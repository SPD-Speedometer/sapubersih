export const initialRegisterForm = { name: '', phone: '', email: '', password: '', password_confirmation: '' };

export const initialVerifyForm = { phone: '', otp_code: '' };

export const initialLoginForm = { phone: '', password: '' };

export const initialAddressForm = {
  label: '',
  receiver_name: '',
  receiver_phone: '',
  address_text: '',
  lat: '',
  lng: '',
  maps_url: '',
  is_default: false
};

export const initialOrderForm = {
  address_id: '',
  calc_method: 'weighing',
  requested_pickup_at: '',
  notes_customer: '',
  waste_category_id: '',
  qty: '',
  unit: 'kg',
  item_notes: ''
};
