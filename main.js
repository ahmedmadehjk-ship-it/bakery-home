// ========== Navbar Scroll Effect ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ========== Burger Menu ==========
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ========== Category Filter ==========
const tabBtns = document.querySelectorAll('.tab-btn');
const productCards = document.querySelectorAll('.product-card');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.category;
    productCards.forEach(card => {
      if (cat === 'all' || card.dataset.category === cat) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ========== Product Modal ==========
function openModal(title, imgSrc, desc) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalImg').src = imgSrc;
  document.getElementById('modalImg').alt = title;
  document.getElementById('modalDesc').textContent = desc;
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ========== Scroll Reveal ==========
const revealEls = document.querySelectorAll(
  '.product-card, .contact-card, .feature-item, .stat-item, .about-image, .about-content'
);
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

// ========== إرسال الطلب للسيرفر المحلي ==========
async function handleContactSubmit(e) {
  e.preventDefault();
  const btn        = document.getElementById('submitBtn');
  const successBox = document.getElementById('formSuccess');
  const errorBox   = document.getElementById('formError');

  const name    = document.getElementById('f-name').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const product = document.getElementById('f-product').value;
  const message = document.getElementById('f-message').value.trim();

  btn.textContent = '⏳ جاري الإرسال...';
  btn.disabled = true;
  successBox.style.display = 'none';
  errorBox.style.display   = 'none';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, product, message })
    });

    if (res.ok) {
      btn.textContent = '✅ تم إرسال طلبك!';
      successBox.style.display = 'block';
      e.target.reset();
      setTimeout(() => {
        btn.textContent = 'إرسال الطلب 🚀';
        btn.disabled = false;
        successBox.style.display = 'none';
      }, 5000);
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    errorBox.textContent = '❌ حصل خطأ، تأكد إن السيرفر شغال وحاول تاني.';
    errorBox.style.display = 'block';
    btn.textContent = 'إرسال الطلب 🚀';
    btn.disabled = false;
  }
}
