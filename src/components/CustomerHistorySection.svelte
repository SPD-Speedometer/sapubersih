<script>
  export let orders = [];
  export let selectedOrder = null;
  export let orderTimeline = [];
  export let orderHistoryWarning = '';
  export let statusLabel = (value) => value;
  export let toCurrency = (value) => value;
  export let toDate = (value) => value;
  export let onRefresh = () => {};
  export let onOpenOrder = () => {};
</script>

<section class="section-grid history-layout">
  <article class="panel">
    <div class="section-head">
      <h3>Riwayat order</h3>
      <button class="btn btn-ghost" on:click={onRefresh}>Refresh</button>
    </div>

    {#if orderHistoryWarning}
      <p class="muted" data-testid="order-history-warning">{orderHistoryWarning}</p>
    {/if}

    {#if orders.length === 0}
      <p class="muted">Belum ada order.</p>
    {:else}
      <div class="history-stack">
        {#each orders as order}
          <button class="history-card" on:click={() => onOpenOrder(order.id)}>
            <div>
              <strong>{order.order_code}</strong>
              <span>{statusLabel(order.status)}</span>
            </div>
            <small>{toCurrency(order.total_amount)} • {toDate(order.created_at)}</small>
          </button>
        {/each}
      </div>
    {/if}
  </article>

  <article class="panel">
    <h3>Detail order</h3>
    {#if !selectedOrder}
      <p class="muted">Pilih salah satu order untuk melihat detail dan timeline.</p>
    {:else}
      <div class="detail-stack">
        <div class="detail-row">
          <span>Kode</span>
          <strong>{selectedOrder.order_code}</strong>
        </div>
        <div class="detail-row">
          <span>Status</span>
          <strong>{statusLabel(selectedOrder.status)}</strong>
        </div>
        <div class="detail-row">
          <span>Alamat</span>
          <strong>{selectedOrder.address?.label || '-'}</strong>
        </div>
        <div class="detail-row">
          <span>Pickup</span>
          <strong>{toDate(selectedOrder.requested_pickup_at || selectedOrder.confirmed_pickup_at)}</strong>
        </div>
        <div class="detail-row">
          <span>Total</span>
          <strong>{toCurrency(selectedOrder.total_amount)}</strong>
        </div>

        <div>
          <h4>Item sampah</h4>
          <div class="item-list">
            {#each selectedOrder.items || [] as item}
              <div class="item-card">
                <strong>{item.waste_category?.name || 'Kategori'}</strong>
                <span>{item.qty || 0} {item.unit || '-'}</span>
                <small>{toCurrency(item.line_total)}</small>
              </div>
            {/each}
          </div>
        </div>

        <div>
          <h4>Timeline</h4>
          <div class="timeline-list">
            {#each orderTimeline as entry}
              <div class="timeline-card">
                <strong>{statusLabel(entry.status)}</strong>
                <span>{toDate(entry.created_at)}</span>
                <small>{entry.note || 'Perubahan status tercatat di backend.'}</small>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </article>
</section>
