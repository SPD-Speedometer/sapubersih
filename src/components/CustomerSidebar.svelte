<script>
  import { LayoutDashboard, Truck, Clock3, MapPin, LogOut } from 'lucide-svelte';

  export let profile = null;
  export let sessionUser = null;
  export let customerSection = 'home';
  export let onHome = () => {};
  export let onPickup = () => {};
  export let onHistory = () => {};
  export let onAddress = () => {};
  export let onProfile = () => {};
  export let onLogout = () => {};

  $: displayName = profile?.name || sessionUser?.name || 'Customer';
  $: displayEmail = profile?.email || sessionUser?.email || '-';
  $: initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'C';
</script>

<aside class="sidebar">
  <a class="sidebar-logo-btn bg-light" href="/" aria-label="Kembali ke halaman utama">
    <img class="sidebar-logo-full" src="/logo-sapu-bersih-navbar.png" alt="Logo Sapu Bersih" />
  </a>

  <div class="panel nav-panel">
    <button class:active={customerSection === 'home'} data-testid="sidebar-dashboard" on:click={onHome}>
      <span class="nav-icon">
        <LayoutDashboard size={20} strokeWidth={2} />
      </span>
      Dashboard
    </button>
    <button class:active={customerSection === 'pickup'} data-testid="sidebar-panggil-kurir" on:click={onPickup}>
      <span class="nav-icon">
        <Truck size={20} strokeWidth={2} />
      </span>
      Panggil Kurir
    </button>
    <button class:active={customerSection === 'history'} data-testid="sidebar-riwayat" on:click={onHistory}>
      <span class="nav-icon">
        <Clock3 size={20} strokeWidth={2} />
      </span>
      Riwayat
    </button>
    <button class:active={customerSection === 'address'} data-testid="sidebar-alamat" on:click={onAddress}>
      <span class="nav-icon">
        <MapPin size={20} strokeWidth={2} />
      </span>
      Alamat
    </button>
    <div class="sidebar-footer">
      <button class="sidebar-account" type="button" on:click={onProfile}>
        <div class="sidebar-account-avatar">{initials}</div>
        <div class="sidebar-account-text">
          <strong>{displayName}</strong>
          <span>{displayEmail}</span>
        </div>
      </button>
    </div>
  </div>
</aside>
