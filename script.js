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
  menu: ic('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  chev: ic('<path d="m15 6-6 6 6 6"/>'),
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
  share: ic('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>'),
  wa: ic('<path d="M3 21l1.5-5A9 9 0 1 1 8 19.5z"/><path d="M9 9c0 3 3 6 6 6l1-2-2-1-1 .8c-1-.5-2-1.5-2.5-2.5l.8-1-1-2z"/>')
};
// أيقونات ملونة ومليانة للهيدر (ذهبي / أخضر / أعلام) — واضحة على الموبايل
const fi = (p, c = '') => `<svg viewBox="0 0 24 24" class="${c}" aria-hidden="true">${p}</svg>`;
Object.assign(I, {
  userC: fi('<circle cx="12" cy="7.5" r="4.6" fill="#E0A82E"/><path d="M3 21.5c0-5 4-8.2 9-8.2s9 3.2 9 8.2z" fill="#E0A82E"/>'),
  basketC: fi('<path d="M8.5 9.5l3-6M15.5 9.5l-3-6" stroke="#E0A82E" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M2.5 9.5h19l-2.2 10.6a1.5 1.5 0 0 1-1.5 1.2H6.2a1.5 1.5 0 0 1-1.5-1.2z" fill="#E0A82E"/><path d="M8.5 13v5M12 13v5M15.5 13v5" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>'),
  pinC: fi('<path d="M12 22s7.5-6.6 7.5-12.2A7.5 7.5 0 0 0 4.5 9.8C4.5 15.4 12 22 12 22z" fill="#7FA52A"/><circle cx="12" cy="9.8" r="3" fill="#fff"/>'),
  flagUS: `<svg viewBox="0 0 30 20" class="flag" aria-hidden="true"><rect width="30" height="20" fill="#fff"/><g fill="#C8283C"><rect width="30" height="2"/><rect y="4" width="30" height="2"/><rect y="8" width="30" height="2"/><rect y="12" width="30" height="2"/><rect y="16" width="30" height="2"/><rect y="18" width="30" height="2"/></g><rect width="13" height="11" fill="#2B3C85"/><g fill="#fff"><circle cx="3" cy="3" r=".9"/><circle cx="6.5" cy="3" r=".9"/><circle cx="10" cy="3" r=".9"/><circle cx="4.7" cy="6" r=".9"/><circle cx="8.2" cy="6" r=".9"/><circle cx="3" cy="9" r=".9"/><circle cx="6.5" cy="9" r=".9"/><circle cx="10" cy="9" r=".9"/></g></svg>`,
  flagEG: `<svg viewBox="0 0 30 20" class="flag" aria-hidden="true"><rect width="30" height="6.7" fill="#CE1126"/><rect y="6.7" width="30" height="6.6" fill="#fff"/><rect y="13.3" width="30" height="6.7" fill="#111"/><circle cx="15" cy="10" r="2.2" fill="#C09300"/></svg>`,
  google: `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`
});
// أيقونة بديلة للمنتج/القسم لو مفيش صورة (بتتحدد من اسم القسم)
const catIco = (n = '') => /شرق|مصر/.test(n) ? 'cookie' : /غرب/.test(n) ? 'cake' : /ميكس|هدايا/.test(n) ? 'gift' : /مخبوز/.test(n) ? 'bread' : /شيكولات|شوكولات/.test(n) ? 'candy' : /كحك|مولد|عيد/.test(n) ? 'moon' : /ايس|آيس/.test(n) ? 'ice' : /عروض|خصوم/.test(n) ? 'pct' : 'cookie';

/* ======== 3) البيانات (جاية من Firebase عن طريق index.html) ======== */
// الأقسام والفروع والإعدادات + منتجات الرئيسية بس بتتحمّل أول ما الموقع يفتح.
// باقي المنتجات بتتحمّل لما الزائر يدخل القسم / يبحث / يفتح المنتج، وبتتخزن على جهازه (بتتجدد لو الأدمن غيّر حاجة أو بعد 4 ساعات).
const R = window.REMOTE || { cats: [], prods: [], branches: [], settings: {}, brand: {}, loy: {} };
const CATS = R.cats, BR = R.branches.filter(b => b.active !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const CFG = R.settings || {}, BRAND = R.brand || {}, LOY = R.loy || {}, HOT = BRAND.hotline || '16312';
const SEC = [['الأكثر رواجًا', 'الأكثر مبيعًا'], ['المنتجات الجديده', 'جديدنا'], ['تشكيلة مميزة', 'تشكيلة مميزة']];
const PEN = {};                                    // أسماء المنتجات بالإنجليزي (للترجمة)
const PCK = 'hm_pc_v3', TTL = 4 * 3600 * 1000, CV = R.v || 0;
let PC = { v: CV, items: {}, done: {} };           // items: المنتجات المخزنة، done: أوقات تحميل كل قسم
try { const x = JSON.parse(localStorage.getItem(PCK) || 'null'); if (x && x.v === CV && x.items) PC = x; } catch (e) {}
const PRODS = [], PM = new Map(), MISSING = new Set();
const normP = (p) => ({ ...p, price: +p.price, oldPrice: p.oldPrice ? +p.oldPrice : 0 });
function addProds(list) {                          // بيضيف/يحدّث المنتجات في الذاكرة (والمخفي بيتشال)
  list.forEach(p => {
    if (!p || !p.id) return; PC.items[p.id] = p;
    const old = PM.get(p.id);
    if (p.active === false) { if (old) { PM.delete(p.id); PRODS.splice(PRODS.indexOf(old), 1); } return; }
    if (p.en) PEN[p.name] = p.en;
    const n = normP(p);
    if (old) Object.assign(old, n); else { PM.set(p.id, n); PRODS.push(n); }
  });
}
let pcT;
function savePC() { clearTimeout(pcT); pcT = setTimeout(() => { try { localStorage.setItem(PCK, JSON.stringify(PC)); } catch (e) { PC.done = {}; } }, 400); }
const isFresh = (k) => PC.done[k] && Date.now() - PC.done[k] < TTL;
const docRows = (s) => s.docs.map(d => ({ id: d.id, ...d.data() }));
async function loadQ(k, q) {                       // بيحمّل مجموعة منتجات مرة واحدة بس (ومحدّش بيعيد التحميل لو لسه طازة)
  if (isFresh('all') || isFresh(k)) return;
  addProds(docRows(await q())); PC.done[k] = Date.now(); savePC();
}
const prodsCol = () => db.collection('products');
const ensureCat = (n) => loadQ('c:' + n, () => prodsCol().where('cat', '==', n).get());
const ensureAll = () => loadQ('all', () => prodsCol().get());
const ensureOff = () => loadQ('off', () => prodsCol().where('oldPrice', '>', 0).get());
const ensureSec = (k) => loadQ('s:' + k, () => prodsCol().where('section', '==', k).get());
async function fetchIds(ids) {                     // جلب منتجات بالـ id (10 في المرة) من غير ما نبص على الكاش
  const FP = firebase.firestore.FieldPath.documentId();
  for (let i = 0; i < ids.length; i += 10) {
    const part = ids.slice(i, i + 10), s = await prodsCol().where(FP, 'in', part).get(), got = new Set();
    addProds(s.docs.map(d => { got.add(d.id); return { id: d.id, ...d.data() }; }));
    part.forEach(id => { if (!got.has(id)) addProds([{ id, active: false }]); if (!PM.has(id)) MISSING.add(id); else MISSING.delete(id); });
  }
  savePC();
}
const ensureIds = (ids) => { const miss = [...new Set(ids)].filter(id => id && !PM.has(id) && !MISSING.has(id)); return miss.length ? fetchIds(miss) : Promise.resolve(); };
const refetchIds = (ids) => fetchIds([...new Set(ids)].filter(Boolean));
addProds(Object.values(PC.items)); addProds(R.prods || []);
if (R.t) SEC.forEach(([k]) => { PC.done['s:' + k] = R.t; });
const byId = (id) => PM.get(id);
const sortO = (a) => [...a].sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
const disc = (p) => p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
const out = (p) => p.stock === 0;
const isOffersCat = (n) => /عروض|خصوم/.test(n);

/* ======== 4) الحالة: المستخدم والسلة والمفضلة والفرع ======== */
let lang = localStorage.getItem('hm_lang') || 'ar';
let user = null, hasOrders = false, afterAuth = null, qv = '', curCat = '', slideT, unTrack = null;
let cart = store.get('hm_cart2', []);            // [{id, size, qty}]
let favs = store.get('hm_favs', []);
let myBranch = localStorage.getItem('hm_branch') || '';
let co = { method: 'delivery', name: '', phone: '', gov: 'القاهرة', area: '', addr: '', branch: myBranch, code: '', offer: null, note: '', gift: false, giftMsg: '', when: 'asap', whenAt: '', reward: null };
let L = {}, PD = {}, navTok = 0;                              // حالة صفحة القسم وصفحة المنتج
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
  if (user) { clearTimeout(toggleFav.t); toggleFav.t = setTimeout(() => db.collection('users').doc(user.uid).update({ favs: favs.slice(0, 100) }).catch(() => {}), 800); }
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
  ${BRAND.announce ? `<div class="annc">${esc(BRAND.announce)}</div>` : ''}<div class="topbar"><span>${I.phone} اتصل بنا: ${esc(HOT)}</span><span>${I.truck} مدة التوصيل من 45 إلى 60 دقيقة</span><span>${I.card} طرق دفع سهلة</span></div>
  <header class="header"><div class="wrap hrow">
    <button class="burger" data-act="menu" aria-label="menu">${I.menu}</button>
    <a class="logo" href="#/">${logoHtml()}</a>
    <form class="search" id="sf"><input id="q" placeholder="ابحث عن..." value="${esc(qv)}"><button aria-label="search">${I.search}</button></form>
    <div class="acts">
      ${user ? `<a class="act" href="#" data-act="acct">${I.userC}<span class="nm">${esc(user.name || user.phone || user.email)}</span></a>`
             : `<a class="act" href="#" data-act="login">${I.userC}<span>تسجيل الدخول</span></a><a class="act" href="#" data-act="register"><span>إنشاء حساب</span></a>`}
      ${hasOrders ? `<a class="act" href="#/track"><span>تتبع الطلب</span></a>` : ''}
      <a class="act" href="#/cart">${I.basketC}<span>${cartCount()} منتج</span></a>
      <a class="act" href="#" data-act="branch">${I.pinC}<span>${esc(branchName() || 'اختر الفرع')}</span><em>تغيير</em></a>
      <a class="act" href="#" data-act="lang">${lang === 'ar' ? I.flagUS : I.flagEG}<span>${lang === 'ar' ? 'English' : 'العربية'}</span></a>
    </div></div>
    <nav class="nav"><ul class="wrap">${CATS.map(c => `<li><a href="${navHref(c)}" class="${(isOffersCat(c.name) ? curCat === '__offers' : curCat === c.name) ? 'on' : ''}">${esc(c.name)}</a></li>`).join('')}</ul></nav>
  </header>`;
  tr($('#top'));
}
function foot() {
  const so = BRAND.social || {}, ico = [['fb', 'fb'], ['ig', 'ig'], ['tt', 'tt'], ['wa', 'wa']];
  $('#foot').innerHTML = `<div class="wrap fgrid">
    <div class="fb"><a class="logo" href="#/">${logoHtml()}</a><p>أجود الحلويات الشرقية والغربية والمخبوزات، بمكونات طازة وتوصيل لحد باب بيتك.</p></div>
    <div><h4>روابط سريعة</h4><a href="#/">الرئيسية</a><a href="#/all">المنيو</a><a href="#/offers">العروض</a><a href="#/branches">فروعنا</a><a href="#/account">حسابي</a></div>
    <div><h4>خدمة العملاء</h4><a href="#/track">تتبع الطلب</a><a href="#/pg/refund">سياسة الاسترجاع</a><a href="#/pg/faq">الأسئلة الشائعة</a><a href="#/pg/contact">اتصل بنا</a></div>
    <div><h4>حمّل التطبيق</h4><div class="apps"><a href="#" data-act="soon">Google Play</a><a href="#" data-act="soon">App Store</a></div>
      <div class="soc">${ico.filter(([k]) => so[k]).map(([k, i]) => `<a href="${esc(k === 'wa' ? 'https://wa.me/' + String(so[k]).replace(/\D/g, '') : so[k])}" target="_blank" rel="noopener">${I[i]}</a>`).join('')}</div></div>
  </div><div class="wrap fcopy"><span>جميع الحقوق محفوظة لدى حلو الملك 2026</span><span>الخط الساخن: ${esc(HOT)}</span></div>`;
  tr($('#foot'));
}

/* ======== 6) كارت المنتج ======== */
const cld = (u, w) => /res\.cloudinary\.com\/[^/]+\/image\/upload\/v?\d/.test(u || '') ? u.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${w}/`) : u;   // Cloudinary بيصغّر الصورة ويحوّلها WebP تلقائيًا
const pic = (p, w = 420) => p.img ? `<img src="${esc(cld(p.img, w))}" alt="${esc(p.name)}" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'">` : `<span class="ph">${I[catIco(p.cat)]}</span>`;
function card(p) {
  const d = disc(p), badge = d ? `خصم ${d}%` : (p.badge || '');
  return `<article class="pc" data-go="#/p/${p.id}"><div class="pi">${badge ? `<span class="bd">${esc(badge)}</span>` : ''}
    <button class="hr ${favs.includes(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="fav">${I.heart}</button>${pic(p)}</div>
    <div class="pb"><h3>${esc(p.name)}</h3><small>${esc(p.unit || '')}</small>
    <div class="pr"><span class="pp">${p.oldPrice > p.price ? `<s>${fmt(p.oldPrice)}</s>` : ''}<b>${fmt(p.price)} ج.م</b></span>
    <button class="cb" data-add="${p.id}" ${out(p) ? 'disabled' : ''} aria-label="add">${I.cartp}</button></div></div></article>`;
}

/* كاروسيل أفقي: صف منتجات بيتحرك بالجنب (سحب بالصباع أو الأسهم) */
const carousel = (a) => `<div class="car"><button class="cn p" data-act="cnav" data-d="-1" aria-label="prev">${I.chev}</button><div class="cs">${a.map(card).join('')}</div><button class="cn n" data-act="cnav" data-d="1" aria-label="next">${I.chev}</button></div>`;

/* ======== 7) الراوتر والعرض ======== */
function render(html, keep) {
  clearInterval(slideT); $('#view').innerHTML = html; tr($('#view'));
  if (!keep) window.scrollTo(0, 0);
}
const crumb = (...a) => `<div class="wrap crumb">${a.map((x, i) => i < a.length - 1 ? `<a href="${x[1]}">${x[0]}</a> / ` : `<b>${x[0]}</b>`).join('')}</div>`;
const nf = () => render(`<div class="wrap empty"><h2>الصفحة غير موجودة</h2><a class="gbtn" style="display:inline-block" href="#/">الرجوع للرئيسية</a></div>`);
function route() {
  navTok++;
  if (unTrack) { unTrack(); unTrack = null; }
  const [a, ...r] = location.hash.replace(/^#\/?/, '').split('/'), b = decodeURIComponent(r.join('/') || '');
  curCat = a === 'c' ? b : a === 'offers' ? '__offers' : '';
  head(); window.scrollTo(0, 0);
  ({ '': home, c: () => catView(b), p: () => productRoute(b), account: () => accountView(b), cart: cartView, track, s: () => search(b), sec: () => secView(b), all: allView, offers: offersView, branches: branchesView, pg: () => pgView(b) }[a] || nf)();
}
window.addEventListener('hashchange', route);

/* ---------- الرئيسية ---------- */
let slideI = 0;                                        // رقم البانر الظاهر دلوقتي
function fitSlider() {                                 // طول البانر = طول الصورة الظاهرة بالظبط (من غير قص)
  const s = $('#slides'); if (!s) return;
  const im = s.children[slideI] && s.children[slideI].querySelector('img');
  if (im && im.clientHeight) s.parentElement.style.height = im.clientHeight + 'px';
}
window.addEventListener('resize', fitSlider);
document.addEventListener('load', (e) => { if (e.target.tagName === 'IMG' && e.target.closest('#slides')) fitSlider(); }, true);
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
  const rows = SEC.map(([k, t]) => { const it = sortO(PRODS.filter(p => p.section === k)); return it.length ? `<section class="wrap rowsec"><div class="rh"><h2>${t}</h2><a href="#/sec/${enc(k)}">عرض الكل</a></div>${carousel(it.slice(0, 12))}</section>` : ''; });
  const feat = `<section class="wrap feat">${[['truck', 'توصيل سريع', 'من 45 إلى 60 دقيقة'], ['shield', 'مكونات أصلية', 'زبدة وفواكه طازة'], ['card', 'دفع سهل', 'كاش عند الاستلام'], ['store', 'فروع كثير', 'اطلب من أقرب فرع ليك']].map(([i, t, s]) => `<div class="ft"><div><b>${t}</b><small>${s}</small></div>${I[i]}</div>`).join('')}</section>`;
  if (!PRODS.length && !CATS.length) return render(`<div class="wrap empty"><h2>المتجر قيد التجهيز</h2><p>هنكون معاكم قريبًا.</p></div>`);
  render(hero + (rows[0] || '') + (rows[1] || '') + (rows[2] || '') + recentRow() + cats + feat);
  slideI = 0; setTimeout(fitSlider, 60);
  if (bn.length > 1) { let i = 0; slideT = setInterval(() => ACT.dot({ dataset: { i: i = (i + 1) % bn.length } }), 5000); }
}

/* ---------- صفحات القوائم (قسم / بحث / عروض / الكل) ---------- */
const skel = () => render(`<div class="wrap"><div class="skl" style="height:34px;width:220px;margin:22px 0 14px"></div><div class="g4c">${'<div class="skl" style="height:280px"></div>'.repeat(8)}</div></div>`);
const loadErr = () => render(`<div class="wrap empty"><h2>تعذّر تحميل المنتجات</h2><p>اتأكد من الإنترنت وحاول تاني.</p><button class="gbtn" style="display:inline-block" data-act="retry">إعادة المحاولة</button></div>`);
async function showList(freshKey, loader, build) {        // يحمّل المنتجات المطلوبة بس (لو مش متخزنة) وبعدين يعرض الصفحة
  const my = navTok;
  if (!(isFresh('all') || isFresh(freshKey))) skel();
  try { await loader(); } catch (e) { if (my === navTok) loadErr(); return; }
  if (my === navTok) build();
}
const secName = (k) => (SEC.find(s => s[0] === k) || [0, k])[1];
const catView = (n) => isOffersCat(n) ? offersView() : showList('c:' + n, () => ensureCat(n), () => list('c' + n, n, PRODS.filter(p => p.cat === n), 'sub', [['الرئيسية', '#/'], ['المنيو', '#/all'], [esc(n)]]));
const allView = () => showList('all', ensureAll, () => list('all', 'المنيو', PRODS, 'cat', [['الرئيسية', '#/'], ['المنيو']]));
const secView = (k) => showList('s:' + k, () => ensureSec(k), () => list('sec' + k, secName(k), PRODS.filter(p => p.section === k), 'cat', [['الرئيسية', '#/'], ['المنيو', '#/all'], [esc(secName(k))]]));
const search = (q) => showList('all', ensureAll, () => list('s' + q, 'نتائج البحث عن "' + q + '"', PRODS.filter(p => (p.name + ' ' + (p.en || '') + ' ' + p.cat + ' ' + (p.sub || '')).toLowerCase().includes(q.toLowerCase())), 'cat', [['الرئيسية', '#/'], ['البحث']]));
const offersView = () => showList('off', ensureOff, () => list('offers', 'عروض وخصومات', PRODS.filter(p => disc(p) > 0), 'cat', [['الرئيسية', '#/'], ['عروض وخصومات']]));
function list(key, title, base, fk, cr) {
  if (L.key !== key) L = { key, f: [], min: null, max: null, av: [], sort: 'pop', page: 1 };
  base = sortO(base); LAST = [key, title, base, fk, cr];
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
async function productRoute(id) {                    // لو المنتج مش متحمّل (لينك مباشر) بنجيبه لوحده بقراءة واحدة
  const my = navTok;
  if (!byId(id)) {
    render(`<div class="wrap"><div class="skl" style="height:34px;width:240px;margin:22px 0 14px"></div><div class="skl" style="height:380px"></div></div>`);
    try { const d = await prodsCol().doc(id).get(); if (d.exists) { addProds([{ id: d.id, ...d.data() }]); savePC(); } else MISSING.add(id); } catch (e) { if (my === navTok) loadErr(); return; }
    if (my !== navTok) return;
  }
  if (byId(id)) rvAdd(id);
  product(id);
}
function product(id) {
  const p = byId(id); if (!p) return nf();
  if (PD.id !== id) PD = { id, size: (p.sizes || [])[0]?.label || '', qty: 1, tab: 'd' };
  const sz = (p.sizes || []).find(s => s.label === PD.size), price = sz ? +sz.price : p.price, d = disc(p);
  const sim = PRODS.filter(x => x.cat === p.cat && x.id !== id).slice(0, 5);
  render(`${crumb(['الرئيسية', '#/'], [esc(p.cat), '#/c/' + enc(p.cat)], [esc(p.name)])}<div class="wrap"><div class="pgd">
   <div class="gal">${d || p.badge ? `<span class="bd">${esc(d ? 'خصم ' + d + '%' : p.badge)}</span>` : ''}${pic(p, 800)}</div>
   <div class="dt"><h1>${esc(p.name)}</h1>
    <div class="rt">${p.reviews > 0 ? `<span class="stars">${'★'.repeat(Math.round(p.rating || 0))}${'☆'.repeat(5 - Math.round(p.rating || 0))}</span><span>${p.rating} (${p.reviews} تقييم)</span>` : '<span>لا توجد تقييمات</span>'}</div>
    <div class="big">${p.oldPrice > price ? `<s style="font-size:20px;color:var(--mut)">${fmt(p.oldPrice)}</s> ` : ''}${fmt(price)} ج.م ${p.unit ? `<small>/ ${esc(p.unit)}</small>` : ''}</div>
    ${p.desc ? `<p class="ds">${esc(p.desc)}</p>` : ''}
    ${(p.sizes || []).length ? `<h5>الحجم</h5><div class="szs">${p.sizes.map(s => `<button class="sz ${s.label === PD.size ? 'on' : ''}" data-act="size" data-v="${esc(s.label)}">${esc(s.label)}</button>`).join('')}</div>` : ''}
    <h5>الكمية</h5><div class="qty"><button data-act="pq" data-d="1">+</button><b>${PD.qty}</b><button data-act="pq" data-d="-1">−</button></div>
    <div class="dact"><button class="gbtn" data-act="padd" ${out(p) ? 'disabled' : ''}>${out(p) ? 'نفد المخزون' : 'أضف للسلة'} ${I.cartp}</button><button class="fv ${favs.includes(id) ? 'on' : ''}" data-pfav="${id}" data-act="pfav">${I.heart}</button><button class="fv" data-act="share" aria-label="share">${I.share}</button></div>
    <div class="inf"><span>${I.truck} توصيل من 45 لـ 60 دقيقة</span><span>${I.shield} مكونات طازة</span></div></div></div>
   <div class="tabs"><nav>${[['d', 'الوصف'], ['i', 'المكونات'], ['r', 'التقييمات']].map(([k, t]) => `<button class="${PD.tab === k ? 'on' : ''}" data-act="tab" data-v="${k}">${t}</button>`).join('')}</nav>
    <p>${esc(PD.tab === 'd' ? (p.desc || 'لا يوجد وصف.') : PD.tab === 'i' ? (p.ingredients || 'لا توجد مكونات مسجّلة.') : (p.reviews > 0 ? p.reviews + ' تقييم' : 'لا توجد تقييمات حتى الآن.'))}</p></div>
   ${sim.length ? `<section class="rowsec"><div class="rh"><h2>منتجات مشابهة</h2></div>${carousel(sim)}</section>` : ''}</div>`, PD.keep);
  PD.keep = false;
}

/* ---------- السلة وإتمام الطلب ---------- */
function syncForm() {                              // بنقرا الخانات قبل أي إعادة رسم عشان ميضيعش اللي اتكتب
  const g = (id) => { const e = $('#' + id); return e ? e.value : null; };
  [['name', 'f-name'], ['phone', 'f-phone'], ['gov', 'f-gov'], ['area', 'f-area'], ['addr', 'f-addr'], ['branch', 'f-br'], ['code', 'f-code'], ['note', 'f-note'], ['giftMsg', 'f-gm'], ['whenAt', 'f-when']].forEach(([k, id]) => { const v = g(id); if (v !== null) co[k] = v; });
  const gc = $('#f-gift'); if (gc) co.gift = gc.checked;
}

/* --- الولاء والعروض --- */
const pad2 = (n) => String(n).padStart(2, '0');
const localDT = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
const nowHM = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const hm = (s) => { const [h, m] = String(s || '').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
function branchState(b) {                          // true مفتوح / false مقفول / null مفيش مواعيد
  if (!b || !b.open || !b.close) return null;
  const n = nowHM(), a = hm(b.open), z = hm(b.close); return a <= z ? (n >= a && n < z) : (n >= a || n < z);
}
const LOYON = () => LOY.on !== false && (+LOY.earnPer > 0 || (LOY.rewards || []).length > 0);
const avail = () => user ? Math.max(0, (+user.points || 0) - (+user.pend || 0)) : 0;
const tierOf = () => { const sp = user ? +user.totalSpent || 0 : 0; return (LOY.tiers || []).filter(x => sp >= +x.min).sort((a, b) => b.min - a.min)[0] || null; };
const earnFor = (amt) => (LOY.on !== false && +LOY.earnPer > 0) ? Math.floor(Math.max(0, amt) / +LOY.earnPer) : 0;
let OFFERS = null;                                 // كل العروض (بتتحمّل مرة وتتخزن)
async function loadOffers() {
  if (OFFERS) return OFFERS;
  const k = 'hm_offers_v3', c = store.get(k, null);
  if (c && c.v === CV && Date.now() - c.t < TTL) return (OFFERS = c.list);
  OFFERS = docRows(await db.collection('offers').get());
  try { store.set(k, { v: CV, t: Date.now(), list: OFFERS }); } catch (e) {}
  return OFFERS;
}
function offerWhy(o, sub) {                        // سبب إن العرض مش صالح (أو '' لو سليم)
  if (!o || o.active === false) return 'الكود غير صحيح';
  if (o.endsAt && new Date(o.endsAt + 'T23:59:59') < new Date()) return 'الكود منتهي';
  if (o.minOrder && sub < o.minOrder) return 'الحد الأدنى للطلب ' + o.minOrder + ' ج.م';
  if (o.maxUses && (o.used || 0) >= o.maxUses) return 'العرض خلص';
  if (o.firstOrder && hasOrders) return 'العرض ده لأول طلب بس';
  if (o.hFrom && o.hTo) { const n = nowHM(), a = hm(o.hFrom), b = hm(o.hTo), ok = a <= b ? (n >= a && n <= b) : (n >= a || n <= b); if (!ok) return 'العرض شغال من ' + o.hFrom + ' إلى ' + o.hTo; }
  return '';
}
const offerAmt = (o, sub) => o.type === 'percent' ? Math.min(sub, Math.round(sub * (+o.value || 0) / 100)) : o.type === 'fixed' ? Math.min(sub, +o.value || 0) : 0;
function bestAuto(sub) {                           // أحسن خصم تلقائي (خاص بالعميل / مستواه / عرض تلقائي)
  const c = [];
  if (user && +user.discountPct > 0) c.push({ label: 'خصم خاص بيك', pct: +user.discountPct, kind: 'vip' });
  const t = user && tierOf(); if (t && +t.pct > 0) c.push({ label: 'مستوى ' + t.name, pct: +t.pct, kind: 'tier' });
  (OFFERS || []).filter(o => o.auto && !offerWhy(o, sub)).forEach(o => c.push({ label: o.title || o.code, o, kind: 'auto' }));
  let best = null;
  c.forEach(x => {
    const amt = x.pct ? Math.min(sub, Math.round(sub * x.pct / 100)) : offerAmt(x.o, sub), ship = !x.pct && x.o.type === 'ship', sc = amt + (ship ? 0.001 : 0);
    if (!best || sc > best.sc) best = { ...x, amt, ship, sc };
  });
  return best && (best.amt > 0 || best.ship) ? best : null;
}
function pricing() {                               // كل حسابات الطلب في مكان واحد
  const sub = subtotal(), br = branchOf(co.branch), pick = co.method === 'pickup';
  let fee = pick ? 0 : (br ? +br.fee || 0 : 0), d = 0, label = '', kind = '', free = false, oid = '', cid = '';
  if (co.offer) { const w = offerWhy(co.offer, sub); if (w) { toast(w); co.offer = null; co.code = ''; } }
  if (co.offer) { d = offerAmt(co.offer, sub); label = co.offer.code; kind = 'code'; free = co.offer.type === 'ship'; if (co.offer.kind === 'coupon') cid = co.offer.id; else oid = co.offer.id || ''; }
  else { const a = bestAuto(sub); if (a) { d = a.amt; label = a.label; kind = a.kind; free = !!a.ship; oid = a.o ? a.o.id : ''; } }
  let rd = 0;
  if (co.reward && !(user && LOYON() && avail() >= co.reward.pts)) co.reward = null;
  const rw = co.reward;
  if (rw) { if (rw.type === 'fixed') rd = Math.min(sub - d, +rw.value || 0); else if (rw.type === 'percent') rd = Math.min(sub - d, Math.round((sub - d) * (+rw.value || 0) / 100)); else if (rw.type === 'ship') free = true; }
  const after = Math.max(0, sub - d - rd), thr = +LOY.freeShipOver || 0;
  if (!pick && (free || (thr > 0 && after >= thr))) fee = 0;
  return { sub, d, rd, label, kind, fee, after, total: after + fee, pick, thr, br, oid, cid };
}
async function applyCode() {
  syncForm(); const c = (co.code || '').trim().toUpperCase(); if (!c) return toast('اكتب كود الخصم');
  try {
    const list = await loadOffers(); let o = list.find(x => String(x.code || '').toUpperCase() === c), kind = 'offer';
    if (!o && user) {                              // كود خاص بالعميل ده بس
      const s = await db.collection('coupons').where('uid', '==', user.uid).where('code', '==', c).get();
      const d = docRows(s).find(x => !x.used); if (d) { o = d; kind = 'coupon'; }
    }
    if (!o) return toast(user ? 'الكود غير صحيح' : 'الكود غير صحيح (لو كود خاص بيك سجّل دخولك الأول)');
    const why = offerWhy(o, subtotal()); if (why) return toast(why);
    if (o.perUser && kind === 'offer') {
      if (!user) return authDrawer('login', applyCode);
      const s = await db.collection('orders').where('uid', '==', user.uid).where('code', '==', c).limit(1).get();
      if (s.docs.some(d => d.data().status !== 'ملغي')) return toast('استخدمت الكود ده قبل كده');
    }
    co.offer = { id: o.id, kind, code: o.code, type: o.type, value: +o.value || 0, minOrder: +o.minOrder || 0, endsAt: o.endsAt || '', maxUses: +o.maxUses || 0, used: +o.used || 0, firstOrder: !!o.firstOrder, hFrom: o.hFrom || '', hTo: o.hTo || '' };
    co.code = o.code; cartView(); toast('تم تطبيق الكود ✓');
  } catch (e) { toast('تعذّر التحقق من الكود'); }
}

async function cartView() {
  const my = navTok;
  try { await ensureIds(cart.map(c => c.id)); } catch (e) {}
  try { await loadOffers(); } catch (e) {}
  try { if (user && Date.now() - (user.t || 0) > 600000) await refreshUser(); } catch (e) {}
  if (my !== navTok) return;
  const ls = lines();
  if (!ls.length) return render(`<div class="wrap empty"><h2>السلة فاضية</h2><p>ضيف منتجات وارجع هنا.</p><a class="gbtn" style="display:inline-block" href="#/all">تصفح المنيو</a></div>`);
  if (user && !co.phone) co.phone = user.phone || '';
  if (user && !co.name) co.name = user.name || '';
  const P = pricing(), pick = P.pick, br = P.br, bs = branchState(br), earn = earnFor(P.after), adr = (user && user.addresses) || [];
  const bar = (!pick && P.thr > 0) ? (P.after >= P.thr ? `<div class="shb ok">${I.truck}<span>توصيلك مجاني ✓</span></div>` : `<div class="shb"><div class="sbt"><i style="width:${Math.min(100, P.after / P.thr * 100)}%"></i></div><small>باقي ${fmt(P.thr - P.after)} ج.م وتوصيلك ببلاش</small></div>`) : '';
  const rws = LOY.rewards || [];
  const rwBox = (user && LOYON() && rws.length) ? `<div class="rwb"><div class="rwh"><span>${I.crown} نقاطك</span><b>${fmt(avail())}</b></div>${co.reward
    ? `<div class="rwo"><span>${esc(co.reward.name)} <small>(−${co.reward.pts} نقطة)</small></span><button class="bt" data-act="rwoff">إلغاء</button></div>`
    : (rws.map((r, i) => avail() >= r.pts ? `<button class="chip" data-act="rwon" data-i="${i}">${esc(r.name)} · ${r.pts} نقطة</button>` : '').join('') || '<small>اجمع نقاط أكتر عشان تستبدلها بمكافأة.</small>')}</div>` : '';
  render(`<div class="wrap"><div class="steps"><span class="dn"><b>1</b>السلة</span><hr><span class="on"><b>2</b>بيانات التوصيل</span><hr><span><b>3</b>الدفع</span></div>
  <div class="cl"><div>
   <div class="bx"><button class="bt" data-act="cclear">إفراغ السلة</button><h3>سلة المشتريات (${ls.length})</h3>
    ${ls.map((l, i) => `<div class="ln"><div class="lt">${l.p.img ? `<img src="${esc(cld(l.p.img, 200))}" alt="">` : I[catIco(l.p.cat)]}</div>
     <div class="li"><b>${esc(l.p.name)}</b><small>${esc(l.size || l.p.unit || '')}</small><div>${fmt(l.price)} ج.م</div></div>
     <div class="qty"><button data-act="cq" data-i="${i}" data-d="1">+</button><b>${l.qty}</b><button data-act="cq" data-i="${i}" data-d="-1">−</button></div>
     <div class="lp">${fmt(l.price * l.qty)} ج.م</div><button class="rm" data-act="cdel" data-i="${i}" aria-label="remove">${I.trash}</button></div>`).join('')}</div>
   <div class="bx"><h3>بيانات التوصيل</h3>
    <div class="opts"><div class="op ${!pick ? 'on' : ''}" data-act="method" data-v="delivery"><span style="display:flex;gap:12px;align-items:center">${I.truck}<span><b>توصيل للمنزل</b><small>من 45 لـ 60 دقيقة</small></span></span><i></i></div>
     <div class="op ${pick ? 'on' : ''}" data-act="method" data-v="pickup"><span style="display:flex;gap:12px;align-items:center">${I.store}<span><b>استلام من الفرع</b><small>جاهز في 30 دقيقة</small></span></span><i></i></div></div>
    ${adr.length && !pick ? `<label class="f">عناويني المحفوظة</label><div class="chips" style="margin-bottom:14px">${adr.map((a, i) => `<button type="button" class="chip" data-act="useaddr" data-i="${i}">${esc(a.label || 'عنوان')}</button>`).join('')}</div>` : ''}
    <div class="fg"><div><label class="f">الاسم بالكامل</label><input class="in" id="f-name" placeholder="أحمد محمد" value="${esc(co.name)}"></div>
     <div><label class="f">رقم الموبايل</label><input class="in" id="f-phone" inputmode="tel" placeholder="01xxxxxxxxx" value="${esc(co.phone)}"></div>
     <div class="fl"><label class="f">الفرع الأقرب لك (إجباري)</label><select class="in" id="f-br"><option value="">— اختر الفرع —</option>${BR.map(b => `<option value="${b.id}" ${b.id === co.branch ? 'selected' : ''}>${esc(b.name)}${b.area ? ' — ' + esc(b.area) : ''}</option>`).join('')}</select></div>
     ${bs === false ? `<div class="fl"><div class="warn">الفرع مقفول دلوقتي (بيفتح ${esc(br.open)}) — طلبك هيتجهز أول ما يفتح.</div></div>` : ''}
     ${pick ? '' : `<div><label class="f">المحافظة</label><input class="in" id="f-gov" value="${esc(co.gov)}"></div><div><label class="f">المنطقة</label><input class="in" id="f-area" placeholder="مثال: مدينة نصر" value="${esc(co.area)}"></div>
     <div class="fl"><label class="f">العنوان بالتفصيل</label><input class="in" id="f-addr" placeholder="شارع، رقم العمارة، الدور، الشقة" value="${esc(co.addr)}"></div>`}
     <div class="fl"><label class="f">ميعاد ${pick ? 'الاستلام' : 'التوصيل'}</label><div class="chips"><button type="button" class="chip ${co.when !== 'later' ? 'on' : ''}" data-act="when" data-v="asap">في أقرب وقت</button><button type="button" class="chip ${co.when === 'later' ? 'on' : ''}" data-act="when" data-v="later">اختار ميعاد</button></div>
      ${co.when === 'later' ? `<input class="in" id="f-when" type="datetime-local" min="${localDT(new Date(Date.now() + 3600e3))}" value="${esc(co.whenAt)}" style="margin-top:10px">` : ''}</div>
     <div class="fl"><label class="f">ملاحظات على الطلب (اختياري)</label><textarea class="in" id="f-note" rows="2" placeholder="مثال: بدون مكسرات">${esc(co.note)}</textarea></div>
     <div class="fl"><label class="ck" style="margin:0"><input type="checkbox" id="f-gift" data-act="giftt" ${co.gift ? 'checked' : ''}><i></i><span>الطلب هدية 🎁 (نكتب لك كارت)</span></label>
      ${co.gift ? `<textarea class="in" id="f-gm" rows="2" placeholder="اكتب رسالة الكارت" style="margin-top:10px">${esc(co.giftMsg)}</textarea>` : ''}</div></div></div>
   <div class="bx"><h3>طريقة الدفع</h3><div class="opts" style="grid-template-columns:repeat(3,1fr)">
     <div class="op on"><span style="display:flex;gap:10px;align-items:center">${I.wallet}<span><b>كاش</b><small>عند الاستلام</small></span></span><i></i></div>
     <div class="op off"><span style="display:flex;gap:10px;align-items:center">${I.card}<span><b>بطاقة بنكية</b><small>غير متوفر حاليًا</small></span></span><i></i></div>
     <div class="op off"><span style="display:flex;gap:10px;align-items:center">${I.wallet}<span><b>محفظة إلكترونية</b><small>غير متوفر حاليًا</small></span></span><i></i></div></div></div>
  </div>
  <aside class="bx sm"><h3>ملخص الطلب</h3><div class="cp"><input class="in" id="f-code" placeholder="كود الخصم" value="${esc(co.code)}"><button data-act="apply">تطبيق</button></div>
   ${rwBox}${bar}
   <div class="sr"><span>المجموع الفرعي</span><span>${fmt(P.sub)} ج.م</span></div>
   ${P.d ? `<div class="sr g"><span>${P.kind === 'code' ? 'خصم ' + esc(P.label) : esc(P.label)}</span><span>- ${fmt(P.d)} ج.م</span></div>` : ''}
   ${P.rd ? `<div class="sr g"><span>${esc(co.reward.name)}</span><span>- ${fmt(P.rd)} ج.م</span></div>` : ''}
   ${pick ? '' : `<div class="sr"><span>رسوم التوصيل</span><span>${P.fee ? fmt(P.fee) + ' ج.م' : 'مجاني'}</span></div>`}
   <div class="sr tt"><span>الإجمالي</span><span>${fmt(P.total)} ج.م</span></div>
   ${earn > 0 ? `<div class="erp">${I.crown}<span>هتكسب ${earn} نقطة بعد تسليم الطلب</span></div>` : (!user && LOYON() ? `<div class="erp">${I.crown}<span>سجّل دخولك واكسب نقاط على طلبك</span></div>` : '')}
   <div class="err" id="cerr"></div>
   <button class="gbtn" style="width:100%;margin-top:6px" data-act="confirm">تأكيد الطلب</button><div class="sec">بياناتك محمية ومدفوعاتك آمنة</div></aside></div></div>`, true);
}
async function confirmOrder() {
  syncForm(); const err = (m) => { const e = $('#cerr'); if (e) e.textContent = lang === 'en' ? T(m) : m; };
  if (!user) return authDrawer('login', confirmOrder);
  const br = branchOf(co.branch), pick = co.method === 'pickup';
  if (!br) return err('اختر الفرع الأقرب لك');
  if (!co.name.trim()) return err('اكتب الاسم بالكامل');
  if (!/^01[0125]\d{8}$/.test(co.phone.trim())) return err('رقم الموبايل غير صحيح');
  if (!pick && (!co.area.trim() || !co.addr.trim())) return err('اكتب المنطقة والعنوان بالتفصيل');
  if (co.when === 'later' && (!co.whenAt || new Date(co.whenAt) < new Date())) return err('اختار ميعاد صحيح');
  const bt = document.querySelector('[data-act="confirm"]'); if (bt) bt.disabled = true;
  const unlock = () => { const b = document.querySelector('[data-act="confirm"]'); if (b) b.disabled = false; };
  const before = pricing().total;
  try { await refetchIds(cart.map(c => c.id)); } catch (e) {}      // نتأكد من السعر والمخزون الحاليين قبل الإرسال
  const gone = cart.filter(c => !byId(c.id));
  if (gone.length) { cart = cart.filter(c => byId(c.id)); saveCart(); cartView(); return toast('في منتجات مبقتش متاحة واتشالت من السلة'); }
  const ls = lines(); if (!ls.length) { cartView(); return; }
  for (const l of ls) if (out(l.p) || (l.p.stock != null && l.qty > l.p.stock)) { unlock(); return err('«' + l.p.name + '» المتاح منه ' + (l.p.stock || 0) + ' فقط'); }
  const P = pricing();
  if (Math.round(P.total) !== Math.round(before)) { cartView(); return toast('الأسعار اتحدّثت، راجع الطلب وأكّد تاني'); }
  const rw = co.reward, orderNo = 1000 + Math.floor(Date.now() / 1000) % 1000000;
  const order = { uid: user.uid, name: co.name.trim(), phone: co.phone.trim(), method: co.method, branchId: br.id, branchName: br.name,
    gov: pick ? '' : co.gov, area: pick ? '' : co.area.trim(), addr: pick ? '' : co.addr.trim(),
    items: ls.map(l => ({ id: l.id, size: l.size, name: l.name, cat: l.p.cat, price: l.price, qty: l.qty })),
    subtotal: P.sub, discount: P.d + P.rd, code: P.kind === 'code' ? P.label : '', discLabel: P.label || '', discKind: P.kind || '', offerId: P.oid || '', couponId: P.cid || '',
    rewardId: rw ? rw.id : '', rewardName: rw ? rw.name : '', rewardType: rw ? rw.type : '', rewardDisc: P.rd, pointsUsed: rw ? +rw.pts : 0,
    fee: P.fee, total: P.total, pay: 'cash', note: (co.note || '').trim(), gift: !!co.gift, giftMsg: co.gift ? (co.giftMsg || '').trim() : '', when: co.when === 'later' ? co.whenAt : '',
    status: 'جديدة', orderNo, createdAt: TS() };
  try { await db.collection('orders').add(order); } catch (e) { unlock(); return err('تعذّر إرسال الطلب، حاول تاني'); }
  if (rw) user.pend = (+user.pend || 0) + (+rw.pts || 0);
  MYORD = null; cart = []; co.offer = null; co.code = ''; co.reward = null; co.note = ''; co.gift = false; co.giftMsg = ''; co.when = 'asap'; co.whenAt = ''; saveCart(); hasOrders = true; head();
  const msg = `طلب جديد #${orderNo}%0A${order.items.map(i => `${i.name} × ${i.qty}`).join('%0A')}%0Aالإجمالي: ${order.total} ج.م%0Aالاسم: ${order.name}%0Aالموبايل: ${order.phone}${pick ? '%0Aاستلام من الفرع' : '%0Aالعنوان: ' + order.area + ' - ' + order.addr}${order.when ? '%0Aالميعاد: ' + order.when.replace('T', ' ') : ''}${order.note ? '%0Aملاحظات: ' + order.note : ''}${order.gift ? '%0Aهدية 🎁: ' + (order.giftMsg || 'بدون رسالة') : ''}${order.rewardName ? '%0Aمكافأة: ' + order.rewardName : ''}`;
  let wa = String(br.phone || '').replace(/\D/g, ''); if (wa.startsWith('0')) wa = '20' + wa.slice(1);
  const pts = earnFor(P.after);
  render(`<div class="wrap empty"><h2>تم استلام طلبك ✓</h2><p>رقم الطلب #${orderNo} — فرع ${esc(br.name)}</p><p>هنتواصل معاك على ${esc(order.phone)}</p>${pts > 0 ? `<p class="erp" style="justify-content:center">${I.crown}<span>هتكسب ${pts} نقطة بعد تسليم الطلب</span></p>` : ''}
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
  render(`<div class="wrap">${crumb(['الرئيسية', '#/'], ['فروعنا'])}<div class="lh"><h1>فروعنا</h1></div>${BR.length ? BR.map(b => `<div class="tk"><h3><span>${esc(b.name)}</span></h3><small>${esc(b.area || '')}${b.open && b.close ? ' — ' + esc(b.open) + ' إلى ' + esc(b.close) : ''}</small>${b.phone ? `<div><a class="dl" href="tel:${esc(b.phone)}">${esc(b.phone)}</a></div>` : ''}</div>`).join('') : '<div class="empty">قريبًا</div>'}</div>`);
}
function pgView(k) {
  const P = { refund: ['سياسة الاسترجاع', 'لو في أي مشكلة في طلبك كلمنا خلال 24 ساعة من الاستلام وهنراجعها معاك.'], faq: ['الأسئلة الشائعة', 'مدة التوصيل من 45 إلى 60 دقيقة. الدفع كاش عند الاستلام حاليًا. تقدر تتابع طلبك من "تتبع الطلب".'], contact: ['اتصل بنا', 'الخط الساخن: ' + HOT] }[k];
  if (!P) return nf(); render(`<div class="wrap">${crumb(['الرئيسية', '#/'], [P[0]])}<div class="tk"><h3>${P[0]}</h3><p style="margin-top:10px">${esc(P[1])}</p></div></div>`);
}

/* ======== 8) الدخول (رقم الموبايل + كلمة المرور بس) ======== */
function authDrawer(tab = 'login', cb) {
  if (cb) afterAuth = cb; const reg = tab === 'register';
  $('#drawer').innerHTML = `<div class="dov" data-act="dclose"></div><div class="dpn"><button class="dx" data-act="dclose">×</button>
   <h2>${reg ? 'أهلاً بك' : 'مرحبا بعودتك'}</h2><p class="dsub">${reg ? 'أنشئ حسابك برقم الموبايل أو بحساب جوجل' : 'سجّل دخولك برقم الموبايل أو بحساب جوجل'}</p>
   <button type="button" class="gg" id="ggbtn" data-act="google">${I.google}<span>${reg ? 'التسجيل بحساب جوجل' : 'الدخول بحساب جوجل'}</span></button>
   <div class="or"><span>أو</span></div>
   <form id="af" data-tab="${tab}">${reg ? '<label>الاسم</label><input name="name" autocomplete="name" placeholder="اكتب اسمك" required>' : ''}<label>رقم الموبايل</label><input name="phone" inputmode="tel" placeholder="01XXXXXXXXX" autocomplete="username" required>
   <label>كلمة المرور</label><div class="pw"><input name="pass" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" required><button type="button" class="eye" data-act="eye">${I.eye}</button></div>
   ${reg ? '<label>كود دعوة (اختياري)</label><input name="ref" placeholder="مثال: HMXXXXX" autocomplete="off" style="text-transform:uppercase">' : '<a href="#" class="dl" data-act="forgot">نسيت كلمة المرور ؟</a>'}<div class="err" id="aerr"></div>
   <button class="gbtn" id="abtn">${reg ? 'إنشاء الحساب' : 'تسجيل الدخول'}</button></form>
   <p class="dfoot">${reg ? 'لديك حساب بالفعل ؟' : 'ليس لديك حساب ؟'} <a href="#" class="dl" data-act="${reg ? 'login' : 'register'}">${reg ? 'تسجيل الدخول' : 'إنشاء حساب'}</a></p></div>`;
  $('#drawer').classList.add('open'); tr($('#drawer'));
}
function acctDrawer() {
  $('#drawer').innerHTML = `<div class="dov" data-act="dclose"></div><div class="dpn"><button class="dx" data-act="dclose">×</button><h2>حسابي</h2><p class="dsub"><b>${esc(user.name || '')}</b><br><span dir="ltr">${esc(user.phone || user.email || '')}</span></p>
   <a class="gbtn" href="#/track" data-act="dclose">تتبع طلباتي</a><button class="gbtn w" style="width:100%;margin-top:12px;border:1px solid var(--navy)" data-act="logout">تسجيل خروج</button></div>`;
  $('#drawer').classList.add('open'); tr($('#drawer'));
}
function branchDrawer() {
  $('#drawer').innerHTML = `<div class="dov" data-act="dclose"></div><div class="dpn"><button class="dx" data-act="dclose">×</button><h2>اختر الفرع</h2><p class="dsub">اطلب من أقرب فرع ليك</p>
   ${BR.map(b => `<button class="bo ${b.id === myBranch ? 'on' : ''}" data-act="pick" data-id="${b.id}"><b>${esc(b.name)}</b><small>${esc(b.area || '')}${branchState(b) === null ? '' : branchState(b) ? ' — مفتوح الآن' : ' — مقفول الآن'}</small></button>`).join('') || '<div class="empty">لا توجد فروع متاحة حاليًا</div>'}</div>`;
  $('#drawer').classList.add('open'); tr($('#drawer'));
}
function menuDrawer() {                               // قائمة الهمبورجر (الأقسام) في الموبايل
  $('#drawer').innerHTML = `<div class="dov" data-act="dclose"></div><div class="dpn mn"><button class="dx" data-act="dclose">×</button><h2>القائمة</h2>
   <a class="mi" href="#/" data-act="dclose">الرئيسية</a><a class="mi" href="#/all" data-act="dclose">المنيو</a>
   ${CATS.map(c => `<a class="mi" href="${navHref(c)}" data-act="dclose">${esc(c.name)}</a>`).join('')}
   <a class="mi" href="#/branches" data-act="dclose">فروعنا</a></div>`;
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
      const nm = (f.name || '').trim();
      if (nm.length < 2) return err('اكتب اسمك (حرفين على الأقل)');
      if (f.pass.length < 6) return err('كلمة المرور لازم 6 حروف على الأقل');
      const c = await auth.createUserWithEmailAndPassword(phoneEmail(phone), f.pass);
      try { await c.user.updateProfile({ displayName: nm }); } catch {}                   // الاسم بيتخزن في حساب Firebase نفسه
      user = { ...(user || { uid: c.user.uid, phone }), name: nm }; head();                // يظهر الاسم في الهيدر فورًا
      let refBy = ''; const rc = (f.ref || '').trim().toUpperCase();
      if (rc) { try { const rs = await db.collection('refs').doc(rc).get(); if (rs.exists && rs.data().uid !== c.user.uid) refBy = rc; } catch (x) {} }
      await db.collection('users').doc(c.user.uid).set({ name: nm, phone, createdAt: TS(), ...(refBy ? { refBy } : {}) });
      user.addresses = []; user.points = 0; user.t = Date.now();
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
const PH_DOMAIN = 'helwelmalek.app';
async function googleLogin() {                         // تسجيل / دخول بحساب جوجل
  const err = (m) => { const e = $('#aerr'); if (e) e.textContent = lang === 'en' ? T(m) : m; };
  const b = $('#ggbtn'); if (b) b.disabled = true;
  try {
    const prov = new firebase.auth.GoogleAuthProvider(); prov.setCustomParameters({ prompt: 'select_account' });
    let c;
    try { c = await auth.signInWithPopup(prov); }
    catch (ex) {
      if (ex.code === 'auth/popup-blocked' || ex.code === 'auth/operation-not-supported-in-this-environment') { await auth.signInWithRedirect(prov); return; }
      throw ex;
    }
    const a = await db.collection('admins').doc(c.user.uid).get();
    if (a.exists) { location.href = 'admin.html'; return; }
    ACT.dclose(); toast('أهلاً بك ✓');
    if (afterAuth) { const fn = afterAuth; afterAuth = null; setTimeout(fn, 600); }
  } catch (ex) {
    const c = ex.code || '';
    if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return;
    err(c === 'auth/network-request-failed' ? 'مشكلة في الاتصال بالإنترنت' : /unauthorized-domain|operation-not-allowed/.test(c) ? 'تسجيل جوجل غير مفعّل حاليًا' : 'حصلت مشكلة، حاول تاني');
  } finally { const b2 = $('#ggbtn'); if (b2) b2.disabled = false; }
}
/* ======== 8-ب) حسابي: طلباتي / نقاطي وكوبوناتي / عناويني / المفضلة / بياناتي ======== */
const usersDoc = () => db.collection('users').doc(user.uid);
async function loadUserDoc(u) {                    // قراءة واحدة لمستند العميل (نقاط، عناوين، مفضلة...)
  const em = u.email || '', isPh = em.endsWith('@' + PH_DOMAIN);
  try {
    const r = db.collection('users').doc(u.uid); let d = await r.get(), x;
    if (d.exists) x = d.data();
    else if (!isPh) { x = { name: u.displayName || '', email: em, phone: '', createdAt: TS() }; await r.set(x); }   // حساب جوجل جديد
    else return;                                    // حساب موبايل: المستند بيتعمل في خطوة التسجيل
    Object.assign(user, { name: x.name || user.name, addresses: x.addresses || [], points: +x.points || 0, totalSpent: +x.totalSpent || 0, ordersCount: +x.ordersCount || 0, discountPct: +x.discountPct || 0, refCode: x.refCode || '', t: Date.now() });
    const remote = x.favs || [], merged = [...new Set([...remote, ...favs])].slice(0, 100);   // دمج مفضلة الجهاز مع مفضلة الحساب
    favs = merged; store.set('hm_favs', favs); if (merged.length !== remote.length) r.update({ favs }).catch(() => {});
  } catch (e) {}
}
const refreshUser = async () => { if (auth.currentUser && user) { await loadUserDoc(auth.currentUser); head(); } };

const rvList = () => store.get('hm_rv', []);
const rvAdd = (id) => { try { store.set('hm_rv', [id, ...rvList().filter(x => x !== id)].slice(0, 12)); } catch (e) {} };
function recentRow() {                              // شاهدتها مؤخرًا: من المنتجات المخزنة بس (من غير قراءات)
  const a = rvList().map(byId).filter(Boolean).slice(0, 10);
  return a.length ? `<section class="wrap rowsec"><div class="rh"><h2>شاهدتها مؤخرًا</h2></div>${carousel(a)}</section>` : '';
}

let AC = { tab: 'orders', n: 10 }, MYORD = null;
const ATABS = [['orders', 'طلباتي'], ['rewards', 'نقاطي وكوبوناتي'], ['addr', 'عناويني'], ['favs', 'المفضلة'], ['me', 'بياناتي']];
const STC = { 'جديدة': 'n', 'قيد التحضير': 'p', 'في الطريق': 'w', 'تم التسليم': 'd', 'ملغي': 'x' };
async function loadMyOrders(force) {
  if (MYORD && !force && Date.now() - MYORD.t < 120000) return MYORD.list;
  const list = docRows(await db.collection('orders').where('uid', '==', user.uid).get()).sort((a, b) => (b.createdAt?.seconds || 9e9) - (a.createdAt?.seconds || 9e9));
  MYORD = { t: Date.now(), list }; return list;
}
function accountView(tab) {
  if (!user) return render(`<div class="wrap empty"><h2>حسابي</h2><p>سجّل دخولك عشان تشوف طلباتك ونقاطك وعناوينك.</p><button class="gbtn" style="display:inline-block" data-act="login">تسجيل الدخول</button></div>`);
  AC.tab = ATABS.some(t => t[0] === tab) ? tab : 'orders';
  const t = tierOf(), my = navTok;
  render(`<div class="wrap">${crumb(['الرئيسية', '#/'], ['حسابي'])}<div class="acc">
   <aside class="acm"><div class="acu"><span class="av">${esc(String(user.name || '؟').trim().charAt(0))}</span><div><b>${esc(user.name || 'عميلنا')}</b><small dir="ltr">${esc(user.phone || user.email || '')}</small></div></div>
    ${LOYON() ? `<div class="pts">${I.crown}<div><b>${fmt(avail())} نقطة</b><small>${t ? 'مستوى ' + esc(t.name) : 'اجمع نقاط واستبدلها'}</small></div></div>` : ''}
    <nav>${ATABS.map(([k, n]) => `<a class="${AC.tab === k ? 'on' : ''}" href="#/account/${k}">${n}</a>`).join('')}<a href="#/track">تتبع الطلب المباشر</a><button data-act="logout">تسجيل خروج</button></nav></aside>
   <section class="acb" id="acb"><div class="skl" style="height:260px"></div></section></div></div>`);
  const paint = { orders: acOrders, rewards: acRewards, addr: acAddr, favs: acFavs, me: acMe }[AC.tab];
  Promise.resolve().then(paint).then(h => { if (my === navTok && $('#acb')) { $('#acb').innerHTML = h; tr($('#acb')); } }).catch(() => { if (my === navTok && $('#acb')) $('#acb').innerHTML = '<div class="empty"><h2>تعذّر التحميل</h2><p>اتأكد من الإنترنت وحاول تاني.</p></div>'; });
}
const setAcb = (h) => { const b = $('#acb'); if (b) { b.innerHTML = h; tr(b); } };
async function acOrders() {
  const list = await loadMyOrders();
  if (!list.length) return `<div class="bx"><div class="empty" style="padding:30px"><h2>لسه معندكش طلبات</h2><p>اطلب أول طلب وابدأ تجمع نقاط.</p><a class="gbtn" style="display:inline-block" href="#/all">تصفح المنيو</a></div></div>`;
  const shown = list.slice(0, AC.n);
  return `<div class="bx"><h3>طلباتي (${list.length})</h3>${shown.map(o => `<div class="oc"><div class="och"><b>طلب #${o.orderNo}</b><span class="stc ${STC[o.status] || 'n'}">${esc(o.status)}</span></div>
   <small>${esc(o.branchName || '')} — ${o.createdAt ? new Date(o.createdAt.seconds * 1000).toLocaleString('ar-EG') : ''}</small>
   <p>${(o.items || []).map(i => esc(i.name) + ' × ' + i.qty).join(' ، ')}</p>
   <div class="och"><b>${fmt(o.total)} ج.م</b><span><a class="chip" href="#/track">تتبع</a> <button class="chip on" data-act="reorder" data-id="${o.id}">اطلب تاني</button></span></div></div>`).join('')}
   ${list.length > AC.n ? `<button class="gbtn w" style="width:100%;border:1px solid var(--navy);margin-top:6px" data-act="moreord">عرض المزيد</button>` : ''}</div>`;
}
async function makeRefCode() {                      // كود دعوة شخصي (بيتعمل مرة واحدة)
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let k = 0; k < 5; k++) {
    const c = 'HM' + Array.from({ length: 5 }, () => A[Math.floor(Math.random() * A.length)]).join('');
    try { await db.collection('refs').doc(c).set({ uid: user.uid }); await usersDoc().update({ refCode: c }); user.refCode = c; return c; } catch (e) {}
  }
  return '';
}
async function acRewards() {
  await refreshUser();
  const on = LOYON(), t = tierOf(), sp = +user.totalSpent || 0, next = (LOY.tiers || []).filter(x => +x.min > sp).sort((a, b) => a.min - b.min)[0];
  let cps = [], offs = [];
  try { [cps, offs] = await Promise.all([db.collection('coupons').where('uid', '==', user.uid).get().then(docRows), loadOffers()]); } catch (e) {}
  const okDate = (o) => !o.endsAt || new Date(o.endsAt + 'T23:59:59') >= new Date();
  cps = cps.filter(c => !c.used && okDate(c)); offs = offs.filter(o => o.active !== false && !o.auto && okDate(o) && !(o.maxUses && (o.used || 0) >= o.maxUses));
  const val = (o) => o.type === 'percent' ? o.value + '%' : o.type === 'ship' ? 'توصيل مجاني' : fmt(o.value) + ' ج.م';
  const cpHtml = (o, mine) => `<div class="cpn"><div><b>${esc(o.title || o.code)}</b><small>خصم ${val(o)}${o.minOrder ? ' — أقل طلب ' + fmt(o.minOrder) + ' ج.م' : ''}${o.endsAt ? ' — لحد ' + esc(o.endsAt) : ''}</small></div><button class="chip on" data-act="usecode" data-code="${esc(o.code)}">${mine ? 'كود خاص: ' : ''}${esc(o.code)}</button></div>`;
  let ref = '';
  if (on && +LOY.refBonus > 0) {
    const c = user.refCode || await makeRefCode(), link = location.origin + location.pathname;
    ref = c ? `<div class="bx"><h3>ادعُ صاحبك واكسبوا نقاط</h3><p class="note">اصحابك يسجلوا بالكود ده، وبعد تسليم أول طلب ليهم كل واحد فيكم ياخد <b>${+LOY.refBonus}</b> نقطة.</p>
      <div class="refc"><b dir="ltr">${esc(c)}</b><button class="chip on" data-act="copyref" data-c="${esc(c)}">نسخ</button><a class="chip" target="_blank" rel="noopener" href="https://wa.me/?text=${enc('جرّب حلو الملك! سجّل بكود الدعوة ' + c + ' ونكسب نقاط احنا الاتنين: ' + link)}">مشاركة واتساب</a></div></div>` : '';
  }
  return `${on ? `<div class="bx"><h3>نقاطي</h3><div class="ptb"><div><small>رصيدك</small><b>${fmt(avail())}</b></div><div><small>إجمالي مشترياتك</small><b>${fmt(sp)} ج.م</b></div><div><small>مستواك</small><b>${t ? esc(t.name) : '—'}</b></div></div>
    ${next ? `<div class="shb"><div class="sbt"><i style="width:${Math.min(100, sp / next.min * 100)}%"></i></div><small>باقي ${fmt(next.min - sp)} ج.م وتوصل لمستوى ${esc(next.name)}${+next.pct ? ' (خصم ' + next.pct + '%)' : ''}</small></div>` : ''}
    ${+LOY.earnPer > 0 ? `<p class="note">بتكسب نقطة على كل ${fmt(LOY.earnPer)} ج.م بعد تسليم الطلب.</p>` : ''}
    ${(LOY.rewards || []).length ? `<h3 style="margin:16px 0 8px;font-size:17px">المكافآت (استبدلها وقت الطلب)</h3>${LOY.rewards.map(r => `<div class="cpn"><div><b>${esc(r.name)}</b></div><span class="chip ${avail() >= r.pts ? 'on' : ''}">${r.pts} نقطة</span></div>`).join('')}` : ''}</div>` : ''}
   <div class="bx"><h3>كوبوناتي</h3>${cps.length ? cps.map(c => cpHtml(c, true)).join('') : ''}${offs.length ? offs.map(o => cpHtml(o, false)).join('') : ''}${!cps.length && !offs.length ? '<div class="empty" style="padding:20px">مفيش كوبونات متاحة حاليًا</div>' : ''}</div>${ref}`;
}
function acAddr() {
  const a = user.addresses || [];
  return `<div class="bx"><h3>عناويني (${a.length}/5)</h3>${a.map((x, i) => `<div class="cpn"><div><b>${esc(x.label || 'عنوان')}${x.def ? ' <span class="chip on" style="padding:1px 8px">الافتراضي</span>' : ''}</b><small>${esc(x.gov || '')} - ${esc(x.area || '')} - ${esc(x.addr || '')}</small></div>
    <span>${x.def ? '' : `<button class="chip" data-act="addrdef" data-i="${i}">افتراضي</button> `}<button class="chip" data-act="addrdel" data-i="${i}">حذف</button></span></div>`).join('') || '<div class="empty" style="padding:20px">لسه مفيش عناوين محفوظة</div>'}</div>
   ${a.length < 5 ? `<div class="bx"><h3>إضافة عنوان</h3><form id="addrf"><div class="fg"><div><label class="f">الاسم (البيت / الشغل...)</label><input class="in" name="label" placeholder="البيت" required></div><div><label class="f">المحافظة</label><input class="in" name="gov" value="القاهرة" required></div>
    <div><label class="f">المنطقة</label><input class="in" name="area" required></div><div class="fl"><label class="f">العنوان بالتفصيل</label><input class="in" name="addr" placeholder="شارع، رقم العمارة، الدور، الشقة" required></div></div><div class="err" id="aferr"></div><button class="gbtn" style="margin-top:6px">حفظ العنوان</button></form></div>` : ''}`;
}
async function acFavs() {
  await ensureIds(favs);
  const a = favs.map(byId).filter(Boolean);
  return a.length ? `<div class="bx"><h3>المفضلة (${a.length})</h3><div class="g4c fv4">${a.map(card).join('')}</div></div>` : `<div class="bx"><div class="empty" style="padding:30px"><h2>مفيش منتجات في المفضلة</h2><p>اضغط على القلب في أي منتج عشان تحفظه هنا.</p></div></div>`;
}
function acMe() {
  const pw = auth.currentUser && auth.currentUser.providerData.some(p => p.providerId === 'password');
  return `<div class="bx"><h3>بياناتي</h3><form id="mef"><div class="fg"><div><label class="f">الاسم</label><input class="in" name="name" value="${esc(user.name || '')}" required></div><div><label class="f">${user.phone ? 'رقم الموبايل' : 'الإيميل'}</label><input class="in" value="${esc(user.phone || user.email)}" disabled dir="ltr"></div></div><div class="err" id="meerr"></div><button class="gbtn" style="margin-top:6px">حفظ</button></form></div>
   ${pw ? `<div class="bx"><h3>تغيير كلمة المرور</h3><form id="pwf"><div class="fg"><div><label class="f">الحالية</label><input class="in" name="cur" type="password" required></div><div><label class="f">الجديدة (6 حروف على الأقل)</label><input class="in" name="nw" type="password" minlength="6" required></div></div><div class="err" id="pwerr"></div><button class="gbtn" style="margin-top:6px">تغيير كلمة المرور</button></form></div>` : ''}
   <div class="bx"><h3>اللغة</h3><button class="gbtn w" style="border:1px solid var(--navy);display:inline-block" data-act="lang">${lang === 'ar' ? 'English' : 'العربية'}</button></div>`;
}
document.addEventListener('submit', async (e) => {   // فورمات صفحة حسابي
  const id = e.target.id; if (!['addrf', 'mef', 'pwf'].includes(id)) return; e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target)), er = (k, m) => { const x = $('#' + k); if (x) x.textContent = lang === 'en' ? T(m) : m; };
  try {
    if (id === 'addrf') {
      const a = [...(user.addresses || [])]; if (a.length >= 5) return er('aferr', 'أقصى عدد عناوين 5');
      a.push({ id: Date.now().toString(36), label: f.label.trim(), gov: f.gov.trim(), area: f.area.trim(), addr: f.addr.trim(), def: !a.length });
      await usersDoc().update({ addresses: a }); user.addresses = a; toast('تم حفظ العنوان ✓'); setAcb(acAddr());
    } else if (id === 'mef') {
      const nm = f.name.trim(); if (nm.length < 2) return er('meerr', 'اكتب اسمك (حرفين على الأقل)');
      await usersDoc().update({ name: nm }); try { await auth.currentUser.updateProfile({ displayName: nm }); } catch (x) {} user.name = nm; head(); toast('تم الحفظ ✓');
    } else {
      const u = auth.currentUser; await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, f.cur)); await u.updatePassword(f.nw); e.target.reset(); toast('تم تغيير كلمة المرور ✓');
    }
  } catch (x) { const c = x.code || ''; er(id === 'addrf' ? 'aferr' : id === 'mef' ? 'meerr' : 'pwerr', /wrong|invalid-credential|invalid-login/.test(c) ? 'كلمة المرور الحالية غلط' : c === 'auth/weak-password' ? 'كلمة المرور ضعيفة' : 'حصلت مشكلة، حاول تاني'); }
});
const saveAddrs = async (a) => { await usersDoc().update({ addresses: a }); user.addresses = a; setAcb(acAddr()); };

auth.onAuthStateChanged(async (u) => {
  if (!u) { user = null; hasOrders = false; MYORD = null; head(); return; }
  const em = u.email || '', isPh = em.endsWith('@' + PH_DOMAIN);      // حساب رقم موبايل ولا حساب جوجل
  user = { uid: u.uid, phone: isPh ? em.split('@')[0] : '', email: isPh ? '' : em, name: u.displayName || (user && user.uid === u.uid ? user.name : '') || '', addresses: (user && user.uid === u.uid && user.addresses) || [], points: 0, totalSpent: 0, pend: 0, t: 0 };
  await loadUserDoc(u);
  try { hasOrders = !(await db.collection('orders').where('uid', '==', u.uid).limit(1).get()).empty; } catch (e) {}
  user.name = u.displayName || user.name; head();
  if (location.hash.startsWith('#/cart')) cartView(); else if (location.hash.startsWith('#/account')) route();
});

/* ======== 9) الأوامر (كل الأزرار) ======== */
const ACT = {
  menu: menuDrawer,
  cnav: (el) => { const c = el.parentElement.querySelector('.cs'); c.scrollBy({ left: +el.dataset.d * c.clientWidth * .8 * (lang === 'ar' ? -1 : 1), behavior: 'smooth' }); },
  google: googleLogin, login: () => authDrawer('login'), register: () => authDrawer('register'), acct: acctDrawer, branch: branchDrawer,
  dclose: () => $('#drawer').classList.remove('open'),
  eye: (el) => { const i = el.parentElement.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; },
  forgot: () => toast('لاستعادة كلمة المرور اتصل بنا على ' + HOT),
  pick: (el) => { myBranch = el.dataset.id; co.branch = myBranch; localStorage.setItem('hm_branch', myBranch); ACT.dclose(); head(); if (location.hash.startsWith('#/cart')) cartView(); },
  logout: async () => { await auth.signOut(); ACT.dclose(); toast('تم تسجيل الخروج'); if (location.hash.startsWith('#/track')) route(); },
  lang: () => { lang = lang === 'ar' ? 'en' : 'ar'; localStorage.setItem('hm_lang', lang); applyLang(); },
  soon: () => toast('التطبيق قريبًا'),
  usecode: (el) => { co.code = el.dataset.code; location.hash = '#/cart'; setTimeout(() => cart.length ? applyCode() : toast('ضيف منتجات للسلة الأول'), 300); },
  dot: (el) => { const s = $('#slides'); if (!s) return; const i = slideI = +el.dataset.i; s.style.transform = `translateX(${(lang === 'ar' ? 1 : -1) * i * 100}%)`; document.querySelectorAll('#dots i').forEach((d, k) => d.classList.toggle('on', k === i)); fitSlider(); },
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
Object.assign(ACT, {
  acct: () => { location.hash = '#/account'; },
  retry: () => route(),
  share: () => { const p = byId(PD.id), u = location.href; if (navigator.share) navigator.share({ title: p ? p.name : 'حلو الملك', url: u }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => toast('تم نسخ اللينك ✓')).catch(() => toast(u)); else toast(u); },
  when: (el) => { syncForm(); co.when = el.dataset.v; cartView(); },
  giftt: () => { syncForm(); cartView(); },
  useaddr: (el) => { syncForm(); const a = (user.addresses || [])[+el.dataset.i]; if (a) { co.gov = a.gov || co.gov; co.area = a.area || ''; co.addr = a.addr || ''; } cartView(); },
  rwon: (el) => { syncForm(); const r = (LOY.rewards || [])[+el.dataset.i]; if (r && avail() >= r.pts) co.reward = r; cartView(); },
  rwoff: () => { syncForm(); co.reward = null; cartView(); },
  moreord: () => { AC.n += 10; acOrders().then(setAcb); },
  copyref: (el) => { const c = el.dataset.c; if (navigator.clipboard) navigator.clipboard.writeText(c).then(() => toast('تم نسخ الكود ✓')).catch(() => toast(c)); else toast(c); },
  addrdel: async (el) => { const a = (user.addresses || []).filter((_, i) => i !== +el.dataset.i); if (a.length && !a.some(x => x.def)) a[0].def = true; try { await saveAddrs(a); } catch (e) { toast('تعذّر الحذف'); } },
  addrdef: async (el) => { const a = (user.addresses || []).map((x, i) => ({ ...x, def: i === +el.dataset.i })); try { await saveAddrs(a); } catch (e) { toast('تعذّر الحفظ'); } },
  reorder: async (el) => {
    const o = (MYORD ? MYORD.list : []).find(x => x.id === el.dataset.id); if (!o) return;
    try { await ensureIds(o.items.map(i => i.id)); } catch (e) { return toast('تعذّر تحميل المنتجات'); }
    let n = 0;
    o.items.forEach(i => {
      const p = byId(i.id); if (!p || out(p)) return;
      const sz = (p.sizes || []).some(s => s.label === i.size) ? i.size : ((p.sizes || [])[0] || {}).label || '', q = Math.min(i.qty, p.stock ?? 99); if (q < 1) return;
      const c = cart.find(x => x.id === i.id && x.size === sz); if (c) c.qty = Math.min(c.qty + q, p.stock ?? 999); else cart.push({ id: i.id, size: sz, qty: q }); n++;
    });
    saveCart(); toast(n ? 'اتضافت ' + n + ' صنف للسلة ✓' : 'الأصناف دي مش متاحة حاليًا'); if (n) location.hash = '#/cart';
  }
});

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
  'القائمة': 'Menu', 'اتصل بنا': 'Call us', 'مدة التوصيل من 45 إلى 60 دقيقة': 'Delivery time 45 - 60 minutes', 'طرق دفع سهلة': 'Easy payment methods', 'ابحث عن...': 'Search for...',
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
  'الاسم': 'Name', 'اكتب اسمك': 'Enter your name', 'أو': 'or', 'التسجيل بحساب جوجل': 'Sign up with Google', 'الدخول بحساب جوجل': 'Continue with Google', 'أنشئ حسابك برقم الموبايل أو بحساب جوجل': 'Create your account with mobile number or Google', 'سجّل دخولك برقم الموبايل أو بحساب جوجل': 'Log in with mobile number or Google', 'اكتب اسمك (حرفين على الأقل)': 'Enter your name (at least 2 characters)', 'تسجيل جوجل غير مفعّل حاليًا': 'Google sign-in is not available right now',
  'الكود غير صحيح': 'Invalid code', 'الكود منتهي': 'Code expired', 'تم تطبيق الكود ✓': 'Code applied ✓', 'اكتب كود الخصم': 'Enter a discount code', 'سياسة الاسترجاع': 'Return policy'
};
const RULES = [[/^(\d+) منتج$/, '$1 items'], [/^(.+) ج\.م$/, '$1 EGP'], [/^خصم (\d+)%$/, '$1% off'], [/^طلب #(\d+)$/, 'Order #$1'], [/^الكمية المتاحة (\d+) فقط$/, 'Only $1 available'], [/^اتصل بنا: (.+)$/, 'Call us: $1'], [/^(\d+) تقييم$/, '$1 reviews'], [/^خصم (.+)$/, 'Discount $1'], [/^الخط الساخن: (.+)$/, 'Hotline: $1'], [/^نتائج البحث عن "(.*)"$/, 'Search results for "$1"']];
CATS.forEach(c => { if (c.en) D[c.name] = c.en; (c.subs || []).forEach((s, i) => { if (c.subsEn && c.subsEn[i]) D[s] = c.subsEn[i]; }); });
function T(t) { if (D[t] !== undefined) return D[t]; if (PEN[t]) return PEN[t]; for (const [re, to] of RULES) if (re.test(t)) return t.replace(re, to); return t; }
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

/* ======== منع الزوم بالصباع في الموبايل ======== */
['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, (e) => e.preventDefault()));   // iOS
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });      // لمسة بإصبعين

/* ======== 11) تشغيل ======== */
if (!CATS.length && !PRODS.length && !window.REMOTE) toast('تعذّر تحميل البيانات');
applyLang();
ensureIds(cart.map(c => c.id)).then(() => head()).catch(() => {});
