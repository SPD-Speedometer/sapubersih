<script>
  export let isLoggedIn = false;
  export let onLogin = () => {};
  export let hideLogin = false;
</script>

<header class="site-header">
  <nav class="navbar">
    <div class="brand-lockup">
      <a class="brand-link" href="/">
        <img class="brand-logo" src="/logo-sapu-bersih-navbar.png" alt="Logo Sapu Bersih" />
      </a>
    </div>

    {#if !hideLogin && !isLoggedIn}
      <div class="header-actions">
        <button class="btn btn-login" data-testid="nav-login" on:click={onLogin}>Login</button>
      </div>
    {/if}
  </nav>
</header>
