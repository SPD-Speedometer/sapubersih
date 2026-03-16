<script>
  export let authMode = 'login';
  export let busy = false;
  export let loginForm = { phone: '', password: '' };
  export let registerForm = { name: '', phone: '', email: '', password: '', password_confirmation: '' };
  export let onLoginSubmit = () => {};
  export let onRegisterSubmit = () => {};
  export let onModeChange = () => {};
  export let inlineAlert = '';

  let showLoginPassword = false;
  let showRegisterPassword = false;
  let showRegisterPasswordConfirmation = false;

  import loginIllustration from '../assets/login-truck-person.svg';
</script>

<section class="auth-shell single">
  <article class="panel auth-panel">
    {#if authMode === 'login'}
      <form data-testid="form-login" on:submit|preventDefault={onLoginSubmit}>
        {#if inlineAlert}
          <div class="alert error inline-alert">
            <span>{inlineAlert}</span>
            <button class="alert-close" type="button" aria-label="Tutup peringatan" on:click={() => (inlineAlert = '')}>×</button>
          </div>
        {/if}
        <p class="field-hint welcome">
          Welcome to
          <span class="brand-line">Sapu Bersih</span>
        </p>
        <label class="field">
          <span>Email atau No. WhatsApp</span>
          <input
            data-testid="login-phone"
            bind:value={loginForm.phone}
            name="phone"
            autocomplete="username"
            inputmode="text"
            placeholder="email@contoh.com atau 0812xxxx"
          />
        </label>
        <label class="field">
          <span>Password</span>
          <div class="password-field">
            {#if showLoginPassword}
              <input
                data-testid="login-password"
                bind:value={loginForm.password}
                name="password"
                autocomplete="current-password"
                type="text"
                placeholder="Minimal 6 karakter"
              />
            {:else}
              <input
                data-testid="login-password"
                bind:value={loginForm.password}
                name="password"
                autocomplete="current-password"
                type="password"
                placeholder="Minimal 6 karakter"
              />
            {/if}
            <button
              class="password-toggle"
              type="button"
              aria-label={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
              on:click={() => (showLoginPassword = !showLoginPassword)}
            >
              {#if showLoginPassword}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M3 5l16 16M10.7 10.8a3 3 0 0 0 4.2 4.2M9.9 5.2A10.7 10.7 0 0 1 12 5c5.3 0 9.3 4.4 10 7-.3 1.1-1.3 2.7-2.9 4.1M6.1 6.1C4.2 7.5 2.8 9.5 2 12c.7 2.6 4.7 7 10 7 1.5 0 2.9-.3 4.1-.8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8" />
                </svg>
              {/if}
            </button>
          </div>
        </label>
        <div class="forgot-row">
          <button class="link-button" type="button">Lupa password?</button>
        </div>
        <button class="btn auth-submit wide" data-testid="login-submit" disabled={busy}>Masuk</button>
        <div class="sso sso-below">
          <button type="button" class="sso-btn google">
            <img class="sso-icon-img" src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="" />
            <span>Login dengan Google</span>
          </button>
        </div>
      </form>
    {/if}

    {#if authMode === 'register'}
      <form data-testid="form-register" on:submit|preventDefault={onRegisterSubmit}>
        <p class="field-hint welcome">
          Daftarkan diri Anda
        </p>
        <label class="field">
          <span>Nama lengkap</span>
          <input data-testid="register-name" bind:value={registerForm.name} name="name" autocomplete="name" placeholder="Nama customer" />
        </label>
        <label class="field">
          <span>No. WhatsApp</span>
          <input
            data-testid="register-phone"
            bind:value={registerForm.phone}
            name="phone"
            autocomplete="username"
            inputmode="tel"
            placeholder="0812xxxx"
          />
        </label>
        <label class="field">
          <span>Email</span>
          <input
            data-testid="register-email"
            bind:value={registerForm.email}
            name="email"
            autocomplete="email"
            type="email"
            placeholder="email@contoh.com"
          />
        </label>
        <label class="field">
          <span>Password</span>
          <div class="password-field">
            {#if showRegisterPassword}
              <input
                data-testid="register-password"
                bind:value={registerForm.password}
                name="password"
                autocomplete="new-password"
                type="text"
                placeholder="Minimal 6 karakter"
              />
            {:else}
              <input
                data-testid="register-password"
                bind:value={registerForm.password}
                name="password"
                autocomplete="new-password"
                type="password"
                placeholder="Minimal 6 karakter"
              />
            {/if}
            <button
              class="password-toggle"
              type="button"
              aria-label={showRegisterPassword ? 'Sembunyikan password' : 'Lihat password'}
              on:click={() => (showRegisterPassword = !showRegisterPassword)}
            >
              {#if showRegisterPassword}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M3 5l16 16M10.7 10.8a3 3 0 0 0 4.2 4.2M9.9 5.2A10.7 10.7 0 0 1 12 5c5.3 0 9.3 4.4 10 7-.3 1.1-1.3 2.7-2.9 4.1M6.1 6.1C4.2 7.5 2.8 9.5 2 12c.7 2.6 4.7 7 10 7 1.5 0 2.9-.3 4.1-.8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8" />
                </svg>
              {/if}
            </button>
          </div>
        </label>
        <label class="field">
          <span>Konfirmasi Password</span>
          <div class="password-field">
            {#if showRegisterPasswordConfirmation}
              <input
                data-testid="register-password-confirmation"
                bind:value={registerForm.password_confirmation}
                name="password_confirmation"
                autocomplete="new-password"
                type="text"
                placeholder="Ulangi password"
              />
            {:else}
              <input
                data-testid="register-password-confirmation"
                bind:value={registerForm.password_confirmation}
                name="password_confirmation"
                autocomplete="new-password"
                type="password"
                placeholder="Ulangi password"
              />
            {/if}
            <button
              class="password-toggle"
              type="button"
              aria-label={showRegisterPasswordConfirmation ? 'Sembunyikan password' : 'Lihat password'}
              on:click={() => (showRegisterPasswordConfirmation = !showRegisterPasswordConfirmation)}
            >
              {#if showRegisterPasswordConfirmation}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M3 5l16 16M10.7 10.8a3 3 0 0 0 4.2 4.2M9.9 5.2A10.7 10.7 0 0 1 12 5c5.3 0 9.3 4.4 10 7-.3 1.1-1.3 2.7-2.9 4.1M6.1 6.1C4.2 7.5 2.8 9.5 2 12c.7 2.6 4.7 7 10 7 1.5 0 2.9-.3 4.1-.8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8" />
                </svg>
              {/if}
            </button>
          </div>
        </label>
        <button class="btn auth-submit wide" data-testid="register-submit" disabled={busy}>Daftar</button>
      </form>
      <div class="register-cta alt">
        <span>Sudah punya akun?</span>
        <button class="link-button" type="button" on:click={() => onModeChange('login')}>Masuk sekarang</button>
      </div>
    {/if}

    {#if authMode === 'login'}
      <div class="register-cta">
        <span>Belum punya akun?</span>
        <button class="link-button" type="button" on:click={() => onModeChange('register')}>Daftar sekarang</button>
      </div>
    {/if}
  </article>
</section>
