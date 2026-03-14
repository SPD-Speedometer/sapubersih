<script>
  export let isLoggedIn = false;
  export let onLogin = () => {};
  export let onLogout = () => {};
</script>

<header class="site-header">
  <nav class="navbar">
    <div class="brand-lockup">
      <img class="brand-logo" src="/logo-sapu-bersih-navbar.png" alt="Logo Sapu Bersih" />
    </div>

    <div class="header-actions">
      {#if !isLoggedIn}
        <button class="btn btn-login" data-testid="nav-login" on:click={onLogin}>Login</button>
      {:else}
        <button class="btn btn-ghost" data-testid="nav-logout" on:click={onLogout}>Logout</button>
      {/if}
    </div>
  </nav>
</header>
