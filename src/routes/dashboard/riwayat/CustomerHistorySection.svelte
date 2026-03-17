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
      const state = currentIndex >= 0 && idx <= currentIndex ? 'done' : 'pending';
      return {
        status,
        label: statusLabel(status),
        date: entry.created_at || '',
        note: entry.note || '',
        state
      };
    });
  })();
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
              <div class={`timeline-card ${entry.state}`}>
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <strong>{entry.label}</strong>
                  <span>{entry.date ? toDate(entry.date) : 'Belum tercatat'}</span>
                  <small>{entry.note || 'Perubahan status tercatat di backend.'}</small>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </article>
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
    padding-left: 0.8rem;
  }

  .timeline-card {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .timeline-card::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 18px;
    bottom: -0.65rem;
    width: 2px;
    background: #e5e7eb;
  }

  .timeline-card:last-child::before {
    display: none;
  }

  .timeline-marker {
    width: 14px;
    height: 14px;
    margin-top: 2px;
    border-radius: 50%;
    border: 2px solid #e5e7eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0);
  }

  .timeline-card.done .timeline-marker {
    background: #16a34a;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
  }

  .timeline-card.done::before {
    background: linear-gradient(#16a34a, #16a34a);
  }

  .timeline-content strong {
    display: block;
    color: #0f172a;
  }

  .timeline-content span {
    display: block;
    color: #1f2937;
    font-size: 0.95rem;
  }

  .timeline-content small {
    display: block;
    color: #6b7280;
  }

  .timeline-card.pending .timeline-marker {
    background: #fff;
    border-color: #cbd5e1;
  }

  .timeline-card.pending .timeline-content strong,
  .timeline-card.pending .timeline-content span,
  .timeline-card.pending .timeline-content small {
    color: #94a3b8;
  }
</style>
