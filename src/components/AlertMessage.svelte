<script>
  export let alert = { type: '', text: '' };
</script>

{#if alert.text}
  <div class={`alert ${alert.type}`} data-testid="global-alert">{alert.text}</div>
{/if}
