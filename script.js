const appState = {
  currentPage: 'dashboard',
};

const summaryData = [
  { label: 'Total Parcels', value: '1,284', note: '+8.2% vs last week', tone: 'blue', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>' },
  { label: 'Stored', value: '318', note: '12 pending pickup', tone: 'green', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"/><path d="M8 9h8M8 13h8"/></svg>' },
  { label: 'Claimed', value: '942', note: '+15 pickups today', tone: 'purple', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 7 9 18l-5-5"/></svg>' },
  { label: 'Alerts', value: '02', note: '1 critical issue', tone: 'red', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>' },
];

const recentParcels = [
  { id: 'PAR-1048', recipient: 'Mia Lewis', rfid: 'A42F89', status: 'Stored', weight: '2.4 kg', time: '09:14 AM' },
  { id: 'PAR-1047', recipient: 'Noah Gomez', rfid: 'C90B21', status: 'Claimed', weight: '4.1 kg', time: '08:42 AM' },
  { id: 'PAR-1046', recipient: 'Ava Patel', rfid: 'D11A67', status: 'Pending', weight: '1.9 kg', time: '08:05 AM' },
  { id: 'PAR-1045', recipient: 'Leo Smith', rfid: 'F98D41', status: 'Detected', weight: '3.8 kg', time: '07:48 AM' },
];

const dashboardAlerts = [
  { level: 'Critical', title: 'Unauthorized access attempt', text: 'RFID tag 1D-9A was rejected at rear entrance', time: '6 min ago', icon: 'crit' },
  { level: 'Warning', title: 'Door left open', text: 'Rear compartment remained open for 14 minutes', time: '22 min ago', icon: 'warn' },
  { level: 'Information', title: 'Battery health check', text: 'ESP-01 battery remains above 82%', time: '1 hr ago', icon: 'info' },
];

const deviceState = [
  { name: 'ESP-01 Gateway', status: 'Online', type: 'on' },
  { name: 'RFID Reader', status: 'Stable', type: 'on' },
  { name: 'Load Cell', status: 'Calibrated', type: 'on' },
  { name: 'Locker Solenoid', status: 'Standby', type: 'warn' },
];

const liveFeed = [
  { time: '09:18', text: 'Parcel PAR-1048 detected and stored in Bay 03.' },
  { time: '09:12', text: 'RFID scan allowed for user A42F89.' },
  { time: '09:04', text: 'Door closed successfully after parcel intake.' },
  { time: '08:58', text: 'Load cell calibration verified across 3 readings.' },
  { time: '08:49', text: 'Alert cleared for low battery on ESP-01.' },
];

const pageTitles = {
  dashboard: 'Dashboard',
  parcels: 'Parcels',
  live: 'Live Monitoring',
  logs: 'Access Logs',
  alerts: 'Alerts',
  analytics: 'Analytics',
  users: 'Users',
  settings: 'System Settings',
};

function setActivePage(pageName) {
  appState.currentPage = pageName;

  const allPages = document.querySelectorAll('.page');
  allPages.forEach((page) => {
    page.classList.toggle('active', page.dataset.page === pageName);
  });

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });

  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) pageTitle.textContent = pageTitles[pageName] || pageName;
}

function bindNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach((button) => {
    button.addEventListener('click', () => setActivePage(button.dataset.page));
  });

  document.querySelectorAll('[data-goto]').forEach((button) => {
    button.addEventListener('click', () => {
      const page = button.dataset.goto;
      if (page) setActivePage(page);
    });
  });

  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const closeBtn = document.getElementById('sidebarClose');

  function toggleSidebar(forceOpen) {
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', shouldOpen);
    overlay.classList.toggle('open', shouldOpen);
  }

  hamburger?.addEventListener('click', () => toggleSidebar(true));
  closeBtn?.addEventListener('click', () => toggleSidebar(false));
  overlay?.addEventListener('click', () => toggleSidebar(false));

  const adminBtn = document.getElementById('adminBtn');
  const adminDropdown = document.getElementById('adminDropdown');
  adminBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    adminDropdown.classList.toggle('open');
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.admin-menu')) {
      adminDropdown.classList.remove('open');
    }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    showToast('Admin session ended.');
    adminDropdown.classList.remove('open');
  });
}

function renderSummaryCards() {
  const target = document.getElementById('summaryGrid');
  if (!target) return;

  target.innerHTML = summaryData.map((card) => `
    <div class="stat-card ${card.tone}">
      <div class="stat-card-head">
        <div>
          <div class="stat-label">${card.label}</div>
          <div class="stat-value">${card.value}</div>
        </div>
        <div class="stat-icon">${card.icon}</div>
      </div>
      <div class="stat-note ${card.tone === 'red' ? 'negative' : ''}">
        ${card.tone === 'red' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 14l6-6 6 6"/><path d="M12 8v8"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 10l6 6 6-6"/><path d="M12 16V8"/></svg>'}
        ${card.note}
      </div>
    </div>
  `).join('');
}

function renderRecentParcelsTable() {
  const target = document.getElementById('recentParcelsTable');
  if (!target) return;

  target.innerHTML = `
    <thead>
      <tr>
        <th>Parcel ID</th>
        <th>Recipient</th>
        <th>RFID</th>
        <th>Status</th>
        <th>Weight</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      ${recentParcels.map((parcel) => `
        <tr>
          <td>${parcel.id}</td>
          <td>${parcel.recipient}</td>
          <td>${parcel.rfid}</td>
          <td><span class="status-chip ${parcel.status === 'Claimed' ? 'detected' : parcel.status === 'Pending' ? 'warn' : parcel.status === 'Detected' ? 'info' : 'neutral'}">${parcel.status}</span></td>
          <td>${parcel.weight}</td>
          <td>${parcel.time}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function renderAlertFeed() {
  const target = document.getElementById('dashAlertList');
  if (!target) return;

  target.innerHTML = dashboardAlerts.map((alert) => `
    <div class="mini-alert-item">
      <div class="mini-alert-icon ${alert.icon}">
        ${alert.level === 'Critical' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>' : alert.level === 'Warning' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v10"/><path d="M12 18h.01"/><path d="M5 19h14"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v8"/><path d="M12 22v-8"/><path d="M2 12h8"/><path d="M14 12h8"/></svg>'}
      </div>
      <div class="mini-alert-text">
        <strong>${alert.title}</strong>
        <span>${alert.text}</span>
      </div>
      <span class="mini-alert-time">${alert.time}</span>
    </div>
  `).join('');
}

function renderDeviceList() {
  const target = document.getElementById('deviceMiniList');
  if (!target) return;

  target.innerHTML = deviceState.map((device) => `
    <div class="device-mini-item">
      <span class="device-mini-dot ${device.type}"></span>
      <span class="device-mini-name">${device.name}</span>
      <span class="device-mini-status ${device.type}">${device.status}</span>
    </div>
  `).join('');
}

function renderLiveFeed() {
  const target = document.getElementById('liveFeed');
  const count = document.getElementById('feedCount');
  if (!target) return;

  target.innerHTML = liveFeed.map((item) => `
    <div class="feed-item">
      <span class="feed-dot"></span>
      <span class="feed-time">${item.time}</span>
      <span class="feed-text">${item.text}</span>
    </div>
  `).join('');

  if (count) {
    count.textContent = `${liveFeed.length} events`;
  }
}

function updateClock() {
  const dateEl = document.getElementById('headerDate');
  const timeEl = document.getElementById('headerTime');
  if (!dateEl || !timeEl) return;

  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  timeEl.textContent = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function init() {
  renderSummaryCards();
  renderRecentParcelsTable();
  renderAlertFeed();
  renderDeviceList();
  renderLiveFeed();
  updateClock();
  setInterval(updateClock, 15000);
  bindNavigation();

  const saveBtn = document.querySelector('#settingsForm button[type="submit"]');
  saveBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    showToast('Settings saved successfully.');
  });

  const bellBtn = document.getElementById('bellBtn');
  bellBtn?.addEventListener('click', () => {
    setActivePage('alerts');
    showToast('New alerts available.');
  });
}

document.addEventListener('DOMContentLoaded', init);
