/**
 * weather.js — Helper untuk mengambil data ramalan cuaca menggunakan Open-Meteo API
 * Open-Meteo 100% gratis dan tidak memerlukan API Key.
 */

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

/**
 * Cek apakah kode cuaca WMO (World Meteorological Organization) mengindikasikan hujan/buruk.
 * Kode >= 51 umumnya adalah hujan ringan hingga badai petir.
 * @param {number} code
 * @returns {boolean}
 */
export function isRainyWeather(code) {
  // 51-55: Drizzle, 61-65: Rain, 80-82: Rain showers, 95-99: Thunderstorm
  const rainyCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
  return rainyCodes.includes(code);
}

/**
 * Mendapatkan ramalan cuaca untuk lokasi dan tanggal tertentu.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} targetDate - Format YYYY-MM-DD
 * @returns {Promise<{ isRainy: boolean, code: number } | null>}
 */
export async function checkWeatherForecast(lat, lon, targetDate) {
  if (!lat || !lon || !targetDate) return null;

  try {
    // Ambil ramalan cuaca harian (weathercode). Open-Meteo mendukung perkiraan hingga ~16 hari.
    const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}&daily=weathercode&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.daily || !data.daily.time || !data.daily.weathercode) return null;

    // Cari index tanggal yang sesuai
    const dateIndex = data.daily.time.findIndex(dateStr => dateStr === targetDate);
    
    // Jika tanggal ditemukan dalam rentang ramalan
    if (dateIndex !== -1) {
      const weatherCode = data.daily.weathercode[dateIndex];
      return {
        isRainy: isRainyWeather(weatherCode),
        code: weatherCode
      };
    }

    // Jika tanggal di luar jangkauan ramalan (terlalu jauh di masa depan atau masa lalu)
    return null;
  } catch (error) {
    console.error("Gagal mengambil data cuaca:", error);
    return null;
  }
}
