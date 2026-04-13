let isLoggedIn = false;

function handleLogin() {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorElement = document.getElementById("loginError");

  if (!usernameInput || !passwordInput || !errorElement) {
    console.error("Login form elements not found");
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  errorElement.textContent = "";

  if (username === "" || password === "") {
    errorElement.textContent = "Please enter both username and password";
    return;
  }

  if (username === "admin" && password === "1234") {
    isLoggedIn = true;
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");

    // Apply saved theme and load dashboard
    loadSavedTheme();
    showSection('dashboard');

    // Clear fields for security
    usernameInput.value = "";
    passwordInput.value = "";
  } else {
    errorElement.textContent = "Incorrect username or password";
  }
}

function logout() {
  isLoggedIn = false;
  document.getElementById("mainApp").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("loginError").textContent = "";
}

// Navigation
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  if (id === "dashboard") loadDashboard();
  if (id === "viewPlayers") loadPlayersTable();
  if (id === "events") loadEvents();
  if (id === "announcements") loadAnnouncements();
  if (id === "viewMatches") loadMatches();
}

// Data Helpers
function get(key) { return JSON.parse(localStorage.getItem(key) || "[]"); }
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

// Add Player
function addPlayer(e) {
  e.preventDefault();
  const player = {
    id: Number(document.getElementById("id").value),
    name: document.getElementById("name").value.trim(),
    age: Number(document.getElementById("age").value),
    position: document.getElementById("position").value,
    jersey: Number(document.getElementById("jersey").value),
    goals: Number(document.getElementById("goals").value),
    imageUrl: document.getElementById("imageUrl").value.trim() || "https://via.placeholder.com/80?text=Player",
    parentName: document.getElementById("parentName").value.trim(),
    parentPhone: document.getElementById("parentPhone").value.trim(),
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value.trim()
  };

  let players = get("players");
  if (players.some(p => p.id === player.id)) {
    alert("This ID is already used!");
    return;
  }

  players.push(player);
  save("players", players);
  document.getElementById("addMsg").textContent = "Player added successfully!";
  document.getElementById("addMsg").style.color = "#4caf50";
  e.target.reset();
  setTimeout(() => document.getElementById("addMsg").textContent = "", 3000);
}

// View Players
function loadPlayersTable() {
  let players = get("players");
  const nameFilter = document.getElementById("searchName")?.value.toLowerCase() || "";
  const statusFilter = document.getElementById("searchStatus")?.value || "";

  if (nameFilter) {
    players = players.filter(p => p.name.toLowerCase().includes(nameFilter));
  }
  if (statusFilter) {
    players = players.filter(p => p.status === statusFilter);
  }

  const container = document.getElementById("playersTable");
  container.innerHTML = players.length === 0
    ? "<p>No players match your search.</p>"
    : `
      <table>
        <tr>
          <th>Photo</th>
          <th>Name</th>
          <th>Position</th>
          <th>Jersey</th>
          <th>Goals</th>
          <th>Status</th>
          <th>Parent / Phone</th>
          <th>Actions</th>
        </tr>
        ${players.map(p => `
          <tr>
            <td><img src="${p.imageUrl}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;"></td>
            <td>${p.name}</td>
            <td>${p.position}</td>
            <td>${p.jersey}</td>
            <td>${p.goals}</td>
            <td class="status-${p.status}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</td>
            <td>${p.parentName || '-'} / ${p.parentPhone || '-'}</td>
            <td>
              <button onclick="editPlayer(${p.id})">Edit</button>
              <button onclick="deletePlayer(${p.id})">Delete</button>
            </td>
          </tr>
        `).join("")}
      </table>`;
}

// Edit Player
function editPlayer(id) {
  const player = get("players").find(p => p.id === id);
  if (!player) return;

  document.getElementById("editId").value = player.id;
  document.getElementById("editName").value = player.name;
  document.getElementById("editAge").value = player.age;
  document.getElementById("editPosition").value = player.position;
  document.getElementById("editJersey").value = player.jersey;
  document.getElementById("editGoals").value = player.goals;
  document.getElementById("editImageUrl").value = player.imageUrl;
  document.getElementById("editPreviewImg").src = player.imageUrl;
  document.getElementById("editParentName").value = player.parentName || "";
  document.getElementById("editParentPhone").value = player.parentPhone || "";
  document.getElementById("editStatus").value = player.status;
  document.getElementById("editNotes").value = player.notes || "";

  document.getElementById("editModal").classList.remove("hidden");
}

function saveEditedPlayer(e) {
  e.preventDefault();
  const id = Number(document.getElementById("editId").value);
  let players = get("players");
  const index = players.findIndex(p => p.id === id);
  if (index === -1) return;

  players[index] = {
    id,
    name: document.getElementById("editName").value.trim(),
    age: Number(document.getElementById("editAge").value),
    position: document.getElementById("editPosition").value,
    jersey: Number(document.getElementById("editJersey").value),
    goals: Number(document.getElementById("editGoals").value),
    imageUrl: document.getElementById("editImageUrl").value.trim() || players[index].imageUrl,
    parentName: document.getElementById("editParentName").value.trim(),
    parentPhone: document.getElementById("editParentPhone").value.trim(),
    status: document.getElementById("editStatus").value,
    notes: document.getElementById("editNotes").value.trim()
  };

  save("players", players);
  closeEditModal();
  loadPlayersTable();
  loadDashboard();
}

function deletePlayer(id) {
  if (!confirm("Delete this player permanently?")) return;
  let players = get("players").filter(p => p.id !== id);
  save("players", players);
  loadPlayersTable();
  loadDashboard();
}

function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
}

// Events
function addEvent(e) {
  e.preventDefault();
  const eventData = {
    id: Date.now(),
    title: document.getElementById("eventTitle").value.trim(),
    date: document.getElementById("eventDate").value,
    time: document.getElementById("eventTime").value || "All day"
  };

  let events = get("events");
  events.push(eventData);
  save("events", events);
  loadEvents();
  e.target.reset();
}

function loadEvents() {
  let events = get("events").sort((a, b) => new Date(a.date) - new Date(b.date));
  document.getElementById("eventsList").innerHTML = events.length === 0
    ? "<p>No upcoming or past events.</p>"
    : events.map(ev => `
        <div class="event-item">
          <strong>${ev.title}</strong><br>
          <small>${ev.date} • ${ev.time}</small>
        </div>
      `).join("");
}

// Announcements
function postAnnouncement() {
  const text = document.getElementById("announceText").value.trim();
  if (!text) return alert("Please write a message first.");

  let ann = get("announcements");
  ann.push({ text, date: new Date().toLocaleString() });
  save("announcements", ann);
  loadAnnouncements();
  document.getElementById("announceText").value = "";
}

function loadAnnouncements() {
  let ann = get("announcements").reverse();
  document.getElementById("announceFeed").innerHTML = ann.length === 0
    ? "<p>No announcements yet.</p>"
    : ann.map(a => `
        <div class="announce-item">
          <small>${a.date}</small>
          <p>${a.text}</p>
        </div>
      `).join("");
}

// Matches
function addMatch(e) {
  e.preventDefault();
  const match = {
    opponent: document.getElementById("opponent").value.trim(),
    date: document.getElementById("matchDate").value,
    ourScore: Number(document.getElementById("ourScore").value),
    opponentScore: Number(document.getElementById("opponentScore").value)
  };

  let matches = get("matches");
  matches.push(match);
  save("matches", matches);
  document.getElementById("matchMsg").textContent = "Match recorded successfully!";
  e.target.reset();
  setTimeout(() => document.getElementById("matchMsg").textContent = "", 3000);
}

function loadMatches() {
  let matches = get("matches");
  document.getElementById("matchesList").innerHTML = matches.length === 0
    ? "<p>No matches recorded yet.</p>"
    : matches.map(m => `
        <div style="margin:10px 0; padding:10px; background:var(--card-bg); border-radius:6px;">
          <strong>${m.date} vs ${m.opponent}</strong><br>
          Score: ${m.ourScore} - ${m.opponentScore}
        </div>
      `).join("");
}

// Dashboard
function loadDashboard() {
  const players = get("players");
  const matches = get("matches");

  const totalPlayers = players.length;
  const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
  const injuredCount = players.filter(p => p.status === "injured").length;
  const recentForm = matches.slice(-3).map(m => {
    if (m.ourScore > m.opponentScore) return "W";
    if (m.ourScore === m.opponentScore) return "D";
    return "L";
  }).reverse().join(" - ") || "No recent matches";

  document.getElementById("statsOverview").innerHTML = `
    <div class="stat-card">
      <h3>Total Players</h3>
      <div class="value">${totalPlayers}</div>
    </div>
    <div class="stat-card">
      <h3>Total Goals</h3>
      <div class="value">${totalGoals}</div>
    </div>
    <div class="stat-card">
      <h3>Injured Players</h3>
      <div class="value">${injuredCount}</div>
    </div>
    <div class="stat-card">
      <h3>Recent Form</h3>
      <div class="value">${recentForm}</div>
    </div>
  `;
}

// Export Data
function exportData() {
  const data = {
    players: get("players"),
    matches: get("matches"),
    events: get("events"),
    announcements: get("announcements")
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "navrongo_fc_backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Reset All Data
function resetAllData() {
  if (confirm("This will delete ALL data permanently. Continue?")) {
    localStorage.clear();
    location.reload();
  }
}

// Print Squad List
function printSquad() {
  const players = get("players");
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
    <head><title>Navrongo FC Squad List</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { text-align: center; color: #2e7d32; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      th { background: #4caf50; color: white; }
      img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
    </style>
    </head>
    <body>
      <h1>Navrongo FC Squad</h1>
      <table>
        <tr>
          <th>Photo</th>
          <th>Name</th>
          <th>Position</th>
          <th>Jersey</th>
          <th>Status</th>
          <th>Parent / Phone</th>
        </tr>
        ${players.map(p => `
          <tr>
            <td><img src="${p.imageUrl}" alt="${p.name}"></td>
            <td>${p.name}</td>
            <td>${p.position}</td>
            <td>${p.jersey}</td>
            <td class="status-${p.status}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</td>
            <td>${p.parentName || '-'} / ${p.parentPhone || '-'}</td>
          </tr>
        `).join("")}
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 800);
}

// Theme Toggle
function toggleTheme() {
  const body = document.body;
  const icon = document.getElementById("themeIcon");

  if (body.classList.contains("light-mode")) {
    body.classList.remove("light-mode");
    icon.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.add("light-mode");
    icon.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
}

function loadSavedTheme() {
  const saved = localStorage.getItem("theme");
  const body = document.body;
  const icon = document.getElementById("themeIcon");

  if (saved === "light") {
    body.classList.add("light-mode");
    icon.textContent = "🌙";
  } else {
    body.classList.remove("light-mode");
    icon.textContent = "☀️";
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadSavedTheme();
});