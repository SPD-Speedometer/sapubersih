<script>
  import flatpickr from 'flatpickr';
  import 'flatpickr/dist/flatpickr.css';

  export let busy = false;
  export let hasAddresses = false;
  export let addresses = [];
  export let wasteCategories = [];
  export let pricingRules = [];
  export let orderForm = {};
  export let activePricingRule = null;
  export let currentWasteCategory = null;
  export let estimatedLineTotal = 0;
  export let toCurrency = (value) => value;
  export let unitOptions = () => [];
  export let inline = false;
  export let hasOngoingOrder = false;
  export let onClose = () => {};
  export let onSubmit = () => {};
  export let onAddAddressFirst = () => {};
  export let onCategoryChange = () => {};

  let selectedPricingRuleId = orderForm.pricing_rule_id ? String(orderForm.pricing_rule_id) : '';

  function applyPricingRuleById(id) {
    if (!id) return;
    const rule = pricingRules.find((r) => String(r.id) === String(id));
    if (!rule) return;
    selectedPricingRuleId = String(id);
    orderForm = {
      ...orderForm,
      pricing_rule_id: String(rule.id),
      waste_category_id: String(rule.waste_category_id),
      calc_method: rule.calc_method,
      unit: rule.unit || rule.default_unit || orderForm.unit
    };
  }

  function findCategoryName(id) {
    return wasteCategories.find((c) => String(c.id) === String(id))?.name || 'Tanpa nama';
  }

  function getRuleLabel(rule) {
    const unit = rule.unit || rule.default_unit || '';
    return `${findCategoryName(rule.waste_category_id)} - ${rule.calc_method} - ${unit}`;
  }

  function handlePricingSelect(event) {
    const value = event.target.value;
    if (value) {
      applyPricingRuleById(value);
      onCategoryChange();
    } else {
      selectedPricingRuleId = '';
      orderForm = { ...orderForm, pricing_rule_id: '', waste_category_id: '', calc_method: orderForm.calc_method };
    }
  }

  import { onMount } from 'svelte';
  onMount(() => {
    if (orderForm.pricing_rule_id) applyPricingRuleById(orderForm.pricing_rule_id);
  });

  function datetimePicker(node, value) {
    const fp = flatpickr(node, {
      enableTime: true,
      dateFormat: 'Y-m-d H:i',
      altInput: true,
      altFormat: 'd M Y, H:i',
      time_24hr: true,
      defaultDate: value || null,
      allowInput: true,
      onChange(selectedDates, dateStr) {
        orderForm = { ...orderForm, requested_pickup_at: dateStr };
      }
    });

    return {
      update(newValue) {
        if (newValue !== value) {
          value = newValue;
          fp.setDate(newValue || null, false);
        }
      },
      destroy() {
        fp.destroy();
      }
    };
  }
</script>

{#if inline}
  <div class="modal-shell inline-shell">
    <section class="modal-card inline-card" data-testid="order-modal" role="dialog" aria-modal="false">
      {#if hasOngoingOrder}
        <div class="inline-warning" role="status">
          Masih ada order yang belum selesai. Yakin mau panggil kurir lagi?
        </div>
      {/if}

      <div class="section-head">
        <div>
          <h3>Form panggil kurir</h3>
        </div>
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
                <option value={String(address.id)}>{address.label} - {address.address_text}</option>
              {/each}
            </select>
          </label>

          <label class="field">
            <span>Jadwal pickup</span>
            <input
              data-testid="order-requested-pickup-at"
              bind:value={orderForm.requested_pickup_at}
              use:datetimePicker={orderForm.requested_pickup_at}
              type="text"
              placeholder="Pilih tanggal & jam"
            />
          </label>

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
            <span>Kategori sampah (berdasar pricing rule)</span>
            <select data-testid="order-waste-category-id" bind:value={selectedPricingRuleId} on:change={handlePricingSelect}>
              <option value="">Pilih kategori & metode</option>
              {#each pricingRules as rule}
                <option value={String(rule.id)}>{getRuleLabel(rule)}</option>
              {/each}
            </select>
          </label>

          <label class="field">
            <span>Estimasi jumlah ({orderForm.unit || activePricingRule?.unit || currentWasteCategory?.default_unit || 'unit'})</span>
            <input data-testid="order-qty" bind:value={orderForm.qty} type="number" min="0" step="0.1" placeholder="0" />
          </label>

          <label class="field">
            <span>Catatan item</span>
            <textarea data-testid="order-item-notes" bind:value={orderForm.item_notes} rows="2" placeholder="Contoh: plastik botol campur kardus."></textarea>
          </label>

          <div class="estimate-card mt-2 mt-gap" data-testid="order-estimate-card">
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

          <div class="stack-actions mt-gap mb-gap">
            <button class="btn" data-testid="order-submit" disabled={busy}>Submit Order</button>
          </div>
        </form>
      {/if}
    </section>
  </div>
{:else}
  <div class="modal-backdrop" role="presentation" on:click|self={onClose}>
    <div class="modal-shell">
      <section class="modal-card" data-testid="order-modal" role="dialog" aria-modal="true">
        {#if hasOngoingOrder}
          <div class="inline-warning" role="status">
            Masih ada order yang belum selesai. Yakin mau panggil kurir lagi?
          </div>
        {/if}

        <div class="section-head">
          <div>
            <h3>Form panggil kurir</h3>
          </div>
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
                  <option value={String(address.id)}>{address.label} - {address.address_text}</option>
                {/each}
              </select>
            </label>

            <label class="field">
              <span>Jadwal pickup</span>
              <input
                data-testid="order-requested-pickup-at"
                bind:value={orderForm.requested_pickup_at}
                use:datetimePicker={orderForm.requested_pickup_at}
                type="text"
                placeholder="Pilih tanggal & jam"
              />
            </label>

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
              <span>Kategori sampah (berdasar pricing rule)</span>
              <select data-testid="order-waste-category-id" bind:value={selectedPricingRuleId} on:change={handlePricingSelect}>
                <option value="">Pilih kategori & metode</option>
              {#each pricingRules as rule}
                <option value={String(rule.id)}>{getRuleLabel(rule)}</option>
              {/each}
            </select>
          </label>

            <label class="field">
              <span>Estimasi jumlah ({orderForm.unit || activePricingRule?.unit || currentWasteCategory?.default_unit || 'unit'})</span>
              <input data-testid="order-qty" bind:value={orderForm.qty} type="number" min="0" step="0.1" placeholder="0" />
            </label>

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

            <div class="stack-actions mb-gap">
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
    padding: 1.5rem 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    padding-inline: clamp(1rem, 4vw, 2.5rem);
  }

  .inline-card {
    position: static;
    transform: none;
    width: min(920px, 100%);
    margin: 0 auto;
    background: #fff;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    border: 1px solid #edf0f5;
    padding: 1.25rem 1.5rem;
  }

  @media (max-width: 640px) {
    .modal-card,
    .inline-card {
      padding: 0.9rem 1rem;
    }

    /* Hilangkan margin/padding luar di tampilan mobile agar menempel ke tepi */
    .inline-shell {
      padding: 0;
      margin-top: 0.75rem;
      padding-bottom: 1.25rem;
    }

    .inline-card {
      width: 100%;
      margin: 0;
      border-radius: 0;
      border: none;
      box-shadow: none;
    }
  }

  .inline-warning {
    margin: 0.5rem 0 1rem;
    padding: 0.9rem 1rem;
    border-radius: 10px;
    background: #fff6ed;
    border: 1px solid #fed7aa;
    color: #c05621;
    font-weight: 600;
  }

  :global(.flatpickr-input),
  :global(.flatpickr-alt-input) {
    width: 100%;
    box-sizing: border-box;
  }

  .mt-gap {
    margin-top: 0.75rem;
  }

  .mb-gap {
    margin-bottom: 1.25rem;
  }

  @media (max-width: 640px) {
    .mb-gap {
      margin-bottom: 2.5rem;
    }
  }
</style>
