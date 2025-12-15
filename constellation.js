// ========================================
// CONSTELLATION.JS - Friends Star Map
// Interactive visualization of your friends network
// ========================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const popup = document.getElementById('popup');

const API_BASE = 'http://localhost:3000/api';

let currentUser = null; // utilisateur connecté (centre de la constellation)
let nodes = [];
let animationId;

// ========================================
// CANVAS SETUP
// ========================================

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========================================
// FETCH FRIENDS FROM API (synchronisé avec /api/ami)
// ========================================

let friends = [];
let friendships = [];

async function fetchConstellation() {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      console.warn('No session found. Redirecting to login...');
      window.location.href = 'login.html';
      return;
    }

    currentUser = JSON.parse(userStr);

    const response = await fetch(`${API_BASE}/constellation`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    currentUser = data.me || currentUser;
    friends = Array.isArray(data.friends) ? data.friends : [];
    friendships = Array.isArray(data.friendships) ? data.friendships : [];

    console.log(`✓ Loaded ${friends.length} friends for constellation`);
    initializeConstellation();
  } catch (error) {
    console.error('Failed to fetch constellation:', error);
    friends = [];
    friendships = [];
    initializeConstellation();
  }
}

// ========================================
// CREATE CONSTELLATION NODES
// ========================================

function initializeConstellation() {
  nodes = [];
  if (!currentUser) return;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Noeud central: l'utilisateur connecté
  const meDisplayName = currentUser.username || currentUser.first_name || 'Moi';
  const meNode = {
    id: currentUser.id,
    name: meDisplayName,
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    size: 10,
    color: '#ffffff',
    isUser: true,
    data: currentUser
  };
  nodes.push(meNode);

  if (!friends || friends.length === 0) {
    animate();
    return;
  }

  // Positionner les amis sur un cercle autour de l'utilisateur
  const count = friends.length;
  const baseRadius = Math.min(canvas.width, canvas.height) / 3;

  friends.forEach((user, index) => {
    const angle = (index / count) * Math.PI * 2;
    const distance = baseRadius + Math.random() * 60;

    const displayName =
      (user.first_name && user.last_name)
        ? `${user.first_name} ${user.last_name}`
        : (user.first_name || user.username || 'Ami');

    nodes.push({
      id: user.id,
      name: displayName,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      vx: 0,
      vy: 0,
      size: 7,
      color: generateColorFromName(displayName),
      isUser: false,
      data: user,
      angle,
      distance
    });
  });

  animate();
}

// ========================================
// GENERATE COLOR FROM NAME
// ========================================

function generateColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#FF6B9D', '#C44569', '#00D9FF', '#00F0FF',
    '#FF006E', '#8338EC', '#3A86FF', '#06FFA5',
    '#FFBE0B', '#FB5607', '#FF006E', '#00BBF9'
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

// ========================================
// PHYSICS & ANIMATION
// ========================================

function updatePhysics() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const friction = 0.98;
  const attraction = 0.002;
  const repulsion = 800;
  const maxVelocity = 3;

  nodes.forEach((node, i) => {
    if (node.isUser) return;

    // Attraction to center
    const dx = centerX - node.x;
    const dy = centerY - node.y;
    const distance = Math.hypot(dx, dy);
    
    node.vx += (dx / distance) * attraction;
    node.vy += (dy / distance) * attraction;

    // Repulsion from other nodes
    nodes.forEach((other, j) => {
      if (i === j) return;
      
      const ddx = node.x - other.x;
      const ddy = node.y - other.y;
      const dist = Math.hypot(ddx, ddy) + 1;
      
      node.vx += (ddx / dist) * (repulsion / (dist * dist));
      node.vy += (ddy / dist) * (repulsion / (dist * dist));
    });

    // Friction and velocity limit
    node.vx *= friction;
    node.vy *= friction;
    
    const speed = Math.hypot(node.vx, node.vy);
    if (speed > maxVelocity) {
      node.vx = (node.vx / speed) * maxVelocity;
      node.vy = (node.vy / speed) * maxVelocity;
    }

    // Update position
    node.x += node.vx;
    node.y += node.vy;

    // Boundary wrapping
    const padding = 100;
    if (node.x < -padding) node.x = canvas.width + padding;
    if (node.x > canvas.width + padding) node.x = -padding;
    if (node.y < -padding) node.y = canvas.height + padding;
    if (node.y > canvas.height + padding) node.y = -padding;
  });
}

function drawConnections() {
  ctx.save();
  // Traînées lumineuses animées
  const t = Date.now() / 800;
  friendships.forEach(f => {
    const n1 = nodes.find(n => n.id === f.user_id_1);
    const n2 = nodes.find(n => n.id === f.user_id_2);
    if (n1 && n2) {
      // Animation de traînée
      for (let i = 0; i < 12; i++) {
        const p = i / 12;
        const x = n1.x + (n2.x - n1.x) * p;
        const y = n1.y + (n2.y - n1.y) * p;
        const alpha = 0.18 + 0.12 * Math.sin(t + p * 6);
        ctx.beginPath();
        ctx.arc(x, y, 2 + 2 * Math.sin(t + p * 8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${alpha})`;
        ctx.fill();
      }
      // Lien principal
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
    }
  });
  ctx.restore();
}

function drawNodes() {
  nodes.forEach((node) => {
    // Pulsation lumineuse selon le nombre d'amis
    let pulse = 1;
    if (node.id) {
      const friendCount = friendships.filter(f => f.user_id_1 === node.id || f.user_id_2 === node.id).length;
      pulse = 1 + 0.5 * Math.sin(Date.now() / 400 + node.id) * (friendCount / 6);
    }

    // Glow cosmique
    const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 3 * pulse);
    glowGradient.addColorStop(0, node.color + '55');
    glowGradient.addColorStop(1, node.color + '00');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size * 3 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Halo pour les groupes d'amis (si >3 liens)
    if (node.id && friendships.filter(f => f.user_id_1 === node.id || f.user_id_2 === node.id).length > 3) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * 7 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = '#aaf6ff';
      ctx.fill();
      ctx.restore();
    }

    // Draw node
    ctx.save();
    ctx.shadowColor = node.color;
    ctx.shadowBlur = 18 * pulse;
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw border
    ctx.strokeStyle = node.isUser ? '#fff' : node.color;
    ctx.lineWidth = node.isUser ? 2 : 1;
    ctx.stroke();
  });
}

// ========================================
// INTERACTION
// ========================================

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let hoveredNode = null;
  nodes.forEach((node) => {
    const distance = Math.hypot(node.x - mouseX, node.y - mouseY);
    if (distance < node.size + 15) {
      hoveredNode = node;
    }
  });

  if (hoveredNode) {
    canvas.style.cursor = 'pointer';
    showPopup(hoveredNode, mouseX, mouseY);
  } else {
    canvas.style.cursor = 'default';
    popup.style.display = 'none';
  }
});

function showPopup(node, x, y) {
  popup.innerHTML = `<strong>${node.name}</strong><br>${node.data && node.data.bio ? node.data.bio : ''}`;
  popup.style.left = x + 'px';
  popup.style.top = y + 'px';
  popup.style.display = 'block';
  popup.style.opacity = '1';
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  nodes.forEach((node) => {
    const distance = Math.hypot(node.x - mouseX, node.y - mouseY);
    if (distance < node.size + 15 && node.data) {
      // Affiche un profil détaillé + supernova
      showProfileModal(node);
      animateSupernova(node.x, node.y, node.color);
    }
  });
});

function showProfileModal(node) {
  const u = node.data || {};
  const fullName =
    (u.first_name && u.last_name)
      ? `${u.first_name} ${u.last_name}`
      : (u.first_name || u.username || node.name || 'Ami');

  const bio = u.bio || 'Aucune bio renseignée pour le moment.';

  alert(`👤 ${fullName}\n\n${bio}`);
}

function animateSupernova(x, y, color) {
  let frame = 0;
  function draw() {
    if (frame > 22) return;
    ctx.save();
    ctx.globalAlpha = 0.18 - frame * 0.007;
    ctx.beginPath();
    ctx.arc(x, y, 18 + frame * 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 40 - frame * 1.5;
    ctx.fill();
    ctx.restore();
    frame++;
    requestAnimationFrame(draw);
  }
  draw();
}

// ========================================
// ANIMATION LOOP
// ========================================

function animate() {
  ctx.fillStyle = 'rgba(7, 10, 22, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  updatePhysics();
  drawConnections();
  drawNodes();

  animationId = requestAnimationFrame(animate);
}

// ========================================
// INIT
// ========================================

fetchConstellation();
