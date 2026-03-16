<script>
  export let alert = { type: '', text: '' };
  export let onClose = () => {};
</script>

{#if alert.text}
  <div class={`alert ${alert.type}`} data-testid="global-alert">
    <span>{alert.text}</span>
    <button class="alert-close" type="button" aria-label="Tutup peringatan" on:click={onClose}>×</button>
  </div>
{/if}
