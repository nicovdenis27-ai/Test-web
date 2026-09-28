/* ============================================================
   SCRIPT
   ============================================================ */

/* ---- NAVIGARE ---- */
function showPage(id) {
  window.location.href = id + '.html';
}

/* ---- PAGE LOADER ---- */
function initLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;
  if (sessionStorage.getItem('loaderShown') || localStorage.getItem('loaderShown')) {
    loader.classList.add('loaded');
    loader.style.display = 'none';
    return;
  }
  setTimeout(() => loader.classList.add('loaded'), 2000);
  localStorage.setItem('loaderShown', 'true');
  sessionStorage.setItem('loaderShown', 'true');
}

/* ---- SCROLL PROGRESS BAR ---- */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, { passive: true });
}

/* ---- BACK TO TOP ---- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---- HEADER SCROLL SHRINK ---- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
}

/* ---- ACTIVE NAV LINK ---- */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop().replace('.html', '') || 'acasa';
  const btn = document.getElementById('nav-' + path);
  if (btn) {
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

/* ============================================================
   CANVAS PARTICLES — hero acasă
   ============================================================ */
function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  container.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;display:block;';
  container.appendChild(canvas);

  const ctx  = canvas.getContext('2d');
  const hero = container.closest('.hero') || container.parentElement;

  let W, H;
  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildGrid(); }, { passive: true });

  const mouse = { x: -9999, y: -9999, active: false, vx: 0, vy: 0, px: 0, py: 0 };

  hero.addEventListener('mousemove', e => {
    const r  = canvas.getBoundingClientRect();
    mouse.px = mouse.x; mouse.py = mouse.y;
    mouse.x  = e.clientX - r.left;
    mouse.y  = e.clientY - r.top;
    mouse.vx = mouse.x - mouse.px;
    mouse.vy = mouse.y - mouse.py;
    mouse.active = true;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mouse.active = false; });
  hero.addEventListener('touchmove', e => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    mouse.x  = t.clientX - r.left;
    mouse.y  = t.clientY - r.top;
    mouse.active = true;
  }, { passive: true });
  hero.addEventListener('touchend', () => { mouse.active = false; });

  const PAL = [
    { r:255, g:193, b:7   },
    { r:255, g:193, b:7   },
    { r:255, g:220, b:80  },
    { r:211, g:47,  b:47  },
    { r:255, g:255, b:255 },
  ];

  let particles = [];

  function buildGrid() {
    particles = [];
    const cols = Math.max(5, Math.floor(W / 88));
    const rows = Math.max(4, Math.floor(H / 88));
    const cx   = W / (cols + 1);
    const cy   = H / (rows + 1);

    for (let c = 1; c <= cols; c++) {
      for (let r = 1; r <= rows; r++) {
        particles.push(new Particle(
          c * cx + (Math.random() - 0.5) * 36,
          r * cy + (Math.random() - 0.5) * 36
        ));
      }
    }
    const extra = Math.floor((W * H) / 13000);
    for (let i = 0; i < extra; i++) {
      particles.push(new Particle(Math.random() * W, Math.random() * H));
    }
  }

  class Particle {
    constructor(ox, oy) {
      const c    = PAL[Math.floor(Math.random() * PAL.length)];
      this.r  = c.r; this.g = c.g; this.b = c.b;
      this.ox = ox; this.oy = oy;
      this.x  = ox + (Math.random() - 0.5) * 50;
      this.y  = oy + (Math.random() - 0.5) * 50;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
      this.size  = 1.4 + Math.random() * 2.8;
      this.mass  = this.size * 1.1;
      this.alpha = 0.5 + Math.random() * 0.5;
      this.drift      = Math.random() * Math.PI * 2;
      this.driftSpeed = 0.003 + Math.random() * 0.006;
      this.driftAmp   = 0.12 + Math.random() * 0.22;
      this.trail    = [];
      this.trailMax = 6 + Math.floor(Math.random() * 10);
      this.pulse      = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.035 + Math.random() * 0.04;
    }

    update() {
      this.drift += this.driftSpeed;
      this.pulse += this.pulseSpeed;
      this.vx += Math.cos(this.drift) * this.driftAmp;
      this.vy += Math.sin(this.drift * 1.3) * this.driftAmp;
      this.vx += (this.ox - this.x) * 0.007;
      this.vy += (this.oy - this.y) * 0.007;
      if (mouse.active) {
        const dx   = mouse.x - this.x;
        const dy   = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const R    = 170;
        if (dist < R) {
          const t     = 1 - dist / R;
          const force = t * t * 5;
          this.vx += (dx / dist) * force / this.mass;
          this.vy += (dy / dist) * force / this.mass;
          this.vx += -mouse.vy * 0.025 * t;
          this.vy +=  mouse.vx * 0.025 * t;
        }
      }
      this.vx *= 0.88; this.vy *= 0.88;
      const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (spd > 6) { this.vx = (this.vx / spd) * 6; this.vy = (this.vy / spd) * 6; }
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailMax) this.trail.shift();
      this.x += this.vx;
      this.y += this.vy;
    }

    draw() {
      const pf = 0.85 + 0.15 * Math.sin(this.pulse);
      if (this.trail.length > 2) {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          const t0 = this.trail[i - 1], t1 = this.trail[i];
          ctx.quadraticCurveTo(t0.x, t0.y, (t0.x + t1.x) / 2, (t0.y + t1.y) / 2);
        }
        ctx.lineTo(this.x, this.y);
        const tg = ctx.createLinearGradient(this.trail[0].x, this.trail[0].y, this.x, this.y);
        tg.addColorStop(0, `rgba(${this.r},${this.g},${this.b},0)`);
        tg.addColorStop(1, `rgba(${this.r},${this.g},${this.b},${this.alpha * 0.3})`);
        ctx.strokeStyle = tg;
        ctx.lineWidth   = this.size * 0.5;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.stroke();
      }
      const gr = this.size * 3.5 * pf;
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, gr);
      glow.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${this.alpha * 0.38 * pf})`);
      glow.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, gr, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * pf, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
      ctx.fill();
      if (this.size > 2.2) {
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.28, this.y - this.size * 0.28, this.size * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.alpha * 0.45})`;
        ctx.fill();
      }
    }
  }

  const crosses = Array.from({ length: 14 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    size: 3 + Math.random() * 7,
    alpha: 0.05 + Math.random() * 0.14,
    phase: Math.random() * Math.PI * 2,
    speed: 0.004 + Math.random() * 0.007,
  }));

  function drawCross(c) {
    c.phase += c.speed;
    const a = c.alpha * (0.55 + 0.45 * Math.sin(c.phase));
    const s = c.size;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(255,193,7,1)';
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(c.x - s, c.y); ctx.lineTo(c.x + s, c.y);
    ctx.moveTo(c.x, c.y - s); ctx.lineTo(c.x, c.y + s);
    ctx.stroke();
    const d = s * 0.5;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(c.x - d, c.y - d); ctx.lineTo(c.x + d, c.y + d);
    ctx.moveTo(c.x + d, c.y - d); ctx.lineTo(c.x - d, c.y + d);
    ctx.stroke();
    ctx.restore();
  }

  const CONN_R  = 100;
  const MOUSE_R = 195;

  function drawConnections() {
    const n = particles.length;
    for (let i = 0; i < n; i++) {
      const a = particles[i];
      for (let j = i + 1; j < n; j++) {
        const b  = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > CONN_R * CONN_R) continue;
        const t = 1 - Math.sqrt(d2) / CONN_R;
        let color;
        if (mouse.active) {
          const ma = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          const mb = Math.hypot(b.x - mouse.x, b.y - mouse.y);
          const near = Math.min(ma, mb);
          if (near < MOUSE_R) {
            const gold = 1 - near / MOUSE_R;
            color = `rgba(${Math.round(255)},${Math.round(193 * gold + 255 * (1 - gold))},${Math.round(7 * gold)},${t * t * 0.55})`;
          } else {
            color = `rgba(255,255,255,${t * t * 0.07})`;
          }
        } else {
          color = `rgba(255,255,255,${t * t * 0.07})`;
        }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = color;
        ctx.lineWidth   = t * 0.9;
        ctx.stroke();
      }
      if (mouse.active) {
        const dx = a.x - mouse.x, dy = a.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_R * MOUSE_R) {
          const t    = 1 - Math.sqrt(d2) / MOUSE_R;
          const grad = ctx.createLinearGradient(a.x, a.y, mouse.x, mouse.y);
          grad.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${t * t * 0.65})`);
          grad.addColorStop(1, `rgba(255,193,7,${t * t * 0.9})`);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth   = t * 1.4;
          ctx.stroke();
        }
      }
    }
  }

  function drawCursor() {
    if (!mouse.active || mouse.x < 0) return;
    const now   = performance.now() / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(now * 3.5);
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 20 + pulse * 5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,193,7,${0.22 + pulse * 0.18})`;
    ctx.lineWidth   = 1;
    ctx.stroke();
    const cs = 10;
    ctx.beginPath();
    ctx.moveTo(mouse.x - cs, mouse.y); ctx.lineTo(mouse.x + cs, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - cs); ctx.lineTo(mouse.x, mouse.y + cs);
    ctx.strokeStyle = `rgba(255,193,7,${0.4 + pulse * 0.3})`;
    ctx.lineWidth   = 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,193,7,${0.8 + pulse * 0.2})`;
    ctx.fill();
  }

  buildGrid();

  let animating = true;

  function loop() {
    if (!animating) return;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    drawConnections();
    ctx.restore();
    crosses.forEach(drawCross);
    particles.forEach(p => { p.update(); p.draw(); });
    drawCursor();
    requestAnimationFrame(loop);
  }
  loop();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(en => {
      animating = en[0].isIntersecting;
      if (animating) loop();
    }, { threshold: 0.01 }).observe(hero);
  }
}

/* ============================================================
   SCROLL-DRIVEN ANIMATIONS
   ============================================================ */
const SCROLL_SELECTORS = [
  { sel: '.reveal',       from: { opacity: 0, y: 50,  x: 0,   scale: 1    } },
  { sel: '.reveal-l',     from: { opacity: 0, y: 0,   x: -60, scale: 1    } },
  { sel: '.reveal-r',     from: { opacity: 0, y: 0,   x: 60,  scale: 1    } },
  { sel: '.tl-item',      from: { opacity: 0, y: 0,   x: 0,   scale: 1    }, customX: true },
  { sel: '.contact-card', from: { opacity: 0, y: 30,  x: 0,   scale: 1    } },
  { sel: '.g-item',       from: { opacity: 0, y: 0,   x: 0,   scale: 0.88 } },
  { sel: '.person-card',  from: { opacity: 0, y: 40,  x: 0,   scale: 1    } },
  { sel: '.section-title',from: { opacity: 0, y: 30,  x: 0,   scale: 1    } },
  { sel: '.g-stat',       from: { opacity: 0, y: 30,  x: 0,   scale: 1    } },
  { sel: '.feature-card', from: { opacity: 0, y: 40,  x: 0,   scale: 1    } },
  { sel: '.event-card',   from: { opacity: 0, y: 40,  x: 0,   scale: 1    } },
  { sel: '.mini-card',    from: { opacity: 0, y: 30,  x: 0,   scale: 1    } },
  { sel: '.strip-stat',   from: { opacity: 0, y: 20,  x: 0,   scale: 1    } },
];

let scrollElements = [], scrollTimeout = null, rafId = null, isScrolling = false;

function lerp(a, b, t)  { return a + (b - a) * t; }
function easeInOut(t)   { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function applyState(el, data, progress) {
  const p  = Math.max(0, Math.min(1, progress));
  const ep = easeInOut(p);
  const fx = data.fromX !== undefined ? data.fromX : data.from.x;
  el.style.opacity   = lerp(data.from.opacity, 1, ep);
  el.style.transform = `translate(${lerp(fx,0,ep)}px,${lerp(data.from.y,0,ep)}px) scale(${lerp(data.from.scale,1,ep)})`;
  if (el.classList.contains('section-title')) el.classList.toggle('visible', p > 0.5);
}

function collectElements() {
  scrollElements = [];
  const page = document.querySelector('.page.active') || document;
  SCROLL_SELECTORS.forEach(({ sel, from, customX }) => {
    page.querySelectorAll(sel).forEach((el, idx) => {
      const sd = idx * 0.04;
      let fx = from.x;
      if (customX && sel === '.tl-item') fx = (idx % 2 === 0) ? -60 : 60;
      scrollElements.push({ el, from: { ...from }, fromX: fx, staggerDelay: sd, progress: 0, targetProgress: 0 });
      el.style.transition = 'none';
      el.style.opacity    = from.opacity;
      el.style.transform  = `translate(${fx}px,${from.y}px) scale(${from.scale})`;
    });
  });
}

/*анимация завершается в середине экрана (vh * 0.5) ---- */
function updateTargets() {
  const vh = window.innerHeight;
  scrollElements.forEach(data => {
    const rect = data.el.getBoundingClientRect();
    let p;
    if (rect.top > vh * 0.92) {
      p = 0;
    } else if (rect.bottom < vh * 0.1) {
      p = 1;
    } else {
      /* Начало: элемент появляется снизу (rect.top = vh*0.92)
         Конец:  элемент достигает середины экрана (rect.top = vh*0.5) */
      const range = vh * 0.92 - vh * 0.5;
      p = Math.max(0, Math.min(1, (vh * 0.92 - rect.top) / range));
    }
    p = Math.max(0, p - data.staggerDelay);
    p = Math.min(1, p * (1 + data.staggerDelay));
    data.targetProgress = p;
  });
}

function animateFrame() {
  scrollElements.forEach(data => {
    const speed = isScrolling ? 0.12 : 0.06;
    data.progress += (data.targetProgress - data.progress) * speed;
    if (Math.abs(data.progress - data.targetProgress) < 0.001) data.progress = data.targetProgress;
    applyState(data.el, data, data.progress);
  });
  rafId = requestAnimationFrame(animateFrame);
}

function onScroll() {
  isScrolling = true;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => { isScrolling = false; }, 150);
  updateTargets();
}

function initScrollAnimations() {
  collectElements(); updateTargets();
  scrollElements.forEach(d => { d.progress = d.targetProgress; applyState(d.el, d, d.progress); });
  window.addEventListener('scroll', onScroll, { passive: true });
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(animateFrame);
}

/* ---- RIPPLE ---- */
function addRipple(e) {
  const btn = e.currentTarget, rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const rpl  = document.createElement('span');
  rpl.className = 'ripple-effect';
  rpl.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;`;
  btn.appendChild(rpl);
  rpl.addEventListener('animationend', () => rpl.remove());
}

/* ---- GALLERY ---- */
function filterGallery(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.g-item').forEach(item => {
    item.style.display = (cat === 'toate' || item.dataset.category === cat) ? '' : 'none';
  });
  setTimeout(initScrollAnimations, 60);
}

/* ---- LIGHTBOX ---- */
let lbItems = [], lbIdx = 0;
function buildLbItems() { lbItems = Array.from(document.querySelectorAll('.g-item:not([style*="none"])')); }
document.addEventListener('click', e => {
  const item = e.target.closest('.g-item');
  if (!item || e.target.closest('.lightbox')) return;
  buildLbItems(); lbIdx = lbItems.indexOf(item); openLb(item);
});
function openLb(item) {
  const inner = item.querySelector('.g-inner');
  document.getElementById('lbDisplay').innerHTML = inner ? inner.innerHTML : '🖼️';
  document.getElementById('lbDisplay').className = 'lb-img-display ' + (inner ? inner.className.replace('g-inner','') : '');
  document.getElementById('lbTitle').textContent = item.dataset.title || '';
  document.getElementById('lbDesc').textContent  = item.dataset.desc  || '';
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); document.body.style.overflow = ''; }
function lbPrev() { buildLbItems(); lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; openLb(lbItems[lbIdx]); }
function lbNext() { buildLbItems(); lbIdx = (lbIdx + 1) % lbItems.length; openLb(lbItems[lbIdx]); }
document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('lightbox');
  if (lb) lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
});
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lbPrev();
  if (e.key === 'ArrowRight') lbNext();
});

/* ---- EPOCHS ---- */
function showEpoch(id, btn) {
  document.querySelectorAll('.epoch-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.epoch-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById('epoch-' + id);
  if (panel) panel.classList.add('active');
}

/* ---- FAQ ---- */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling, icon = btn.querySelector('.faq-icon');
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-icon').forEach(i => i.textContent = '+');
  if (!isOpen) { answer.classList.add('open'); icon.textContent = '−'; }
}

/* ---- FORM ---- */
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-submit');
  btn.textContent = '✅ Mesaj trimis cu succes!'; btn.style.background = '#27ae60';
  showToast('✅ Mesajul tău a fost trimis!');
  setTimeout(() => { btn.textContent = '📨 Trimite Mesajul'; btn.style.background = ''; e.target.reset(); }, 3500);
}

/* ---- TOAST ---- */
function showToast(msg, duration = 3000) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ---- COUNTERS ---- */
function animateCounter(el, target, duration = 1500) {
  const isF = target % 1 !== 0; let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = isF ? (e * target).toFixed(1) : Math.floor(e * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step); else el.textContent = el.dataset.target;
  };
  requestAnimationFrame(step);
}
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, num = parseFloat((el.dataset.target || el.textContent).replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0) animateCounter(el, num);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.strip-stat-num, .hero-stat-num').forEach(el => {
    el.dataset.target = el.textContent; obs.observe(el);
  });
}

/* ============================================================
   PAGE PARTICLES — câte un stil pentru fiecare pagină
   ============================================================ */
function createPageParticles(containerId, theme) {

  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;display:block;';
  container.style.position = 'relative';
  container.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const THEMES = {
    istorie: {
      palette: [
        [255, 193,   7],
        [255, 215,  80],
        [220, 160,  50],
        [255, 240, 160],
        [200, 140,  40],
        [255, 255, 210],
      ],
      count: 55, speed: 0.18, trailMax: 14, connRadius: 110,
      crossColor: 'rgba(255,193,7,1)', crossCount: 18, mouseR: 160, glow: 3.5,
      extras: 'crosses',
    },
    atractii: {
      palette: [
        [255, 193,   7],
        [255, 215,  80],
        [220, 160,  50],
        [255, 240, 160],
        [200, 140,  40],
        [255, 255, 210],
      ],
      count: 55, speed: 0.18, trailMax: 14, connRadius: 110,
      crossColor: 'rgba(255,193,7,1)', crossCount: 18, mouseR: 160, glow: 3.5,
      extras: 'crosses',
    },
    galerie: {
      palette: [
        [180,  80, 255],
        [255,  80, 200],
        [140,  60, 210],
        [220, 150, 255],
        [255, 255, 255],
        [200, 100, 240],
      ],
      count: 60, speed: 0.38, trailMax: 16, connRadius: 80,
      crossColor: 'rgba(200,100,255,1)', crossCount: 20, mouseR: 180, glow: 4.0,
      extras: 'rings',
    },
    contact: {
      palette: [
        [ 80, 160, 255],
        [100, 200, 255],
        [150, 220, 255],
        [200, 230, 255],
        [ 60, 120, 220],
        [180, 210, 255],
      ],
      count: 45, speed: 0.22, trailMax: 10, connRadius: 120,
      crossColor: 'rgba(100,180,255,1)', crossCount: 14, mouseR: 170, glow: 3.2,
      extras: 'grid',
    },
  };

  const T = THEMES[theme];
  if (!T) return;

  const mouse = { x: -9999, y: -9999, active: false, vx: 0, vy: 0, px: 0, py: 0 };
  const hero  = container;

  hero.addEventListener('mousemove', e => {
    const r  = canvas.getBoundingClientRect();
    mouse.px = mouse.x; mouse.py = mouse.y;
    mouse.x  = e.clientX - r.left;
    mouse.y  = e.clientY - r.top;
    mouse.vx = mouse.x - mouse.px;
    mouse.vy = mouse.y - mouse.py;
    mouse.active = true;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mouse.active = false; });
  hero.addEventListener('touchmove', e => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    mouse.x = t.clientX - r.left;
    mouse.y = t.clientY - r.top;
    mouse.active = true;
  }, { passive: true });
  hero.addEventListener('touchend', () => { mouse.active = false; });

  const particles = [];

  class Particle {
    constructor() {
      const c = T.palette[Math.floor(Math.random() * T.palette.length)];
      this.r = c[0]; this.g = c[1]; this.b = c[2];
      this.ox = Math.random() * W;
      this.oy = Math.random() * H;
      this.x  = this.ox;
      this.y  = this.oy;
      this.vx = (Math.random() - 0.5) * T.speed;
      this.vy = (Math.random() - 0.5) * T.speed;
      this.size  = 1.4 + Math.random() * 2.6;
      this.alpha = 0.45 + Math.random() * 0.55;
      this.drift      = Math.random() * Math.PI * 2;
      this.driftSpeed = 0.003 + Math.random() * 0.006;
      this.driftAmp   = 0.08  + Math.random() * 0.18;
      this.trail    = [];
      this.trailMax = T.trailMax;
      this.pulse    = Math.random() * Math.PI * 2;
      this.pulseSpd = 0.03  + Math.random() * 0.04;
      this.mass     = this.size * 1.1;
    }

    update() {
      this.drift += this.driftSpeed;
      this.pulse += this.pulseSpd;
      this.vx += Math.cos(this.drift) * this.driftAmp;
      this.vy += Math.sin(this.drift * 1.3) * this.driftAmp;
      this.vx += (this.ox - this.x) * 0.005;
      this.vy += (this.oy - this.y) * 0.005;
      if (mouse.active) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const d  = Math.hypot(dx, dy) || 1;
        const R  = T.mouseR;
        if (d < R) {
          const t = 1 - d / R;
          const f = t * t * 4.5;
          this.vx += (dx / d) * f / this.mass;
          this.vy += (dy / d) * f / this.mass;
          this.vx += -mouse.vy * 0.022 * t;
          this.vy +=  mouse.vx * 0.022 * t;
        }
      }
      this.vx *= 0.87; this.vy *= 0.87;
      const spd = Math.hypot(this.vx, this.vy);
      if (spd > 5) { this.vx = this.vx / spd * 5; this.vy = this.vy / spd * 5; }
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > this.trailMax) this.trail.shift();
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) { this.x = 0; this.vx *= -1; this.ox = Math.random() * W; }
      if (this.x > W) { this.x = W; this.vx *= -1; this.ox = Math.random() * W; }
      if (this.y < 0) { this.y = 0; this.vy *= -1; this.oy = Math.random() * H; }
      if (this.y > H) { this.y = H; this.vy *= -1; this.oy = Math.random() * H; }
    }

    draw() {
      const pf = 0.85 + 0.15 * Math.sin(this.pulse);
      if (this.trail.length > 2) {
        ctx.beginPath();
        ctx.moveTo(this.trail[0].x, this.trail[0].y);
        for (let i = 1; i < this.trail.length; i++) {
          const t0 = this.trail[i - 1], t1 = this.trail[i];
          ctx.quadraticCurveTo(t0.x, t0.y, (t0.x + t1.x) / 2, (t0.y + t1.y) / 2);
        }
        ctx.lineTo(this.x, this.y);
        const tg = ctx.createLinearGradient(this.trail[0].x, this.trail[0].y, this.x, this.y);
        tg.addColorStop(0, `rgba(${this.r},${this.g},${this.b},0)`);
        tg.addColorStop(1, `rgba(${this.r},${this.g},${this.b},${this.alpha * 0.28})`);
        ctx.strokeStyle = tg;
        ctx.lineWidth   = this.size * 0.45;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.stroke();
      }
      const gr   = this.size * T.glow * pf;
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, gr);
      glow.addColorStop(0, `rgba(${this.r},${this.g},${this.b},${this.alpha * 0.35 * pf})`);
      glow.addColorStop(1, `rgba(${this.r},${this.g},${this.b},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, gr, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * pf, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
      ctx.fill();
      if (this.size > 2.0) {
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.28, this.y - this.size * 0.28, this.size * 0.26, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.alpha * 0.4})`;
        ctx.fill();
      }
    }
  }

  for (let i = 0; i < T.count; i++) particles.push(new Particle());

  let extras = [];
  if (T.extras === 'crosses') {
    extras = Array.from({ length: T.crossCount }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: 3 + Math.random() * 8, alpha: 0.04 + Math.random() * 0.12,
      phase: Math.random() * Math.PI * 2, speed: 0.003 + Math.random() * 0.006,
    }));
  } else if (T.extras === 'dots') {
    extras = Array.from({ length: T.crossCount }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: 2 + Math.random() * 5, alpha: 0.04 + Math.random() * 0.1,
      phase: Math.random() * Math.PI * 2, speed: 0.008 + Math.random() * 0.01,
    }));
  } else if (T.extras === 'rings') {
    extras = Array.from({ length: T.crossCount }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: 6 + Math.random() * 16, alpha: 0.03 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2, speed: 0.015 + Math.random() * 0.02,
    }));
  } else if (T.extras === 'grid') {
    const cols = Math.floor(W / 80), rows = Math.floor(H / 80);
    const cx = W / (cols + 1), cy = H / (rows + 1);
    for (let c = 1; c <= cols; c++)
      for (let r = 1; r <= rows; r++)
        extras.push({ x: c * cx, y: r * cy, size: 2, alpha: 0.08,
          phase: Math.random() * Math.PI * 2, speed: 0.005 + Math.random() * 0.008 });
  }

  function drawExtras() {
    extras.forEach(e => {
      e.phase += e.speed;
      const a = e.alpha * (0.5 + 0.5 * Math.sin(e.phase));
      ctx.save();
      ctx.globalAlpha = a;
      if (T.extras === 'crosses') {
        ctx.strokeStyle = T.crossColor; ctx.lineCap = 'round'; ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(e.x - e.size, e.y); ctx.lineTo(e.x + e.size, e.y);
        ctx.moveTo(e.x, e.y - e.size); ctx.lineTo(e.x, e.y + e.size);
        ctx.stroke();
        const d = e.size * 0.45; ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.moveTo(e.x-d, e.y-d); ctx.lineTo(e.x+d, e.y+d);
        ctx.moveTo(e.x+d, e.y-d); ctx.lineTo(e.x-d, e.y+d);
        ctx.stroke();
      } else if (T.extras === 'dots') {
        ctx.fillStyle = T.crossColor;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * (0.7 + 0.3 * Math.sin(e.phase)), 0, Math.PI * 2);
        ctx.fill();
      } else if (T.extras === 'rings') {
        ctx.strokeStyle = T.crossColor; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 0.3;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.size * 0.5, 0, Math.PI * 2); ctx.stroke();
      } else if (T.extras === 'grid') {
        ctx.fillStyle = T.crossColor;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * (0.6 + 0.4 * Math.sin(e.phase)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawConnections() {
    const n = particles.length, CR = T.connRadius, MR = T.mouseR;
    for (let i = 0; i < n; i++) {
      const a = particles[i];
      for (let j = i + 1; j < n; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > CR * CR) continue;
        const t = 1 - Math.sqrt(d2) / CR;
        let color;
        if (mouse.active) {
          const nearA = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          const nearB = Math.hypot(b.x - mouse.x, b.y - mouse.y);
          if (Math.min(nearA, nearB) < MR) {
            const g = T.palette[0];
            color = `rgba(${g[0]},${g[1]},${g[2]},${t * t * 0.5})`;
          } else { color = `rgba(255,255,255,${t * t * 0.06})`; }
        } else { color = `rgba(255,255,255,${t * t * 0.06})`; }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = color; ctx.lineWidth = t * 0.8; ctx.stroke();
      }
      if (mouse.active) {
        const dx = a.x - mouse.x, dy = a.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MR * MR) {
          const t = 1 - Math.sqrt(d2) / MR;
          const g = ctx.createLinearGradient(a.x, a.y, mouse.x, mouse.y);
          const c = T.palette[0];
          g.addColorStop(0, `rgba(${a.r},${a.g},${a.b},${t * t * 0.6})`);
          g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},${t * t * 0.9})`);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = g; ctx.lineWidth = t * 1.3; ctx.stroke();
        }
      }
    }
  }

  function drawCursor() {
    if (!mouse.active || mouse.x < 0) return;
    const now = performance.now() / 1000;
    const pulse = 0.5 + 0.5 * Math.sin(now * 3.5);
    const c = T.palette[0];
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 18 + pulse * 5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.2 + pulse * 0.15})`;
    ctx.lineWidth = 1; ctx.stroke();
    const cs = 9;
    ctx.beginPath();
    ctx.moveTo(mouse.x - cs, mouse.y); ctx.lineTo(mouse.x + cs, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - cs); ctx.lineTo(mouse.x, mouse.y + cs);
    ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.38 + pulse * 0.3})`;
    ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.8 + pulse * 0.2})`; ctx.fill();
  }

  let animating = true;
  function loop() {
    if (!animating) return;
    ctx.clearRect(0, 0, W, H);
    drawExtras();
    ctx.save(); drawConnections(); ctx.restore();
    particles.forEach(p => { p.update(); p.draw(); });
    drawCursor();
    requestAnimationFrame(loop);
  }
  loop();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      animating = entries[0].isIntersecting;
      if (animating) loop();
    }, { threshold: 0.01 }).observe(hero);
  }
}

/* Apel automat pe baza paginii curente */
document.addEventListener('DOMContentLoaded', function() {
  const path   = window.location.pathname.split('/').pop().replace('.html', '');
  const heroEl = document.getElementById('pageHeroParticles');
  if (heroEl && path && path !== 'acasa') {
    createPageParticles('pageHeroParticles', path);
  }
});

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.scroll-progress')) {
    const b = document.createElement('div'); b.className = 'scroll-progress'; document.body.prepend(b);
  }
  if (!document.querySelector('.back-to-top')) {
    const btn = document.createElement('button');
    btn.className = 'back-to-top'; btn.innerHTML = '↑'; btn.title = 'Sus';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  }
  if (!document.querySelector('.page-loader')) {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `<div class="loader-logo">Or<span>hei</span></div><div class="loader-bar-wrap"><div class="loader-bar"></div></div>`;
    document.body.prepend(loader);
    if (!localStorage.getItem('loaderShown')) {
      setTimeout(() => loader.classList.add('loaded'), 1900);
      localStorage.setItem('loaderShown', 'true');
    } else { loader.classList.add('loaded'); loader.style.display = 'none'; }
  }

  initLoader();
  initScrollProgress();
  initBackToTop();
  initHeaderScroll();
  setActiveNav();
  initCounters();

  document.querySelectorAll('.btn-primary,.btn-secondary,.nav-cta,.btn-submit,.filter-btn')
    .forEach(btn => btn.addEventListener('click', addRipple));

  createParticles();

  setTimeout(initScrollAnimations, 300);
});

window.addEventListener('resize', () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(initScrollAnimations, 300);
});