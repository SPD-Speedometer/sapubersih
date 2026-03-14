<script>
  import MetricCard from './MetricCard.svelte';

  export let serviceAreas = [];
  export let wasteCategories = [];
  export let depots = [];
</script>

<section class="section-grid section-metrics">
  <article class="hero-panel hero-side">
    <h3>Ringkasan layanan</h3>
    <div class="metric-list">
      <MetricCard value={serviceAreas.length} label="Area layanan aktif" icon="service-area" />
      <MetricCard value={wasteCategories.length} label="Kategori sampah" icon="category" />
      <MetricCard value={depots.length} label="Depo terdaftar" icon="depot" />
    </div>
  </article>
</section>
