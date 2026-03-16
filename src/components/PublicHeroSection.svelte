<script>
  export let onPickup = () => {};
  export let onRegister = () => {};
</script>

<section class="hero-grid">
  <article class="hero-panel hero-main">
    <span class="badge">Layanan pickup untuk customer</span>
    <h2>Panggil kurir dari rumah untuk solusi sampahmu yang lebih praktis, rapi, dan mudah ditangani.</h2>
    <p>
      Cukup daftarkan diri, isi data penjemputan, buat order, dan kurir akan langsung mengambil sampahmu di rumah.
    </p>

    <div class="hero-buttons">
      <button class="btn" data-testid="hero-panggil-kurir" on:click={onPickup}>Panggil Kurir</button>
      <button class="btn btn-ghost" data-testid="hero-buat-akun" on:click={onRegister}>Buat Akun</button>
    </div>
  </article>

  <aside class="hero-panel hero-visual" aria-hidden="true">
    <img class="trash-illustration" src="/hero-recycle-green.png" alt="" />
    <strong class="hero-visual-heading">Jemput sampah lebih rapi</strong>
    <span class="hero-visual-sub">Order cepat, kurir datang, sampah langsung terangkut.</span>
  </aside>
</section>
