<script>
  export let busy = false;
  export let verifyForm = { phone: '', otp_code: '' };
  export let onSubmit = () => {};
  export let onResend = () => {};
  export let onDismiss = () => {};
</script>

<div class="modal-backdrop">
  <section class="popup-card" data-testid="verification-popup" role="dialog" aria-modal="true" aria-labelledby="verify-title">
    <div class="popup-header">
      <span class="badge">Peringatan akun</span>
      <button class="icon-button popup-close" type="button" aria-label="Tutup popup" data-testid="verify-dismiss" on:click={onDismiss}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
    <h3 id="verify-title">Nomor WhatsApp belum diverifikasi</h3>
    <p>
      Anda sudah login, tetapi akun belum bisa dianggap lengkap sebelum OTP diverifikasi. Masukkan kode OTP
      langsung dari popup ini.
    </p>
    <div class="field">
      <span>No. WhatsApp</span>
      <input data-testid="verify-phone" bind:value={verifyForm.phone} placeholder="0812xxxx" />
    </div>
    <div class="field verify-otp-field">
      <span>Kode OTP</span>
      <input data-testid="verify-otp-code" bind:value={verifyForm.otp_code} placeholder="6 digit OTP" />
    </div>
    <div class="stack-actions">
      <button class="btn" data-testid="verify-submit" on:click={onSubmit} disabled={busy}>Verifikasi Sekarang</button>
      <button class="btn btn-ghost popup-dismiss" data-testid="verify-resend" on:click={onResend} disabled={busy}>
        Kirim Ulang OTP
      </button>
    </div>
  </section>
</div>
