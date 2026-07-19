const API_BASE = "http://127.0.0.1:8000";

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await res.json();
  // Store tokens so other screens can use them.
  localStorage.setItem("daleel_access", data.access);
  localStorage.setItem("daleel_refresh", data.refresh);
  return data;
}

export function getAccessToken() {
  return localStorage.getItem("daleel_access");
}

export function logout() {
  localStorage.removeItem("daleel_access");
  localStorage.removeItem("daleel_refresh");
}