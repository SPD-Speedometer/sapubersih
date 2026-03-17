<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import Navbar from './Navbar.svelte';
  import AlertMessage from './AlertMessage.svelte';
  import PublicHeroSection from './PublicHeroSection.svelte';
  import ServiceSummarySection from './ServiceSummarySection.svelte';
  import AuthSection from './AuthSection.svelte';
  import CustomerSidebar from './CustomerSidebar.svelte';
  import CustomerHomeSection from '../routes/dashboard/CustomerHomeSection.svelte';
  import CustomerHistorySection from '../routes/dashboard/riwayat/CustomerHistorySection.svelte';
  import CustomerAddressSection from '../routes/dashboard/alamat/CustomerAddressSection.svelte';
  import CustomerProfileSection from '../routes/dashboard/profil/CustomerProfileSection.svelte';
  import VerificationPopup from './VerificationPopup.svelte';
  import OrderModal from '../routes/dashboard/panggil-kurir/OrderModal.svelte';
  import { LayoutDashboard, Truck, Clock3, MapPin, User } from 'lucide-svelte';
  import { api } from '../lib/api';
  import { session } from '../lib/session';
  import { toCurrency, toDate } from '../lib/format';
  import {
    initialRegisterForm,
    initialVerifyForm,
    initialLoginForm,
    initialAddressForm,
    initialOrderForm
  } from '../lib/app-constants';
  import { statusLabel, unitOptions } from '../lib/order-helpers';
  import {
    fetchPublicData,
    fetchProfile,
    fetchAddresses,
    fetchOrders,
    fetchOrderDetailBundle,
    registerRequest,
    loginRequest,
    verifyPhoneRequest,
    resendOtpRequest,
    logoutRequest,
    saveAddressRequest,
    setDefaultAddressRequest,
    deleteAddressRequest,
    submitPickupOrderRequest,
    updateProfileRequest
  } from '../lib/customer-api';

  export let initialView = null;
  export let initialSection = null;

  const dashboardRoutes = {
    home: '/dashboard',
    history: '/dashboard/riwayat',
    address: '/dashboard/alamat',
    pickup: '/dashboard/panggil-kurir',
    profile: '/dashboard/profil'
  };

  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const initialSession = get(session);
  const initialIsLoggedIn = Boolean(initialSession?.accessToken);

  let currentView =
    initialView ||
    (initialPath === '/login' || initialPath === '/register'
      ? 'auth'
      : initialPath.startsWith('/dashboard')
        ? initialIsLoggedIn
          ? 'customer'
          : 'auth'
        : 'public');
  let authMode = initialPath === '/register' ? 'register' : 'login';
  let customerSection =
    initialSection ||
    (initialPath === dashboardRoutes.history
      ? 'history'
      : initialPath === dashboardRoutes.address
        ? 'address'
        : initialPath === dashboardRoutes.profile
          ? 'profile'
          : initialPath === dashboardRoutes.pickup
            ? 'pickup'
            : 'home');
  let routeReady = false;
  let busy = false;
  let alert = { type: '', text: '' };

  let registerForm = { ...initialRegisterForm };
  let verifyForm = { ...initialVerifyForm };
  let loginForm = { ...initialLoginForm };
  let addressForm = { ...initialAddressForm };
  let orderForm = { ...initialOrderForm };
  let profileForm = { name: '', email: '', phone: '' };

  let profile = null;
  let addresses = [];
  let addressesLoading = false;
  let addressesLoaded = false;
  let orders = [];
  let wasteCategories = [];
  let serviceAreas = [];
  let pricingRules = [];
  let depots = [];
  let orderTimeline = [];
  let selectedOrder = null;
  let orderHistoryWarning = '';
  let authInlineAlert = '';
  let hasOngoingOrder = false;

  let orderModalOpen = false;
  let editingAddressId = null;
  let verificationPopupDismissed = false;
  let isMobileView = false;

  const ADDRESS_CACHE_KEY = 'sb.addressCache';

  const initialCachedAddresses =
    typeof window !== 'undefined' ? loadAddressCache() : null;
  if (initialCachedAddresses && Array.isArray(initialCachedAddresses)) {
    addresses = initialCachedAddresses;
    addressesLoaded = true;
  }

  function loadAddressCache() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(ADDRESS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (_e) {
      return null;
    }
  }

  function saveAddressCache(list) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(ADDRESS_CACHE_KEY, JSON.stringify(list || []));
    } catch (_e) {
      // ignore quota errors
    }
  }

  function clearAddressCache() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(ADDRESS_CACHE_KEY);
    } catch (_e) {
      // ignore
    }
  }

  $: isLoggedIn = Boolean($session.accessToken);
  $: phoneVerified = Boolean(profile?.phone_verified_at || $session.user?.phone_verified_at);
  $: showVerificationPopup =
    currentView === 'customer' &&
    customerSection === 'home' &&
    !phoneVerified &&
    !verificationPopupDismissed;
  $: hasAddresses = addresses.length > 0;
  $: defaultAddress = addresses.find((item) => item.is_default) || addresses[0] || null;
  $: activePricingRule =
    pricingRules.find(
      (rule) =>
        String(rule.waste_category_id) === String(orderForm.waste_category_id) &&
        rule.calc_method === orderForm.calc_method
    ) || null;
  $: currentWasteCategory =
    wasteCategories.find((item) => String(item.id) === String(orderForm.waste_category_id)) || null;
  $: estimatedLineTotal =
    orderForm.qty && activePricingRule
      ? Number(orderForm.qty || 0) * Number(activePricingRule.price_base || 0)
      : 0;
  $: if (!isMobileView && orderModalOpen) {
    orderModalOpen = false;
  }
  $: if (hasAddresses && !orderForm.address_id) {
    orderForm = { ...orderForm, address_id: String(defaultAddress?.id || '') };
  }
  $: if (
    currentView === 'customer' &&
    customerSection === 'address' &&
    !editingAddressId &&
    profile &&
    !addressForm.receiver_name &&
    !addressForm.receiver_phone
  ) {
    addressForm = {
      ...addressForm,
      receiver_name: profile?.name || '',
      receiver_phone: profile?.phone || '',
      is_default: addresses.length === 0 ? true : addressForm.is_default
    };
  }

  $: displayName = profile?.name || $session.user?.name || 'Sahabat Bersih';
  $: lastOrderDate = orders[0]?.created_at ? toDate(orders[0].created_at) : null;
  $: hasOngoingOrder = orders.some((order) => !['completed', 'cancelled', 'failed'].includes(order.status));

  onMount(() => {
    const handlePopState = async () => {
      await applyRoute(window.location.pathname, { replace: true });
    };
    const handleResize = () => updateIsMobileView();

    const initialize = async () => {
      routeReady = true; // tampilkan layout lebih cepat saat refresh/route awal
      try {
        updateIsMobileView();
        await loadPublicData();
        if (isLoggedIn) {
          await bootstrapCustomer();
        }
        await applyRoute(window.location.pathname, { replace: true });
      } catch (error) {
        setAlert('error', error.message || 'Gagal memuat data awal.');
      } finally {
        routeReady = true;
      }
    };

    initialize();
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('resize', handleResize);
    };
  });

  function setAlert(type, text) {
    alert = { type, text };
  }

  function clearAlert() {
    alert = { type: '', text: '' };
  }

  function updateIsMobileView() {
    if (typeof window === 'undefined') return;
    isMobileView = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobileView && orderModalOpen) {
      orderModalOpen = false;
      customerSection = 'pickup';
    }
  }

  async function withBusy(action) {
    busy = true;
    clearAlert();
    try {
      await action();
    } catch (error) {
      console.error('API error', error?.response || error);
      const resp = error?.response;
      const errorsArray = Array.isArray(resp?.errors)
        ? resp.errors.map((e) => (typeof e === 'object' ? `${e.field}: ${e.message}` : e))
        : resp?.errors && typeof resp.errors === 'object'
          ? Object.entries(resp.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          : null;
      const apiMessage = resp?.message || (errorsArray ? errorsArray.join(', ') : null);
      const message = apiMessage || error.message || 'Terjadi kesalahan pada sistem.';
      if (currentView === 'auth') {
        authInlineAlert = message;
      } else {
        setAlert('error', message);
      }
    } finally {
      busy = false;
    }
  }

  async function loadPublicData() {
    const data = await fetchPublicData(api);
    wasteCategories = data.wasteCategories;
    serviceAreas = data.serviceAreas;
    pricingRules = data.pricingRules;
    depots = data.depots;
  }

  async function bootstrapCustomer() {
    await Promise.all([loadProfile(), loadAddresses(), loadOrders(), loadPublicData()]);
  }

  function normalizePath(pathname = '/') {
    if (!pathname) return '/';
    const normalized = pathname.replace(/\/+$/, '') || '/';
    return normalized === '' ? '/' : normalized;
  }

  function getPathForState() {
    if (currentView === 'auth') {
      return authMode === 'register' ? '/register' : '/login';
    }

    if (currentView === 'customer') {
      if (customerSection === 'pickup') {
        return dashboardRoutes.pickup;
      }

      return dashboardRoutes[customerSection] || dashboardRoutes.home;
    }

    return '/';
  }

  function updateBrowserRoute(path, replace = false) {
    if (typeof window === 'undefined') return;
    const normalized = normalizePath(path);
    const currentPath = normalizePath(window.location.pathname);
    if (normalized === currentPath) return;
    window.history[replace ? 'replaceState' : 'pushState']({}, '', normalized);
  }

  function syncRoute(replace = false) {
    updateBrowserRoute(getPathForState(), replace);
  }

  async function applyRoute(pathname, { replace = false } = {}) {
    const path = normalizePath(pathname);

    if (path === '/login' || path === '/register') {
      orderModalOpen = false;
      selectedOrder = null;
      orderTimeline = [];

      if (isLoggedIn) {
        currentView = 'customer';
        customerSection = 'home';
        syncRoute(true);
        return;
      }

      currentView = 'auth';
      authMode = path === '/register' ? 'register' : 'login';
      updateBrowserRoute(path, replace);
      return;
    }

    if (path.startsWith('/dashboard')) {
      if (!isLoggedIn) {
        currentView = 'auth';
        authMode = 'login';
        orderModalOpen = false;
        updateBrowserRoute('/login', true);
        return;
      }

      currentView = 'customer';
      selectedOrder = null;
      orderTimeline = [];

      if (path === dashboardRoutes.history) {
        customerSection = 'history';
        orderModalOpen = false;
      } else if (path === dashboardRoutes.address) {
        customerSection = 'address';
        orderModalOpen = false;
      } else if (path === dashboardRoutes.profile) {
        customerSection = 'profile';
        orderModalOpen = false;
      } else if (path === dashboardRoutes.pickup) {
        customerSection = 'pickup';
        orderModalOpen = false;
      } else {
        customerSection = 'home';
        orderModalOpen = false;
      }

      updateBrowserRoute(getPathForState(), replace);
      return;
    }

    currentView = 'public';
    orderModalOpen = false;
    selectedOrder = null;
    orderTimeline = [];
    updateBrowserRoute('/', replace);
  }

  async function loadProfile() {
    const nextProfile = await fetchProfile(api);
    profile = nextProfile;
    profileForm = {
      name: nextProfile?.name || '',
      email: nextProfile?.email || '',
      phone: nextProfile?.phone || ''
    };
    session.setUser(nextProfile);
    verifyForm = {
      ...verifyForm,
      phone: nextProfile?.phone || verifyForm.phone
    };
  }

  async function loadAddresses() {
    const cached = addresses.length === 0 ? loadAddressCache() : null;
    if (cached) {
      addresses = cached;
      addressesLoaded = true;
    }

    addressesLoading = !cached;
    try {
      const fresh = await fetchAddresses(api);
      addresses = fresh;
      saveAddressCache(fresh);
      addressesLoaded = true;
    } finally {
      addressesLoading = false;
    }
  }

  async function loadOrders() {
    try {
      orders = await fetchOrders(api);
      orderHistoryWarning = '';
      return orders;
    } catch (error) {
      if (error.status === 403) {
        orderHistoryWarning =
          'Riwayat order dari API backend belum bisa diambil karena route customer dan operator bentrok. Order baru tetap bisa dibuat dari frontend ini.';
        return orders;
      }
      throw error;
    }
  }

  async function openOrderDetail(orderId) {
    await withBusy(async () => {
      const fallbackOrder = orders.find((item) => item.id === orderId) || selectedOrder;
      const bundle = await fetchOrderDetailBundle(api, orderId, fallbackOrder);
      selectedOrder = bundle.orderDetail;
      orderTimeline = bundle.timeline;
      currentView = 'customer';
      customerSection = 'history';
      orderModalOpen = false;
      syncRoute();
    });
  }

  function goPublic(replace = false) {
    currentView = 'public';
    orderModalOpen = false;
    selectedOrder = null;
    orderTimeline = [];
    authInlineAlert = '';
    syncRoute(replace);
  }

  function goAuth(mode = 'login', replace = false) {
    authMode = mode;
    currentView = 'auth';
    orderModalOpen = false;
    selectedOrder = null;
    orderTimeline = [];
    if (mode !== 'login') authInlineAlert = '';
    syncRoute(replace);
  }

  function goCustomer(section = 'home', replace = false) {
    currentView = 'customer';
    customerSection = section;
    orderModalOpen = false;
    syncRoute(replace);
  }

  function handlePublicPickupClick() {
    if (!isLoggedIn) {
      authInlineAlert = 'Silakan login dulu sebelum memanggil kurir.';
      goAuth('login');
      return;
    }

    openOrderModal();
  }

  function openOrderModal() {
    currentView = 'customer';
    customerSection = 'pickup';
    orderModalOpen = false;
    selectedOrder = null;
    orderTimeline = [];
    orderForm = {
      ...initialOrderForm,
      address_id: String(defaultAddress?.id || ''),
      requested_pickup_at: '',
      unit: currentWasteCategory?.default_unit || 'kg'
    };
    syncRoute();
  }

  function closeOrderModal(shouldSync = true) {
    orderModalOpen = false;
    customerSection = 'home';
    orderForm = {
      ...initialOrderForm,
      address_id: String(defaultAddress?.id || '')
    };
    if (shouldSync) {
      syncRoute();
    }
  }

  async function handleRegister() {
    await withBusy(async () => {
      if (!registerForm.password || registerForm.password.length < 6) {
        throw new Error('Password minimal 6 karakter.');
      }

      if (registerForm.password !== registerForm.password_confirmation) {
        throw new Error('Konfirmasi password tidak sama.');
      }

      const response = await registerRequest(api, registerForm);
      session.setAuth(response.data);
      registerForm = { ...initialRegisterForm };
      verifyForm = {
        phone: response.data?.user?.phone || '',
        otp_code: ''
      };
      authInlineAlert = '';
      await bootstrapCustomer();
      goCustomer('home', true);
      setAlert('success', response.message);
    });
  }

  async function handleVerifyPhone() {
    await withBusy(async () => {
      const response = await verifyPhoneRequest(api, verifyForm);
      verifyForm = { ...verifyForm, otp_code: '' };
      verificationPopupDismissed = false;
      await loadProfile();
      setAlert('success', response.message);
      goCustomer('home');
    });
  }

  async function handleResendOtp() {
    await withBusy(async () => {
      const phone = verifyForm.phone || profile?.phone || $session.user?.phone;
      if (!phone) {
        throw new Error('Nomor telepon belum tersedia untuk kirim OTP.');
      }

      const response = await resendOtpRequest(api, phone);
      verifyForm = { ...verifyForm, phone };
      setAlert('success', response.message);
    });
  }

  async function handleLogin() {
    await withBusy(async () => {
      const response = await loginRequest(api, loginForm);
      session.setAuth(response.data);
      verificationPopupDismissed = false;
      loginForm = { ...initialLoginForm };
      verifyForm = {
        phone: response.data?.user?.phone || '',
        otp_code: ''
      };
      await bootstrapCustomer();
      goCustomer('home', true);
      setAlert('success', response.message);
    });
  }

  async function handleLogout() {
    await withBusy(async () => {
      try {
        await logoutRequest(api);
      } catch (_error) {
        // Tetap bersihkan sesi lokal meskipun token sudah tidak valid.
      }

      session.clearAuth();
      profile = null;
      addresses = [];
      clearAddressCache();
      orders = [];
      selectedOrder = null;
      orderTimeline = [];
      orderModalOpen = false;
      verificationPopupDismissed = false;
      goPublic(true);
      setAlert('success', 'Logout berhasil.');
    });
  }

  function startAddAddress() {
    editingAddressId = null;
    addressForm = {
      ...initialAddressForm,
      receiver_name: profile?.name || '',
      receiver_phone: profile?.phone || '',
      is_default: addresses.length === 0
    };
  }

  function startEditAddress(address) {
    editingAddressId = address.id;
    addressForm = {
      label: address.label || '',
      receiver_name: address.receiver_name || '',
      receiver_phone: address.receiver_phone || '',
      address_text: address.address_text || '',
      lat: address.lat ?? '',
      lng: address.lng ?? '',
      maps_url: address.maps_url ?? '',
      is_default: address.is_default ?? false
    };
  }

  function resetAddressForm() {
    editingAddressId = null;
    addressForm = {
      ...initialAddressForm,
      receiver_name: profile?.name || '',
      receiver_phone: profile?.phone || '',
      is_default: addresses.length === 0
    };
  }

  async function saveAddress() {
    await withBusy(async () => {
      const response = await saveAddressRequest(api, editingAddressId, addressForm);
      await loadAddresses();
      resetAddressForm();
      setAlert('success', response.message);
    });
  }

  async function makeDefaultAddress(addressId) {
    await withBusy(async () => {
      const response = await setDefaultAddressRequest(api, addressId);
      await loadAddresses();
      setAlert('success', response.message);
    });
  }

  async function removeAddress(addressId) {
    await withBusy(async () => {
      const response = await deleteAddressRequest(api, addressId);
      await loadAddresses();
      setAlert('success', response.message);
    });
  }

  async function submitPickupOrder() {
    await withBusy(async () => {
      if (!orderForm.address_id) {
        throw new Error('Pilih alamat penjemputan lebih dulu.');
      }
      if (!orderForm.waste_category_id) {
        throw new Error('Pilih kategori sampah.');
      }
      if (!orderForm.qty) {
        throw new Error('Isi estimasi jumlah sampah.');
      }

      const result = await submitPickupOrderRequest(api, orderForm);
      orders = [result.submittedOrder, ...orders.filter((item) => item.id !== result.submittedOrder.id)];
      selectedOrder = result.submittedOrder;
      orderTimeline = result.timeline;
      closeOrderModal(false);
      currentView = 'customer';
      customerSection = 'history';
      syncRoute();
      setAlert('success', 'Order penjemputan berhasil dibuat dan dikirim.');
    });
  }

  function handleOrderCategoryChange() {
    const ruleFromId = pricingRules.find((r) => String(r.id) === String(orderForm.pricing_rule_id));
    orderForm = {
      ...orderForm,
      unit:
        ruleFromId?.unit ||
        ruleFromId?.default_unit ||
        activePricingRule?.unit ||
        activePricingRule?.default_unit ||
        (currentWasteCategory?.default_unit === 'manual' ? 'kg' : currentWasteCategory?.default_unit) ||
        'kg'
    };
  }

  function handleAddAddressFirst() {
    closeOrderModal(false);
    goCustomer('address');
    startAddAddress();
  }

  async function handleProfileSave() {
    await withBusy(async () => {
      const response = await updateProfileRequest(api, profileForm);
      await loadProfile();
      setAlert('success', response.message || 'Profil berhasil diperbarui.');
    });
  }
</script>

<svelte:head>
  <title>Sapu Bersih - Layanan Jemput Sampah</title>
</svelte:head>

<div class={`app-shell ${currentView === 'customer' ? 'no-pad' : ''}`}>
  {#if currentView !== 'customer'}
    <Navbar
      {isLoggedIn}
      onLogin={() => goAuth('login')}
      hideLogin={currentView === 'auth'}
    />
  {/if}

  {#if routeReady && currentView === 'public'}
    <PublicHeroSection onPickup={handlePublicPickupClick} onRegister={() => goAuth('register')} />
    <ServiceSummarySection {serviceAreas} {wasteCategories} {depots} />

    <section class="section-grid">
      <article class="panel">
        <h3>Jenis sampah yang diterima</h3>
        <div class="chip-list">
          {#each wasteCategories.slice(0, 8) as category}
            <span class="chip">{category.name}</span>
          {/each}
        </div>
      </article>
    </section>
  {/if}

  {#if routeReady && currentView === 'auth'}
    <AuthSection
      {authMode}
      {busy}
      {loginForm}
      {registerForm}
      inlineAlert={authInlineAlert}
      onBack={goPublic}
      onLoginSubmit={handleLogin}
      onRegisterSubmit={handleRegister}
      onModeChange={(mode) => goAuth(mode)}
    />
  {/if}

  {#if routeReady && currentView === 'customer'}
    <section class="customer-shell">
      <CustomerSidebar
        {profile}
        sessionUser={$session.user}
        {customerSection}
        onHome={() => goCustomer('home')}
        onPickup={openOrderModal}
        onHistory={() => goCustomer('history')}
        onAddress={() => goCustomer('address')}
        onProfile={() => goCustomer('profile')}
        onLogout={handleLogout}
      />

      <div class="customer-content">
        <AlertMessage {alert} onClose={clearAlert} />

        {#if customerSection === 'home'}
          <CustomerHomeSection
            {orders}
            {addresses}
            {statusLabel}
            {toDate}
            {displayName}
            {lastOrderDate}
            onPickup={openOrderModal}
            onOpenOrder={openOrderDetail}
          />
        {/if}

        {#if customerSection === 'pickup'}
          <OrderModal
            inline={true}
            {busy}
            {hasAddresses}
            {addresses}
            {wasteCategories}
            {pricingRules}
            bind:orderForm={orderForm}
            {activePricingRule}
            {currentWasteCategory}
            {estimatedLineTotal}
            {hasOngoingOrder}
            {toCurrency}
            {unitOptions}
            onClose={() => goCustomer('home')}
            onSubmit={submitPickupOrder}
            onAddAddressFirst={handleAddAddressFirst}
            onCategoryChange={handleOrderCategoryChange}
          />
        {/if}

        {#if customerSection === 'history'}
          <CustomerHistorySection
            {orders}
            {selectedOrder}
            {orderTimeline}
            {orderHistoryWarning}
            {statusLabel}
            {toCurrency}
            {toDate}
            onRefresh={loadOrders}
            onOpenOrder={openOrderDetail}
          />
        {/if}

        {#if customerSection === 'address'}
          <CustomerAddressSection
            {busy}
            loading={addressesLoading}
            loaded={addressesLoaded}
            {addresses}
            bind:addressForm={addressForm}
            {editingAddressId}
            onAdd={startAddAddress}
            onRefresh={loadAddresses}
            onSetDefault={makeDefaultAddress}
            onEdit={startEditAddress}
            onDelete={removeAddress}
            onSubmit={saveAddress}
            onReset={resetAddressForm}
          />
        {/if}

        {#if customerSection === 'profile'}
          <CustomerProfileSection
            {busy}
            {profileForm}
            onChange={(form) => (profileForm = form)}
            onSubmit={handleProfileSave}
            onLogout={handleLogout}
          />
        {/if}
      </div>
    </section>

    <nav class="bottom-nav">
      <button class:active={customerSection === 'home'} type="button" on:click={() => goCustomer('home')}>
        <LayoutDashboard size={22} strokeWidth={2} />
        <span>Dashboard</span>
      </button>
      <button class:active={customerSection === 'history'} type="button" on:click={() => goCustomer('history')}>
        <Clock3 size={22} strokeWidth={2} />
        <span>Riwayat</span>
      </button>
      <button class="bottom-call-btn" class:active={customerSection === 'pickup'} type="button" on:click={openOrderModal}>
        <Truck size={22} strokeWidth={2} />
        <span>Panggil</span>
      </button>
      <button class:active={customerSection === 'address'} type="button" on:click={() => goCustomer('address')}>
        <MapPin size={22} strokeWidth={2} />
        <span>Alamat</span>
      </button>
      <button class:active={customerSection === 'profile'} type="button" on:click={() => goCustomer('profile')}>
        <User size={22} strokeWidth={2} />
        <span>Profil</span>
      </button>
    </nav>
  {/if}

  {#if routeReady && showVerificationPopup}
    <VerificationPopup
      {busy}
      {verifyForm}
      onSubmit={handleVerifyPhone}
      onResend={handleResendOtp}
      onDismiss={() => (verificationPopupDismissed = true)}
    />
  {/if}
</div>
