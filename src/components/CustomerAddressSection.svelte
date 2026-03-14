<script>
  import MapPickerModal from './MapPickerModal.svelte';

  export let busy = false;
  export let addresses = [];
  export let addressForm = {};
  export let editingAddressId = null;
  export let onAdd = () => {};
  export let onSetDefault = () => {};
  export let onEdit = () => {};
  export let onDelete = () => {};
  export let onSubmit = () => {};
  export let onReset = () => {};

  let mapsStepStarted = false;
  let mapPickerOpen = false;
  $: addressFieldsVisible =
    Boolean(editingAddressId) ||
    mapsStepStarted ||
    Boolean(addressForm.address_text || addressForm.lat || addressForm.lng || addressForm.maps_url);

  function handleAddAddress() {
    mapsStepStarted = false;
    onAdd();
  }

  function handleEditAddress(address) {
    mapsStepStarted = true;
    onEdit(address);
  }

  function handleResetAddress() {
    mapsStepStarted = false;
    onReset();
  }

  function handleOpenMaps() {
    mapsStepStarted = true;
    mapPickerOpen = true;
  }

  function handleApplyMapSelection(selection) {
    addressForm = {
      ...addressForm,
      lat: selection.lat,
      lng: selection.lng,
      maps_url: selection.maps_url
    };
    mapsStepStarted = true;
    mapPickerOpen = false;
  }
</script>

<section class="section-grid address-layout">
  <article class="panel">
    <div class="section-head">
      <h3>Alamat penjemputan</h3>
      <button class="btn btn-ghost" data-testid="add-address-button" on:click={handleAddAddress}>Tambah Alamat</button>
    </div>

    {#if addresses.length === 0}
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
              {:else}
                <button class="link-button" on:click={() => onSetDefault(address.id)}>Jadikan default</button>
              {/if}
              <button class="link-button" on:click={() => handleEditAddress(address)}>Edit</button>
              <button class="link-button danger" on:click={() => onDelete(address.id)}>Hapus</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </article>

  <article class="panel">
    <h3>{editingAddressId ? 'Edit alamat' : 'Form alamat baru'}</h3>
    <form data-testid="address-form" on:submit|preventDefault={onSubmit}>
      <label class="field">
        <span>Label alamat</span>
        <input data-testid="address-label" bind:value={addressForm.label} placeholder="Rumah / Kantor" />
      </label>
      <label class="field">
        <span>Nama penerima</span>
        <input data-testid="address-receiver-name" bind:value={addressForm.receiver_name} placeholder="Nama penerima" />
      </label>
      <label class="field">
        <span>No. penerima</span>
        <input data-testid="address-receiver-phone" bind:value={addressForm.receiver_phone} placeholder="0812xxxx" />
      </label>
      <div class="maps-helper">
        <div>
          <strong>Pilih lokasi di peta</strong>
          <p>Setelah memilih titik di peta, field alamat lengkap sampai link maps akan muncul otomatis di bawah.</p>
        </div>
        <button class="btn btn-ghost maps-picker-button" type="button" on:click={handleOpenMaps}>Buka Peta</button>
      </div>

      {#if addressFieldsVisible}
        <label class="field">
          <span>Alamat lengkap</span>
          <textarea data-testid="address-text" bind:value={addressForm.address_text} rows="4" placeholder="Alamat penjemputan"></textarea>
        </label>
        <div class="field-row">
          <label class="field">
            <span>Latitude</span>
            <input data-testid="address-lat" bind:value={addressForm.lat} placeholder="-6.2" />
          </label>
          <label class="field">
            <span>Longitude</span>
            <input data-testid="address-lng" bind:value={addressForm.lng} placeholder="106.8" />
          </label>
        </div>
        <label class="field">
          <span>Link maps</span>
          <input data-testid="address-maps-url" bind:value={addressForm.maps_url} placeholder="https://maps.google.com/..." />
        </label>
      {/if}
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

{#if mapPickerOpen}
  <MapPickerModal
    initialLat={addressForm.lat}
    initialLng={addressForm.lng}
    initialAddressText={addressForm.address_text}
    onApply={handleApplyMapSelection}
    onClose={() => (mapPickerOpen = false)}
  />
{/if}
