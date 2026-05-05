/* ============================================================
   CareFlow — Dashboard Script (with Payments & Discharge)
   ============================================================ */

const API_BASE  = window.location.origin; // Always use same origin (works locally and on Render)
const TOKEN_KEY = "hospital_auth_token";
const USER_KEY  = "hospital_auth_user";

// ── DOM refs ──
const toast                    = document.getElementById("toast");
const authStatus               = document.getElementById("authStatus");
const sidebarName              = document.getElementById("sidebarName");
const sidebarAvatar            = document.getElementById("sidebarAvatar");
const sidebarRole              = document.getElementById("sidebarRole");
const refreshBtn               = document.getElementById("refreshBtn");
const logoutBtn                = document.getElementById("logoutBtn");
const pageTitle                = document.getElementById("pageTitle");
const pageSubtitle             = document.getElementById("pageSubtitle");
const patientsCount            = document.getElementById("patientsCount");
const doctorsCount             = document.getElementById("doctorsCount");
const appointmentsCount        = document.getElementById("appointmentsCount");
const totalCollected           = document.getElementById("totalCollected");
const admittedCount            = document.getElementById("admittedCount");
const dischargedCount          = document.getElementById("dischargedCount");
const overviewPatientsBody     = document.getElementById("overviewPatientsBody");
const overviewPaymentsBody     = document.getElementById("overviewPaymentsBody");
const patientsTableBody        = document.getElementById("patientsTableBody");
const doctorsList              = document.getElementById("doctorsList");
const appointmentsList         = document.getElementById("appointmentsList");
const paymentsTableBody        = document.getElementById("paymentsTableBody");
const payTotalBilled           = document.getElementById("payTotalBilled");
const payTotalCollected        = document.getElementById("payTotalCollected");
const payTotalDue              = document.getElementById("payTotalDue");
const paymentPatientSelect     = document.getElementById("paymentPatientSelect");
const patientForm              = document.getElementById("patientForm");
const doctorForm               = document.getElementById("doctorForm");
const appointmentForm          = document.getElementById("appointmentForm");
const paymentForm              = document.getElementById("paymentForm");
const navLinks                 = document.querySelectorAll(".nav-link");
const viewAllPatients          = document.getElementById("viewAllPatients");
const viewAllPayments          = document.getElementById("viewAllPayments");

const views = {
  overview:     document.getElementById("view-overview"),
  patients:     document.getElementById("view-patients"),
  doctors:      document.getElementById("view-doctors"),
  appointments: document.getElementById("view-appointments"),
  payments:     document.getElementById("view-payments"),
};

const pageMeta = {
  overview:     { title: "Dashboard Overview",   subtitle: "Welcome back! Here's what's happening today." },
  patients:     { title: "Patients",             subtitle: "View and manage all patient records." },
  doctors:      { title: "Doctors",              subtitle: "Manage your medical staff and specializations." },
  appointments: { title: "Appointments",         subtitle: "Schedule and track patient appointments." },
  payments:     { title: "Fee Payments",         subtitle: "Record and track all patient payments." },
};

// ── Auth ──
function getToken()       { return localStorage.getItem(TOKEN_KEY); }
function getUser()        { const u = localStorage.getItem(USER_KEY); return u ? JSON.parse(u) : null; }
function getAuthHeaders() { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }
function ensureAuthenticated() {
  if (!getToken()) { window.location.href = "./login.html"; return false; }
  return true;
}

// ── Toast ──
function showToast(msg, type = "default") {
  toast.textContent = msg;
  toast.className = "toast show" + (type !== "default" ? " " + type : "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2600);
}

// ── View switch ──
function setView(view) {
  Object.keys(views).forEach(k => views[k].classList.toggle("hidden", k !== view));
  navLinks.forEach(l => l.classList.toggle("active", l.dataset.view === view));
  const m = pageMeta[view] || pageMeta.overview;
  if (pageTitle)    pageTitle.textContent    = m.title;
  if (pageSubtitle) pageSubtitle.textContent = m.subtitle;
}

// ── User UI ──
function updateUserUI() {
  const user = getUser();
  if (!user) return;
  if (authStatus)   authStatus.textContent    = user.name;
  if (sidebarName)  sidebarName.textContent   = user.name;
  if (sidebarAvatar)sidebarAvatar.textContent = user.name.charAt(0).toUpperCase();
  if (sidebarRole)  sidebarRole.textContent   = user.role || "Administrator";
}

// ── HTTP ──
async function fetchJSON(url) {
  const res = await fetch(url, { headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
async function deleteJSON(url) {
  const res = await fetch(url, { method: "DELETE", headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json().catch(() => ({}));
}

// ── Badge helpers ──
function genderBadge(g) {
  const map = { Male:"badge-blue", Female:"badge-purple", Other:"badge-gray" };
  return `<span class="badge ${map[g]||"badge-gray"}">${g||"—"}</span>`;
}
function statusBadge(s) {
  const map = {
    Active:"badge-green", Admitted:"badge-amber", Discharged:"badge-gray",
    Scheduled:"badge-blue", Completed:"badge-green", Cancelled:"badge-red",
    "On Leave":"badge-amber", Inactive:"badge-gray",
    Paid:"badge-green", Partial:"badge-amber", Pending:"badge-red"
  };
  return `<span class="badge ${map[s]||"badge-gray"}">${s||"—"}</span>`;
}
function bloodBadge(b) {
  return b ? `<span class="badge badge-red">${b}</span>` : `<span class="muted">—</span>`;
}

// ── Render Patients ──
function renderPatients(patients) {
  patientsCount.textContent = patients.length;
  const admitted   = patients.filter(p => p.status === "Admitted").length;
  const discharged = patients.filter(p => p.status === "Discharged").length;
  if (admittedCount)   admittedCount.textContent   = admitted;
  if (dischargedCount) dischargedCount.textContent = discharged;

  // Overview table (first 5)
  if (overviewPatientsBody) {
    if (!patients.length) {
      overviewPatientsBody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🔍</div><p>No patients yet</p></div></td></tr>`;
    } else {
      overviewPatientsBody.innerHTML = patients.slice(0, 5).map((p, i) => `
        <tr>
          <td class="muted">${i+1}</td>
          <td class="td-name">${p.name||"—"}</td>
          <td>${p.age||"—"}</td>
          <td>${bloodBadge(p.bloodGroup)}</td>
          <td class="muted">${p.condition||"—"}</td>
          <td>${statusBadge(p.status)}</td>
          <td class="muted">${p.ward||"—"} ${p.bedNumber ? `/ ${p.bedNumber}` : ""}</td>
        </tr>`).join("");
    }
  }

  // Full table
  if (!patientsTableBody) return;
  if (!patients.length) {
    patientsTableBody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">🧑‍⚕️</div><p>No patients found. Add one above.</p></div></td></tr>`;
    return;
  }
  patientsTableBody.innerHTML = patients.map((p, i) => `
    <tr>
      <td class="muted">${i+1}</td>
      <td class="td-name">
        ${p.name||"—"}
        ${p.email ? `<br><span class="muted" style="font-size:0.75rem">${p.email}</span>` : ""}
      </td>
      <td>${p.age||"—"}</td>
      <td>${genderBadge(p.gender)}</td>
      <td>${p.phone||`<span class="muted">—</span>`}</td>
      <td>${bloodBadge(p.bloodGroup)}</td>
      <td class="muted">${p.condition||"—"}</td>
      <td class="muted">${p.ward||"—"} ${p.bedNumber ? `/ ${p.bedNumber}` : ""}</td>
      <td>${statusBadge(p.status)}</td>
      <td>
        ${p.status === "Active" ? `<button class="btn btn-sm btn-admit" onclick="openAdmitModal('${p._id}','${p.name}')">🏥 Admit</button>` : ""}
        ${p.status === "Admitted" ? `<button class="btn btn-sm btn-discharge" onclick="openDischargeModal('${p._id}','${p.name}')">✅ Discharge</button>` : ""}
        <button class="btn btn-sm btn-pay" onclick="openPaymentForPatient('${p._id}','${p.name}')">💳 Pay</button>
        <button class="btn btn-danger btn-sm" onclick="deletePatient('${p._id}')">🗑</button>
      </td>
    </tr>`).join("");

  // Update patient select dropdown in payment form
  if (paymentPatientSelect) {
    paymentPatientSelect.innerHTML = `<option value="">Select Patient *</option>` +
      patients.map(p => `<option value="${p._id}" data-name="${p.name}">${p.name} (${p.age}y, ${p.gender})</option>`).join("");
  }
}

// ── Render Doctors ──
function renderDoctors(doctors) {
  doctorsCount.textContent = doctors.length;
  if (!doctorsList) return;
  if (!doctors.length) {
    doctorsList.innerHTML = `<div class="empty-state"><div class="empty-icon">👨‍⚕️</div><p>No doctors yet. Add one above.</p></div>`;
    return;
  }
  doctorsList.innerHTML = doctors.map(d => `
    <div class="item-card">
      <div class="card-avatar" style="background:#d1fae5">👨‍⚕️</div>
      <div class="card-body">
        <div class="card-name">${d.name||"Doctor"}</div>
        <div class="card-sub">
          <span class="badge badge-green">${d.specialization||"General"}</span>
          ${d.qualification ? `<span class="badge badge-gray" style="margin-left:4px">${d.qualification}</span>` : ""}
        </div>
        <div class="card-sub" style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">
          ${d.experience ? `<span class="muted">🏅 ${d.experience} yrs exp</span>` : ""}
          ${d.phone      ? `<span class="muted">📞 ${d.phone}</span>` : ""}
          ${d.email      ? `<span class="muted">✉️ ${d.email}</span>` : ""}
          ${d.availability ? `<span class="muted">🕐 ${d.availability}</span>` : ""}
        </div>
        <div class="card-sub" style="margin-top:4px">${statusBadge(d.status)}</div>
        <div class="card-actions">
          <button class="btn btn-danger btn-sm" onclick="deleteDoctor('${d._id}')">🗑 Remove</button>
        </div>
      </div>
    </div>`).join("");
}

// ── Render Appointments ──
function renderAppointments(appointments) {
  appointmentsCount.textContent = appointments.length;
  if (!appointmentsList) return;
  if (!appointments.length) {
    appointmentsList.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div><p>No appointments yet. Book one above.</p></div>`;
    return;
  }
  appointmentsList.innerHTML = appointments.map(a => {
    const date = a.date ? new Date(a.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—";
    return `
    <div class="item-card">
      <div class="card-avatar" style="background:#ede9fe">📅</div>
      <div class="card-body">
        <div class="card-name">${a.patientName||"Patient"}</div>
        <div class="card-sub">with <strong>${a.doctorName||"Doctor"}</strong></div>
        <div class="card-sub" style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">
          <span class="badge badge-purple">${date}</span>
          <span class="badge badge-amber">⏰ ${a.time||"—"}</span>
          ${statusBadge(a.status)}
        </div>
        ${a.reason ? `<div class="card-sub" style="margin-top:4px">📋 ${a.reason}</div>` : ""}
        ${a.notes  ? `<div class="card-sub">📝 ${a.notes}</div>` : ""}
        <div class="card-actions">
          <button class="btn btn-danger btn-sm" onclick="deleteAppointment('${a._id}')">🗑 Cancel</button>
        </div>
      </div>
    </div>`;
  }).join("");
}

// ── Render Payments ──
function renderPayments(payments) {
  // Overview table (first 5)
  if (overviewPaymentsBody) {
    if (!payments.length) {
      overviewPaymentsBody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">💳</div><p>No payments yet</p></div></td></tr>`;
    } else {
      overviewPaymentsBody.innerHTML = payments.slice(0, 5).map((p, i) => `
        <tr>
          <td class="muted">${i+1}</td>
          <td class="td-name">${p.patientName||"—"}</td>
          <td>${p.paymentType||"—"}</td>
          <td>₹${p.amount||0}</td>
          <td>₹${p.paidAmount||0}</td>
          <td>₹${p.dueAmount||0}</td>
          <td>${p.paymentMethod||"—"}</td>
          <td>${statusBadge(p.status)}</td>
        </tr>`).join("");
    }
  }

  // Full table
  if (!paymentsTableBody) return;
  if (!payments.length) {
    paymentsTableBody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">💳</div><p>No payments recorded yet.</p></div></td></tr>`;
    return;
  }
  paymentsTableBody.innerHTML = payments.map((p, i) => `
    <tr>
      <td class="muted">${i+1}</td>
      <td class="td-name">${p.patientName||"—"}</td>
      <td>${p.paymentType||"—"}</td>
      <td>₹${p.amount||0}</td>
      <td>₹${p.paidAmount||0}</td>
      <td>₹${p.dueAmount||0}</td>
      <td>${p.paymentMethod||"—"}</td>
      <td>${statusBadge(p.status)}</td>
      <td class="muted">${p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-GB") : "—"}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deletePayment('${p._id}')">🗑</button>
      </td>
    </tr>`).join("");
}

// ── Load all data ──
async function loadDashboardData() {
  try {
    const [patients, doctors, appointments, payments, paymentSummary] = await Promise.all([
      fetchJSON(`${API_BASE}/patients`),
      fetchJSON(`${API_BASE}/doctors`),
      fetchJSON(`${API_BASE}/appointments`),
      fetchJSON(`${API_BASE}/payments`),
      fetchJSON(`${API_BASE}/payments/summary/stats`),
    ]);
    renderPatients(Array.isArray(patients) ? patients : []);
    renderDoctors(Array.isArray(doctors) ? doctors : []);
    renderAppointments(Array.isArray(appointments) ? appointments : []);
    renderPayments(Array.isArray(payments) ? payments : []);

    // Payment summary
    if (totalCollected)    totalCollected.textContent    = `₹${paymentSummary.totalCollected||0}`;
    if (payTotalBilled)    payTotalBilled.textContent    = `₹${paymentSummary.totalBilled||0}`;
    if (payTotalCollected) payTotalCollected.textContent = `₹${paymentSummary.totalCollected||0}`;
    if (payTotalDue)       payTotalDue.textContent       = `₹${paymentSummary.totalDue||0}`;

    showToast("Data refreshed ✓", "success");
  } catch (err) {
    showToast("Could not load data. Check backend.", "error");
  }
}

// ── Delete handlers ──
async function deletePatient(id) {
  if (!confirm("Delete this patient?")) return;
  try { await deleteJSON(`${API_BASE}/patients/${id}`); showToast("Patient deleted","success"); await loadDashboardData(); }
  catch { showToast("Could not delete patient.","error"); }
}
async function deleteDoctor(id) {
  if (!confirm("Remove this doctor?")) return;
  try { await deleteJSON(`${API_BASE}/doctors/${id}`); showToast("Doctor removed","success"); await loadDashboardData(); }
  catch { showToast("Could not remove doctor.","error"); }
}
async function deleteAppointment(id) {
  if (!confirm("Cancel this appointment?")) return;
  try { await deleteJSON(`${API_BASE}/appointments/${id}`); showToast("Appointment cancelled","success"); await loadDashboardData(); }
  catch { showToast("Could not cancel appointment.","error"); }
}
async function deletePayment(id) {
  if (!confirm("Delete this payment record?")) return;
  try { await deleteJSON(`${API_BASE}/payments/${id}`); showToast("Payment deleted","success"); await loadDashboardData(); }
  catch { showToast("Could not delete payment.","error"); }
}

// ── Modal helpers ──
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }
function openModal(id)  { document.getElementById(id).classList.remove("hidden"); }

// ── Admit Modal ──
function openAdmitModal(patientId, patientName) {
  document.getElementById("admitPatientId").value = patientId;
  document.getElementById("admitModalSubtitle").textContent = `Admit ${patientName} to a ward.`;
  openModal("admitModal");
}
document.getElementById("admitConfirmBtn")?.addEventListener("click", async () => {
  const patientId = document.getElementById("admitPatientId").value;
  const ward      = document.getElementById("admitWard").value.trim();
  const bedNumber = document.getElementById("admitBedNumber").value.trim();
  try {
    await postJSON(`${API_BASE}/patients/${patientId}/admit`, { ward, bedNumber });
    showToast("Patient admitted ✓", "success");
    closeModal("admitModal");
    await loadDashboardData();
  } catch { showToast("Could not admit patient.", "error"); }
});

// ── Discharge Modal ──
function openDischargeModal(patientId, patientName) {
  document.getElementById("dischargePatientId").value = patientId;
  document.getElementById("dischargeModalSubtitle").textContent = `Discharge ${patientName} from the hospital.`;
  openModal("dischargeModal");
}
document.getElementById("dischargeConfirmBtn")?.addEventListener("click", async () => {
  const patientId = document.getElementById("dischargePatientId").value;
  const note      = document.getElementById("dischargeNote").value.trim();
  const condition = document.getElementById("dischargeCondition").value;
  const fullNote  = condition ? `${condition}. ${note}` : note;
  try {
    await postJSON(`${API_BASE}/patients/${patientId}/discharge`, { dischargeNote: fullNote });
    showToast("Patient discharged ✓", "success");
    closeModal("dischargeModal");
    await loadDashboardData();
  } catch { showToast("Could not discharge patient.", "error"); }
});

// ── Payment for specific patient ──
function openPaymentForPatient(patientId, patientName) {
  setView("payments");
  if (paymentPatientSelect) {
    paymentPatientSelect.value = patientId;
  }
  showToast(`Recording payment for ${patientName}`, "default");
}

// ── Show receipt ──
function showReceipt(payment) {
  document.getElementById("receiptDate").textContent = new Date(payment.paidAt).toLocaleString();
  document.getElementById("rPatient").textContent = payment.patientName;
  document.getElementById("rType").textContent    = payment.paymentType;
  document.getElementById("rMethod").textContent  = payment.paymentMethod;
  document.getElementById("rDesc").textContent    = payment.description || "—";
  document.getElementById("rTotal").textContent   = `₹${payment.amount}`;
  document.getElementById("rPaid").textContent    = `₹${payment.paidAmount}`;
  document.getElementById("rDue").textContent     = `₹${payment.dueAmount}`;
  document.getElementById("rStatus").textContent  = payment.status;
  openModal("receiptModal");
}

// ── Boot ──
if (ensureAuthenticated()) {
  updateUserUI();
  setView("overview");
  loadDashboardData();

  // Nav
  navLinks.forEach(link => {
    link.addEventListener("click", e => { e.preventDefault(); setView(link.dataset.view || "overview"); });
  });
  viewAllPatients?.addEventListener("click",  () => setView("patients"));
  viewAllPayments?.addEventListener("click",  () => setView("payments"));
  refreshBtn?.addEventListener("click", loadDashboardData);

  // Logout
  logoutBtn?.addEventListener("click", async () => {
    try { await postJSON(`${API_BASE}/auth/logout`, {}); } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    showToast("Logged out");
    setTimeout(() => window.location.href = "./login.html", 600);
  });

  // ── Add Patient ──
  patientForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      name:       document.getElementById("patientName").value.trim(),
      age:        Number(document.getElementById("patientAge").value),
      gender:     document.getElementById("patientGender").value,
      phone:      document.getElementById("patientPhone").value.trim(),
      email:      document.getElementById("patientEmail").value.trim(),
      bloodGroup: document.getElementById("patientBloodGroup").value,
      condition:  document.getElementById("patientCondition").value.trim(),
      address:    document.getElementById("patientAddress").value.trim(),
      status:     document.getElementById("patientStatus").value,
    };
    try {
      await postJSON(`${API_BASE}/patients`, payload);
      patientForm.reset();
      showToast("Patient added ✓", "success");
      await loadDashboardData();
    } catch { showToast("Could not add patient.", "error"); }
  });

  // ── Add Doctor ──
  doctorForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      name:           document.getElementById("doctorName").value.trim(),
      specialization: document.getElementById("doctorSpecialization").value.trim(),
      qualification:  document.getElementById("doctorQualification").value.trim(),
      phone:          document.getElementById("doctorPhone").value.trim(),
      email:          document.getElementById("doctorEmail").value.trim(),
      experience:     Number(document.getElementById("doctorExperience").value) || 0,
      availability:   document.getElementById("doctorAvailability").value.trim(),
      status:         document.getElementById("doctorStatus").value,
    };
    try {
      await postJSON(`${API_BASE}/doctors`, payload);
      doctorForm.reset();
      showToast("Doctor added ✓", "success");
      await loadDashboardData();
    } catch { showToast("Could not add doctor.", "error"); }
  });

  // ── Book Appointment ──
  appointmentForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = {
      patientName: document.getElementById("appointmentPatientName").value.trim(),
      doctorName:  document.getElementById("appointmentDoctorName").value.trim(),
      date:        document.getElementById("appointmentDate").value,
      time:        document.getElementById("appointmentTime").value,
      reason:      document.getElementById("appointmentReason").value.trim(),
      notes:       document.getElementById("appointmentNotes").value.trim(),
      status:      document.getElementById("appointmentStatus").value,
    };
    try {
      await postJSON(`${API_BASE}/appointments`, payload);
      appointmentForm.reset();
      showToast("Appointment booked ✓", "success");
      await loadDashboardData();
    } catch { showToast("Could not book appointment.", "error"); }
  });

  // ── Record Payment ──
  paymentForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const sel = document.getElementById("paymentPatientSelect");
    const patientId   = sel.value;
    const patientName = sel.options[sel.selectedIndex]?.getAttribute("data-name") || "";
    const amount      = Number(document.getElementById("paymentAmount").value);
    const paidAmount  = Number(document.getElementById("paymentPaidAmount").value) || amount;

    const payload = {
      patientId,
      patientName,
      amount,
      paidAmount,
      paymentType:   document.getElementById("paymentType").value,
      paymentMethod: document.getElementById("paymentMethod").value,
      status:        document.getElementById("paymentStatus").value,
      description:   document.getElementById("paymentDescription").value.trim(),
    };
    try {
      const res = await postJSON(`${API_BASE}/payments`, payload);
      paymentForm.reset();
      showToast("Payment recorded ✓", "success");
      await loadDashboardData();
      showReceipt(res.payment);
    } catch { showToast("Could not record payment.", "error"); }
  });
}
