const API_BASE = window.location.origin; // Always use same origin (works locally and on Render)
const TOKEN_KEY = "hospital_auth_token";
const USER_KEY = "hospital_auth_user";

async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
  } catch (error) {
    // Ignore API failure and clear local auth state.
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  const messageNode = document.getElementById("logoutMessage");
  if (messageNode) {
    messageNode.textContent = "You are logged out successfully.";
  }

  setTimeout(() => {
    window.location.href = "./login.html";
  }, 1200);
}

logout();
