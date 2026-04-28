import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

const loader = document.getElementById('loader');
const loaderName = document.getElementById('loader-name');
const fullName = 'MD SAKIB';
let idx = 0;
const typer = setInterval(() => {
  loaderName.textContent = fullName.slice(0, idx++);
  if (idx > fullName.length) clearInterval(typer);
}, 120);
setTimeout(() => loader.classList.add('done'), 2500);

// Three.js CGI guide (procedural robotic avatar)
const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.15, 5.8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

scene.add(new THREE.AmbientLight(0x9ebeff, 0.58));
const keyLight = new THREE.DirectionalLight(0x83dfff, 1.2);
keyLight.position.set(2.8, 4, 4);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xaa7dff, 0.7);
rimLight.position.set(-3, 2.5, -2.5);
scene.add(rimLight);

const avatar = new THREE.Group();
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0x95e8ff, roughness: 0.2, metalness: 0.55, transmission: 0.15, transparent: true, opacity: 0.95
});
const darkMat = new THREE.MeshStandardMaterial({ color: 0x10182f, roughness: 0.45, metalness: 0.7 });
const eyeMat = new THREE.MeshBasicMaterial({ color: 0x9df3ff });

const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.2, 6, 18), darkMat);
torso.position.y = -0.3;
avatar.add(torso);

const headPivot = new THREE.Group();
headPivot.position.y = 1.1;
const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 30, 30), glassMat);
headPivot.add(head);

const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 18, 18), eyeMat);
const eyeR = eyeL.clone();
eyeL.position.set(-0.14, 0.03, 0.39);
eyeR.position.set(0.14, 0.03, 0.39);
headPivot.add(eyeL, eyeR);

const shoulderBar = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 0.18), darkMat);
shoulderBar.position.y = 0.37;
avatar.add(shoulderBar);

const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.6, 4, 10), darkMat);
armL.position.set(-0.9, 0.0, 0.0);
armL.rotation.z = 0.35;
const armR = armL.clone();
armR.position.x = 0.9;
armR.rotation.z = -0.35;
avatar.add(armL, armR, headPivot);
scene.add(avatar);

// environment particles
const starCount = 240;
const starGeo = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 22;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x8fd6ff, size: 0.03 }));
scene.add(stars);

const pointer = { x: 0, y: 0 };
const capturePointer = (x, y) => {
  pointer.x = (x / innerWidth - 0.5) * 2;
  pointer.y = (y / innerHeight - 0.5) * 2;
};
addEventListener('mousemove', (e) => capturePointer(e.clientX, e.clientY));
addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (t) capturePointer(t.clientX, t.clientY);
}, { passive: true });

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  avatar.position.y = Math.sin(t * 1.2) * 0.07;
  headPivot.rotation.y += (pointer.x * 0.6 - headPivot.rotation.y) * 0.08;
  headPivot.rotation.x += (-pointer.y * 0.38 - headPivot.rotation.x) * 0.08;
  eyeL.position.x = -0.14 + pointer.x * 0.03;
  eyeR.position.x = 0.14 + pointer.x * 0.03;
  eyeL.position.y = 0.03 - pointer.y * 0.03;
  eyeR.position.y = 0.03 - pointer.y * 0.03;
  armL.rotation.z = 0.35 + Math.sin(t * 1.4) * 0.08;
  armR.rotation.z = -0.35 - Math.sin(t * 1.4) * 0.08;
  camera.position.x += (pointer.x * 0.35 - camera.position.x) * 0.05;
  camera.position.y += (1.15 - pointer.y * 0.2 - camera.position.y) * 0.05;
  camera.lookAt(0, 0.8, 0);
  stars.rotation.y += 0.0009;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// reveal + ui interactions
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible'));
}, { threshold: 0.16 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const skillOutput = document.getElementById('skillOutput');
document.querySelectorAll('.planet').forEach((planet) => {
  const update = () => { skillOutput.textContent = planet.dataset.proof; };
  planet.addEventListener('mouseenter', update);
  planet.addEventListener('focus', update);
  planet.addEventListener('touchstart', update, { passive: true });
});

document.querySelectorAll('.proj-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.proj-tab').forEach((b) => b.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.target;
    document.querySelectorAll('.case').forEach((c) => c.classList.remove('visible'));
    document.getElementById(target).classList.add('visible');
  });
});

const nav = document.getElementById('nav');
document.getElementById('menuBtn').addEventListener('click', () => nav.classList.toggle('open'));

// magnetic buttons
for (const btn of document.querySelectorAll('.magnetic')) {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.14}px, ${y * 0.18}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
  });
}
