import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

const loader = document.getElementById('loader');
const loaderName = document.getElementById('loader-name');
const text = 'MD SAKIB';
let i = 0;
const typing = setInterval(() => {
  loaderName.textContent = text.slice(0, i++);
  if (i > text.length) clearInterval(typing);
}, 120);
setTimeout(() => loader.classList.add('done'), 2400);

const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.2, 6);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

scene.add(new THREE.AmbientLight(0x8fb5ff, 0.65));
const key = new THREE.DirectionalLight(0x7de3ff, 1.2); key.position.set(2.5, 4, 3.2); scene.add(key);
const rim = new THREE.DirectionalLight(0x7d6aff, 0.7); rim.position.set(-3, 2.3, -2.3); scene.add(rim);

const particleGeo = new THREE.BufferGeometry();
const count = 320;
const pts = new Float32Array(count * 3);
for (let p = 0; p < count; p++) {
  pts[p * 3] = (Math.random() - .5) * 24;
  pts[p * 3 + 1] = (Math.random() - .5) * 12;
  pts[p * 3 + 2] = (Math.random() - .5) * 20;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ size: .028, color: 0x95d7ff }));
scene.add(particles);

const characterRoot = new THREE.Group();
scene.add(characterRoot);
let characterMesh;
let eyeGlow;

const modes = {
  neutral: { tilt: 0, scale: 1, y: .0, emissive: 0.45 },
  focus: { tilt: -.08, scale: 1.02, y: .04, emissive: 0.62 },
  curious: { tilt: .1, scale: 1.01, y: .05, emissive: 0.55 },
  confident: { tilt: -.04, scale: 1.05, y: .02, emissive: 0.75 },
};
let activeMode = 'neutral';

function fallbackRobot() {
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x97e6ff, transmission: .16, roughness: .2, metalness: .5 });
  characterMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2.2, 6, 18), mat);
  characterMesh.position.y = .15;
  eyeGlow = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), new THREE.MeshBasicMaterial({ color: 0x9ef4ff }));
  eyeGlow.position.set(0, 1.05, 0.62);
  characterRoot.add(characterMesh, eyeGlow);
}

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function whiteToAlpha(img) {
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height);
  const arr = d.data;
  for (let n = 0; n < arr.length; n += 4) {
    const r = arr[n], g = arr[n + 1], b = arr[n + 2];
    const isWhite = r > 240 && g > 240 && b > 240;
    if (isWhite) arr[n + 3] = 0;
    else if (r > 210 && g > 210 && b > 210) arr[n + 3] = Math.max(0, arr[n + 3] - 120);
  }
  x.putImageData(d, 0, 0);
  return c;
}

async function buildCharacterFromSheet() {
  try {
    const sheet = await loadImage('assets/character/explorer-sheet.png');
    const cut = whiteToAlpha(sheet);
    const tex = new THREE.CanvasTexture(cut);
    tex.anisotropy = 4;
    const ratio = cut.width / cut.height;
    const plane = new THREE.PlaneGeometry(3.3 * ratio, 3.3);
    characterMesh = new THREE.Mesh(plane, new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .9, metalness: .05 }));
    characterMesh.position.set(0, .45, 0);
    eyeGlow = new THREE.Mesh(new THREE.CircleGeometry(.12, 24), new THREE.MeshBasicMaterial({ color: 0x9df6ff, transparent: true, opacity: .45 }));
    eyeGlow.position.set(0, 1.0, .02);
    characterRoot.add(characterMesh, eyeGlow);
  } catch {
    fallbackRobot();
  }
}
await buildCharacterFromSheet();

const pointer = { x: 0, y: 0 };
const capture = (x, y) => {
  pointer.x = (x / innerWidth - .5) * 2;
  pointer.y = (y / innerHeight - .5) * 2;
};
addEventListener('mousemove', (e) => capture(e.clientX, e.clientY));
addEventListener('touchmove', (e) => {
  if (e.touches[0]) capture(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

for (const btn of document.querySelectorAll('.expr-btn')) {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.expr-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeMode = btn.dataset.mode;
  });
}

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  const mode = modes[activeMode];
  characterRoot.position.y = Math.sin(t * 1.2) * 0.05 + mode.y;
  characterRoot.rotation.y += (pointer.x * 0.22 + mode.tilt - characterRoot.rotation.y) * 0.08;
  characterRoot.rotation.x += (-pointer.y * 0.12 - characterRoot.rotation.x) * 0.08;
  if (characterMesh) characterMesh.scale.lerp(new THREE.Vector3(mode.scale, mode.scale, 1), 0.08);
  if (eyeGlow) {
    eyeGlow.position.x += (pointer.x * 0.35 - eyeGlow.position.x) * 0.12;
    eyeGlow.material.opacity = 0.28 + Math.abs(Math.sin(t * 2.1)) * 0.2 + mode.emissive * 0.15;
  }
  camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.05;
  camera.position.y += (1.2 - pointer.y * 0.22 - camera.position.y) * 0.05;
  camera.lookAt(0, 0.9, 0);
  particles.rotation.y += 0.0008;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const reveal = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')), { threshold: .14 });
document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

const skillOutput = document.getElementById('skillOutput');
document.querySelectorAll('.planet').forEach((planet) => {
  const update = () => skillOutput.textContent = planet.dataset.proof;
  planet.addEventListener('mouseenter', update);
  planet.addEventListener('focus', update);
  planet.addEventListener('touchstart', update, { passive: true });
});

document.querySelectorAll('.proj-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.proj-tab').forEach((b) => b.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.case').forEach((c) => c.classList.remove('visible'));
    document.getElementById(tab.dataset.target).classList.add('visible');
  });
});

const nav = document.getElementById('nav');
document.getElementById('menuBtn').addEventListener('click', () => nav.classList.toggle('open'));
for (const btn of document.querySelectorAll('.magnetic')) {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * .13}px, ${y * .16}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
}
