import { checkWeatherForecast } from './src/lib/weather.js';
import dotenv from 'dotenv';
dotenv.config();

// mock import.meta.env
globalThis.import = {
  meta: {
    env: {
      VITE_WEATHER_API_KEY: process.env.VITE_WEATHER_API_KEY
    }
  }
};

async function run() {
  const lat = -7.2504;
  const lon = 112.7688; // Surabaya
  const date = "2026-06-03";
  const time = "08:00:00";
  console.log("Checking weather...", process.env.VITE_WEATHER_API_KEY);
  const res = await checkWeatherForecast(lat, lon, date, time);
  console.log("Result:", res);
}
run();
