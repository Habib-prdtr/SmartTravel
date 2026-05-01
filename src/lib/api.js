import { getToken } from "./session";
import { Capacitor } from "@capacitor/core";

// Di Android Emulator, localhost mengarah ke emulator itu sendiri.
// 10.0.2.2 adalah IP khusus untuk mengakses localhost milik laptop/host.
const isNative = Capacitor.isNativePlatform();
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Override khusus untuk Android Emulator jika tertulis localhost
if (isNative && API_BASE_URL.includes("localhost")) {
  API_BASE_URL = API_BASE_URL.replace("localhost", "10.0.2.2");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

export async function register(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function login(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getMe() {
  return request("/api/auth/me");
}

export async function updateProfile(payload) {
  return request("/api/auth/me", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function createTrip(payload) {
  return request("/api/trips", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function searchDestinationPlaces(query, signal) {
  const q = String(query || "").trim();
  if (!q) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=7&q=${encodeURIComponent(q)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    signal
  });

  if (!response.ok) {
    throw new Error("Gagal mencari destinasi");
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

export async function getTrips() {
  return request("/api/trips");
}

export async function getTripHistory() {
  return request("/api/trips/history");
}

export async function deleteTrip(tripId) {
  return request(`/api/trips/${tripId}`, {
    method: "DELETE"
  });
}

export async function updateTrip(tripId, payload) {
  return request(`/api/trips/${tripId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function getItineraryDays(tripId) {
  return request(`/api/trips/${tripId}/itinerary-days`);
}

export async function createItineraryDay(tripId, payload) {
  return request(`/api/trips/${tripId}/itinerary-days`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateItineraryDay(tripId, dayId, payload) {
  return request(`/api/trips/${tripId}/itinerary-days/${dayId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function getItineraryItems(tripId, dayId) {
  return request(`/api/trips/${tripId}/itinerary-days/${dayId}/items`);
}

export async function createItineraryItem(tripId, dayId, payload) {
  return request(`/api/trips/${tripId}/itinerary-days/${dayId}/items`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateItineraryItem(tripId, dayId, itemId, payload) {
  return request(`/api/trips/${tripId}/itinerary-days/${dayId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteItineraryItem(tripId, dayId, itemId) {
  return request(`/api/trips/${tripId}/itinerary-days/${dayId}/items/${itemId}`, {
    method: "DELETE"
  });
}

export async function getBudget(tripId) {
  return request(`/api/trips/${tripId}/budget`);
}

export async function upsertBudget(tripId, payload) {
  return request(`/api/trips/${tripId}/budget`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function getExpenses(tripId) {
  return request(`/api/trips/${tripId}/expenses`);
}

export async function createExpense(tripId, payload) {
  return request(`/api/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function generateTripWithAI(prompt) {
  return request("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({ prompt })
  });
}
