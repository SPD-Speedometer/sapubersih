<script>
  import MapPicker from './MapPicker.svelte';
  import { Pencil, Trash2, RefreshCw } from 'lucide-svelte';

  export let busy = false;
  export let loading = false;
  export let loaded = false;
  export let addresses = [];
  export let addressForm = {};
  export let editingAddressId = null;
  export let onAdd = () => {};
  export let onRefresh = () => {};
  export let onSetDefault = () => {};
  export let onEdit = () => {};
  export let onDelete = () => {};
  export let onSubmit = () => {};
  export let onReset = () => {};

  let errors = {};

  function handleAddAddress() {
    onAdd();
    errors = {};
  }

  function handleEditAddress(address) {
    onEdit(address);
    errors = {};
  }

  function handleDeleteAddress(addressId) {
    const ok = confirm('Hapus alamat ini? Aksi tidak dapat dibatalkan.');
    if (!ok) return;
    onDelete(addressId);
  }

  function handleResetAddress() {
    onReset();
    errors = {};
  }

  function handleMapChange(event) {
    const { lat, lng, maps_url, address_text } = event.detail;
    addressForm = {
      ...addressForm,
      lat,
      lng,
      maps_url
    };

    if (address_text) {
      addressForm = {
        ...addressForm,
        address_text
      };
    }
  }

  function toNumber(val) {
    if (val === null || val === undefined) return null;
    const parsed = Number(String(val).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function validateForm() {
    const isFilled = (val) => {
      if (typeof val === 'number') return !Number.isNaN(val);
      return String(val || '').trim().length > 0;
    };

    const nextErrors = {};
    const latNum = toNumber(addressForm.lat);
    const lngNum = toNumber(addressForm.lng);

    if (!isFilled(addressForm.label)) nextErrors.label = 'Label alamat wajib diisi.';
    if (!isFilled(addressForm.receiver_name)) nextErrors.receiver_name = 'Nama penerima wajib diisi.';
    if (!isFilled(addressForm.receiver_phone)) nextErrors.receiver_phone = 'No. penerima wajib diisi.';
    if (!isFilled(addressForm.address_text)) nextErrors.address_text = 'Alamat lengkap wajib diisi.';
    // lat/lng opsional untuk menyesuaikan backend; tidak memblokir submit
    errors = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    // Normalisasi koordinat ke angka titik desimal (opsional)
    const latNum = toNumber(addressForm.lat);
    const lngNum = toNumber(addressForm.lng);
    addressForm = {
      ...addressForm,
      lat: latNum,
      lng: lngNum
    };

    onSubmit();
  }
</script>

<section class="section-grid address-layout">
  <article class="panel">
    <div class="section-head">
      <h3>Alamat penjemputan</h3>
      <div class="section-actions">
        <button class="btn btn-ghost" type="button" on:click={onRefresh}>
          <RefreshCw size={16} class:spin={loading} />
          <span>Refresh</span>
        </button>
        <button class="btn btn-ghost" data-testid="add-address-button" on:click={handleAddAddress}>Tambah Alamat</button>
      </div>
    </div>

    {#if loading && addresses.length === 0}
      <p class="muted">Memuat data alamat...</p>
    {:else if !loaded && addresses.length === 0}
      <p class="muted">Memuat data alamat...</p>
    {:else if loaded && addresses.length === 0}
      <p class="muted">Belum ada alamat. Tambahkan alamat sebelum membuat order.</p>
    {:else}
      <div class="address-list">
        {#each addresses as address}
          <div class="address-card">
            <div>
              <strong>{address.label}</strong>
              <p>{address.receiver_name} • {address.receiver_phone}</p>
              <small>{address.address_text}</small>
            </div>
            <div class="address-actions">
              {#if address.is_default}
                <span class="badge light">Default</span>
              {/if}
              <button
                class="address-icon-btn"
                aria-label="Edit alamat"
                title="Edit"
                on:click={() => handleEditAddress(address)}
              >
                <Pencil size={18} strokeWidth={2.2} />
              </button>
              <button
                class="address-icon-btn danger"
                aria-label="Hapus alamat"
                title="Hapus"
                on:click={() => handleDeleteAddress(address.id)}
              >
                <Trash2 size={18} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </article>

  <article class="panel">
    <h3>{editingAddressId ? 'Edit alamat' : 'Form alamat baru'}</h3>
    <form data-testid="address-form" on:submit={handleSubmit}>
      <label class="field">
        <span>Label alamat</span>
        <input data-testid="address-label" bind:value={addressForm.label} placeholder="Rumah / Kantor" />
        {#if errors.label}<p class="field-error">{errors.label}</p>{/if}
      </label>
      <label class="field">
        <span>Nama penerima</span>
        <input data-testid="address-receiver-name" bind:value={addressForm.receiver_name} placeholder="Nama penerima" />
        {#if errors.receiver_name}<p class="field-error">{errors.receiver_name}</p>{/if}
      </label>
      <label class="field">
        <span>No. penerima</span>
        <input data-testid="address-receiver-phone" bind:value={addressForm.receiver_phone} placeholder="0812xxxx" />
        {#if errors.receiver_phone}<p class="field-error">{errors.receiver_phone}</p>{/if}
      </label>

      <div class="field">
        <span class="field-label">Pilih lokasi di peta</span>
        <p class="field-hint muted">Klik titik di peta atau gunakan tombol lokasi untuk mengisi koordinat otomatis.</p>
        <MapPicker
          lat={addressForm.lat ? Number(addressForm.lat) : 0}
          lng={addressForm.lng ? Number(addressForm.lng) : 0}
          height="280px"
          on:change={handleMapChange}
        />
        {#if errors.location}<p class="field-error">{errors.location}</p>{/if}
      </div>

      <label class="field">
        <span>Alamat lengkap</span>
        <textarea data-testid="address-text" bind:value={addressForm.address_text} rows="4" placeholder="Alamat penjemputan"></textarea>
        {#if errors.address_text}<p class="field-error">{errors.address_text}</p>{/if}
      </label>
      <label class="field">
        <span>Link maps</span>
        <input data-testid="address-maps-url" bind:value={addressForm.maps_url} placeholder="https://maps.google.com/..." />
      </label>

      <label class="checkbox">
        <input data-testid="address-is-default" bind:checked={addressForm.is_default} type="checkbox" />
        <span>Jadikan alamat default</span>
      </label>
      <div class="stack-actions">
        <button class="btn" data-testid="address-submit" disabled={busy}>{editingAddressId ? 'Simpan Perubahan' : 'Simpan Alamat'}</button>
        <button class="btn btn-ghost" data-testid="address-reset" type="button" on:click={handleResetAddress}>Reset</button>
      </div>
    </form>
  </article>
</section>

<style>
  .field-label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .field-hint {
    font-size: 0.8rem;
    margin: 0 0 0.5rem;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-actions .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .spin {
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
