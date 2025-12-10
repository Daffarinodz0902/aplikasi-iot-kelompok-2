// App logic for IoT Dashboard
// -- Firebase: Optional. If you have config, replace `firebaseConfig` below.
const firebaseConfig = null; // <-- set your firebase config object here, or leave null to use mock data

let db = null;
if (firebaseConfig) {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
}

// Elements
const suhuVal = document.getElementById('suhuVal');
const lastUpdate = document.getElementById('lastUpdate');
const humVal = document.getElementById('humVal');
const humUpdate = document.getElementById('humUpdate');
const toggleLamp = document.getElementById('toggleLamp');
const lampStatus = document.getElementById('lampStatus');
const btnStatus = document.getElementById('btnStatus');

// Chart setup
const ctx = document.getElementById('chartSuhu').getContext('2d');
// Chart: disable animations and keep points small to reduce CPU/GPU cost
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Suhu (°C)',
      data: [],
      borderColor: 'rgba(255,99,132,0.9)',
      backgroundColor: 'rgba(255,99,132,0.12)',
      tension: 0.12,
      pointRadius: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    transitions: { show: { animation: false }, hide: { animation: false } },
    plugins: { legend: { display: true } },
    elements: { point: { radius: 1 } }
  }
});

// Local simulation state (used when no firebase)
let mockState = { lamp: false, button: false };

function pushPoint(t, val) {
  const labels = chart.data.labels;
  const data = chart.data.datasets[0].data;
  labels.push(t);
  data.push(val);
  if (labels.length > 30) { labels.shift(); data.shift(); }
  // update chart with no animation and minimal work
  chart.update('none');
  updateInsights();
}

function humanTime() { return new Date().toLocaleTimeString(); }

// If firebase configured, attach listeners; otherwise use mock generator
if (db) {
  // suhu
  db.ref('iot/suhu').on('value', s => {
    const v = s.val();
    if (v !== null) {
      suhuVal.innerText = v.toFixed(1) + '°C';
      lastUpdate.innerText = 'Update: ' + humanTime();
    }
  });

  // history
  db.ref('iot/history').limitToLast(30).on('value', snap => {
    const data = snap.val();
    if (!data) return;
    const entries = Object.entries(data);
    chart.data.labels = entries.map(e => new Date(Number(e[0])).toLocaleTimeString());
    chart.data.datasets[0].data = entries.map(e => e[1]);
    chart.update();
  });

  // lamp
  db.ref('iot/lampu').on('value', s => {
    const v = s.val();
    lampStatus.innerText = v ? 'ON' : 'OFF';
    toggleLamp.innerText = v ? 'Matikan Lampu' : 'Nyalakan Lampu';
  });

  // tombol
  db.ref('iot/tombol').on('value', s => {
    btnStatus.innerText = s.val() ? 'Tertekan' : 'Tidak Tertekan';
  });

  toggleLamp.onclick = async () => {
    const cur = (await db.ref('iot/lampu').once('value')).val();
    db.ref('iot/lampu').set(!cur);
  };
} else {
  // Mock generator: create pseudo-random sensor values
  // Slower interval (6s) to reduce CPU load on low-end laptops
  setInterval(() => {
    const t = humanTime();
    const temp = (20 + Math.sin(Date.now()/6000) * 3.2 + (Math.random()-0.5));
    const hum = 40 + Math.abs(Math.round(Math.sin(Date.now()/9000)*12 + (Math.random()*5)));
    suhuVal.innerText = temp.toFixed(1) + '°C';
    lastUpdate.innerText = 'Update: ' + t;
    humVal.innerText = hum + '%';
    humUpdate.innerText = 'Update: ' + t;
    pushPoint(t, Number(temp.toFixed(1)));
  }, 6000);

  // lamp toggle mock
  toggleLamp.innerText = 'Nyalakan Lampu';
  lampStatus.innerText = 'OFF';
  toggleLamp.onclick = () => {
    mockState.lamp = !mockState.lamp;
    lampStatus.innerText = mockState.lamp ? 'ON' : 'OFF';
    toggleLamp.innerText = mockState.lamp ? 'Matikan Lampu' : 'Nyalakan Lampu';
  };

  // button mock (change occasionally)
  setInterval(() => {
    mockState.button = Math.random() > 0.88 ? !mockState.button : mockState.button;
    btnStatus.innerText = mockState.button ? 'Tertekan' : 'Tidak Tertekan';
  }, 4000);
}

// Insights DOM elements
const avgTempEl = document.getElementById('avgTemp');
const maxTempEl = document.getElementById('maxTemp');
const minTempEl = document.getElementById('minTemp');
const lastHumEl = document.getElementById('lastHum');

function updateInsights() {
  const data = chart.data.datasets[0].data.map(Number);
  if (!data || data.length === 0) return;
  const sum = data.reduce((a,b)=>a+b,0);
  const avg = (sum/data.length).toFixed(1);
  const mx = Math.max(...data).toFixed(1);
  const mn = Math.min(...data).toFixed(1);
  avgTempEl.innerText = avg + '°C';
  maxTempEl.innerText = mx + '°C';
  minTempEl.innerText = mn + '°C';
  if (humVal) lastHumEl.innerText = humVal.innerText || '--%';
}

