const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let w = canvas.width = innerWidth;
let h = canvas.height = innerHeight;
const stars = Array.from({ length: 120 }, () => ({
  x: Math.random() * w,
  y: Math.random() * h,
  z: Math.random() * 1.5 + 0.2,
}));

let mx = 0;
let my = 0;
addEventListener('mousemove', (e) => {
  mx = (e.clientX / w - 0.5) * 8;
  my = (e.clientY / h - 0.5) * 8;
});

function draw() {
  ctx.clearRect(0, 0, w, h);
  for (const s of stars) {
    s.y += s.z * 0.55;
    if (s.y > h + 3) s.y = -3;
    const px = s.x + mx;
    const py = s.y + my;
    ctx.fillStyle = 'rgba(170,210,255,0.85)';
    ctx.beginPath();
    ctx.arc(px, py, s.z, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(draw);
}
draw();

addEventListener('resize', () => {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const output = document.getElementById('skill-output');
document.querySelectorAll('.planet').forEach(btn => {
  btn.addEventListener('mouseenter', () => output.textContent = btn.dataset.copy);
  btn.addEventListener('focus', () => output.textContent = btn.dataset.copy);
});
