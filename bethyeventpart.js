// --- DATA VERSIONING & DEFAULTS ---
const DATA_VERSION = '2026-01-19'; 

const DEFAULT_EVENTS = [
  {id: 1, name:"Tech Fest 2025", date:"15-17 Mar 2025", time:"9AM-6PM", location:"Main Auditorium", desc:"Hackathon & workshops"},
  {id: 2, name:"Cultural Night", date:"5 May 2025", time:"6PM-11PM", location:"Open Air Theater", desc:"Music, dance, food"},
  {id: 3, name:"AI & Robotics Expo", date:"12 Feb 2026", time:"10AM-4PM", location:"Innovation Lab", desc:"Student projects showcase and demos"},
  {id: 4, name:"Startup Pitch Day", date:"28 Feb 2026", time:"2PM-6PM", location:"Entrepreneurship Hub", desc:"Pitch competition with mentors and judges"},
  {id: 5, name:"Sports Meet", date:"10 Mar 2026", time:"8AM-5PM", location:"Central Field", desc:"Track events, football, basketball"},
  {id: 6, name:"Culture & Coffee", date:"18 Mar 2026", time:"5PM-8PM", location:"Student Lounge", desc:"Cultural exchange, music and poetry"},
  {id: 7, name:"Open Source Sprint", date:"23 Mar 2026", time:"1PM-7PM", location:"CS Block A", desc:"Contribute to OSS; beginners welcome"},
  {id: 8, name:"Mental Wellness Workshop", date:"29 Mar 2026", time:"3PM-5PM", location:"Seminar Hall 2", desc:"Mindfulness, stress management, peer support"}
];

// Initialize Data
let events = JSON.parse(localStorage.getItem('clubconnect_events')) || DEFAULT_EVENTS;
let savedIds = JSON.parse(localStorage.getItem('clubconnect_saved_ids')) || [];

// --- NAVIGATION ---
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  
  document.getElementById(id).classList.add('active');
  document.getElementById('nav-' + id).classList.add('active');
  
  if(id === 'my-events') renderMyEvents();
  else renderAllEvents();
}

// --- RENDERING ---
function renderAllEvents(filterText = "") {
  const container = document.getElementById('eventList');
  container.innerHTML = "";
  
  const filtered = events.filter(e => 
    e.name.toLowerCase().includes(filterText.toLowerCase()) || 
    e.desc.toLowerCase().includes(filterText.toLowerCase())
  );

  filtered.forEach(e => container.appendChild(createEventCard(e)));
}

function renderMyEvents() {
  const container = document.getElementById('myEventList');
  container.innerHTML = "";
  const myData = events.filter(e => savedIds.includes(e.id));
  
  if(myData.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); margin-top: 50px;">
      <i class="fas fa-calendar-day" style="font-size: 3rem; opacity: 0.2;"></i>
      <p style="margin-top: 15px;">Your schedule is clear. Go add some events!</p>
    </div>`;
    return;
  }
  
  myData.forEach(e => container.appendChild(createEventCard(e)));
}

function createEventCard(e) {
  const card = document.createElement('div');
  card.className = 'card';
  card.onclick = () => openEventModal(e);
  card.innerHTML = `
    <div>
      <h3>${e.name}</h3>
      <p>${e.desc}</p>
    </div>
    <div class="card-footer">
      <div class="card-meta"><i class="far fa-calendar"></i> ${e.date}</div>
      <div class="card-meta"><i class="fas fa-map-marker-alt"></i> ${e.location}</div>
    </div>
  `;
  return card;
}

// --- SEARCH ---
function handleSearch() {
  const query = document.getElementById('globalSearch').value;
  renderAllEvents(query);
}

// --- MODAL LOGIC ---
let activeEvent = null;

function openEventModal(e) {
  activeEvent = e;
  const isSaved = savedIds.includes(e.id);
  
  document.getElementById('modalInjectedContent').innerHTML = `
    <h2 style="font-size: 2rem; margin-bottom: 10px;">${e.name}</h2>
    <div class="card-meta" style="font-size: 1.1rem; color: var(--primary);"><i class="fas fa-clock"></i> ${e.time}</div>
    <div class="card-meta" style="font-size: 1.1rem;"><i class="fas fa-calendar-alt"></i> ${e.date}</div>
    <div class="card-meta" style="font-size: 1.1rem;"><i class="fas fa-map-pin"></i> ${e.location}</div>
    <hr style="margin: 20px 0; border: 0; border-top: 1px solid var(--border);">
    <p style="line-height: 1.8; color: var(--text-muted); font-size: 1.1rem;">${e.desc}</p>
  `;
  
  document.getElementById('modalActions').innerHTML = isSaved 
    ? `<button class="btn btn-outline" style="color: #ef4444;" onclick="toggleSave(${e.id})"><i class="fas fa-trash"></i> Remove from My Events</button>`
    : `<button class="btn btn-primary" onclick="toggleSave(${e.id})"><i class="fas fa-plus"></i> Add to My Events</button>`;
  
  document.getElementById('eventModal').classList.add('active');
}

function toggleSave(id) {
  if(savedIds.includes(id)) {
    savedIds = savedIds.filter(sid => sid !== id);
  } else {
    savedIds.push(id);
    showToast(`"${activeEvent.name}" added to schedule!`);
  }
  
  localStorage.setItem('clubconnect_saved_ids', JSON.stringify(savedIds));
  closeModal('eventModal');
  
  if(document.getElementById('my-events').classList.contains('active')) renderMyEvents();
  else renderAllEvents();
}

// --- CREATIVE FEATURES ---
function showToast(msg) {
  const toast = document.getElementById('reminder-toast');
  document.getElementById('toast-text').textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function shareEvent() {
  const url = `https://clubconnect.app/share/event-${activeEvent.id}`;
  navigator.clipboard.writeText(url);
  alert("Link copied! Share it with your club mates.");
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// --- THEME ---
document.getElementById('themeToggle').onclick = function() {
  document.body.classList.toggle('light');
  const icon = this.querySelector('i');
  icon.classList.toggle('fa-moon');
  icon.classList.toggle('fa-sun');
};

// Start App
renderAllEvents();