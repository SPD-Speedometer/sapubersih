<script>
  export let phoneVerified = false;
  export let profile = null;
  export let sessionUser = null;
  export let customerSection = 'home';
  export let onHome = () => {};
  export let onPickup = () => {};
  export let onHistory = () => {};
  export let onAddress = () => {};
</script>

<aside class="sidebar">
  <div class="panel profile-card">
    <span class="badge">{phoneVerified ? 'Terverifikasi' : 'Belum verifikasi'}</span>
    <h2>{profile?.name || sessionUser?.name || 'Customer'}</h2>
    <p>{sessionUser?.phone || '-'}</p>
    <p>{profile?.email || '-'}</p>
  </div>

  <div class="panel nav-panel">
    <button class:active={customerSection === 'home'} data-testid="sidebar-beranda" on:click={onHome}>Beranda</button>
    <button class:active={customerSection === 'pickup'} data-testid="sidebar-panggil-kurir" on:click={onPickup}>Panggil Kurir</button>
    <button class:active={customerSection === 'history'} data-testid="sidebar-riwayat" on:click={onHistory}>Riwayat</button>
    <button class:active={customerSection === 'address'} data-testid="sidebar-alamat" on:click={onAddress}>Alamat</button>
  </div>
</aside>
