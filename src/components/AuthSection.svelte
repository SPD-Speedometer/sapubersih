<script>
  export let authMode = 'login';
  export let busy = false;
  export let loginForm = { phone: '', password: '' };
  export let registerForm = { name: '', phone: '', email: '', password: '', password_confirmation: '' };
  export let onLoginSubmit = () => {};
  export let onRegisterSubmit = () => {};
  export let onModeChange = () => {};

  let showLoginPassword = false;
  let showRegisterPassword = false;
  let showRegisterPasswordConfirmation = false;
</script>

<section class="auth-shell">
  <article class="panel auth-intro">
    <h2>
      {authMode === 'register'
        ? 'Daftarkan diri Anda untuk memanggil kurir dan mulai menggunakan layanan penjemputan.'
        : 'Masuk untuk memanggil kurir dan melihat riwayat penjemputan.'}
    </h2>
    <div class="auth-illustration">
      <svg viewBox="0 0 240 220" aria-hidden="true">
        <defs>
          <linearGradient id="authCardGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#2d9657" />
            <stop offset="100%" stop-color="#145433" />
          </linearGradient>
        </defs>

        <rect x="36" y="30" width="168" height="160" rx="24" fill="#ffffff" stroke="#d9ebe0" stroke-width="2" />
        <rect x="56" y="52" width="128" height="34" rx="17" fill="url(#authCardGradient)" opacity="0.12" />
        <circle cx="85" cy="69" r="13" fill="url(#authCardGradient)" />
        <path d="M77 69c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8Z" fill="#ffffff" opacity="0.95" />
        <path d="M70 95c3.8-7.4 11.2-11.2 21.8-11.2 10.6 0 18 3.8 21.8 11.2" fill="none" stroke="#1f7f49" stroke-width="6" stroke-linecap="round" />

        <rect x="56" y="103" width="128" height="12" rx="6" fill="#e4f2e9" />
        <rect x="56" y="124" width="102" height="12" rx="6" fill="#edf7f0" />
        <rect x="56" y="145" width="88" height="12" rx="6" fill="#edf7f0" />

        <circle cx="178" cy="152" r="24" fill="url(#authCardGradient)" />
        <path d="M178 141v22M167 152h22" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />

        <path d="M34 166c0-11 9-20 20-20h14" fill="none" stroke="#58b97a" stroke-width="6" stroke-linecap="round" opacity="0.75" />
        <path d="M176 34c16 0 30 13 30 30" fill="none" stroke="#92d4a8" stroke-width="6" stroke-linecap="round" opacity="0.7" />
      </svg>
    </div>
  </article>

  <article class="panel auth-panel">
    <div class="tabs">
      <button class:active={authMode === 'login'} data-testid="tab-login" on:click={() => onModeChange('login')}>Login</button>
      <button class:active={authMode === 'register'} data-testid="tab-register" on:click={() => onModeChange('register')}>
        Register
      </button>
    </div>

    {#if authMode === 'login'}
      <form data-testid="form-login" on:submit|preventDefault={onLoginSubmit}>
        <label class="field">
          <span>No. WhatsApp</span>
          <input
            data-testid="login-phone"
            bind:value={loginForm.phone}
            name="phone"
            autocomplete="username"
            inputmode="tel"
            placeholder="0812xxxx"
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
        <button class="btn auth-submit" data-testid="login-submit" disabled={busy}>Masuk</button>
      </form>
    {/if}

    {#if authMode === 'register'}
      <form data-testid="form-register" on:submit|preventDefault={onRegisterSubmit}>
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
        <button class="btn auth-submit" data-testid="register-submit" disabled={busy}>Daftar</button>
      </form>
    {/if}
  </article>
</section>
