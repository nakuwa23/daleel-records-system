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


// --- Learners ---

export async function createLearner(learnerData) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/api/learners/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(learnerData),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || "Could not register learner");
  }
  return res.json();
}

export async function getLearners() {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/api/learners/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not load learners");
  return res.json();
}

export async function getLearner(learnerId) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/api/learners/${learnerId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not load learner");
  return res.json();
}


// --- Records ---

export async function issueRecord(recordData) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/api/records/issue/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(recordData),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || "Could not issue record");
  }
  return res.json();
}