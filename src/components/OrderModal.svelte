<script>
  export let busy = false;
  export let hasAddresses = false;
  export let addresses = [];
  export let wasteCategories = [];
  export let orderForm = {};
  export let activePricingRule = null;
  export let currentWasteCategory = null;
  export let estimatedLineTotal = 0;
  export let toCurrency = (value) => value;
  export let unitOptions = () => [];
  export let inline = false;
  export let onClose = () => {};
  export let onSubmit = () => {};
  export let onAddAddressFirst = () => {};
  export let onCategoryChange = () => {};
</script>

{#if inline}
  <div class="modal-shell inline-shell">
    <section class="modal-card inline-card" data-testid="order-modal" role="dialog" aria-modal="false">
      <div class="section-head">
        <div>
          <span class="badge">Tambah order</span>
          <h3>Form panggil kurir</h3>
        </div>
        <button class="icon-button" data-testid="order-modal-close" on:click={onClose}>×</button>
      </div>

      {#if !hasAddresses}
        <div class="empty-state">
          <p>Anda belum memiliki alamat penjemputan.</p>
          <button class="btn" data-testid="order-add-address-first" on:click={onAddAddressFirst}>
            Tambah Alamat Dulu
          </button>
        </div>
      {:else}
        <form data-testid="order-form" on:submit|preventDefault={onSubmit}>
          <label class="field">
            <span>Alamat penjemputan</span>
            <select data-testid="order-address-id" bind:value={orderForm.address_id}>
              <option value="">Pilih alamat</option>
              {#each addresses as address}
                <option value={address.id}>{address.label} - {address.address_text}</option>
              {/each}
            </select>
          </label>

          <div class="field-row">
            <label class="field">
              <span>Metode hitung</span>
              <select data-testid="order-calc-method" bind:value={orderForm.calc_method}>
                <option value="weighing">Weighing</option>
                <option value="trashbag">Trashbag</option>
                <option value="pickup">Pickup</option>
                <option value="truck">Truck</option>
                <option value="manual">Manual</option>
              </select>
            </label>

            <label class="field">
              <span>Jadwal pickup</span>
              <input data-testid="order-requested-pickup-at" bind:value={orderForm.requested_pickup_at} type="datetime-local" />
            </label>
          </div>

          <label class="field">
            <span>Catatan untuk kurir</span>
            <textarea
              data-testid="order-notes-customer"
              bind:value={orderForm.notes_customer}
              rows="3"
              placeholder="Contoh: sampah ada di samping pagar."
            ></textarea>
          </label>

          <div class="divider"></div>

          <label class="field">
            <span>Kategori sampah</span>
            <select data-testid="order-waste-category-id" bind:value={orderForm.waste_category_id} on:change={onCategoryChange}>
              <option value="">Pilih kategori</option>
              {#each wasteCategories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          </label>

          <div class="field-row">
            <label class="field">
              <span>Estimasi jumlah</span>
              <input data-testid="order-qty" bind:value={orderForm.qty} type="number" min="0" step="0.1" placeholder="0" />
            </label>

            <label class="field">
              <span>Satuan</span>
              <select data-testid="order-unit" bind:value={orderForm.unit}>
                {#each unitOptions(orderForm.calc_method, currentWasteCategory?.default_unit) as unit}
                  <option value={unit}>{unit}</option>
                {/each}
              </select>
            </label>
          </div>

          <label class="field">
            <span>Catatan item</span>
            <textarea data-testid="order-item-notes" bind:value={orderForm.item_notes} rows="2" placeholder="Contoh: plastik botol campur kardus."></textarea>
          </label>

          <div class="estimate-card" data-testid="order-estimate-card">
            <div>
              <span>Estimasi harga</span>
              <strong>{estimatedLineTotal ? toCurrency(estimatedLineTotal) : 'Akan dihitung backend'}</strong>
            </div>
            <small>
              {#if activePricingRule}
                Acuan rule {toCurrency(activePricingRule.price_base)} per {activePricingRule.unit}.
              {:else}
                Rule harga tidak ditemukan untuk kombinasi kategori dan metode ini.
              {/if}
            </small>
          </div>

          <div class="stack-actions">
            <button class="btn" data-testid="order-submit" disabled={busy}>Submit Order</button>
            <button class="btn btn-ghost" data-testid="order-cancel" type="button" on:click={onClose}>Batal</button>
          </div>
        </form>
      {/if}
    </section>
  </div>
{:else}
  <div class="modal-backdrop" role="presentation" on:click|self={onClose}>
    <div class="modal-shell">
      <section class="modal-card" data-testid="order-modal" role="dialog" aria-modal="true">
        <div class="section-head">
          <div>
            <span class="badge">Tambah order</span>
            <h3>Form panggil kurir</h3>
          </div>
          <button class="icon-button" data-testid="order-modal-close" on:click={onClose}>×</button>
        </div>

        {#if !hasAddresses}
          <div class="empty-state">
            <p>Anda belum memiliki alamat penjemputan.</p>
            <button class="btn" data-testid="order-add-address-first" on:click={onAddAddressFirst}>
              Tambah Alamat Dulu
            </button>
          </div>
        {:else}
          <form data-testid="order-form" on:submit|preventDefault={onSubmit}>
            <label class="field">
              <span>Alamat penjemputan</span>
              <select data-testid="order-address-id" bind:value={orderForm.address_id}>
                <option value="">Pilih alamat</option>
                {#each addresses as address}
                  <option value={address.id}>{address.label} - {address.address_text}</option>
                {/each}
              </select>
            </label>

            <div class="field-row">
              <label class="field">
                <span>Metode hitung</span>
                <select data-testid="order-calc-method" bind:value={orderForm.calc_method}>
                  <option value="weighing">Weighing</option>
                  <option value="trashbag">Trashbag</option>
                  <option value="pickup">Pickup</option>
                  <option value="truck">Truck</option>
                  <option value="manual">Manual</option>
                </select>
              </label>

              <label class="field">
                <span>Jadwal pickup</span>
                <input data-testid="order-requested-pickup-at" bind:value={orderForm.requested_pickup_at} type="datetime-local" />
              </label>
            </div>

            <label class="field">
              <span>Catatan untuk kurir</span>
              <textarea
                data-testid="order-notes-customer"
                bind:value={orderForm.notes_customer}
                rows="3"
                placeholder="Contoh: sampah ada di samping pagar."
              ></textarea>
            </label>

            <div class="divider"></div>

            <label class="field">
              <span>Kategori sampah</span>
              <select data-testid="order-waste-category-id" bind:value={orderForm.waste_category_id} on:change={onCategoryChange}>
                <option value="">Pilih kategori</option>
                {#each wasteCategories as category}
                  <option value={category.id}>{category.name}</option>
                {/each}
              </select>
            </label>

            <div class="field-row">
              <label class="field">
                <span>Estimasi jumlah</span>
                <input data-testid="order-qty" bind:value={orderForm.qty} type="number" min="0" step="0.1" placeholder="0" />
              </label>

              <label class="field">
                <span>Satuan</span>
                <select data-testid="order-unit" bind:value={orderForm.unit}>
                  {#each unitOptions(orderForm.calc_method, currentWasteCategory?.default_unit) as unit}
                    <option value={unit}>{unit}</option>
                  {/each}
                </select>
              </select>
              </label>
            </div>

            <label class="field">
              <span>Catatan item</span>
              <textarea data-testid="order-item-notes" bind:value={orderForm.item_notes} rows="2" placeholder="Contoh: plastik botol campur kardus."></textarea>
            </label>

            <div class="estimate-card" data-testid="order-estimate-card">
              <div>
                <span>Estimasi harga</span>
                <strong>{estimatedLineTotal ? toCurrency(estimatedLineTotal) : 'Akan dihitung backend'}</strong>
              </div>
              <small>
                {#if activePricingRule}
                  Acuan rule {toCurrency(activePricingRule.price_base)} per {activePricingRule.unit}.
                {:else}
                  Rule harga tidak ditemukan untuk kombinasi kategori dan metode ini.
                {/if}
              </small>
            </div>

            <div class="stack-actions">
              <button class="btn" data-testid="order-submit" disabled={busy}>Submit Order</button>
              <button class="btn btn-ghost" data-testid="order-cancel" type="button" on:click={onClose}>Batal</button>
            </div>
          </form>
        {/if}
      </section>
    </div>
  </div>
{/if}

<style>
  .inline-shell {
    padding: 1rem 0;
  }

  .inline-card {
    position: static;
    transform: none;
    box-shadow: none;
    max-width: 840px;
    margin: 0 auto;
  }
</style>
