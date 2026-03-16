<script>
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
  <img class="sidebar-logo-full" src="/logo-sapu-bersih-navbar.png" alt="Logo Sapu Bersih" />

  <div class="panel nav-panel">
    <button class:active={customerSection === 'home'} data-testid="sidebar-dashboard" on:click={onHome}>
      <span class="nav-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M10 21V16.5a2 2 0 0 1 4 0V21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      Dashboard
    </button>
    <button class:active={customerSection === 'pickup'} data-testid="sidebar-panggil-kurir" on:click={onPickup}>
      <span class="nav-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 7.5h10a2 2 0 0 1 2 2v7.5h-1.4a2.6 2.6 0 0 0-5.2 0H6.6a2.6 2.6 0 0 0-5.2 0H1V9.5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M15 11h3.2a1.8 1.8 0 0 1 1.44.72L21 13.5V17h-1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="6" cy="17" r="1.6" fill="currentColor" />
          <circle cx="13" cy="17" r="1.6" fill="currentColor" />
        </svg>
      </span>
      Panggil Kurir
    </button>
    <button class:active={customerSection === 'history'} data-testid="sidebar-riwayat" on:click={onHistory}>
      <span class="nav-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 8v5l3 2m6-3a9 9 0 1 1-3-6.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      Riwayat
    </button>
    <button class:active={customerSection === 'address'} data-testid="sidebar-alamat" on:click={onAddress}>
      <span class="nav-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 21s6-5 6-10a6 6 0 1 0-12 0c0 5 6 10 6 10Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="11" r="2" fill="currentColor" />
        </svg>
      </span>
      Alamat
    </button>
    <button class:active={customerSection === 'profile'} data-testid="sidebar-profil" on:click={onProfile}>
      <span class="nav-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M5 20.5c.6-3.4 3.4-5.5 7-5.5s6.4 2.1 7 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      Profil
    </button>
    <div class="sidebar-footer">
      <div class="sidebar-account">
        <div class="sidebar-account-avatar">{initials}</div>
        <div class="sidebar-account-text">
          <strong>{displayName}</strong>
          <span>{displayEmail}</span>
        </div>
      </div>
      <div class="sidebar-logout-row">
        <button class="sidebar-logout" type="button" on:click={onLogout}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M10 17l-1.5-1.5 3-3-3-3L10 8l4 4-4 5Z" fill="currentColor" />
            <path d="M5 5h6v2H5v10h6v2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="currentColor" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
</aside>
