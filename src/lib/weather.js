/**
 * weather.js — Helper untuk mengambil data ramalan cuaca menggunakan WeatherAPI.com
 */

// URL endpoint untuk ramalan (forecast) dari WeatherAPI
const WEATHER_API_BASE = "https://api.weatherapi.com/v1/forecast.json";

/**
 * Cek apakah kondisi cuaca mengindikasikan hujan/buruk berdasarkan kode dari WeatherAPI.
 * WeatherAPI memiliki daftar kode tersendiri, kita kelompokkan yang mengandung hujan/badai.
 * Referensi kode: https://www.weatherapi.com/docs/weather_conditions.json
 */
export function isRainyWeather(code) {
  // Kode-kode yang berhubungan dengan hujan ringan, deras, salju, hingga badai petir
  const rainyCodes = [
    1063, 1066, 1069, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 
    1192, 1195, 1198, 1201, 1240, 1243, 1246, 1273, 1276
  ];
  return rainyCodes.includes(code);
}

/**
 * Mendapatkan ramalan cuaca untuk lokasi dan tanggal tertentu menggunakan WeatherAPI.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} targetDate - Format YYYY-MM-DD
 * @param {string} targetTime - Opsional, format HH:MM atau HH:MM:SS
 * @returns {Promise<{ isRainy: boolean, code: number, text: string, icon: string, tempC: number } | null>}
 */
export async function checkWeatherForecast(lat, lon, targetDate, targetTime) {
  if (!lat || !lon || !targetDate) return null;

  // Ambil API Key dari environment variables (Vite)
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn("VITE_WEATHER_API_KEY belum disetel di .env!");
    return null;
  }

  try {
    // Parameter 'days=14' untuk mengambil ramalan maksimum
    // Parameter 'q' menerima "Latitude,Longitude" di WeatherAPI
    const url = `${WEATHER_API_BASE}?key=${apiKey}&q=${lat},${lon}&days=14`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.forecast || !data.forecast.forecastday) return null;

    // Cari data ramalan yang tanggalnya cocok dengan targetDate
    const forecastDay = data.forecast.forecastday.find(d => d.date === targetDate);
    
    if (forecastDay) {
      let condition = forecastDay.day.condition;
      let tempC = forecastDay.day.avgtemp_c;

      if (targetTime) {
        // targetTime bisa jadi "08:00:00", kita ambil "08"
        const hourPrefix = String(targetTime).substring(0, 2);
        const targetHourStr = `${targetDate} ${hourPrefix}:00`;
        const hourData = forecastDay.hour.find(h => h.time === targetHourStr);
        if (hourData) {
          condition = hourData.condition;
          tempC = hourData.temp_c;
        }
      }

      return {
        isRainy: isRainyWeather(condition.code),
        code: condition.code,
        text: condition.text, 
        icon: condition.icon,
        tempC: tempC
      };
    }

    return null; // Tanggal di luar jangkauan ramalan
  } catch (error) {
    console.error("Gagal mengambil data cuaca dari WeatherAPI:", error);
    return null;
  }
}
