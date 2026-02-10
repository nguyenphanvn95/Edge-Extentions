let systemChart;
let celebrationAnimationId;

document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  setupTabs();
  setupEventListeners();
  updateSystemInfo();
  updateTopSites();
});

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tab.dataset.tab).classList.add('active');
      
      if (tab.dataset.tab === 'system') {
        updateSystemInfo();
      } else if (tab.dataset.tab === 'topsites') {
        updateTopSites();
      }
    });
  });
}

function setupEventListeners() {
  document.getElementById('cleanNow').addEventListener('click', cleanNow);
  document.getElementById('timeInterval').addEventListener('change', saveSettings);
  document.getElementById('requestSystemPermissions').addEventListener('click', () => requestAdditionalPermissions(['system.cpu', 'system.memory']));
  document.getElementById('requestTopSitesPermissions').addEventListener('click', () => requestAdditionalPermissions(['topSites']));
}

function loadSettings() {
  chrome.storage.sync.get(['dataTypes', 'timeInterval'], function(data) {
    const dataTypesDiv = document.getElementById('dataTypes');
    const dataTypes = [
      {id: 'cache', name: 'Cache'},
      {id: 'cookies', name: 'Cookies'},
      {id: 'downloads', name: 'Downloads'},
      {id: 'formData', name: 'Form Data'},
      {id: 'history', name: 'History'},
      {id: 'indexedDB', name: 'IndexedDB'},
      {id: 'localStorage', name: 'Local Storage'},
      {id: 'pluginData', name: 'Plugin Data'},
      {id: 'passwords', name: 'Passwords'},
      {id: 'webSQL', name: 'Web SQL'}
    ];

    dataTypesDiv.innerHTML = '';
    dataTypes.forEach(type => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="checkbox" id="${type.id}" ${data.dataTypes && data.dataTypes[type.id] ? 'checked' : ''}>
        ${type.name}
      `;
      dataTypesDiv.appendChild(label);
    });

    if (data.timeInterval) {
      document.getElementById('timeInterval').value = data.timeInterval;
    }
  });
}

function saveSettings() {
  const dataTypes = {};
  document.querySelectorAll('#dataTypes input').forEach(input => {
    dataTypes[input.id] = input.checked;
  });
  
  const timeInterval = document.getElementById('timeInterval').value;
  
  chrome.storage.sync.set({dataTypes, timeInterval});
}

function cleanNow() {
  saveSettings();
  chrome.storage.sync.get(['dataTypes', 'timeInterval'], function(data) {
    chrome.runtime.sendMessage({
      action: "clean", 
      dataTypes: data.dataTypes, 
      timeInterval: data.timeInterval
    }, function(response) {
      const statusDiv = document.getElementById('cleaningStatus');
      statusDiv.innerHTML = `
        <h3>Cleaning completed</h3>
        <p>${response.report}</p>
      `;
      startCelebration();
      setTimeout(stopCelebration, 3000);
    });
  });
}

function updateSystemInfo() {
  chrome.permissions.contains({permissions: ['system.cpu', 'system.memory']}, (result) => {
    if (result) {
      chrome.system.cpu.getInfo(cpuInfo => {
        chrome.system.memory.getInfo(memoryInfo => {
          const systemInfoDiv = document.getElementById('systemInfo');
          systemInfoDiv.innerHTML = `
            <p><strong>CPU:</strong> ${cpuInfo.modelName}</p>
            <p><strong>Cores:</strong> ${cpuInfo.numOfProcessors}</p>
            <p><strong>Total Memory:</strong> ${formatBytes(memoryInfo.capacity)}</p>
            <p><strong>Available Memory:</strong> ${formatBytes(memoryInfo.availableCapacity)}</p>
          `;

          updateMemoryChart(memoryInfo);
        });
      });
    } else {
      document.getElementById('systemInfo').textContent = 'Additional permissions are required to display system information.';
      const ctx = document.getElementById('systemChart').getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  });
}

function updateMemoryChart(memoryInfo) {
  const ctx = document.getElementById('systemChart').getContext('2d');
  
  if (systemChart) {
    systemChart.destroy();
  }

  systemChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Used', 'Available'],
      datasets: [{
        data: [
          memoryInfo.capacity - memoryInfo.availableCapacity,
          memoryInfo.availableCapacity
        ],
        backgroundColor: ['#FF4081', '#2196F3']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'Memory Usage'
      },
      legend: {
        position: 'bottom'
      }
    }
  });
}

function updateTopSites() {
  chrome.permissions.contains({permissions: ['topSites']}, (result) => {
    if (result) {
      chrome.topSites.get(sites => {
        const topSitesList = document.getElementById('topSitesList');
        topSitesList.innerHTML = '';
        sites.slice(0, 5).forEach(site => {
          const li = document.createElement('li');
          li.textContent = site.title || site.url;
          topSitesList.appendChild(li);
        });
      });
    } else {
      document.getElementById('topSitesList').textContent = 'Additional permissions are required to display top sites.';
    }
  });
}

function requestAdditionalPermissions(permissions) {
  chrome.permissions.request({
    permissions: permissions
  }, (granted) => {
    if (granted) {
      if (permissions.includes('system.cpu') || permissions.includes('system.memory')) {
        updateSystemInfo();
      }
      if (permissions.includes('topSites')) {
        updateTopSites();
      }
      document.getElementById('cleaningStatus').textContent = 'Additional permissions granted.';
    } else {
      document.getElementById('cleaningStatus').textContent = 'Permissions were not granted.';
    }
  });
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function startCelebration() {
  if (celebrationAnimationId) {
    cancelAnimationFrame(celebrationAnimationId);
  }
  const canvas = document.getElementById('celebration');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  const particleCount = 100;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      radius: Math.random() * 3 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      velocity: {
        x: Math.random() * 4 - 2,
        y: -Math.random() * 10 - 5
      },
      opacity: 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle, index) => {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.y += 0.1; // gravity
      particle.opacity -= 0.01;

      if (particle.opacity <= 0) {
        particles.splice(index, 1);
      } else {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      }
    });

    if (particles.length > 0) {
      celebrationAnimationId = requestAnimationFrame(animate);
    }
  }

  animate();
}

function stopCelebration() {
  if (celebrationAnimationId) {
    cancelAnimationFrame(celebrationAnimationId);
    celebrationAnimationId = null;
    const canvas = document.getElementById('celebration');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}