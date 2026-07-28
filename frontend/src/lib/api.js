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
  localStorage.setItem("daleel_role", data.role || "");
  localStorage.setItem("daleel_is_superuser", data.is_superuser ? "1" : "");
  return data;
}

export function getAccessToken() {
  return localStorage.getItem("daleel_access");
}

export function getRole() {
  return localStorage.getItem("daleel_role") || "";
}

export function getIsSuperuser() {
  return localStorage.getItem("daleel_is_superuser") === "1";
}

export function isAdmin() {
  return getRole() === "ADMINISTRATOR" || getIsSuperuser();
}

export function logout() {
  localStorage.removeItem("daleel_access");
  localStorage.removeItem("daleel_refresh");
  localStorage.removeItem("daleel_role");
  localStorage.removeItem("daleel_is_superuser");
}

export async function getInstitutions() {
  const res = await fetch(`${API_BASE}/api/institutions/`);
  if (!res.ok) throw new Error("Could not load institutions");
  return res.json();
}

export async function register(payload) {
  const res = await fetch(`${API_BASE}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = Object.values(data).flat().join(" ") || "Could not register";
    throw new Error(message);
  }

  localStorage.setItem("daleel_access", data.access);
  localStorage.setItem("daleel_refresh", data.refresh);
  localStorage.setItem("daleel_role", data.role || "");
  localStorage.setItem("daleel_is_superuser", data.is_superuser ? "1" : "");
  return data;
}

export async function getAnalytics() {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/api/analytics/summary/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || "Could not load analytics");
  }
  return res.json();
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

export async function getLearnerRecords(learnerId) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/api/learners/${learnerId}/records/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not load records");
  return res.json();
}

export async function getRecord(recordId) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/api/records/${recordId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not load record");
  return res.json();
}

export async function verifyRecord(qrPayload) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/api/verify/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ qr_payload: qrPayload }),
  });
  if (!res.ok) throw new Error("Verification request failed");
  return res.json();
}