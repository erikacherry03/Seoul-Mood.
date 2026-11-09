/* =====================================================
   CONFIGURACIÓN (edita aquí lo básico de tu tienda)
   ===================================================== */
const STORE_NAME = 'Seoul Mood';
const WHATSAPP_NUMBER = '573001234567'; // Indicativo + número, sin "+" ni espacios

/* =====================================================
   PRODUCTOS
   Para usar una foto real, agrega:  img: 'img/mi-foto.jpg'
   Si no hay "img", se muestra el emoji.
   ===================================================== */
const PRODUCTS = [
  { id: 1,  name: 'Sérum de Centella Asiática',   category: 'skincare',  price: 69900, emoji: '🧴', color: '#ffe3ec', tag: 'Más vendido', desc: 'Calma y repara la piel sensible.' },
  { id: 2,  name: 'Mascarillas de Hidrogel x5',   category: 'skincare',  price: 39900, emoji: '🌿', color: '#e6fbf3', tag: '',            desc: 'Hidratación profunda en 20 minutos.' },
  { id: 3,  name: 'Protector Solar SPF50+',       category: 'skincare',  price: 54900, emoji: '☀️', color: '#fff3c4', tag: 'Nuevo',       desc: 'Textura ligera, sin residuo blanco.' },
  { id: 4,  name: 'Tinte Labial Glossy',          category: 'skincare',  price: 32900, emoji: '💄', color: '#ffd6e4', tag: '',            desc: 'Color intenso con acabado brillante.' },
  { id: 5,  name: 'Ramen Picante Clásico x5',     category: 'snacks',    price: 28900, emoji: '🍜', color: '#ffe9a8', tag: 'Popular',     desc: 'El ramen coreano que todos aman.' },
  { id: 6,  name: 'Caja de Snacks Coreanos',      category: 'snacks',    price: 59900, emoji: '🍪', color: '#ffe0cc', tag: '',            desc: 'Selección de 10 snacks dulces y salados.' },
  { id: 7,  name: 'Té de Yuzu Miel',              category: 'snacks',    price: 24900, emoji: '🍯', color: '#fff3c4', tag: '',            desc: 'Bebida cítrica y reconfortante.' },
  { id: 8,  name: 'Light Stick Oficial',          category: 'kpop',      price: 129900, emoji: '💜', color: '#efe9ff', tag: 'Edición limitada', desc: 'Para tu próximo concierto o fancam.' },
  { id: 9,  name: 'Álbum Edición Especial',       category: 'kpop',      price: 89900, emoji: '💿', color: '#e3dcff', tag: '',            desc: 'Incluye photocards y póster.' },
  { id: 10, name: 'Set de Photocards x20',        category: 'kpop',      price: 19900, emoji: '🃏', color: '#ffd6f0', tag: '',            desc: 'Colecciona tus favoritos.' },
  { id: 11, name: 'Cuaderno Kawaii Pastel',       category: 'papeleria', price: 17900, emoji: '📓', color: '#e6fbf3', tag: '',            desc: 'Tapa dura y hojas punteadas.' },
  { id: 12, name: 'Set de Stickers y Washi Tape', category: 'papeleria', price: 22900, emoji: '🎀', color: '#ffe3ec', tag: 'Nuevo',       desc: 'Decora tu agenda con estilo.' }
];

const CATEGORY_NAMES = {
  skincare: 'Skincare',
  snacks: 'Snacks y Ramen',
  kpop: 'K-pop',
  papeleria: 'Papelería'
};

/* =====================================================
   ESTADO
   ===================================================== */
let cart = loadCart();
let activeFilter = 'todos';
let searchTerm = '';

/* =====================================================
   ELEMENTOS
   ===================================================== */
const $ = (id) => document.getElementById(id);
const grid = $('productGrid');
const emptyMsg = $('emptyMsg');
const cartPanel = $('cart');
const overlay = $('overlay');

/* =====================================================
   UTILIDADES
   ===================================================== */
const money = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

function loadCart() {
  try { return JSON.parse(localStorage.getItem('seoulmood_cart')) || []; }
  catch { return []; }
}
function saveCart() {
  try { localStorage.setItem('seoulmood_cart', JSON.stringify(cart)); } catch {}
}
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 1800);
}
function mediaHTML(p) {
  return p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : p.emoji;
}

/* =====================================================
   PRODUCTOS: render, filtro y búsqueda
   ===================================================== */
function renderProducts() {
  const term = searchTerm.trim().toLowerCase();
  const list = PRODUCTS.filter((p) =>
    (activeFilter === 'todos' || p.category === activeFilter) &&
    (!term || p.name.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term))
  );

  grid.innerHTML = list.map((p) => `
    <article class="card">
      <div class="card__img" style="background:${p.color}">
        ${mediaHTML(p)}
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ''}
      </div>
      <div class="card__body">
        <span class="card__cat">${CATEGORY_NAMES[p.category]}</span>
        <h3 class="card__name">${p.name}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__foot">
          <span class="card__price">${money(p.price)}</span>
          <button class="add-btn" data-add="${p.id}">Agregar +</button>
        </div>
      </div>
    </article>
  `).join('');

  emptyMsg.hidden = list.length > 0;
}

function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.chip').forEach((c) =>
    c.classList.toggle('active', c.dataset.filter === filter)
  );
  renderProducts();
}

/* =====================================================
   CARRITO
   ===================================================== */
function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  const p = PRODUCTS.find((x) => x.id === id);
  toast(`${p.name} agregado 🛒`);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}

function renderCart() {
  const container = $('cartItems');
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $('cartCount').textContent = count;
  $('cartTotal').textContent = money(cartTotal());

  if (!cart.length) {
    container.innerHTML = '<p class="cart__empty">Tu carrito está vacío 🌸<br>¡Agrega algo lindo!</p>';
    return;
  }

  container.innerHTML = cart.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    if (!p) return '';
    return `
      <div class="cart-item">
        <div class="cart-item__icon" style="background:${p.color}">${mediaHTML(p)}</div>
        <div>
          <div class="cart-item__name">${p.name}</div>
          <div class="cart-item__price">${money(p.price)}</div>
          <div class="qty">
            <button data-minus="${p.id}" aria-label="Quitar uno">−</button>
            <span>${i.qty}</span>
            <button data-plus="${p.id}" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <button class="remove" data-remove="${p.id}" aria-label="Eliminar">🗑️</button>
      </div>`;
  }).join('');
}

function openCart() { cartPanel.classList.add('open'); overlay.classList.add('show'); }
function closeCart() { cartPanel.classList.remove('open'); overlay.classList.remove('show'); }

/* =====================================================
   WHATSAPP
   ===================================================== */
function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function checkout() {
  if (!cart.length) { toast('Tu carrito está vacío'); return; }
  let msg = `¡Hola ${STORE_NAME}! 🌸 Quiero hacer este pedido:\n\n`;
  cart.forEach((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    if (p) msg += `• ${i.qty} x ${p.name} — ${money(p.price * i.qty)}\n`;
  });
  msg += `\n*Total: ${money(cartTotal())}*\n\nMis datos de envío:\nNombre:\nCiudad:\nDirección:`;
  window.open(waLink(msg), '_blank', 'noopener');
}

/* =====================================================
   EVENTOS
   ===================================================== */
// Agregar al carrito
grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add]');
  if (btn) addToCart(Number(btn.dataset.add));
});

// Controles dentro del carrito
$('cartItems').addEventListener('click', (e) => {
  const plus = e.target.closest('[data-plus]');
  const minus = e.target.closest('[data-minus]');
  const remove = e.target.closest('[data-remove]');
  if (plus) changeQty(Number(plus.dataset.plus), 1);
  if (minus) changeQty(Number(minus.dataset.minus), -1);
  if (remove) removeFromCart(Number(remove.dataset.remove));
});

// Filtros
$('filters').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (chip) setFilter(chip.dataset.filter);
});

// Tarjetas de categoría: filtran y bajan a productos
document.querySelectorAll('.cat-card').forEach((card) =>
  card.addEventListener('click', () => {
    setFilter(card.dataset.cat);
    $('productos').scrollIntoView({ behavior: 'smooth' });
  })
);

// Buscador
$('search').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  renderProducts();
});

// Carrito
$('cartOpen').addEventListener('click', openCart);
$('cartClose').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
$('checkoutBtn').addEventListener('click', checkout);
$('clearCart').addEventListener('click', () => { cart = []; saveCart(); renderCart(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

// Menú móvil
const nav = $('nav');
$('menuBtn').addEventListener('click', () => nav.classList.toggle('open'));
nav.addEventListener('click', (e) => { if (e.target.tagName === 'A') nav.classList.remove('open'); });

/* =====================================================
   INICIO
   ===================================================== */
$('year').textContent = new Date().getFullYear();
$('waFloat').href = waLink(`¡Hola ${STORE_NAME}! 🌸 Quisiera más información.`);
$('footerWa').href = waLink(`¡Hola ${STORE_NAME}! 🌸`);
renderProducts();
renderCart();
