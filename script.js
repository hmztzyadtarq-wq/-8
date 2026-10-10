/* script.js — كود الموقع كله: الرئيسية، الأقسام، المنتج، السلة والطلب، تتبع الطلب، الدخول، الترجمة */

/* ======== 1) أدوات عامة ======== */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
const enc = encodeURIComponent;
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { localStorage.setItem(k, JSON.stringify(v)); } };
let toastT;
function toast(m) {                                   // رسالة صغيرة تحت الشاشة
  const t = $('#toast'); t.textContent = lang === 'en' ? T(m) : m; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2300);
}

/* ======== 2) الأيقونات (SVG) ======== */
const ic = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I = {
  cookie: ic('<path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4.5-4.5A4 4 0 0 1 12 3z"/><circle cx="9" cy="10" r=".9"/><circle cx="14" cy="14.5" r=".9"/><circle cx="8.5" cy="15" r=".9"/><circle cx="14.5" cy="9.5" r=".9"/>'),
  cake: ic('<path d="M3 20h18v-7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zM3 15.5c3 2 6-2 9 0s6-2 9 0M12 11V7.5M12 3c1.2 1.2 1.2 2.4 0 3.2-1.2-.8-1.2-2 0-3.2z"/>'),
  gift: ic('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8C10 4 6 5 7 8c.6 1.5 3 1 5 0zM12 8c2-4 6-3 5 0-.6 1.5-3 1-5 0z"/>'),
  bread: ic('<rect x="4" y="5" width="16" height="15" rx="5"/>'),
  candy: ic('<rect x="6" y="9" width="12" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M4 8l3 1M20 16l-3-1"/>'),
  moon: ic('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 3v4M15 5h4"/>'),
  ice: ic('<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M12 15v6M8 7h8M8 10h8"/>'),
  pct: ic('<path d="M12 2l2.4 2 3.1-.2.9 3 2.7 1.6-1 3 1 3-2.7 1.6-.9 3-3.1-.2L12 22l-2.4-2-3.1.2-.9-3L3.1 15.6l1-3-1-3 2.7-1.6.9-3 3.1.2z"/><path d="M9 15l6-6"/><circle cx="9.5" cy="9.5" r=".9"/><circle cx="14.5" cy="14.5" r=".9"/>'),
  cartp: ic('<path d="M3 4h2l2.5 11h10l2-8H7"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/><path d="M12 8v4M10 10h4"/>'),
  basket: ic('<path d="M3 9h18l-2 11H5zM8 9l3-6M16 9l-3-6"/><circle cx="12" cy="14.5" r="2"/>'),
  user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  pin: ic('<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  globe: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>'),
  search: ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  heart: ic('<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>'),
  trash: ic('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>'),
  phone: ic('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
  truck: ic('<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
  card: ic('<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20M6 15h4"/>'),
  shield: ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  store: ic('<path d="M3 9l2-5h14l2 5M4 9v11h16V9M9 20v-6h6v6"/>'),
  wallet: ic('<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M16 13h2M3 10h18M6 6l9-3 1 3"/>'),
  eye: ic('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  crown: ic('<path d="M4 18h16M4 18L3 8l5 4 4-7 4 7 5-4-1 10z"/>'),
  fb: ic('<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>'),
  ig: ic('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>'),
  tt: ic('<path d="M14 3v11a4 4 0 1 1-4-4M14 3c0 3 2 5 5 5"/>'),
  wa: ic('<path d="M3 21l1.5-5A9 9 0 1 1 8 19.5z"/><path d="M9 9c0 3 3 6 6 6l1-2-2-1-1 .8c-1-.5-2-1.5-2.5-2.5l.8-1-1-2z"/>')
};
// أيقونة بديلة للمنتج/القسم لو مفيش صورة (بتتحدد من اسم القسم)
const catIco = (n = '') => /شرق|مصر/.test(n) ? 'cookie' : /غرب/.test(n) ? 'cake' : /ميكس|هدايا/.test(n) ? 'gift' : /مخبوز/.test(n) ? 'bread' : /شيكولات|شوكولات/.test(n) ? 'candy' : /كحك|مولد|عيد/.test(n) ? 'moon' : /ايس|آيس/.test(n) ? 'ice' : /عروض|خصوم/.test(n) ? 'pct' : 'cookie';

/* ======== 3) البيانات (جاية من Firebase عن طريق index.html) ======== */
const R = window.REMOTE || { cats: [], prods: [], branches: [], settings: {}, brand: {} };
const CATS = R.cats, BR = R.branches.filter(b => b.active !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const PRODS = R.prods.filter(p => p.active !== false).map(p => ({ ...p, price: +p.price, oldPrice: p.oldPrice ? +p.oldPrice : 0 }));
const CFG = R.settings || {}, BRAND = R.brand || {}, HOT = BRAND.hotline || '16312';
const SEC = [['الأكثر رواجًا', 'الأكثر مبيعًا'], ['المنتجات الجديده', 'جديدنا'], ['تشكيلة مميزة', 'تشكيلة مميزة']];
const byId = (id) => PRODS.find(p => p.id === id);
const disc = (p) => p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
const out = (p) => p.stock === 0;
const isOffersCat = (n) => /عروض|خصوم/.test(n);

/* ======== 4) الحالة: المستخدم والسلة والمفضلة والفرع ======== */
let lang = localStorage.getItem('hm_lang') || 'ar';
let user = null, hasOrders = false, afterAuth = null, qv = '', curCat = '', slideT, unTrack = null;
let cart = store.get('hm_cart2', []);            // [{id, size, qty}]
let favs = store.get('hm_favs', []);
let myBranch = localStorage.getItem('hm_branch') || '';
let co = { method: 'delivery', name: '', phone: '', gov: 'القاهرة', area: '', addr: '', branch: myBranch, code: '', offer: null };
let L = {}, PD = {};                              // حالة صفحة القسم وصفحة المنتج
const branchOf = (id) => BR.find(b => b.id === id);
const branchName = () => (branchOf(myBranch) || {}).name || '';

/* السلة */
function lineOf(c) {
  const p = byId(c.id); if (!p) return null;
  const sz = (p.sizes || []).find(s => s.label === c.size);
  return { ...c, p, price: sz ? +sz.price : p.price, name: p.name + (c.size ? ' — ' + c.size : '') };
}
const lines = () => cart.map(lineOf).filter(Boolean);
const subtotal = () => lines().reduce((a, l) => a + l.price * l.qty, 0);
const cartCount = () => lines().reduce((a, l) => a + l.qty, 0);
const saveCart = () => { store.set('hm_cart2', cart); head(); };
function addToCart(id, size = '', n = 1) {
  const p = byId(id); if (!p || out(p)) return toast('نفد المخزون');
  const c = cart.find(x => x.id === id && x.size === size);
  if (p.stock != null && (c ? c.qty : 0) + n > p.stock) return toast('الكمية المتاحة ' + p.stock + ' فقط');
  c ? c.qty += n : cart.push({ id, size, qty: n });
  saveCart(); toast('تمت الإضافة للسلة ✓');
}
function toggleFav(id) {
  favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id]; store.set('hm_favs', favs);
  document.querySelectorAll(`[data-fav="${id}"],.fv[data-pfav="${id}"]`).forEach(b => b.classList.toggle('on', favs.includes(id)));
}

/* ======== 5) الهيدر والفوتر ======== */
const navHref = (c) => isOffersCat(c.name) ? '#/offers' : '#/c/' + enc(c.name);
function logoHtml() {                       // اللوجو: الافتراضي / صورة من اللوحة / بدون لوجو
  const l = BRAND.logo;
  const icon = l === 'none' ? '' : l ? `<img class="lg-img" src="${esc(l)}" alt="">` : `<span class="lg-ic">${I.crown}</span>`;
  return `${icon}<span class="lg-tx"><b>حلو الملك</b><small>PATISSERIE</small></span>`;
}
function head() {
  $('#top').innerHTML = `
  <div class="topbar"><span>${I.phone} اتصل بنا: ${esc(HOT)}</span><span>${I.truck} مدة التوصيل من 45 إلى 60 دقيقة</span><span>${I.card} طرق دفع سهلة</span></div>
  <header class="header"><div class="wrap hrow">
    <a class="logo" href="#/">${logoHtml()}</a>
    <form class="search" id="sf"><input id="q" placeholder="ابحث عن..." value="${esc(qv)}"><button aria-label="search">${I.search}</button></form>
    <div class="acts">
      ${user ? `<a class="act" href="#" data-act="acct">${I.user}<span>${esc(user.phone)}</span></a>`
             : `<a class="act" href="#" data-act="login">${I.user}<span>تسجيل الدخول</span></a><a class="act" href="#" data-act="register"><span>إنشاء حساب</span></a>`}
      ${hasOrders ? `<a class="act" href="#/track"><span>تتبع الطلب</span></a>` : ''}
      <a class="act" href="#/cart">${I.basket}<span>${cartCount()} منتج</span></a>
      <a class="act" href="#" data-act="branch">${I.pin}<span>${esc(branchName() || 'اختر الفرع')}</span><em>تغيير</em></a>
      <a class="act" href="#" data-act="lang">${I.globe}<span>${lang === 'ar' ? 'English' : 'العربية'}</span></a>
    </div></div>
    <nav class="nav"><ul class="wrap">${CATS.map(c => `<li><a href="${navHref(c)}" class="${(isOffersCat(c.name) ? curCat === '__offers' : curCat === c.name) ? 'on' : ''}">${esc(c.name)}</a></li>`).join('')}</ul></nav>
  </header>`;
  tr($('#top'));
}
function foot() {
  const so = BRAND.social || {}, ico = [['fb', 'fb'], ['ig', 'ig'], ['tt', 'tt'], ['wa', 'wa']];
  $('#foot').innerHTML = `<div class="wrap fgrid">
    <div class="fb"><a class="logo" href="#/">${logoHtml()}</a><p>أجود الحلويات الشرقية والغربية والمخبوزات، بمكونات طازة وتوصيل لحد باب بيتك.</p></div>
    <div><h4>روابط سريعة</h4><a href="#/">الرئيسية</a><a href="#/all">المنيو</a><a href="#/offers">العروض</a><a href="#/branches">فروعنا</a></div>
    <div><h4>خدمة العملاء</h4><a href="#/track">تتبع الطلب</a><a href="#/pg/refund">سياسة الاسترجاع</a><a href="#/pg/faq">الأسئلة الشائعة</a><a href="#/pg/contact">اتصل بنا</a></div>
    <div><h4>حمّل التطبيق</h4><div class="apps"><a href="#" data-act="soon">Google Play</a><a href="#" data-act="soon">App Store</a></div>
      <div class="soc">${ico.filter(([k]) => so[k]).map(([k, i]) => `<a href="${esc(k === 'wa' ? 'https://wa.me/' + String(so[k]).replace(/\D/g, '') : so[k])}" target="_blank" rel="noopener">${I[i]}</a>`).join('')}</div></div>
  </div><div class="wrap fcopy"><span>جميع الحقوق محفوظة لدى حلو الملك 2026</span><span>الخط الساخن: ${esc(HOT)}</span></div>`;
  tr($('#foot'));
}

/* ======== 6) كارت المنتج ======== */
const pic = (p) => p.img ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">` : `<span class="ph">${I[catIco(p.cat)]}</span>`;
function card(p) {
  const d = disc(p), badge = d ? `خصم ${d}%` : (p.badge || '');
  return `<article class="pc" data-go="#/p/${p.id}"><div class="pi">${badge ? `<span class="bd">${esc(badge)}</span>` : ''}
    <button class="hr ${favs.includes(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="fav">${I.heart}</button>${pic(p)}</div>
    <div class="pb"><h3>${esc(p.name)}</h3><small>${esc(p.unit || '')}</small>
    <div class="pr"><span class="pp">${p.oldPrice > p.price ? `<s>${fmt(p.oldPrice)}</s>` : ''}<b>${fmt(p.price)} ج.م</b></span>
    <button class="cb" data-add="${p.id}" ${out(p) ? 'disabled' : ''} aria-label="add">${I.cartp}</button></div></div></article>`;
}

/* ======== 7) الراوتر والعرض ======== */
function render(html, keep) {
  clearInterval(slideT); $('#view').innerHTML = html; tr($('#view'));
  if (!keep) window.scrollTo(0, 0);
}
const crumb = (...a) => `<div class="wrap crumb">${a.map((x, i) => i < a.length - 1 ? `<a href="${x[1]}">${x[0]}</a> / ` : `<b>${x[0]}</b>`).join('')}</div>`;
const nf = () => render(`<div class="wrap empty"><h2>الصفحة غير موجودة</h2><a class="gbtn" style="display:inline-block" href="#/">الرجوع للرئيسية</a></div>`);
function route() {
  if (unTrack) { unTrack(); unTrack = null; }
  const [a, ...r] = location.hash.replace(/^#\/?/, '').split('/'), b = decodeURIComponent(r.join('/') || '');
  curCat = a === 'c' ? b : a === 'offers' ? '__offers' : '';
  head(); window.scrollTo(0, 0);
  ({ '': home, c: () => catView(b), p: () => product(b), cart: cartView, track, s: () => search(b), sec: () => secView(b), all: allView, offers: offersView, branches: branchesView, pg: () => pgView(b) }[a] || nf)();
}
window.addEventListener('hashchange', route);

/* ---------- الرئيسية ---------- */
function home() {
  const bn = CFG.banners || [];
  const hero = bn.length ? `<div class="wrap"><div class="slider"><div class="slides" id="slides" style="transform:translateX(0)">${bn.map(u => `<div><img src="${esc(u)}" alt=""></div>`).join('')}</div></div>
      <div class="dots" id="dots">${bn.map((_, i) => `<i data-act="dot" data-i="${i}" class="${i ? '' : 'on'}"></i>`).join('')}</div></div>`
    : `<div class="wrap"><div class="hero"><div class="ht"><span class="tag">عروض الموسم</span><h1>حلاوة تليق بالملوك</h1><p>كنافة وبسبوسة وجاتوهات طازة كل يوم، وتوصلك لحد بيتك.</p>
      <div class="bs"><a class="gbtn" href="#/all">اطلب دلوقتي</a><a class="gbtn w" href="#/all">تصفح المنيو</a></div></div>
      <div class="hd"><i class="c1">${I.cake}</i><i class="c2">${I.cookie}</i><i class="c3">${I.gift}</i></div></div></div>`;
  const circ = [...CATS.filter(c => c.circle && !isOffersCat(c.name)), ...CATS.filter(c => c.circle && isOffersCat(c.name))];
  const cats = circ.length ? `<section class="wrap rowsec"><div class="rh"><h2>تسوق حسب القسم</h2></div><div class="cats">${circ.map(c =>
    `<a class="cc" href="${navHref(c)}"><span class="ci">${c.img ? `<img src="${esc(c.img)}" alt="">` : I[catIco(c.name)]}</span>${esc(c.name)}</a>`).join('')}</div></section>` : '';
  const rows = SEC.map(([k, t]) => { const it = PRODS.filter(p => p.section === k); return it.length ? `<section class="wrap rowsec"><div class="rh"><h2>${t}</h2><a href="#/sec/${enc(k)}">عرض الكل</a></div><div class="g5">${it.slice(0, 5).map(card).join('')}</div></section>` : ''; });
  const pr = CFG.promos || {}, off = window.OFFER1;
  const kahk = CATS.find(c => /كحك/.test(c.name));
  const promos = (pr.p1 || pr.p2 || kahk) ? `<section class="wrap promos">
    ${pr.p1 ? `<div class="pm im"><img src="${esc(pr.p1)}" alt=""></div>` : (off ? `<div class="pm"><div><h3>${esc(off.title)}</h3><p>كود: <b style="color:var(--maroon)">${esc(off.code)}</b></p><a href="#" class="gbtn" data-act="usecode" data-code="${esc(off.code)}">استخدم الكود</a></div>${I.pct}</div>` : '<div></div>')}
    ${pr.p2 ? `<div class="pm im"><img src="${esc(pr.p2)}" alt=""></div>` : (kahk ? `<div class="pm k"><div><h3>${esc(kahk.name)} 2026</h3><p>اطلب بدري واستلم في معادك</p><a class="gbtn" href="${navHref(kahk)}">اطلب الآن</a></div>${I.moon}</div>` : '')}</section>` : '';
  const feat = `<section class="wrap feat">${[['truck', 'توصيل سريع', 'من 45 إلى 60 دقيقة'], ['shield', 'مكونات أصلية', 'زبدة وفواكه طازة'], ['card', 'دفع سهل', 'كاش عند الاستلام'], ['store', 'فروع كثير', 'اطلب من أقرب فرع ليك']].map(([i, t, s]) => `<div class="ft"><div><b>${t}</b><small>${s}</small></div>${I[i]}</div>`).join('')}</section>`;
  if (!PRODS.length && !CATS.length) return render(`<div class="wrap empty"><h2>المتجر قيد التجهيز</h2><p>هنكون معاكم قريبًا.</p></div>`);
  render(hero + cats + (rows[0] || '') + promos + feat + (rows[1] || '') + (rows[2] || ''));
  if (bn.length > 1) { let i = 0; slideT = setInterval(() => ACT.dot({ dataset: { i: i = (i + 1) % bn.length } }), 5000); }
  if (!window.OFFER1 && !window.OFFER_TRIED) { window.OFFER_TRIED = 1; db.collection('offers').where('active', '==', true).limit(1).get().then(s => { if (s.docs[0]) { window.OFFER1 = s.docs[0].data(); if (location.hash.replace('#', '') === '' || location.hash === '#/') home(); } }).catch(() => {}); }
}

/* ---------- صفحات القوائم (قسم / بحث / عروض / الكل) ---------- */
const catView = (n) => isOffersCat(n) ? offersView() : list('c' + n, n, PRODS.filter(p => p.cat === n), 'sub', [['الرئيسية', '#/'], ['المنيو', '#/all'], [esc(n)]]);
const allView = () => list('all', 'المنيو', PRODS, 'cat', [['الرئيسية', '#/'], ['المنيو']]);
const secView = (k) => list('sec' + k, (SEC.find(s => s[0] === k) || [0, k])[1], PRODS.filter(p => p.section === k), 'cat', [['الرئيسية', '#/'], ['المنيو', '#/all'], [esc((SEC.find(s => s[0] === k) || [0, k])[1])]]);
const search = (q) => list('s' + q, 'نتائج البحث عن "' + q + '"', PRODS.filter(p => (p.name + ' ' + (p.en || '') + ' ' + p.cat + ' ' + (p.sub || '')).toLowerCase().includes(q.toLowerCase())), 'cat', [['الرئيسية', '#/'], ['البحث']]);
function offersView() { list('offers', 'عروض وخصومات', PRODS.filter(p => disc(p) > 0), 'cat', [['الرئيسية', '#/'], ['عروض وخصومات']]); }
function list(key, title, base, fk, cr) {
  if (L.key !== key) L = { key, f: [], min: null, max: null, av: [], sort: 'pop', page: 1 };
  LAST = [key, title, base, fk, cr];
  const ps = base.map(p => p.price), lo = ps.length ? Math.floor(Math.min(...ps)) : 0, hi = ps.length ? Math.ceil(Math.max(...ps)) : 0;
  const mn = Math.max(lo, L.min ?? lo), mx = Math.min(hi, L.max ?? hi);
  const fac = {}; base.forEach(p => { const v = p[fk]; if (v) fac[v] = (fac[v] || 0) + 1; });
  let res = base.filter(p => (!L.f.length || L.f.includes(p[fk])) && p.price >= mn && p.price <= mx && (!L.av.includes('in') || !out(p)) && (!L.av.includes('off') || disc(p)));
  const so = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, new: (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0) };
  if (so[L.sort]) res = [...res].sort(so[L.sort]);
  const pages = Math.max(1, Math.ceil(res.length / 8)); L.page = Math.min(L.page, pages);
  const shown = res.slice((L.page - 1) * 8, L.page * 8), span = Math.max(1, hi - lo);
  render(`${crumb(...cr)}<div class="wrap lay">
   <aside class="fbox"><h4>${fk === 'sub' ? 'التصنيف' : 'القسم'}</h4>
    ${Object.entries(fac).map(([v, c]) => `<label class="ck"><input type="checkbox" class="fl-f" value="${esc(v)}" ${L.f.includes(v) ? 'checked' : ''}><i></i><span>${esc(v)}</span><em>${c}</em></label>`).join('') || '<small>—</small>'}
    <hr><h4>السعر</h4><div class="rng" id="rng" style="--a:${(mn - lo) / span * 100}%;--b:${(mx - lo) / span * 100}%"><input type="range" id="r1" min="${lo}" max="${hi}" value="${mn}"><input type="range" id="r2" min="${lo}" max="${hi}" value="${mx}"></div>
    <div class="rl"><span id="l1">${mn} ج.م</span><span id="l2">${mx} ج.م</span></div>
    <hr><h4>التوفر</h4>
    <label class="ck"><input type="checkbox" class="fl-a" value="in" ${L.av.includes('in') ? 'checked' : ''}><i></i><span>متاح الآن</span><em>${base.filter(p => !out(p)).length}</em></label>
    <label class="ck"><input type="checkbox" class="fl-a" value="off" ${L.av.includes('off') ? 'checked' : ''}><i></i><span>عليه خصم</span><em>${base.filter(disc).length}</em></label>
    <button class="gbtn" style="width:100%;margin-top:18px" data-act="filter">تطبيق الفلتر</button></aside>
   <section><div class="lh"><h1>${esc(title)} <small>${res.length} منتج</small></h1>
    <select class="sel" id="sort"><option value="pop" ${L.sort === 'pop' ? 'selected' : ''}>ترتيب: الأكثر طلبًا</option><option value="low" ${L.sort === 'low' ? 'selected' : ''}>السعر: الأقل</option><option value="high" ${L.sort === 'high' ? 'selected' : ''}>السعر: الأعلى</option><option value="new" ${L.sort === 'new' ? 'selected' : ''}>الأحدث</option></select></div>
    ${shown.length ? `<div class="g4c">${shown.map(card).join('')}</div>` : `<div class="empty"><h2>مفيش منتجات</h2><p>جرّب تغيّر الفلتر.</p><button class="gbtn" style="display:inline-block" data-act="reset">مسح الفلتر</button></div>`}
    ${pages > 1 ? `<div class="pg">${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === L.page ? 'on' : ''}" data-act="page" data-p="${i + 1}">${i + 1}</button>`).join('')}${L.page < pages ? `<button data-act="page" data-p="${L.page + 1}">‹</button>` : ''}</div>` : ''}</section></div>`, true);
}
let LAST = [];
document.addEventListener('input', (e) => {                       // السلايدر المزدوج للسعر
  if (e.target.id !== 'r1' && e.target.id !== 'r2') return;
  const a = $('#r1'), b = $('#r2'), lo = +a.min, hi = +a.max, span = Math.max(1, hi - lo);
  if (+a.value > +b.value) { e.target.id === 'r1' ? a.value = b.value : b.value = a.value; }
  $('#l1').textContent = a.value + ' ج.م'; $('#l2').textContent = b.value + ' ج.م';
  $('#rng').style.setProperty('--a', (a.value - lo) / span * 100 + '%'); $('#rng').style.setProperty('--b', (b.value - lo) / span * 100 + '%');
  if (a.value === a.min && b.value === b.max) { L.min = L.max = null; } else { L.min = +a.value; L.max = +b.value; }
});
document.addEventListener('change', (e) => { if (e.target.id === 'sort') { L.sort = e.target.value; L.page = 1; list(...LAST); } });

/* ---------- صفحة المنتج ---------- */
function product(id) {
  const p = byId(id); if (!p) return nf();
  if (PD.id !== id) PD = { id, size: (p.sizes || [])[0]?.label || '', qty: 1, tab: 'd' };
  const sz = (p.sizes || []).find(s => s.label === PD.size), price = sz ? +sz.price : p.price, d = disc(p);
  const sim = PRODS.filter(x => x.cat === p.cat && x.id !== id).slice(0, 5);
  render(`${crumb(['الرئيسية', '#/'], [esc(p.cat), '#/c/' + enc(p.cat)], [esc(p.name)])}<div class="wrap"><div class="pgd">
   <div class="gal">${d || p.badge ? `<span class="bd">${esc(d ? 'خصم ' + d + '%' : p.badge)}</span>` : ''}${pic(p)}</div>
   <div class="dt"><h1>${esc(p.name)}</h1>
    <div class="rt">${p.reviews > 0 ? `<span class="stars">${'★'.repeat(Math.round(p.rating || 0))}${'☆'.repeat(5 - Math.round(p.rating || 0))}</span><span>${p.rating} (${p.reviews} تقييم)</span>` : '<span>لا توجد تقييمات</span>'}</div>
    <div class="big">${p.oldPrice > price ? `<s style="font-size:20px;color:var(--mut)">${fmt(p.oldPrice)}</s> ` : ''}${fmt(price)} ج.م ${p.unit ? `<small>/ ${esc(p.unit)}</small>` : ''}</div>
    ${p.desc ? `<p class="ds">${esc(p.desc)}</p>` : ''}
    ${(p.sizes || []).length ? `<h5>الحجم</h5><div class="szs">${p.sizes.map(s => `<button class="sz ${s.label === PD.size ? 'on' : ''}" data-act="size" data-v="${esc(s.label)}">${esc(s.label)}</button>`).join('')}</div>` : ''}
    <h5>الكمية</h5><div class="qty"><button data-act="pq" data-d="1">+</button><b>${PD.qty}</b><button data-act="pq" data-d="-1">−</button></div>
    <div class="dact"><button class="gbtn" data-act="padd" ${out(p) ? 'disabled' : ''}>${out(p) ? 'نفد المخزون' : 'أضف للسلة'} ${I.cartp}</button><button class="fv ${favs.includes(id) ? 'on' : ''}" data-pfav="${id}" data-act="pfav">${I.heart}</button></div>
    <div class="inf"><span>${I.truck} توصيل من 45 لـ 60 دقيقة</span><span>${I.shield} مكونات طازة</span></div></div></div>
   <div class="tabs"><nav>${[['d', 'الوصف'], ['i', 'المكونات'], ['r', 'التقييمات']].map(([k, t]) => `<button class="${PD.tab === k ? 'on' : ''}" data-act="tab" data-v="${k}">${t}</button>`).join('')}</nav>
    <p>${esc(PD.tab === 'd' ? (p.desc || 'لا يوجد وصف.') : PD.tab === 'i' ? (p.ingredients || 'لا توجد مكونات مسجّلة.') : (p.reviews > 0 ? p.reviews + ' تقييم' : 'لا توجد تقييمات حتى الآن.'))}</p></div>
   ${sim.length ? `<section class="rowsec"><div class="rh"><h2>منتجات مشابهة</h2></div><div class="g5">${sim.map(card).join('')}</div></section>` : ''}</div>`, PD.keep);
  PD.keep = false;
}

/* ---------- السلة وإتمام الطلب ---------- */
function syncForm() {                              // بنقرا الخانات قبل أي إعادة رسم عشان ميضيعش اللي اتكتب
  const g = (id) => { const e = $('#' + id); return e ? e.value : null; };
  [['name', 'f-name'], ['phone', 'f-phone'], ['gov', 'f-gov'], ['area', 'f-area'], ['addr', 'f-addr'], ['branch', 'f-br'], ['code', 'f-code']].forEach(([k, id]) => { const v = g(id); if (v !== null) co[k] = v; });
}
function discountAmt() { if (!co.offer) return 0; const s = subtotal(); return Math.min(s, co.offer.type === 'percent' ? Math.round(s * co.offer.value / 100) : co.offer.value); }
function cartView() {
  const ls = lines();
  if (!ls.length) return render(`<div class="wrap empty"><h2>السلة فاضية</h2><p>ضيف منتجات وارجع هنا.</p><a class="gbtn" style="display:inline-block" href="#/all">تصفح المنيو</a></div>`);
  if (user && !co.phone) co.phone = user.phone;
  const br = branchOf(co.branch), pick = co.method === 'pickup';
  const sub = subtotal(), d = discountAmt(), fee = pick ? 0 : (br ? +br.fee || 0 : 0), total = Math.max(0, sub - d + fee);
  render(`<div class="wrap"><div class="steps"><span class="dn"><b>1</b>السلة</span><hr><span class="on"><b>2</b>بيانات التوصيل</span><hr><span><b>3</b>الدفع</span></div>
  <div class="cl"><div>
   <div class="bx"><button class="bt" data-act="cclear">إفراغ السلة</button><h3>سلة المشتريات (${ls.length})</h3>
    ${ls.map((l, i) => `<div class="ln"><div class="lt">${l.p.img ? `<img src="${esc(l.p.img)}" alt="">` : I[catIco(l.p.cat)]}</div>
     <div class="li"><b>${esc(l.p.name)}</b><small>${esc(l.size || l.p.unit || '')}</small><div>${fmt(l.price)} ج.م</div></div>
     <div class="qty"><button data-act="cq" data-i="${i}" data-d="1">+</button><b>${l.qty}</b><button data-act="cq" data-i="${i}" data-d="-1">−</button></div>
     <div class="lp">${fmt(l.price * l.qty)} ج.م</div><button class="rm" data-act="cdel" data-i="${i}" aria-label="remove">${I.trash}</button></div>`).join('')}</div>
   <div class="bx"><h3>بيانات التوصيل</h3>
    <div class="opts"><div class="op ${!pick ? 'on' : ''}" data-act="method" data-v="delivery"><span style="display:flex;gap:12px;align-items:center">${I.truck}<span><b>توصيل للمنزل</b><small>من 45 لـ 60 دقيقة</small></span></span><i></i></div>
     <div class="op ${pick ? 'on' : ''}" data-act="method" data-v="pickup"><span style="display:flex;gap:12px;align-items:center">${I.store}<span><b>استلام من الفرع</b><small>جاهز في 30 دقيقة</small></span></span><i></i></div></div>
    <div class="fg"><div><label class="f">الاسم بالكامل</label><input class="in" id="f-name" placeholder="أحمد محمد" value="${esc(co.name)}"></div>
     <div><label class="f">رقم الموبايل</label><input class="in" id="f-phone" inputmode="tel" placeholder="01xxxxxxxxx" value="${esc(co.phone)}"></div>
     <div class="fl"><label class="f">الفرع الأقرب لك (إجباري)</label><select class="in" id="f-br"><option value="">— اختر الفرع —</option>${BR.map(b => `<option value="${b.id}" ${b.id === co.branch ? 'selected' : ''}>${esc(b.name)}${b.area ? ' — ' + esc(b.area) : ''}</option>`).join('')}</select></div>
     ${pick ? '' : `<div><label class="f">المحافظة</label><input class="in" id="f-gov" value="${esc(co.gov)}"></div><div><label class="f">المنطقة</label><input class="in" id="f-area" placeholder="مثال: مدينة نصر" value="${esc(co.area)}"></div>
     <div class="fl"><label class="f">العنوان بالتفصيل</label><input class="in" id="f-addr" placeholder="شارع، رقم العمارة، الدور، الشقة" value="${esc(co.addr)}"></div>`}</div></div>
   <div class="bx"><h3>طريقة الدفع</h3><div class="opts" style="grid-template-columns:repeat(3,1fr)">
     <div class="op on"><span style="display:flex;gap:10px;align-items:center">${I.wallet}<span><b>كاش</b><small>عند الاستلام</small></span></span><i></i></div>
     <div class="op off"><span style="display:flex;gap:10px;align-items:center">${I.card}<span><b>بطاقة بنكية</b><small>غير متوفر حاليًا</small></span></span><i></i></div>
     <div class="op off"><span style="display:flex;gap:10px;align-items:center">${I.wallet}<span><b>محفظة إلكترونية</b><small>غير متوفر حاليًا</small></span></span><i></i></div></div></div>
  </div>
  <aside class="bx sm"><h3>ملخص الطلب</h3><div class="cp"><input class="in" id="f-code" placeholder="كود الخصم" value="${esc(co.code)}"><button data-act="apply">تطبيق</button></div>
   <div class="sr"><span>المجموع الفرعي</span><span>${fmt(sub)} ج.م</span></div>
   ${d ? `<div class="sr g"><span>خصم ${esc(co.offer.code)}</span><span>- ${fmt(d)} ج.م</span></div>` : ''}
   ${pick ? '' : `<div class="sr"><span>رسوم التوصيل</span><span>${fmt(fee)} ج.م</span></div>`}
   <div class="sr tt"><span>الإجمالي</span><span>${fmt(total)} ج.م</span></div><div class="err" id="cerr"></div>
   <button class="gbtn" style="width:100%;margin-top:6px" data-act="confirm">تأكيد الطلب</button><div class="sec">بياناتك محمية ومدفوعاتك آمنة</div></aside></div></div>`, true);
}
async function applyCode() {
  syncForm(); const c = (co.code || '').trim().toUpperCase(); if (!c) return toast('اكتب كود الخصم');
  try {
    const s = await db.collection('offers').where('code', '==', c).get();
    const o = s.docs.map(d => d.data()).find(x => x.active !== false);
    if (!o) return toast('الكود غير صحيح');
    if (o.endsAt && new Date(o.endsAt + 'T23:59:59') < new Date()) return toast('الكود منتهي');
    if (o.minOrder && subtotal() < o.minOrder) return toast('الحد الأدنى للطلب ' + o.minOrder + ' ج.م');
    co.offer = { code: o.code, type: o.type, value: +o.value }; co.code = o.code; cartView(); toast('تم تطبيق الكود ✓');
  } catch { toast('تعذّر التحقق من الكود'); }
}
async function confirmOrder() {
  syncForm(); const err = (m) => { const e = $('#cerr'); if (e) e.textContent = lang === 'en' ? T(m) : m; };
  if (!user) return authDrawer('login', confirmOrder);
  const ls = lines(), br = branchOf(co.branch), pick = co.method === 'pickup';
  if (!br) return err('اختر الفرع الأقرب لك');
  if (!co.name.trim()) return err('اكتب الاسم بالكامل');
  if (!/^01[0125]\d{8}$/.test(co.phone.trim())) return err('رقم الموبايل غير صحيح');
  if (!pick && (!co.area.trim() || !co.addr.trim())) return err('اكتب المنطقة والعنوان بالتفصيل');
  const sub = subtotal(), d = discountAmt(), fee = pick ? 0 : (+br.fee || 0), orderNo = 1000 + Math.floor(Date.now() / 1000) % 1000000;
  const order = { uid: user.uid, name: co.name.trim(), phone: co.phone.trim(), method: co.method, branchId: br.id, branchName: br.name,
    gov: pick ? '' : co.gov, area: pick ? '' : co.area.trim(), addr: pick ? '' : co.addr.trim(),
    items: ls.map(l => ({ id: l.id, size: l.size, name: l.name, cat: l.p.cat, price: l.price, qty: l.qty })),
    subtotal: sub, discount: d, code: co.offer ? co.offer.code : '', fee, total: Math.max(0, sub - d + fee), pay: 'cash', status: 'جديدة', orderNo, createdAt: TS() };
  try { await db.collection('orders').add(order); } catch { return err('تعذّر إرسال الطلب، حاول تاني'); }
  cart = []; co.offer = null; co.code = ''; saveCart(); hasOrders = true; head();
  const msg = `طلب جديد #${orderNo}%0A${order.items.map(i => `${i.name} × ${i.qty}`).join('%0A')}%0Aالإجمالي: ${order.total} ج.م%0Aالاسم: ${order.name}%0Aالموبايل: ${order.phone}${pick ? '%0Aاستلام من الفرع' : '%0Aالعنوان: ' + order.area + ' - ' + order.addr}`;
  let wa = String(br.phone || '').replace(/\D/g, ''); if (wa.startsWith('0')) wa = '20' + wa.slice(1);
  render(`<div class="wrap empty"><h2>تم استلام طلبك ✓</h2><p>رقم الطلب #${orderNo} — فرع ${esc(br.name)}</p><p>هنتواصل معاك على ${esc(order.phone)}</p>
   <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap"><a class="gbtn" href="#/track">تتبع طلبك</a>${wa ? `<a class="gbtn w" style="border:1px solid var(--navy)" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${msg}">ابعت تفاصيل الطلب للفرع (واتساب)</a>` : ''}</div></div>`);
}

/* ---------- تتبع الطلب (لحظي) ---------- */
function track() {
  if (!user) return render(`<div class="wrap empty"><h2>تتبع الطلب</h2><p>سجّل دخولك عشان تشوف طلباتك.</p><button class="gbtn" style="display:inline-block" data-act="login">تسجيل الدخول</button></div>`);
  render(`<div class="wrap"><div class="crumb"><b>تتبع الطلب</b></div><div id="tl"><div class="empty">...</div></div></div>`);
  const ST = ['جديدة', 'قيد التحضير', 'في الطريق', 'تم التسليم'];
  unTrack = db.collection('orders').where('uid', '==', user.uid).onSnapshot(s => {
    const os = s.docs.map(d => d.data()).sort((a, b) => (b.createdAt?.seconds || 9e9) - (a.createdAt?.seconds || 9e9));
    const box = $('#tl'); if (!box) return;
    box.innerHTML = os.length ? os.map(o => { const k = ST.indexOf(o.status);
      return `<div class="tk"><h3><span>طلب #${o.orderNo}</span><span>${fmt(o.total)} ج.م</span></h3><small>${esc(o.branchName || '')} — ${o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleString('ar-EG') : ''}</small>
       ${o.status === 'ملغي' ? '<div class="pst"><div class="x">تم إلغاء الطلب</div></div>' : `<div class="pst">${ST.map((t, i) => `<div class="${i <= k ? 'on' : ''}">${t}</div>`).join('')}</div>`}
       <small>${(o.items || []).map(i => esc(i.name) + ' × ' + i.qty).join(' ، ')}</small></div>`; }).join('') : '<div class="empty"><h2>لسه معندكش طلبات</h2></div>';
    tr(box);
  }, () => { const b = $('#tl'); if (b) b.innerHTML = '<div class="empty">تعذّر تحميل الطلبات</div>'; });
}

/* ---------- فروعنا + صفحات المعلومات ---------- */
function branchesView() {
  render(`<div class="wrap">${crumb(['الرئيسية', '#/'], ['فروعنا'])}<div class="lh"><h1>فروعنا</h1></div>${BR.length ? BR.map(b => `<div class="tk"><h3><span>${esc(b.name)}</span></h3><small>${esc(b.area || '')}</small>${b.phone ? `<div><a class="dl" href="tel:${esc(b.phone)}">${esc(b.phone)}</a></div>` : ''}</div>`).join('') : '<div class="empty">قريبًا</div>'}</div>`);
}
function pgView(k) {
  const P = { refund: ['سياسة الاسترجاع', 'لو في أي مشكلة في طلبك كلمنا خلال 24 ساعة من الاستلام وهنراجعها معاك.'], faq: ['الأسئلة الشائعة', 'مدة التوصيل من 45 إلى 60 دقيقة. الدفع كاش عند الاستلام حاليًا. تقدر تتابع طلبك من "تتبع الطلب".'], contact: ['اتصل بنا', 'الخط الساخن: ' + HOT] }[k];
  if (!P) return nf(); render(`<div class="wrap">${crumb(['الرئيسية', '#/'], [P[0]])}<div class="tk"><h3>${P[0]}</h3><p style="margin-top:10px">${esc(P[1])}</p></div></div>`);
}

/* ======== 8) الدخول (رقم الموبايل + كلمة المرور بس) ======== */
function authDrawer(tab = 'login', cb) {
  if (cb) afterAuth = cb; const reg = tab === 'register';
  $('#drawer').innerHTML = `<div class="dov" data-act="dclose"></div><div class="dpn"><button class="dx" data-act="dclose">×</button>
   <h2>${reg ? 'أهلاً بك' : 'مرحبا بعودتك'}</h2><p class="dsub">${reg ? 'أنشئ حسابك برقم الموبايل وكلمة المرور' : 'سجّل دخولك برقم الموبايل وكلمة المرور'}</p>
   <form id="af" data-tab="${tab}"><label>رقم الموبايل</label><input name="phone" inputmode="tel" placeholder="01XXXXXXXXX" autocomplete="username" required>
   <label>كلمة المرور</label><div class="pw"><input name="pass" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" required><button type="button" class="eye" data-act="eye">${I.eye}</button></div>
   ${reg ? '' : '<a href="#" class="dl" data-act="forgot">نسيت كلمة المرور ؟</a>'}<div class="err" id="aerr"></div>
   <button class="gbtn" id="abtn">${reg ? 'إنشاء الحساب' : 'تسجيل الدخول'}</button></form>
   <p class="dfoot">${reg ? 'لديك حساب بالفعل ؟' : 'ليس لديك حساب ؟'} <a href="#" class="dl" data-act="${reg ? 'login' : 'register'}">${reg ? 'تسجيل الدخول' : 'إنشاء حساب'}</a></p></div>`;
  $('#drawer').classList.add('open'); tr($('#drawer'));
}
function acctDrawer() {
  $('#drawer').innerHTML = `<div class="dov" data-act="dclose"></div><div class="dpn"><button class="dx" data-act="dclose">×</button><h2>حسابي</h2><p class="dsub" dir="ltr">${esc(user.phone)}</p>
   <a class="gbtn" href="#/track" data-act="dclose">تتبع طلباتي</a><button class="gbtn w" style="width:100%;margin-top:12px;border:1px solid var(--navy)" data-act="logout">تسجيل خروج</button></div>`;
  $('#drawer').classList.add('open'); tr($('#drawer'));
}
function branchDrawer() {
  $('#drawer').innerHTML = `<div class="dov" data-act="dclose"></div><div class="dpn"><button class="dx" data-act="dclose">×</button><h2>اختر الفرع</h2><p class="dsub">اطلب من أقرب فرع ليك</p>
   ${BR.map(b => `<button class="bo ${b.id === myBranch ? 'on' : ''}" data-act="pick" data-id="${b.id}"><b>${esc(b.name)}</b><small>${esc(b.area || '')}</small></button>`).join('') || '<div class="empty">لا توجد فروع متاحة حاليًا</div>'}</div>`;
  $('#drawer').classList.add('open'); tr($('#drawer'));
}
document.addEventListener('submit', async (e) => {
  if (e.target.id === 'sf') { e.preventDefault(); qv = $('#q').value.trim(); if (qv) location.hash = '#/s/' + enc(qv); return; }
  if (e.target.id !== 'af') return; e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target)), reg = e.target.dataset.tab === 'register', err = (m) => { $('#aerr').textContent = lang === 'en' ? T(m) : m; };
  const phone = f.phone.trim(); $('#abtn').disabled = true;
  try {
    if (!/^01[0125]\d{8}$/.test(phone)) return err('رقم الموبايل غير صحيح');
    if (reg) {
      if (f.pass.length < 6) return err('كلمة المرور لازم 6 حروف على الأقل');
      const c = await auth.createUserWithEmailAndPassword(phoneEmail(phone), f.pass);
      await db.collection('users').doc(c.user.uid).set({ phone, createdAt: TS() });   // رقم الموبايل بس (توفير في المساحة)
    } else {
      const c = await auth.signInWithEmailAndPassword(phoneEmail(phone), f.pass);
      const a = await db.collection('admins').doc(c.user.uid).get();
      if (a.exists) { location.href = 'admin.html'; return; }                          // الأدمن ← لوحة التحكم
    }
    ACT.dclose(); toast('أهلاً بك ✓');
    if (afterAuth) { const fn = afterAuth; afterAuth = null; setTimeout(fn, 600); }
  } catch (ex) {
    const c = ex.code || '';
    err(c === 'auth/email-already-in-use' ? 'الرقم ده مسجّل قبل كده' : /invalid|wrong|user-not-found/.test(c) ? 'الرقم أو كلمة المرور غلط' : c === 'auth/network-request-failed' ? 'مشكلة في الاتصال بالإنترنت' : 'حصلت مشكلة، حاول تاني');
  } finally { const b = $('#abtn'); if (b) b.disabled = false; }
});
auth.onAuthStateChanged(async (u) => {
  if (!u) { user = null; hasOrders = false; head(); return; }
  user = { uid: u.uid, phone: (u.email || '').split('@')[0] };
  try { hasOrders = !(await db.collection('orders').where('uid', '==', u.uid).limit(1).get()).empty; } catch {}
  head(); if (location.hash.startsWith('#/cart')) cartView();
});

/* ======== 9) الأوامر (كل الأزرار) ======== */
const ACT = {
  login: () => authDrawer('login'), register: () => authDrawer('register'), acct: acctDrawer, branch: branchDrawer,
  dclose: () => $('#drawer').classList.remove('open'),
  eye: (el) => { const i = el.parentElement.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; },
  forgot: () => toast('لاستعادة كلمة المرور اتصل بنا على ' + HOT),
  pick: (el) => { myBranch = el.dataset.id; co.branch = myBranch; localStorage.setItem('hm_branch', myBranch); ACT.dclose(); head(); if (location.hash.startsWith('#/cart')) cartView(); },
  logout: async () => { await auth.signOut(); ACT.dclose(); toast('تم تسجيل الخروج'); if (location.hash.startsWith('#/track')) route(); },
  lang: () => { lang = lang === 'ar' ? 'en' : 'ar'; localStorage.setItem('hm_lang', lang); applyLang(); },
  soon: () => toast('التطبيق قريبًا'),
  usecode: (el) => { co.code = el.dataset.code; location.hash = '#/cart'; setTimeout(() => cart.length ? applyCode() : toast('ضيف منتجات للسلة الأول'), 300); },
  dot: (el) => { const s = $('#slides'); if (!s) return; const i = +el.dataset.i; s.style.transform = `translateX(${(lang === 'ar' ? 1 : -1) * i * 100}%)`; document.querySelectorAll('#dots i').forEach((d, k) => d.classList.toggle('on', k === i)); },
  filter: () => { L.f = [...document.querySelectorAll('.fl-f:checked')].map(x => x.value); L.av = [...document.querySelectorAll('.fl-a:checked')].map(x => x.value); L.page = 1; list(...LAST); },
  reset: () => { L = { key: L.key, f: [], min: null, max: null, av: [], sort: 'pop', page: 1 }; list(...LAST); },
  page: (el) => { L.page = +el.dataset.p; list(...LAST); window.scrollTo(0, 0); },
  size: (el) => { PD.size = el.dataset.v; PD.keep = true; product(PD.id); },
  pq: (el) => { const p = byId(PD.id); PD.qty = Math.max(1, Math.min(p.stock ?? 99, PD.qty + +el.dataset.d)); PD.keep = true; product(PD.id); },
  tab: (el) => { PD.tab = el.dataset.v; PD.keep = true; product(PD.id); },
  padd: () => addToCart(PD.id, PD.size, PD.qty),
  pfav: () => toggleFav(PD.id),
  method: (el) => { syncForm(); co.method = el.dataset.v; cartView(); },
  cq: (el) => { syncForm(); const c = cart[+el.dataset.i], p = byId(c.id), q = c.qty + +el.dataset.d; if (q < 1) return; if (p.stock != null && q > p.stock) return toast('الكمية المتاحة ' + p.stock + ' فقط'); c.qty = q; saveCart(); cartView(); },
  cdel: (el) => { syncForm(); cart.splice(+el.dataset.i, 1); saveCart(); cartView(); },
  cclear: () => { cart = []; saveCart(); cartView(); },
  apply: applyCode, confirm: confirmOrder
};
document.addEventListener('click', (e) => {
  const t = e.target; let el;
  if ((el = t.closest('[data-fav]'))) { e.preventDefault(); e.stopPropagation(); return toggleFav(el.dataset.fav); }
  if ((el = t.closest('[data-add]'))) { e.stopPropagation(); const p = byId(el.dataset.add); return (p.sizes || []).length ? (location.hash = '#/p/' + p.id) : addToCart(p.id); }
  if ((el = t.closest('[data-act]'))) { if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault(); if (ACT[el.dataset.act]) ACT[el.dataset.act](el); return; }
  if ((el = t.closest('[data-go]'))) location.hash = el.dataset.go;
});
$('#q') && 0;
document.addEventListener('input', (e) => { if (e.target.id === 'q') qv = e.target.value; });

/* ======== 10) الترجمة عربي / English ======== */
const D = {
  'اتصل بنا': 'Call us', 'مدة التوصيل من 45 إلى 60 دقيقة': 'Delivery time 45 - 60 minutes', 'طرق دفع سهلة': 'Easy payment methods', 'ابحث عن...': 'Search for...',
  'تسجيل الدخول': 'Login', 'إنشاء حساب': 'Sign up', 'تتبع الطلب': 'Track order', 'تغيير': 'Change', 'اختر الفرع': 'Choose branch', 'الرئيسية': 'Home', 'المنيو': 'Menu', 'العروض': 'Offers', 'فروعنا': 'Our branches',
  'روابط سريعة': 'Quick links', 'خدمة العملاء': 'Customer service', 'سياسة الاسترجاع': 'Return policy', 'الأسئلة الشائعة': 'FAQ', 'اتصل بنا': 'Contact us', 'حمّل التطبيق': 'Get the app',
  'أجود الحلويات الشرقية والغربية والمخبوزات، بمكونات طازة وتوصيل لحد باب بيتك.': 'The finest oriental and western sweets and bakery, fresh ingredients delivered to your door.',
  'جميع الحقوق محفوظة لدى حلو الملك 2026': '© 2026 Helw El Malek. All rights reserved.', 'عرض الكل': 'View all', 'تسوق حسب القسم': 'Shop by category', 'الأكثر مبيعًا': 'Best sellers', 'جديدنا': 'New arrivals', 'تشكيلة مميزة': 'Featured',
  'عروض الموسم': 'Seasonal offers', 'حلاوة تليق بالملوك': 'Sweets fit for kings', 'اطلب دلوقتي': 'Order now', 'تصفح المنيو': 'Browse menu', 'استخدم الكود': 'Use code', 'اطلب الآن': 'Order now',
  'توصيل سريع': 'Fast delivery', 'من 45 إلى 60 دقيقة': '45 to 60 minutes', 'مكونات أصلية': 'Authentic ingredients', 'زبدة وفواكه طازة': 'Fresh butter and fruit', 'دفع سهل': 'Easy payment', 'كاش عند الاستلام': 'Cash on delivery', 'فروع كثير': 'Many branches', 'اطلب من أقرب فرع ليك': 'Order from your nearest branch',
  'التصنيف': 'Category', 'القسم': 'Category', 'السعر': 'Price', 'التوفر': 'Availability', 'متاح الآن': 'In stock', 'عليه خصم': 'On sale', 'تطبيق الفلتر': 'Apply filter', 'مسح الفلتر': 'Clear filter', 'مفيش منتجات': 'No products', 'جرّب تغيّر الفلتر.': 'Try changing the filter.',
  'ترتيب: الأكثر طلبًا': 'Sort: Most popular', 'السعر: الأقل': 'Price: low to high', 'السعر: الأعلى': 'Price: high to low', 'الأحدث': 'Newest', 'نفد المخزون': 'Out of stock', 'أضف للسلة': 'Add to cart', 'الحجم': 'Size', 'الكمية': 'Quantity',
  'الوصف': 'Description', 'المكونات': 'Ingredients', 'التقييمات': 'Reviews', 'لا توجد تقييمات': 'No reviews', 'لا توجد تقييمات حتى الآن.': 'No reviews yet.', 'منتجات مشابهة': 'Similar products', 'توصيل من 45 لـ 60 دقيقة': 'Delivery in 45 - 60 minutes', 'مكونات طازة': 'Fresh ingredients',
  'السلة': 'Cart', 'بيانات التوصيل': 'Delivery details', 'الدفع': 'Payment', 'إفراغ السلة': 'Empty cart', 'سلة المشتريات': 'Shopping cart', 'توصيل للمنزل': 'Home delivery', 'استلام من الفرع': 'Branch pickup', 'جاهز في 30 دقيقة': 'Ready in 30 minutes',
  'الاسم بالكامل': 'Full name', 'رقم الموبايل': 'Mobile number', 'الفرع الأقرب لك (إجباري)': 'Your nearest branch (required)', '— اختر الفرع —': '— Choose branch —', 'المحافظة': 'Governorate', 'المنطقة': 'Area', 'العنوان بالتفصيل': 'Detailed address',
  'طريقة الدفع': 'Payment method', 'كاش': 'Cash', 'عند الاستلام': 'On delivery', 'بطاقة بنكية': 'Bank card', 'محفظة إلكترونية': 'E-wallet', 'غير متوفر حاليًا': 'Not available now', 'ملخص الطلب': 'Order summary', 'كود الخصم': 'Discount code', 'تطبيق': 'Apply',
  'المجموع الفرعي': 'Subtotal', 'رسوم التوصيل': 'Delivery fee', 'الإجمالي': 'Total', 'تأكيد الطلب': 'Confirm order', 'بياناتك محمية ومدفوعاتك آمنة': 'Your data is protected and payments are secure', 'السلة فاضية': 'Your cart is empty', 'ضيف منتجات وارجع هنا.': 'Add some products and come back.',
  'تم استلام طلبك ✓': 'Order received ✓', 'تتبع طلبك': 'Track your order', 'ابعت تفاصيل الطلب للفرع (واتساب)': 'Send order details to the branch (WhatsApp)', 'جديدة': 'New', 'قيد التحضير': 'Preparing', 'في الطريق': 'On the way', 'تم التسليم': 'Delivered', 'تم إلغاء الطلب': 'Order cancelled', 'لسه معندكش طلبات': 'You have no orders yet',
  'مرحبا بعودتك': 'Welcome back', 'أهلاً بك': 'Welcome', 'سجّل دخولك برقم الموبايل وكلمة المرور': 'Log in with your mobile number and password', 'أنشئ حسابك برقم الموبايل وكلمة المرور': 'Create your account with mobile number and password', 'كلمة المرور': 'Password', 'نسيت كلمة المرور ؟': 'Forgot password?',
  'إنشاء الحساب': 'Create account', 'ليس لديك حساب ؟': "Don't have an account?", 'لديك حساب بالفعل ؟': 'Already have an account?', 'حسابي': 'My account', 'تتبع طلباتي': 'Track my orders', 'تسجيل خروج': 'Logout', 'اختر الفرع': 'Choose branch', 'اطلب من أقرب فرع ليك': 'Order from your nearest branch', 'لا توجد فروع متاحة حاليًا': 'No branches available now',
  'المتجر قيد التجهيز': 'Store coming soon', 'الصفحة غير موجودة': 'Page not found', 'الرجوع للرئيسية': 'Back to home', 'عروض وخصومات': 'Offers & discounts', 'البحث': 'Search', 'قريبًا': 'Soon',
  'تمت الإضافة للسلة ✓': 'Added to cart ✓', 'التطبيق قريبًا': 'App coming soon', 'تم تسجيل الخروج': 'Logged out', 'أهلاً بك ✓': 'Welcome ✓', 'رقم الموبايل غير صحيح': 'Invalid mobile number', 'كلمة المرور لازم 6 حروف على الأقل': 'Password must be at least 6 characters',
  'الرقم ده مسجّل قبل كده': 'This number is already registered', 'الرقم أو كلمة المرور غلط': 'Wrong number or password', 'اختر الفرع الأقرب لك': 'Choose your nearest branch', 'اكتب الاسم بالكامل': 'Enter your full name', 'اكتب المنطقة والعنوان بالتفصيل': 'Enter the area and detailed address',
  'الكود غير صحيح': 'Invalid code', 'الكود منتهي': 'Code expired', 'تم تطبيق الكود ✓': 'Code applied ✓', 'اكتب كود الخصم': 'Enter a discount code', 'سياسة الاسترجاع': 'Return policy'
};
const RULES = [[/^(\d+) منتج$/, '$1 items'], [/^(.+) ج\.م$/, '$1 EGP'], [/^خصم (\d+)%$/, '$1% off'], [/^طلب #(\d+)$/, 'Order #$1'], [/^الكمية المتاحة (\d+) فقط$/, 'Only $1 available'], [/^اتصل بنا: (.+)$/, 'Call us: $1'], [/^(\d+) تقييم$/, '$1 reviews'], [/^خصم (.+)$/, 'Discount $1'], [/^الخط الساخن: (.+)$/, 'Hotline: $1'], [/^نتائج البحث عن "(.*)"$/, 'Search results for "$1"']];
CATS.forEach(c => { if (c.en) D[c.name] = c.en; (c.subs || []).forEach((s, i) => { if (c.subsEn && c.subsEn[i]) D[s] = c.subsEn[i]; }); });
PRODS.forEach(p => { if (p.en) D[p.name] = p.en; });
function T(t) { if (D[t] !== undefined) return D[t]; for (const [re, to] of RULES) if (re.test(t)) return t.replace(re, to); return t; }
function tr(root) {                                  // بيترجم النصوص لو اللغة إنجليزي (الرسم دايمًا بيبدأ عربي)
  if (lang !== 'en' || !root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (!t) continue; const r = T(t); if (r !== t) n.nodeValue = n.nodeValue.replace(t, () => r); }
  root.querySelectorAll('[placeholder]').forEach(el => { const v = el.getAttribute('placeholder'), r = T(v); if (r !== v) el.setAttribute('placeholder', r); });
}
function applyLang() {
  const en = lang === 'en', r = document.documentElement; r.lang = lang; r.dir = en ? 'ltr' : 'rtl'; document.title = en ? 'Helw El Malek' : 'حلو الملك';
  head(); foot(); route();
}

/* ======== 11) تشغيل ======== */
if (!CATS.length && !PRODS.length && !window.REMOTE) toast('تعذّر تحميل البيانات');
applyLang();
