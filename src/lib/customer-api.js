import { cleanPayload } from './format';
import { isoFromLocal } from './order-helpers';

export async function fetchPublicData(api) {
  const [categoryRes, areaRes, pricingRes, depotRes] = await Promise.all([
    api.get('/waste-categories'),
    api.get('/service-areas'),
    api.get('/pricing-rules'),
    api.get('/depots')
  ]);

  return {
    wasteCategories: categoryRes.data || [],
    serviceAreas: areaRes.data || [],
    pricingRules: pricingRes.data || [],
    depots: depotRes.data || []
  };
}

export async function fetchProfile(api) {
  const response = await api.get('/me');
  return response.data;
}

export async function fetchAddresses(api) {
  const response = await api.get('/addresses');
  return response.data || [];
}

export async function fetchOrders(api) {
  const response = await api.get('/orders?limit=20');
  return response.data?.orders || [];
}

export async function fetchOrderDetailBundle(api, orderId, fallbackOrder) {
  let orderDetail = fallbackOrder;
  let timeline = [];

  try {
    const orderRes = await api.get(`/orders/${orderId}`);
    orderDetail = orderRes.data;
  } catch (error) {
    if (error.status !== 403) throw error;
  }

  try {
    const timelineRes = await api.get(`/orders/${orderId}/timeline`);
    timeline = timelineRes.data || [];
  } catch (_error) {
    timeline = [];
  }

  return { orderDetail, timeline };
}

export function buildAddressPayload(addressForm) {
  return cleanPayload({
    ...addressForm,
    lat: addressForm.lat === '' ? null : Number(addressForm.lat),
    lng: addressForm.lng === '' ? null : Number(addressForm.lng)
  });
}

export async function saveAddressRequest(api, editingAddressId, addressForm) {
  const payload = buildAddressPayload(addressForm);
  return editingAddressId
    ? api.patch(`/addresses/${editingAddressId}`, payload)
    : api.post('/addresses', payload);
}

export async function setDefaultAddressRequest(api, addressId) {
  return api.post(`/addresses/${addressId}/set-default`);
}

export async function deleteAddressRequest(api, addressId) {
  return api.delete(`/addresses/${addressId}`);
}

export async function registerRequest(api, registerForm) {
  const { password_confirmation, ...payload } = registerForm;
  return api.post('/auth/register', cleanPayload(payload));
}

export async function loginRequest(api, loginForm) {
  return api.post('/auth/login', loginForm);
}

export async function verifyPhoneRequest(api, verifyForm) {
  return api.post('/auth/verify-phone', verifyForm);
}

export async function resendOtpRequest(api, phone) {
  return api.post('/auth/resend-otp', { phone });
}

export async function logoutRequest(api) {
  return api.post('/auth/logout');
}

export async function updateProfileRequest(api, profileForm) {
  const payload = cleanPayload({
    name: profileForm.name,
    email: profileForm.email,
    phone: profileForm.phone
  });
  return api.patch('/me', payload);
}

export async function submitPickupOrderRequest(api, orderForm) {
  const createPayload = cleanPayload({
    address_id: Number(orderForm.address_id),
    calc_method: orderForm.calc_method,
    requested_pickup_at: isoFromLocal(orderForm.requested_pickup_at),
    notes_customer: orderForm.notes_customer
  });

  const orderRes = await api.post('/orders', createPayload);
  const orderId = orderRes.data.id;

  const itemPayload = cleanPayload({
    waste_category_id: Number(orderForm.waste_category_id),
    calc_method: orderForm.calc_method,
    qty: Number(orderForm.qty),
    unit: orderForm.unit,
    notes: orderForm.item_notes
  });

  await api.post(`/orders/${orderId}/items`, itemPayload);
  await api.post(`/orders/${orderId}/estimate`);
  const submitRes = await api.post(`/orders/${orderId}/submit`);

  let timeline = [];
  try {
    const timelineRes = await api.get(`/orders/${orderId}/timeline`);
    timeline = timelineRes.data || [];
  } catch (_error) {
    timeline = [];
  }

  return {
    orderId,
    submittedOrder: submitRes.data,
    timeline
  };
}
