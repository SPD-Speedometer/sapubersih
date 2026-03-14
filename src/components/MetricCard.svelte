<script>
  export let value = 0;
  export let label = '';
  export let icon = 'service-area';
</script>

<div class="metric-card">
  <div class="metric-illustration" aria-hidden="true">
    {#if icon === 'service-area'}
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 17.5C4 14.4624 6.46243 12 9.5 12H14.5C17.5376 12 20 14.4624 20 17.5V19H4V17.5Z" />
        <path d="M12 11C14.4853 11 16.5 8.98528 16.5 6.5C16.5 4.01472 14.4853 2 12 2C9.51472 2 7.5 4.01472 7.5 6.5C7.5 8.98528 9.51472 11 12 11Z" />
      </svg>
    {:else if icon === 'category'}
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 5H19V9H5V5Z" />
        <path d="M5 10.5H11V19H5V10.5Z" />
        <path d="M13 10.5H19V14H13V10.5Z" />
        <path d="M13 15.5H19V19H13V15.5Z" />
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 10L12 4L20 10V19H4V10Z" />
        <path d="M9 19V13H15V19" />
      </svg>
    {/if}
  </div>

  <div class="metric-copy">
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
</div>
