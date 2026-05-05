const API_BASE = window.location.origin.includes("localhost")
  ? window.location.origin
  : window.location.origin;  // On Render: same origin (frontend served by backend)
const TOKEN_KEY = "hospital_auth_token";
const USER_KEY = "hospital_auth_user";
const toast = document.getElementById("toast");

function showToast(message, isError = false) {
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = isError ? "#b91c1c" : "#0f172a";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data;
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name:     document.getElementById("registerName").value.trim(),
      email:    document.getElementById("registerEmail").value.trim(),
      password: document.getElementById("registerPassword").value,
      phone:    document.getElementById("registerPhone")?.value.trim() || "",
      role:     document.getElementById("registerRole")?.value || "Admin",
    };

    try {
      await postJSON(`${API_BASE}/auth/register`, payload);
      registerForm.reset();
      showToast("Registration successful");
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 700);
    } catch (error) {
      showToast(error.message || "Registration failed", true);
    }
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value
    };

    try {
      const data = await postJSON(`${API_BASE}/auth/login`, payload);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      showToast("Login successful");
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 700);
    } catch (error) {
      showToast(error.message || "Login failed", true);
    }
  });
}
