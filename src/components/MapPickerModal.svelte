<script>
  import { onMount } from 'svelte';
  import 'leaflet/dist/leaflet.css';

  export let initialLat = '';
  export let initialLng = '';
  export let initialAddressText = '';
  export let onApply = () => {};
  export let onClose = () => {};

  let mapElement;
  let map;
  let L;
  let marker;
  let loadingMap = true;
  let geolocationNote = '';
  let geolocationPermission = 'unknown';
  let geolocationErrorDetail = '';
  let selectedLat = initialLat !== '' ? Number(initialLat) : -6.2;
  let selectedLng = initialLng !== '' ? Number(initialLng) : 106.816666;
  const hasInitialCoordinates = initialLat !== '' && initialLng !== '';

  function googleMapsUrl(lat, lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  function updateMarker(lat, lng, shouldPan = true) {
    selectedLat = Number(lat.toFixed(6));
    selectedLng = Number(lng.toFixed(6));

    if (!marker) {
      marker = L.circleMarker([selectedLat, selectedLng], {
        radius: 9,
        color: '#145433',
        weight: 3,
        fillColor: '#2d9657',
        fillOpacity: 0.92
      }).addTo(map);
    } else {
      marker.setLatLng([selectedLat, selectedLng]);
    }

    if (shouldPan) {
      map.setView([selectedLat, selectedLng], map.getZoom());
    }
  }

  function applySelection() {
    onApply({
      lat: String(selectedLat),
      lng: String(selectedLng),
      maps_url: googleMapsUrl(selectedLat, selectedLng),
      address_text: initialAddressText || ''
    });
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak tersedia.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    });
  }

  function describeGeolocationError(error) {
    if (!error) {
      return 'Error geolocation tidak diketahui.';
    }

    if (typeof error.code === 'number') {
      if (error.code === 1) {
        return 'PERMISSION_DENIED: Browser atau sistem menolak akses lokasi.';
      }

      if (error.code === 2) {
        return 'POSITION_UNAVAILABLE: Lokasi device tidak bisa ditentukan.';
      }

      if (error.code === 3) {
        return 'TIMEOUT: Permintaan lokasi melebihi batas waktu.';
      }
    }

    return error.message || 'Error geolocation tidak diketahui.';
  }

  async function readGeolocationPermission() {
    if (!navigator.permissions?.query) return;

    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      geolocationPermission = status.state;
      status.onchange = () => {
        geolocationPermission = status.state;
      };
    } catch (_error) {
      geolocationPermission = 'unknown';
    }
  }

  async function resolveInitialCoordinates() {
    if (hasInitialCoordinates) {
      return {
        lat: Number(initialLat),
        lng: Number(initialLng),
        zoom: 16
      };
    }

    try {
      const { coords } = await getCurrentPosition();
      geolocationPermission = 'granted';
      geolocationErrorDetail = '';
      geolocationNote = 'Lokasi awal diambil dari device Anda.';
      return {
        lat: coords.latitude,
        lng: coords.longitude,
        zoom: 16
      };
    } catch (error) {
      geolocationErrorDetail = describeGeolocationError(error);
      geolocationNote =
        geolocationPermission === 'denied'
          ? 'Izin lokasi ditolak. Izinkan akses lokasi di browser atau sistem, lalu coba lagi.'
          : 'Lokasi device tidak terbaca, peta memakai titik default. Anda masih bisa klik lokasi sendiri.';
      return {
        lat: -6.2,
        lng: 106.816666,
        zoom: 13
      };
    }
  }

  async function locateMe() {
    if (!map) return;

    try {
      geolocationNote = 'Meminta akses lokasi dari device...';
      geolocationErrorDetail = '';
      const { coords } = await getCurrentPosition();
      geolocationPermission = 'granted';
      geolocationErrorDetail = '';
      geolocationNote = 'Lokasi berhasil diperbarui dari device Anda.';
      updateMarker(coords.latitude, coords.longitude, true);
      map.setZoom(16);
    } catch (error) {
      geolocationErrorDetail = describeGeolocationError(error);
      geolocationNote =
        geolocationPermission === 'denied'
          ? 'Izin lokasi masih ditolak. Aktifkan Location Access browser/OS lalu tekan tombol ini lagi.'
          : 'Lokasi device masih belum terbaca. Coba tekan lagi atau pilih titik secara manual di peta.';
    }
  }

  async function retryLocationPermission() {
    geolocationNote = 'Mengulang permintaan izin lokasi...';
    geolocationErrorDetail = '';
    geolocationPermission = 'unknown';
    await readGeolocationPermission();
    await locateMe();
  }

  onMount(async () => {
    const leaflet = await import('leaflet');
    L = leaflet.default || leaflet;
    await readGeolocationPermission();

    const initialCoordinates = await resolveInitialCoordinates();
    selectedLat = initialCoordinates.lat;
    selectedLng = initialCoordinates.lng;

    map = L.map(mapElement, {
      zoomControl: true,
      attributionControl: true
    }).setView([selectedLat, selectedLng], initialCoordinates.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    updateMarker(selectedLat, selectedLng, false);

    map.on('click', (event) => {
      updateMarker(event.latlng.lat, event.latlng.lng, false);
    });

    loadingMap = false;

    return () => {
      if (map) {
        map.remove();
      }
    };
  });
</script>

<div class="modal-backdrop">
  <section class="modal-card map-picker-card" role="dialog" aria-modal="true" aria-labelledby="map-picker-title">
    <div class="popup-header">
      <div>
        <span class="badge">Pilih lokasi</span>
        <h3 id="map-picker-title">Tentukan titik penjemputan di peta</h3>
      </div>
      <button class="icon-button popup-close" type="button" aria-label="Tutup peta" on:click={onClose}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <p class="muted map-picker-copy">Klik titik di peta untuk memilih lokasi. Koordinat dan link maps akan terisi otomatis.</p>
    {#if geolocationNote}
      <p class="map-picker-note">{geolocationNote}</p>
    {/if}
    {#if geolocationPermission === 'denied'}
      <p class="map-picker-help">Izin lokasi diblokir. Aktifkan Location Access untuk situs ini di browser, lalu tekan `Gunakan lokasi saya` lagi.</p>
    {/if}
    {#if geolocationErrorDetail}
      <p class="map-picker-error">{geolocationErrorDetail}</p>
    {/if}

    <div class="map-picker-toolbar">
      <div class="map-picker-actions">
        <button class="btn btn-ghost" type="button" on:click={locateMe}>Gunakan lokasi saya</button>
        <button class="btn btn-ghost" type="button" on:click={retryLocationPermission}>Coba Lagi Izin Lokasi</button>
      </div>
      <div class="map-picker-coordinates">
        <strong>{selectedLat.toFixed(6)}</strong>
        <span>{selectedLng.toFixed(6)}</span>
      </div>
    </div>

    <div class="map-picker-frame">
      {#if loadingMap}
        <div class="map-picker-loading">Memuat peta...</div>
      {/if}
      <div bind:this={mapElement} class="map-picker-canvas"></div>
    </div>

    <div class="stack-actions">
      <button class="btn" type="button" on:click={applySelection}>Gunakan Lokasi Ini</button>
      <button class="btn btn-ghost" type="button" on:click={onClose}>Batal</button>
    </div>
  </section>
</div>
