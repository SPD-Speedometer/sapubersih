<script>
  export let orders = [];
  export let addresses = [];
  export let statusLabel = (value) => value;
  export let toDate = (value) => value;
  export let onPickup = () => {};
  export let onOpenOrder = () => {};
  export let displayName = 'Sahabat Bersih';
  export let lastOrderDate = null;
</script>

<section class="panel welcome-panel">
  <div>
    <p class="eyebrow">Selamat datang</p>
    <h2>Halo, {displayName}!</h2>
    <p class="muted">
      Kelola penjemputan, alamat, dan riwayatmu di sini.
      {#if lastOrderDate} Order terakhir: {lastOrderDate}.{/if}
    </p>
  </div>
</section>

<section class="summary-grid">
  <article class="panel summary-card accent">
    <span>Total order</span>
    <strong>{orders.length}</strong>
  </article>
  <article class="panel summary-card">
    <span>Alamat aktif</span>
    <strong>{addresses.length}</strong>
  </article>
  <article class="panel summary-card">
    <span>Order terbaru</span>
    <strong>{orders[0] ? statusLabel(orders[0].status) : 'Belum ada'}</strong>
  </article>
</section>

<section class="section-grid">
  <article class="panel cta-panel">
    <div>
      <span class="badge">Aksi utama</span>
      <h3>Panggil kurir dari dashboard customer</h3>
      <p>Buat order baru, pilih alamat, tentukan kategori sampah, lalu submit ke backend.</p>
    </div>
    <button class="btn" data-testid="home-panggil-kurir" on:click={onPickup}>Panggil Kurir</button>
  </article>

  <article class="panel">
    <h3>Riwayat singkat</h3>
    {#if orders.length === 0}
      <p class="muted">Belum ada order penjemputan.</p>
    {:else}
      <div class="history-stack">
        {#each orders.slice(0, 3) as order}
          <button class="history-card" on:click={() => onOpenOrder(order.id)}>
            <div>
              <strong>{order.order_code}</strong>
              <span>{statusLabel(order.status)}</span>
            </div>
            <small>{toDate(order.created_at)}</small>
          </button>
        {/each}
      </div>
    {/if}
  </article>
</section>
