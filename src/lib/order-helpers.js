export function isoFromLocal(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function statusLabel(status) {
  const map = {
    draft: 'Draft',
    submitted: 'Menunggu review',
    waiting_admin_price: 'Menunggu harga admin',
    waiting_payment: 'Menunggu pembayaran',
    paid: 'Sudah dibayar',
    assigned: 'Kurir ditugaskan',
    enroute: 'Kurir menuju lokasi',
    arrived: 'Kurir tiba',
    picked_up: 'Sudah dijemput',
    delivered: 'Sampai depot',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    failed: 'Gagal'
  };

  return map[status] || status;
}

export function unitOptions(method, fallbackUnit) {
  if (method === 'weighing') return ['kg'];
  if (method === 'trashbag') return ['bag'];
  if (method === 'pickup') return ['pickup'];
  if (method === 'truck') return ['truck'];
  return fallbackUnit && fallbackUnit !== 'manual' ? [fallbackUnit] : ['kg', 'bag', 'pickup', 'truck'];
}
