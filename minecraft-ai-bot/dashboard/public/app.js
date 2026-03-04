const socket = io();

const statusContent = document.getElementById('status-content');
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const sendChat = document.getElementById('send-chat');
const inventoryGrid = document.getElementById('inventory-grid');
const buildVillage = document.getElementById('build-village');
const buildMedieval = document.getElementById('build-medieval');
const buildModern = document.getElementById('build-modern');
const controlsGrid = document.getElementById('controls-grid');
const loginBtn = document.getElementById('login');

loginBtn.addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    alert('Logged in');
  } else {
    alert('Login failed');
  }
});

socket.on('connect', () => {
  statusContent.innerText = 'Connected';
});

socket.on('disconnect', () => {
  statusContent.innerText = 'Disconnected';
});

socket.on('chat', (msg) => {
  const div = document.createElement('div');
  div.innerText = msg;
  chatLog.appendChild(div);
});

sendChat.addEventListener('click', () => {
  const text = chatInput.value;
  socket.emit('chat', text);
  chatInput.value = '';
});

buildVillage.addEventListener('click', () => socket.emit('buildcity', 'village'));
buildMedieval.addEventListener('click', () => socket.emit('buildcity', 'medieval'));
buildModern.addEventListener('click', () => socket.emit('buildcity', 'modern'));

controlsGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const control = btn.dataset.control;
  socket.emit('control', { control, value: true });
});

// Inventory viewer placeholder
for (let i = 0; i < 36; i++) {
  const slot = document.createElement('div');
  slot.className = 'inventory-slot';
  slot.innerText = '';
  inventoryGrid.appendChild(slot);
}
