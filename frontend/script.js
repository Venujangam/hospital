const API_BASE = window.location.origin.includes("localhost")
  ? window.location.origin
  : "http://localhost:5000";

const patientsCount = document.getElementById("patientsCount");
const doctorsCount = document.getElementById("doctorsCount");
const appointmentsCount = document.getElementById("appointmentsCount");
const patientsTableBody = document.getElementById("patientsTableBody");
const doctorsList = document.getElementById("doctorsList");
const appointmentsList = document.getElementById("appointmentsList");
const patientForm = document.getElementById("patientForm");
const doctorForm = document.getElementById("doctorForm");
const appointmentForm = document.getElementById("appointmentForm");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");
const refreshBtn = document.getElementById("refreshBtn");
const toast = document.getElementById("toast");
const navLinks = document.querySelectorAll(".nav-link");
const overviewSection = document.getElementById("overviewSection");
const statsSection = document.getElementById("statsSection");
const patientsSection = document.getElementById("patients");
const doctorsSection = document.getElementById("doctors");
const appointmentsSection = document.getElementById("appointments");
const TOKEN_KEY = "hospital_auth_token";
const USER_KEY = "hospital_auth_user";

function ensureAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.href = "./login.html";
    return false;
  }
  return true;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function updateAuthUI() {
  const user = localStorage.getItem(USER_KEY);
  if (user) {
    const parsed = JSON.parse(user);
    authStatus.textContent = `Logged in as ${parsed.name}`;
    logoutBtn.style.display = "inline-block";
    return;
  }

  authStatus.textContent = "Not logged in";
  logoutBtn.style.display = "none";
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? "#b91c1c" : "#0f172a";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function setActiveView(view) {
  const viewsMap = {
    overview: [overviewSection, statsSection],
    patients: [patientsSection],
    doctors: [doctorsSection],
    appointments: [appointmentsSection]
  };

  const allSections = [
    overviewSection,
    statsSection,
    patientsSection,
    doctorsSection,
    appointmentsSection
  ];

  allSections.forEach((section) => section.classList.add("hidden"));
  (viewsMap[view] || viewsMap.overview).forEach((section) =>
    section.classList.remove("hidden")
  );

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });
}

function renderEmptyState(node, text) {
  node.innerHTML = `<li class="muted">${text}</li>`;
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

function renderPatients(patients) {
  patientsCount.textContent = patients.length;
  if (!patients.length) {
    patientsTableBody.innerHTML = '<tr><td colspan="3" class="muted">No patients found.</td></tr>';
    return;
  }

  patientsTableBody.innerHTML = patients
    .map((patient) => {
      return `
        <tr>
          <td>${patient.name || "-"}</td>
          <td>${patient.age || "-"}</td>
          <td>${patient.gender || "-"}</td>
        </tr>
      `;
    })
    .join("");
}

function renderDoctors(doctors) {
  doctorsCount.textContent = doctors.length;
  if (!doctors.length) {
    renderEmptyState(doctorsList, "No doctors available.");
    return;
  }

  doctorsList.innerHTML = doctors
    .map((doctor) => {
      return `<li><strong>${doctor.name || "Doctor"}</strong><br><span class="muted">${doctor.specialization || "General"}</span></li>`;
    })
    .join("");
}

function renderAppointments(appointments) {
  appointmentsCount.textContent = appointments.length;
  if (!appointments.length) {
    renderEmptyState(appointmentsList, "No appointments scheduled.");
    return;
  }

  appointmentsList.innerHTML = appointments
    .map((appointment) => {
      const patient = appointment.patientName || appointment.patient?.name || "Patient";
      const doctor = appointment.doctorName || appointment.doctor?.name || "Doctor";
      const date = appointment.date ? new Date(appointment.date).toLocaleDateString() : "Date not set";
      const time = appointment.time || "Time not set";
      return `<li><strong>${patient}</strong> with <strong>${doctor}</strong><br><span class="muted">${date} at ${time}</span></li>`;
    })
    .join("");
}

async function loadDashboardData() {
  try {
    const [patients, doctors, appointments] = await Promise.all([
      fetchJSON(`${API_BASE}/patients`),
      fetchJSON(`${API_BASE}/doctors`),
      fetchJSON(`${API_BASE}/appointments`)
    ]);

    renderPatients(Array.isArray(patients) ? patients : []);
    renderDoctors(Array.isArray(doctors) ? doctors : []);
    renderAppointments(Array.isArray(appointments) ? appointments : []);
    showToast("Dashboard refreshed");
  } catch (err) {
    showToast("Could not load all data. Check backend.", true);
  }
}

if (ensureAuthenticated()) {
  patientForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: document.getElementById("patientName").value.trim(),
      age: Number(document.getElementById("patientAge").value),
      gender: document.getElementById("patientGender").value
    };

    try {
      await postJSON(`${API_BASE}/patients`, payload);
      patientForm.reset();
      showToast("Patient added successfully");
      await loadDashboardData();
    } catch (err) {
      showToast("Could not add patient.", true);
    }
  });

  doctorForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      name: document.getElementById("doctorName").value.trim(),
      specialization: document.getElementById("doctorSpecialization").value.trim()
    };

    try {
      await postJSON(`${API_BASE}/doctors`, payload);
      doctorForm.reset();
      showToast("Doctor added successfully");
      await loadDashboardData();
    } catch (err) {
      showToast("Could not add doctor.", true);
    }
  });

  appointmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      patientName: document.getElementById("appointmentPatientName").value.trim(),
      doctorName: document.getElementById("appointmentDoctorName").value.trim(),
      date: document.getElementById("appointmentDate").value,
      time: document.getElementById("appointmentTime").value
    };

    try {
      await postJSON(`${API_BASE}/appointments`, payload);
      appointmentForm.reset();
      showToast("Appointment booked");
      await loadDashboardData();
    } catch (err) {
      showToast("Could not book appointment.", true);
    }
  });

  refreshBtn.addEventListener("click", loadDashboardData);
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setActiveView(link.dataset.view || "overview");
    });
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await postJSON(`${API_BASE}/auth/logout`, {});
    } catch (err) {
      // Ignore server error and clear local state anyway.
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    updateAuthUI();
    showToast("Logged out");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 500);
  });

  updateAuthUI();
  setActiveView("overview");
  loadDashboardData();
}
