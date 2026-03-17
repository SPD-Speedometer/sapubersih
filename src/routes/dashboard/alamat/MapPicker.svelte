<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import 'leaflet/dist/leaflet.css';

  // Props
  export let lat = 0;
  export let lng = 0;
  export let height = '280px';

  const dispatch = createEventDispatcher();

  const DEFAULT_LAT = -6.2;
  const DEFAULT_LNG = 106.816666;

  let mapEl;
  let map;
  let marker;
  let L;
  let locating = false;
  let locateError = '';
  export function invalidate() {
    if (map) {
      map.invalidateSize();
    }
  }

  function googleMapsUrl(la, lo) {
    return `https://www.google.com/maps?q=${la},${lo}`;
  }

  async function updateMarkerPosition(la, lo, pan = true) {
    lat = parseFloat(Number(la).toFixed(6));
    lng = parseFloat(Number(lo).toFixed(6));

    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }

    if (pan) {
      map.setView([lat, lng], map.getZoom());
    }

    dispatch('change', {
      lat: String(lat),
      lng: String(lng),
      maps_url: googleMapsUrl(lat, lng)
    });

    try {
      const addressText = await reverseGeocode(lat, lng);
      if (addressText) {
        dispatch('change', {
          lat: String(lat),
          lng: String(lng),
          maps_url: googleMapsUrl(lat, lng),
          address_text: addressText
        });
      }
    } catch (_err) {
      // abaikan kegagalan geocode
    }
  }

  function locateMe() {
    if (!navigator.geolocation || !map) return;
    locating = true;
    locateError = '';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locating = false;
        updateMarkerPosition(pos.coords.latitude, pos.coords.longitude, true);
        map.setZoom(16);
      },
      (err) => {
        locating = false;
        if (err.code === 1) {
          locateError = 'Izin lokasi ditolak.';
        } else if (err.code === 3) {
          locateError = 'Timeout permintaan lokasi.';
        } else {
          locateError = 'Lokasi tidak tersedia.';
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  // Reactive: sync external lat/lng changes to map marker
  $: if (map && L && lat && lng) {
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }
  }

  onMount(async () => {
    const leaflet = await import('leaflet');
    L = leaflet.default || leaflet;

    // Fix default icon
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    const initLat = lat || DEFAULT_LAT;
    const initLng = lng || DEFAULT_LNG;
    const initZoom = lat && lng ? 15 : 11;

    map = L.map(mapEl).setView([initLat, initLng], initZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    if (lat && lng) {
      marker = L.marker([lat, lng]).addTo(map);
    }

    map.on('click', (e) => {
      updateMarkerPosition(e.latlng.lat, e.latlng.lng, false);
    });

    return () => {
      if (map) map.remove();
    };
  });

  onDestroy(() => {
    if (map) map.remove();
  });

  async function reverseGeocode(la, lo) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${la}&lon=${lo}&accept-language=id`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name || null;
  }
</script>

<div class="map-picker-inline">
  <!-- Map container -->
  <div class="map-picker-wrap" style="height: {height};">
    <div bind:this={mapEl} class="map-picker-el"></div>
    <!-- Locate me button overlay -->
    <button
      class="map-locate-btn"
      type="button"
      title="Gunakan lokasi saya"
      on:click={locateMe}
      disabled={locating}
    >
      {#if locating}
        <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="2" x2="12" y2="5"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="5" y2="12"/>
          <line x1="19" y1="12" x2="22" y2="12"/>
        </svg>
      {/if}
    </button>
  </div>

  <!-- Coordinate inputs -->
  <div class="map-coord-row">
    <label class="field">
      <span>Latitude</span>
      <input
        type="number"
        step="any"
        bind:value={lat}
        placeholder="-6.2"
        on:change={() => {
          if (map && L && lat && lng) {
            updateMarkerPosition(lat, lng, true);
          }
        }}
      />
    </label>
    <label class="field">
      <span>Longitude</span>
      <input
        type="number"
        step="any"
        bind:value={lng}
        placeholder="106.8"
        on:change={() => {
          if (map && L && lat && lng) {
            updateMarkerPosition(lat, lng, true);
          }
        }}
      />
    </label>
  </div>

  {#if locateError}
    <p class="map-locate-error">{locateError}</p>
  {/if}

  {#if lat && lng}
    <p class="map-coord-hint">📍 {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)} — atau klik peta untuk ubah lokasi</p>
  {:else}
    <p class="map-coord-hint muted">Klik peta untuk pilih lokasi, atau gunakan tombol lokasi saya</p>
  {/if}
</div>

<style>
  .map-picker-inline {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .map-picker-wrap {
    position: relative;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 1px solid var(--border, #e2e8f0);
  }

  .map-picker-el {
    width: 100%;
    height: 100%;
  }

  .map-locate-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    cursor: pointer;
    transition: background 0.15s;
  }

  .map-locate-btn:hover:not(:disabled) {
    background: #f0fdf4;
  }

  .map-locate-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .map-locate-btn svg {
    width: 15px;
    height: 15px;
    color: #374151;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .map-coord-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .map-coord-hint {
    font-size: 0.75rem;
    color: #6b7280;
    text-align: center;
    margin: 0;
  }

  .map-locate-error {
    font-size: 0.75rem;
    color: #ef4444;
    margin: 0;
  }
</style>
