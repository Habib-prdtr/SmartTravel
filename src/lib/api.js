import { getToken } from "./session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
