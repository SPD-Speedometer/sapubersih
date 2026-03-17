<script>
  export let orders = [];
  export let selectedOrder = null;
  export let orderTimeline = [];
  export let orderHistoryWarning = '';
  export let statusLabel = (value) => value;
  export let toCurrency = (value) => value;
  export let toDate = (value) => value;
  export let isMobileView = false;
  export let showHistoryDetail = false;
  export let onRefresh = () => {};
  export let onOpenOrder = () => {};
  export let onBackDetail = () => {};

  $: courierInfo = selectedOrder
    ? {
        name:
          selectedOrder.courier?.name ||
          selectedOrder.courier_name ||
          selectedOrder.courier_user?.name ||
          selectedOrder.assigned_user?.name ||
          '-',
        phone:
          selectedOrder.courier?.phone ||
          selectedOrder.courier_phone ||
          selectedOrder.courier_user?.phone ||
          selectedOrder.assigned_user?.phone ||
          '',
        vehicle:
          selectedOrder.courier?.vehicle ||
          selectedOrder.courier_vehicle ||
          selectedOrder.courier_user?.vehicle ||
          selectedOrder.assigned_user?.vehicle ||
          ''
      }
    : null;

  const courierVisibleStatuses = ['assigned', 'enroute', 'arrived', 'picked_up', 'delivered', 'completed'];
  $: showCourierInfo = selectedOrder && courierVisibleStatuses.includes(selectedOrder.status);

  const statusOrder = [
    'draft',
    'submitted',
    'waiting_admin_price',
    'waiting_payment',
    'paid',
    'assigned',
    'enroute',
    'arrived',
    'picked_up',
    'delivered',
    'completed'
  ];

  $: timelineEntries = (() => {
    if (!selectedOrder) return [];
    const timelineMap = (orderTimeline || []).reduce((acc, entry) => {
      acc[String(entry.status)] = entry;
      return acc;
    }, {});

    const currentStatus = selectedOrder.status || orderTimeline?.[orderTimeline.length - 1]?.status || '';
    const currentIndex = statusOrder.indexOf(currentStatus);

    return statusOrder.map((status, idx) => {
      const entry = timelineMap[status] || {};
      let state = 'upcoming';
      if (currentIndex >= 0) {
        if (idx < currentIndex) state = 'done';
        else if (idx === currentIndex) state = 'current';
      }

      const palette = {
        done: { color: '#22c55e', muted: '#0f172a' },
        current: { color: '#f97316', muted: '#0f172a' },
        upcoming: { color: '#94a3b8', muted: '#94a3b8' }
      };

      const theme = palette[state];
      return {
        status,
        label: statusLabel(status),
        date: entry.created_at || '',
        note: entry.note || '',
        state,
        color: theme.color,
        muted: theme.muted
      };
    });
  })();
</script>

<section class="section-grid history-layout">
  {#if !(isMobileView && showHistoryDetail)}
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
  {/if}

  {#if !isMobileView || showHistoryDetail}
    <article class={`panel ${isMobileView ? 'panel-mobile-detail' : ''}`}>
    <h3>Detail order</h3>
    {#if isMobileView && showHistoryDetail}
      <button class="btn btn-ghost back-btn" type="button" on:click={onBackDetail}>← Kembali</button>
    {/if}
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

        {#if showCourierInfo}
          <div>
            <h4>Kurir ditugaskan</h4>
            <div class="courier-card">
              <strong>{courierInfo?.name}</strong>
              {#if courierInfo?.phone}<span>Telp: {courierInfo.phone}</span>{/if}
              {#if courierInfo?.vehicle}<span>Kendaraan: {courierInfo.vehicle}</span>{/if}
            </div>
          </div>
        {/if}

        <div>
          <h4>Timeline</h4>
          <div class="timeline-list">
            {#each timelineEntries as entry}
              <div class={`timeline-row ${entry.state}`} style={`--tl-color:${entry.color}; --tl-muted:${entry.muted};`}>
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <strong>{entry.label}</strong>
                  <span>{entry.date ? toDate(entry.date) : 'Belum tercatat'}</span>
                  {#if entry.note}<small>{entry.note}</small>{/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </article>
{/if}
</section>

<style>
  .courier-card {
    display: grid;
    gap: 0.15rem;
    padding: 0.8rem 1rem;
    border-radius: 12px;
    border: 1px solid var(--line, #e5e7eb);
    background: #f8fafc;
  }

  .courier-card strong {
    font-size: 1.02rem;
  }

  .courier-card span {
    color: var(--muted, #6b7280);
    font-size: 0.95rem;
  }

  .timeline-list {
    position: relative;
    display: grid;
    gap: 0.65rem;
    padding-left: 0;
  }

  .timeline-row {
    position: relative;
    display: grid;
    grid-template-columns: 18px 1fr;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .timeline-row::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 18px;
    bottom: -0.65rem;
    width: 2px;
    background: #e5e7eb;
  }

  .timeline-row:last-child::before {
    display: none;
  }

  .timeline-marker {
    width: 14px;
    height: 14px;
    margin-top: 2px;
    border-radius: 50%;
    border: 2px solid var(--tl-color, #e5e7eb);
    background: #fff;
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--tl-color, #16a34a) 12%, transparent);
  }

  .timeline-row.done .timeline-marker {
    background: var(--tl-color, #16a34a);
    border-color: var(--tl-color, #16a34a);
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--tl-color, #16a34a) 20%, transparent);
  }

  .timeline-row.done::before {
    background: linear-gradient(var(--tl-color, #16a34a), var(--tl-color, #16a34a));
  }

  .timeline-content strong {
    display: block;
    color: var(--tl-muted, #0f172a);
  }

  .timeline-content span {
    display: block;
    color: var(--tl-muted, #1f2937);
    font-size: 0.95rem;
  }

  .timeline-content small {
    display: block;
    color: color-mix(in srgb, var(--tl-muted, #6b7280) 80%, #ffffff);
  }

  .timeline-row.pending .timeline-marker {
    background: #fff;
    border-color: var(--tl-color, #cbd5e1);
  }

  .timeline-row.pending .timeline-content strong,
  .timeline-row.pending .timeline-content span,
  .timeline-row.pending .timeline-content small {
    color: var(--tl-muted, #94a3b8);
  }

  .panel-mobile-detail {
    width: 100%;
  }

  .back-btn {
    margin: 0.4rem 0 0.8rem;
    padding-left: 0;
    color: var(--color-brand-800, #0f172a);
  }
</style>
