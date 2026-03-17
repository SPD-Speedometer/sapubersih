<script>
  export let busy = false;
  export let profileForm = { name: '', email: '', phone: '' };
  export let onChange = () => {};
  export let onSubmit = () => {};
  export let onLogout = () => {};

  const updateField = (key, value) => {
    onChange({ ...profileForm, [key]: value });
  };
</script>

<section class="panel profile-panel">
  <header class="profile-header">
    <div>
      <p class="badge light">Profil</p>
      <h2>Data diri</h2>
      <p class="muted">Perbarui nama, email, atau nomor WhatsApp Anda.</p>
    </div>
  </header>

  <div class="field">
    <span>Nama</span>
    <input
      value={profileForm.name}
      on:input={(e) => updateField('name', e.target.value)}
      placeholder="Nama lengkap"
      autocomplete="name"
    />
  </div>
  <div class="field">
    <span>Email</span>
    <input
      type="email"
      value={profileForm.email}
      on:input={(e) => updateField('email', e.target.value)}
      placeholder="email@contoh.com"
      autocomplete="email"
    />
  </div>
  <div class="field">
    <span>No. WhatsApp</span>
    <input
      value={profileForm.phone}
      on:input={(e) => updateField('phone', e.target.value)}
      placeholder="0812xxxx"
      autocomplete="tel"
    />
  </div>

  <div class="profile-actions">
    <div class="profile-actions-left">
      <button class="btn" type="button" disabled={busy} on:click={onSubmit}>Simpan</button>
    </div>
    <div class="profile-actions-right">
      <button class="profile-logout" type="button" on:click={onLogout} disabled={busy}>
        Logout
      </button>
    </div>
  </div>
</section>
