const baseUrl = process.env.API_BASE_URL || 'http://localhost:8081/api/v1';
const turnstileToken = process.env.TURNSTILE_TOKEN || '';
const otpCode = process.env.OTP_CODE || '';

const now = Date.now();
const uniquePhone = process.env.TEST_PHONE || `08123${String(now).slice(-7)}`;
const password = process.env.TEST_PASSWORD || 'rahasia123';
const email = process.env.TEST_EMAIL || `tester.${now}@example.com`;
const name = process.env.TEST_NAME || 'Automation Tester';

function headers(extra = {}) {
  return {
    Accept: 'application/json',
    ...(turnstileToken ? { 'X-Turnstile-Token': turnstileToken } : {}),
    ...extra
  };
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();

  if (!contentType.includes('application/json')) {
    const preview = rawText.slice(0, 200).replace(/\s+/g, ' ').trim();
    throw new Error(
      `Expected JSON from ${response.url}, got ${contentType || 'unknown content-type'} with status ${response.status}. Preview: ${preview}`
    );
  }

  const payload = JSON.parse(rawText);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || `HTTP ${response.status}`);
  }

  return payload;
}

async function request(path, { method = 'GET', body, accessToken } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: headers({
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }),
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  return parseResponse(response);
}

function logStep(title, value) {
  console.log(`\n[${title}]`);
  if (value !== undefined) {
    console.log(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  }
}

async function main() {
  logStep('CONFIG', { baseUrl, uniquePhone, email });

  const categoryRes = await request('/waste-categories');
  const wasteCategories = categoryRes.data || [];
  if (wasteCategories.length === 0) {
    throw new Error('Waste categories kosong. Seed/master data belum siap.');
  }
  const wasteCategory = wasteCategories[0];
  logStep('WASTE CATEGORY', wasteCategory);

  const registerRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name,
      phone: uniquePhone,
      email,
      password
    }
  });
  logStep('REGISTER', registerRes.message);

  if (otpCode) {
    const verifyRes = await request('/auth/verify-phone', {
      method: 'POST',
      body: {
        phone: uniquePhone,
        otp_code: otpCode
      }
    });
    logStep('VERIFY PHONE', verifyRes.message);
  } else {
    logStep('VERIFY PHONE', 'Skipped. Set OTP_CODE jika ingin menguji verifikasi OTP juga.');
  }

  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: {
      phone: uniquePhone,
      password
    }
  });
  const accessToken = loginRes.data.access_token;
  logStep('LOGIN', {
    message: loginRes.message,
    user_id: loginRes.data.user.id
  });

  const addressRes = await request('/addresses', {
    method: 'POST',
    accessToken,
    body: {
      label: 'Rumah Automation',
      receiver_name: name,
      receiver_phone: uniquePhone,
      address_text: 'Jl. Test Automation No. 1',
      lat: -6.2,
      lng: 106.8,
      maps_url: 'https://maps.google.com/?q=-6.2,106.8',
      is_default: true
    }
  });
  const addressId = addressRes.data.id;
  logStep('CREATE ADDRESS', addressRes.data);

  const orderRes = await request('/orders', {
    method: 'POST',
    accessToken,
    body: {
      address_id: addressId,
      calc_method: 'weighing',
      requested_pickup_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      notes_customer: 'Order dari automation script'
    }
  });
  const orderId = orderRes.data.id;
  logStep('CREATE ORDER', orderRes.data);

  const itemRes = await request(`/orders/${orderId}/items`, {
    method: 'POST',
    accessToken,
    body: {
      waste_category_id: wasteCategory.id,
      calc_method: 'weighing',
      qty: 3,
      unit: wasteCategory.default_unit === 'manual' ? 'kg' : wasteCategory.default_unit || 'kg',
      notes: 'Item automation'
    }
  });
  logStep('ADD ITEM', itemRes.data);

  const estimateRes = await request(`/orders/${orderId}/estimate`, {
    method: 'POST',
    accessToken
  });
  logStep('ESTIMATE', estimateRes.data);

  const submitRes = await request(`/orders/${orderId}/submit`, {
    method: 'POST',
    accessToken
  });
  logStep('SUBMIT ORDER', submitRes.data);

  console.log('\n[SUCCESS]');
  console.log(
    JSON.stringify(
      {
        phone: uniquePhone,
        password,
        address_id: addressId,
        order_id: orderId,
        final_status: submitRes.data.status
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error('\n[FAILED]');
  console.error(error.message);
  process.exit(1);
});
