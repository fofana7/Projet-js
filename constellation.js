// ========================================
// CONSTELLATION.JS - Friends Star Map
// Interactive visualization of your friends network
// ========================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const popup = document.getElementById('popup');

let friends = [];
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
// FETCH FRIENDS FROM API
// ========================================

async function fetchFriends() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found. Redirecting to login...');
      window.location.href = 'login.html';
      return;
    }

    const response = await fetch('http://localhost:3000/api/ami', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    friends = Array.isArray(data) ? data : [];
    
    console.log(`✓ Loaded ${friends.length} friends`);
    initializeConstellation();
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    friends = [];
    initializeConstellation();
  }
}

// ========================================
// CREATE CONSTELLATION NODES
// ========================================

function initializeConstellation() {
  nodes = [];
  
  // User is at center
  nodes.push({
    id: 'user',
    name: 'You',
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    size: 8,
    color: '#ffd700',
    isUser: true,
    data: null
  });

  // Position friends in orbital pattern
  const count = friends.length;
  const baseRadius = Math.min(canvas.width, canvas.height) / 3;
  
  friends.forEach((friend, index) => {
    const angle = (index / count) * Math.PI * 2 + Math.random() * 0.3;
    const distance = baseRadius + Math.random() * 100;
    
    const node = {
      id: friend.id || index,
      name: friend.username || `Friend ${index + 1}`,
      x: canvas.width / 2 + Math.cos(angle) * distance,
      y: canvas.height / 2 + Math.sin(angle) * distance,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: 5,
      color: generateColorFromName(friend.username || `Friend ${index + 1}`),
      isUser: false,
      data: friend,
      angle: angle,
      distance: distance
    };
    
    nodes.push(node);
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
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.2)';
  ctx.lineWidth = 0.8;

  const userNode = nodes[0];
  
  nodes.forEach((node, i) => {
    if (i === 0) return; // Skip user

    ctx.beginPath();
    ctx.moveTo(userNode.x, userNode.y);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();

    // Draw connections between friends (optional - creates web)
    if (Math.random() < 0.05) { // 5% chance per pair
      nodes.forEach((other, j) => {
        if (j <= i) return;
        
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        if (distance < 150) {
          ctx.strokeStyle = `rgba(147, 197, 253, ${0.1 * (1 - distance / 150)})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      });
    }
  });
}

function drawNodes() {
  nodes.forEach((node) => {
    // Draw glow
    const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 3);
    glowGradient.addColorStop(0, node.color + '40');
    glowGradient.addColorStop(1, node.color + '00');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw node
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
    ctx.fill();

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
  popup.textContent = node.name;
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
    if (distance < node.size + 15 && !node.isUser && node.data) {
      // Open user profile or friend details
      console.log('Clicked friend:', node.data);
      // You can add profile modal or navigate to friend profile here
      alert(`👤 ${node.data.username}\nID: ${node.data.id}`);
    }
  });
});

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

fetchFriends();
