<script>
  import { onMount } from 'svelte';
  import Navbar from './Navbar.svelte';
  import AlertMessage from './AlertMessage.svelte';
  import PublicHeroSection from './PublicHeroSection.svelte';
  import ServiceSummarySection from './ServiceSummarySection.svelte';
  import AuthSection from './AuthSection.svelte';
  import CustomerSidebar from './CustomerSidebar.svelte';
  import CustomerHomeSection from './CustomerHomeSection.svelte';
  import CustomerHistorySection from './CustomerHistorySection.svelte';
  import CustomerAddressSection from './CustomerAddressSection.svelte';
  import VerificationPopup from './VerificationPopup.svelte';
  import OrderModal from './OrderModal.svelte';
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
    submitPickupOrderRequest
  } from '../lib/customer-api';

  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  let currentView = initialPath === '/login' || initialPath === '/register' ? 'auth' : 'public';
  let authMode = initialPath === '/register' ? 'register' : 'login';
  let customerSection = 'home';
  let routeReady = false;
  let busy = false;
  let alert = { type: '', text: '' };

  let registerForm = { ...initialRegisterForm };
  let verifyForm = { ...initialVerifyForm };
  let loginForm = { ...initialLoginForm };
  let addressForm = { ...initialAddressForm };
  let orderForm = { ...initialOrderForm };

  let profile = null;
  let addresses = [];
  let orders = [];
  let wasteCategories = [];
  let serviceAreas = [];
  let pricingRules = [];
  let depots = [];
  let orderTimeline = [];
  let selectedOrder = null;
  let orderHistoryWarning = '';

  let orderModalOpen = false;
  let editingAddressId = null;
  let verificationPopupDismissed = false;

  const dashboardRoutes = {
    home: '/dashboard',
    history: '/dashboard/riwayat',
    address: '/dashboard/alamat',
    pickup: '/dashboard/panggil-kurir'
  };

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

  onMount(() => {
    const handlePopState = async () => {
      await applyRoute(window.location.pathname, { replace: true });
    };

    const initialize = async () => {
      await loadPublicData();
      if (isLoggedIn) {
        await bootstrapCustomer();
      }
      await applyRoute(window.location.pathname, { replace: true });
      routeReady = true;
    };

    initialize();
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  });

  function setAlert(type, text) {
    alert = { type, text };
  }

  function clearAlert() {
    alert = { type: '', text: '' };
  }

  async function withBusy(action) {
    busy = true;
    clearAlert();
    try {
      await action();
    } catch (error) {
      setAlert('error', error.message || 'Terjadi kesalahan pada sistem.');
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
      if (orderModalOpen) {
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
      } else if (path === dashboardRoutes.pickup) {
        customerSection = 'home';
        orderModalOpen = true;
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
    session.setUser(nextProfile);
    verifyForm = {
      ...verifyForm,
      phone: nextProfile?.phone || verifyForm.phone
    };
  }

  async function loadAddresses() {
    addresses = await fetchAddresses(api);
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
    syncRoute(replace);
  }

  function goAuth(mode = 'login', replace = false) {
    authMode = mode;
    currentView = 'auth';
    orderModalOpen = false;
    selectedOrder = null;
    orderTimeline = [];
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
      goAuth('login');
      setAlert('error', 'Silakan login dulu sebelum memanggil kurir.');
      return;
    }

    openOrderModal();
  }

  function openOrderModal() {
    currentView = 'customer';
    customerSection = 'home';
    orderModalOpen = true;
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
    orderForm = {
      ...orderForm,
      unit: currentWasteCategory?.default_unit === 'manual' ? 'kg' : currentWasteCategory?.default_unit || 'kg'
    };
  }

  function handleAddAddressFirst() {
    closeOrderModal(false);
    goCustomer('address');
    startAddAddress();
  }
</script>

<svelte:head>
  <title>Sapu Bersih - Layanan Jemput Sampah</title>
</svelte:head>

<div class="app-shell">
  <Navbar
    {isLoggedIn}
    onLogin={() => goAuth('login')}
    onLogout={handleLogout}
  />

    <AlertMessage {alert} onClose={clearAlert} />

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
      onBack={goPublic}
      onLoginSubmit={handleLogin}
      onRegisterSubmit={handleRegister}
      onModeChange={(mode) => goAuth(mode)}
    />
  {/if}

  {#if routeReady && currentView === 'customer'}
    <section class="customer-shell">
      <CustomerSidebar
        {phoneVerified}
        {profile}
        sessionUser={$session.user}
        {customerSection}
        onHome={() => goCustomer('home')}
        onPickup={openOrderModal}
        onHistory={() => goCustomer('history')}
        onAddress={() => goCustomer('address')}
      />

      <div class="customer-content">
        {#if customerSection === 'home'}
          <CustomerHomeSection
            {orders}
            {addresses}
            {statusLabel}
            {toDate}
            onPickup={openOrderModal}
            onOpenOrder={openOrderDetail}
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
            {addresses}
            {addressForm}
            {editingAddressId}
            onAdd={startAddAddress}
            onSetDefault={makeDefaultAddress}
            onEdit={startEditAddress}
            onDelete={removeAddress}
            onSubmit={saveAddress}
            onReset={resetAddressForm}
          />
        {/if}
      </div>
    </section>
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

  {#if routeReady && orderModalOpen}
    <OrderModal
      {busy}
      {hasAddresses}
      {addresses}
      {wasteCategories}
      {orderForm}
      {activePricingRule}
      {currentWasteCategory}
      {estimatedLineTotal}
      {toCurrency}
      {unitOptions}
      onClose={closeOrderModal}
      onSubmit={submitPickupOrder}
      onAddAddressFirst={handleAddAddressFirst}
      onCategoryChange={handleOrderCategoryChange}
    />
  {/if}
</div>
