/* admin.js — لوحة التحكم كلها (بيانات، أدوات، Firebase، الصفحات، الأزرار، تسجيل الدخول) */


/* ================================================================
   ثوابت اللوحة: الأيقونات والصفحات والحالات
   ================================================================ */
// data.js — ثوابت اللوحة (الأيقونات والصفحات والحالات). البيانات الحقيقية بتيجي من Firebase (store.js)
const ICONS = {
  dash:     '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  orders:   '<path d="M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0"/>',
  products: '<path d="M3 12h18v8H3zM5 12V8a7 7 0 0 1 14 0v4"/>',
  cats:     '<path d="M4 6h16M4 12h16M4 18h10"/>',
  cust:     '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6"/>',
  msgs:     '<path d="M3 6h18v12H3zM3 6l9 7 9-7"/>',
  banners:  '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 17l-5-5-9 7"/>',
  set:      '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'
};
const PAGES = [['dash', 'لوحة التحكم'], ['orders', 'الطلبات'], ['products', 'المنتجات'], ['cats', 'الأقسام'], ['stock', 'المخزون'], ['branches', 'الفروع'], ['offers', 'العروض'], ['cust', 'العملاء'], ['reports', 'التقارير'], ['banners', 'البانرات'], ['set', 'الإعدادات']];
const STATUSES = ['جديدة', 'قيد التحضير', 'في الطريق', 'تم التسليم', 'ملغي'];
const STATUS_COLOR = { 'جديدة': 'var(--gold)', 'قيد التحضير': 'var(--navy)', 'في الطريق': 'var(--purple)', 'تم التسليم': 'var(--green)', 'ملغي': 'var(--red)' };
// أقسام الصفحة الرئيسية في الموقع (لازم تطابق عناوين الصفوف في script.js)
const HOME_SECTIONS = ['الأكثر رواجًا', 'المنتجات الجديده', 'تشكيلة مميزة'];


/* ================================================================
   أدوات مشتركة + رفع الصور
   ================================================================ */
// utils.js — أدوات مشتركة + الحالة العامة
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

let currentPage = 'dash';
let currentRange = 'week';   // 'week' أو 'month'
let statusFilter = '';

const dOf = (t) => (t && t.toDate) ? t.toDate() : (t instanceof Date ? t : new Date());
const dayKey = (d) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
const fmtDate = (t) => dOf(t).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });

function icon(name, size = 20) {
  return `<svg viewBox="0 0 24 24" style="width:${size}px;height:${size}px;stroke:currentColor;fill:none;stroke-width:1.7">${ICONS[name]}</svg>`;
}
function showToast(text) {
  const t = $('#toast'); t.textContent = text; t.classList.add('show');
  clearTimeout(showToast.t); showToast.t = setTimeout(() => t.classList.remove('show'), 2200);
}
function openModal(html) {
  const m = $('#modal');
  m.innerHTML = `<div class="m-box"><button class="m-x" type="button" data-act="close" aria-label="إغلاق">×</button>${html}</div>`;
  m.hidden = false;
}
function closeModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; }

// مسار الصورة (لينك Firebase Storage)
const imgSrc = (u) => /^(https?:|data:)/.test(u || '') ? u : (u || '');

// الصور بتتصغّر وبتتخزن جوه Firestore نفسه (من غير Firebase Storage) كنص base64
// max = أقصى عرض/طول بالبكسل، q = الجودة (0 إلى 1)
function resizeImage(file, max, q, mime = 'image/jpeg') {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); if (mime === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); } g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); resolve(c.toDataURL(mime, q));
    };
    img.onerror = () => reject(new Error('الملف مش صورة صالحة'));
    img.src = url;
  });
}
const uploadImage = (file, max = 800, q = 0.75, mime) => resizeImage(file, max, q, mime);
// قص الصورة لمستطيل ثابت (من النص) بالمقاس المطلوب، فكل البانرات بنفس الشكل
function cropImage(file, w, h, q = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.max(w / img.width, h / img.height), sw = w / k, sh = h / k;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
      g.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, w, h);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', q));
    };
    img.onerror = () => reject(new Error('الملف مش صورة صالحة'));
    img.src = url;
  });
}
function deleteImage() {}   // الصورة جوه المستند نفسه، فبتتمسح معاه


/* ================================================================
   الاستماع للبيانات لحظيًا من Firebase
   ================================================================ */
// store.js — بيسمع لتغييرات Firebase لحظيًا ويحطها في S
const S = { orders: [], products: [], cats: [], users: [], messages: [], settings: {}, promos: {}, branches: [], offers: [], brand: {} };
let unsubs = [];
function listen(name, key) {
  return db.collection(name).onSnapshot(
    (snap) => {
      S[key] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (key === 'orders') { if (S._seen) snap.docChanges().forEach(c => { if (c.type === 'added') newOrderAlert(c.doc.data()); }); S._seen = true; }   // تنبيه بطلب جديد
      if (typeof onData === 'function') onData();
    },
    (e) => showToast('تعذّر تحميل ' + name + ': ' + e.code)
  );
}
function startStore() {
  stopStore();
  unsubs = [
    listen('orders', 'orders'), listen('products', 'products'), listen('categories', 'cats'),
    listen('users', 'users'), listen('branches', 'branches'), listen('offers', 'offers'),
    db.collection('settings').doc('brand').onSnapshot((d) => { S.brand = d.exists ? d.data() : {}; if (typeof onData === 'function') onData(); }),
    db.collection('settings').doc('home').onSnapshot((d) => { S.settings = d.exists ? d.data() : {}; if (typeof onData === 'function') onData(); }),
    db.collection('settings').doc('promos').onSnapshot((d) => { S.promos = d.exists ? d.data() : {}; if (typeof onData === 'function') onData(); })
  ];
}
function stopStore() { unsubs.forEach(u => u()); unsubs = []; S._seen = false; }


/* ================================================================
   الشريط الجانبي والتنقل
   ================================================================ */
// nav.js — الشريط الجانبي والانتقال بين الصفحات
function renderNav() {
  $('#nav').innerHTML = PAGES.map(([key, title]) =>
    `<button class="nav ${key === currentPage ? 'on' : ''}" data-page="${key}">${icon(key)}${title}</button>`).join('');
}
function goTo(page, status = '') {
  currentPage = page; statusFilter = status;
  $('#q').value = '';
  renderNav(); renderPage();
  $('#drop').classList.remove('show');
}
$('#nav').addEventListener('click', (e) => {
  const b = e.target.closest('.nav'); if (b) goTo(b.dataset.page);
});


/* ================================================================
   الصفحة الرئيسية: الأرقام والرسم البياني
   ================================================================ */
// dashboard.js — الرئيسية: كل الأرقام محسوبة من الطلبات الحقيقية
const DAYS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const liveOrders = () => S.orders.filter(o => o.status !== 'ملغي');
const sumOf = (list) => list.reduce((a, o) => a + (o.total || 0), 0);
const onDay = (list, d) => list.filter(o => dayKey(dOf(o.createdAt)) === dayKey(d));

function dailySeries() {
  const n = currentRange === 'week' ? 7 : 30, now = new Date(), out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push({ key: dayKey(d), label: n === 7 ? DAYS[d.getDay()] : String(d.getDate()), val: 0 });
  }
  liveOrders().forEach(o => { const s = out.find(x => x.key === dayKey(dOf(o.createdAt))); if (s) s.val += o.total || 0; });
  return out;
}
function niceMax(v) {                       // أقرب رقم "حلو" فوق القيمة (للمحور)
  if (v <= 0) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(v / 4)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * mag * 4 >= v) return m * mag * 4;
  return v;
}
function buildChart() {
  const data = dailySeries(), W = 640, H = 250, padL = 52, padR = 20, padT = 14, padB = 34;
  const max = niceMax(Math.max(...data.map(d => d.val)));
  const getX = (i) => padL + (W - padL - padR) * (i / (data.length - 1));
  const getY = (v) => padT + (H - padT - padB) * (1 - v / max);
  const pts = data.map((d, i) => ({ x: getX(i), y: getY(d.val) }));
  let path = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) { const m = (pts[i - 1].x + pts[i].x) / 2; path += ` C${m},${pts[i - 1].y} ${m},${pts[i].y} ${pts[i].x},${pts[i].y}`; }
  const area = `${path} L${pts[pts.length - 1].x},${H - padB} L${pts[0].x},${H - padB} Z`;
  let grid = '';
  for (let k = 0; k <= 4; k++) {
    const v = max * k / 4, y = getY(v);
    grid += `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${padL - 8}" y="${y + 4}" text-anchor="end">${v >= 1000 ? +(v / 1000).toFixed(1) + 'k' : Math.round(v)}</text>`;
  }
  const labels = data.map((d, i) => (data.length === 7 || i % 5 === 0 || i === data.length - 1) ? `<text x="${getX(i)}" y="${H - 10}" text-anchor="middle">${d.label}</text>` : '').join('');
  const dots = pts.map((p, i) => `<circle class="pt" cx="${p.x}" cy="${p.y}" r="${data.length > 7 ? 4 : 5}" fill="var(--gold)" data-i="${i}"/>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">${grid}<path d="${area}" fill="var(--gold)" opacity=".18"/><path d="${path}" fill="none" stroke="var(--gold)" stroke-width="2.5"/>${labels}${dots}<text class="tip" id="tip" x="${W / 2}" y="12" text-anchor="middle"></text></svg>`;
}

function buildDashboard() {
  const now = new Date(), yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const live = liveOrders(), tOrders = onDay(live, now), yOrders = onDay(live, yest);
  const newUsers = (d) => S.users.filter(u => dayKey(dOf(u.createdAt)) === dayKey(d)).length;
  const avg = (l) => l.length ? sumOf(l) / l.length : 0;
  const kpis = [
    ['مبيعات اليوم', fmt(sumOf(tOrders)), sumOf(tOrders), sumOf(yOrders), 'orders'],
    ['الطلبات', tOrders.length, tOrders.length, yOrders.length, 'orders'],
    ['عملاء جدد', newUsers(now), newUsers(now), newUsers(yest), 'cust'],
    ['متوسط الطلب', fmt(Math.round(avg(tOrders))), avg(tOrders), avg(yOrders), 'orders']
  ];
  const kpiHtml = kpis.map(([title, value, a, b, target]) => {
    let ch = '<span style="color:var(--muted)">—</span>';
    if (b > 0) { const c = Math.round((a - b) / b * 1000) / 10; ch = `<span class="${c >= 0 ? 'up' : 'down'}">${c > 0 ? '+' : ''}${c}% عن أمس</span>`; }
    return `<div class="card kpi" data-go="${target}"><div class="h"><span>${title}</span></div><b>${value}</b>${ch}</div>`;
  }).join('');

  // المبيعات حسب القسم + الأكثر مبيعًا (من بنود الطلبات)
  const byCat = {}, byProd = {};
  live.forEach(o => (o.items || []).forEach(it => {
    const c = it.cat || 'أخرى'; byCat[c] = (byCat[c] || 0) + it.price * it.qty;
    byProd[it.name] = (byProd[it.name] || 0) + it.qty;
  }));
  const catTotal = Object.values(byCat).reduce((a, b) => a + b, 0);
  const catList = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const catsHtml = catList.length ? catList.map(([name, v]) => {
    const pct = Math.round(v / catTotal * 100);
    return `<div class="bar" data-go="cats"><div class="l"><span>${esc(name)}</span><span>${pct}%</span></div><div class="t"><div class="f" style="width:${pct}%"></div></div></div>`;
  }).join('') : '<div class="empty">لسه مفيش مبيعات</div>';
  const topHtml = Object.entries(byProd).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, n]) => `<div class="row" data-go="products"><span>${esc(name)}</span><span>${n} قطعة</span></div>`).join('') || '<div class="empty">لسه مفيش مبيعات</div>';
  const statusHtml = STATUSES.map(s => {
    const n = onDay(S.orders, now).filter(o => o.status === s).length;
    return `<div class="row" data-go="orders" data-st="${s}"><span><i class="dot" style="background:${STATUS_COLOR[s]}"></i>${s}</span><span>${n}</span></div>`;
  }).join('');

  return `
    <div class="grid g4">${kpiHtml}</div>
    <div class="grid g2">
      <div class="card"><h3>المبيعات حسب القسم</h3>${catsHtml}</div>
      <div class="card">
        <div class="ch"><h3>${currentRange === 'week' ? 'المبيعات خلال الأسبوع' : 'المبيعات خلال الشهر'}</h3>
        <button class="sel" id="range">${currentRange === 'week' ? 'آخر 7 أيام' : 'آخر 30 يوم'} ▾</button></div>
        ${buildChart()}
      </div>
    </div>
    <div class="grid g2b">
      <div class="card"><h3>الأكثر مبيعًا</h3>${topHtml}</div>
      <div class="card"><h3>حالة الطلبات اليوم</h3>${statusHtml}</div>
    </div>`;
}


/* ================================================================
   صفحات الإدارة: طلبات / منتجات / أقسام / عملاء / رسائل / بانرات / إعدادات
   ================================================================ */
// tables.js — صفحات الإدارة: الطلبات / المنتجات / الأقسام / العملاء / الرسائل / البانرات / الإعدادات
const card = (title, count, tools, body) =>
  `<div class="card"><div class="ch"><h3>${title} <span class="tag">${count}</span></h3><div>${tools || ''}</div></div>${body}</div>`;
const table = (heads, rows) => `<div class="tw"><table><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr>${rows.join('')}</table></div>`;
const none = '<div class="empty">لا توجد نتائج</div>';
const hit = (arr, q) => !q || arr.join(' ').toLowerCase().includes(q.toLowerCase());
const thumb = (u) => u ? `<img class="thumb" src="${esc(imgSrc(u))}" alt="" onerror="this.style.visibility='hidden'">` : '<span class="thumb ph">—</span>';
const btn = (act, id, label, cls = '') => `<button class="act ${cls}" data-act="${act}" data-id="${esc(id)}">${label}</button>`;

/* ---------- الطلبات ---------- */
function ordersPage(q, status) {
  const list = [...S.orders].sort((a, b) => dOf(b.createdAt) - dOf(a.createdAt))
    .filter(o => (!status || o.status === status) && hit(['#' + o.orderNo, o.name, o.phone, o.addr], q));
  const rows = list.map(o => `<tr><td>#${o.orderNo}</td><td>${esc(o.name)}</td><td dir="ltr">${esc(o.phone)}</td><td>${fmt(o.total)} ج.م</td>
    <td><select class="st" data-oid="${o.id}">${STATUSES.map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
    <td>${fmtDate(o.createdAt)}</td><td>${btn('view-order', o.id, 'تفاصيل')}${btn('del-order', o.id, 'حذف')}</td></tr>`);
  const tools = status ? `<span class="chip">${status}</span><button class="btn ghost sm" data-act="clear-status">إلغاء الفلتر</button>` : '';
  return card('الطلبات', list.length, tools, list.length ? table(['رقم', 'العميل', 'الموبايل', 'الإجمالي', 'الحالة', 'التاريخ', ''], rows) : none);
}
function orderModal(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return;
  openModal(`<h2>طلب #${o.orderNo}</h2><p class="note">${fmtDate(o.createdAt)} — ${esc(o.status)}</p>
    <div class="li"><span>العميل</span><span>${esc(o.name)}</span></div>
    <div class="li"><span>الموبايل</span><a href="tel:${esc(o.phone)}" dir="ltr" style="color:var(--gold)">${esc(o.phone)}</a></div>
    <div class="li"><span>العنوان</span><span style="white-space:normal;text-align:left">${esc(o.addr)}</span></div>
    ${o.note ? `<div class="li"><span>ملاحظات</span><span>${esc(o.note)}</span></div>` : ''}
    <h3 style="margin:14px 0 4px">المنتجات</h3>
    ${(o.items || []).map(i => `<div class="li"><span>${esc(i.name)} × ${i.qty}</span><span>${fmt(i.price * i.qty)} ج.م</span></div>`).join('')}
    <div class="li"><b>الإجمالي</b><b>${fmt(o.total)} ج.م</b></div>`);
}

/* ---------- المنتجات ---------- */
function productsPage(q) {
  const list = [...S.products].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).filter(p => hit([p.name, p.en, p.cat, p.sub], q));
  const rows = list.map(p => `<tr><td>${thumb(p.img)}</td><td>${esc(p.name)}</td><td>${esc(p.cat)} | ${esc(p.sub)}</td><td>${fmt(p.price)} ج.م</td>
    <td>${p.stock == null ? '—' : p.stock}</td><td>${esc(p.section || '—')}</td>
    <td><span class="chip ${p.active === false ? 'off' : ''}">${p.active === false ? 'مخفي' : 'ظاهر'}</span></td>
    <td>${btn('edit-product', p.id, 'تعديل')}${btn('toggle-product', p.id, p.active === false ? 'إظهار' : 'إخفاء')}${btn('del-product', p.id, 'حذف')}</td></tr>`);
  return card('المنتجات', list.length, '<button class="btn sm" data-act="add-product">+ إضافة منتج</button>',
    list.length ? table(['', 'المنتج', 'القسم', 'السعر', 'المخزون', 'صف الرئيسية', 'الحالة', ''], rows) : none);
}
function productForm(id) {
  if (!S.cats.length) return showToast('ضيف قسم الأول من صفحة الأقسام');
  const p = S.products.find(x => x.id === id) || {};
  openModal(`<h2>${id ? 'تعديل منتج' : 'إضافة منتج'}</h2>
  <form data-form="product" data-id="${esc(id || '')}">
    <label>الاسم (عربي)</label><input name="name" value="${esc(p.name)}" required>
    <label>الاسم (English)</label><input name="en" value="${esc(p.en)}">
    <div class="two">
      <div><label>القسم</label><select name="cat" id="fCat">${S.cats.map(c => `<option ${c.name === p.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div><label>القسم الفرعي</label><select name="sub" id="fSub"></select></div>
    </div>
    <div class="two">
      <div><label>السعر (ج.م)</label><input name="price" type="number" min="0" step="0.5" value="${p.price ?? ''}" required></div>
      <div><label>المخزون (فاضي = متوفر)</label><input name="stock" type="number" min="0" value="${p.stock ?? ''}"></div>
    </div>
    <label>يظهر في صف (الرئيسية)</label>
    <select name="section"><option value="">— لا يظهر في الرئيسية —</option>${HOME_SECTIONS.map(s => `<option ${s === p.section ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <label>صورة المنتج</label><input type="file" name="file" accept="image/*" id="fFile">
    ${p.img ? `<img class="prev" id="prev" src="${esc(imgSrc(p.img))}" alt="">` : '<img class="prev" id="prev" style="display:none" alt="">'}
    <label class="chk"><input type="checkbox" name="active" ${p.active === false ? '' : 'checked'}> ظاهر في الموقع</label>
    <div class="err" id="ferr"></div>
    <button class="btn">حفظ</button>
  </form>`);
  fillSubs(p.sub);
}
function fillSubs(selected) {
  const c = S.cats.find(x => x.name === $('#fCat').value);
  const subs = (c && c.subs) || [];
  $('#fSub').innerHTML = subs.length ? subs.map(s => `<option ${s === selected ? 'selected' : ''}>${esc(s)}</option>`).join('') : '<option value="">—</option>';
}

/* ---------- الأقسام ---------- */
function catsPage(q) {
  const list = [...S.cats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).filter(c => hit([c.name, c.en, (c.subs || []).join(' ')], q));
  const rows = list.map(c => `<tr><td>${thumb(c.img)}</td><td>${esc(c.name)}</td><td>${esc(c.en || '—')}</td><td>${(c.subs || []).length}</td>
    <td>${S.products.filter(p => p.cat === c.name).length}</td><td><span class="chip ${c.circle ? '' : 'off'}">${c.circle ? 'ظاهر' : 'لا'}</span></td>
    <td>${btn('edit-cat', c.id, 'تعديل')}${btn('del-cat', c.id, 'حذف')}</td></tr>`);
  return card('الأقسام', list.length, '<button class="btn sm" data-act="add-cat">+ إضافة قسم</button>',
    list.length ? table(['صورة', 'القسم', 'English', 'أقسام فرعية', 'منتجات', 'في دوائر الرئيسية', ''], rows) : none);
}
function catForm(id) {
  const c = S.cats.find(x => x.id === id) || {};
  const subs = (c.subs || []).map((s, i) => s + (c.subsEn && c.subsEn[i] ? ' | ' + c.subsEn[i] : '')).join('\n');
  openModal(`<h2>${id ? 'تعديل قسم' : 'إضافة قسم'}</h2>
  <form data-form="cat" data-id="${esc(id || '')}">
    <label>اسم القسم (عربي)</label><input name="name" value="${esc(c.name)}" required>
    <label>الاسم (English)</label><input name="en" value="${esc(c.en)}">
    <label>الأقسام الفرعية (كل واحد في سطر — ممكن: عربي | English)</label>
    <textarea name="subs" rows="5">${esc(subs)}</textarea>
    <div class="two">
      <div><label>الترتيب</label><input name="order" type="number" value="${c.order ?? S.cats.length}"></div>
      <div><label class="chk" style="margin-top:34px"><input type="checkbox" name="circle" ${c.circle ? 'checked' : ''}> يظهر كدايرة في الرئيسية</label></div>
    </div>
    <label>صورة القسم (للدايرة)</label><input type="file" name="file" accept="image/*" id="fFile">
    ${c.img ? `<img class="prev" id="prev" src="${esc(imgSrc(c.img))}" alt="">` : '<img class="prev" id="prev" style="display:none" alt="">'}
    <div class="note">لو غيّرت اسم القسم، المنتجات بتتنقل له تلقائي. لو غيّرت اسم قسم فرعي، عدّل المنتجات بتاعته.</div>
    <div class="err" id="ferr"></div>
    <button class="btn">حفظ</button>
  </form>`);
}

/* ---------- العملاء ---------- */
function custPage(q) {
  const list = [...S.users].sort((a, b) => dOf(b.createdAt) - dOf(a.createdAt)).filter(u => hit([u.name, u.phone], q));
  const rows = list.map(u => {
    const mine = S.orders.filter(o => o.uid === u.id);
    return `<tr><td>${esc(u.name)}</td><td dir="ltr"><a href="tel:${esc(u.phone)}" style="color:var(--gold)">${esc(u.phone)}</a></td>
      <td>${fmtDate(u.createdAt)}</td><td>${mine.length}</td><td>${fmt(mine.filter(o => o.status !== 'ملغي').reduce((a, o) => a + (o.total || 0), 0))} ج.م</td>
      <td>${btn('view-cust', u.id, 'طلباته')}</td></tr>`;
  });
  return card('العملاء المسجلين', list.length, '', list.length ? table(['الاسم', 'الموبايل', 'تاريخ التسجيل', 'الطلبات', 'إجمالي المشتريات', ''], rows) : none);
}
function custModal(id) {
  const u = S.users.find(x => x.id === id); if (!u) return;
  const mine = S.orders.filter(o => o.uid === id).sort((a, b) => dOf(b.createdAt) - dOf(a.createdAt));
  openModal(`<h2>${esc(u.name)}</h2><p class="note" dir="ltr" style="text-align:right">${esc(u.phone)}</p><h3 style="margin:14px 0 4px">الطلبات</h3>` +
    (mine.map(o => `<div class="li"><span>#${o.orderNo} — ${esc(o.status)}</span><span>${fmt(o.total)} ج.م</span></div>`).join('') || '<div class="empty">لا توجد طلبات</div>'));
}

/* ---------- الرسائل ---------- */
function msgsPage(q) {
  const list = [...S.messages].sort((a, b) => dOf(b.createdAt) - dOf(a.createdAt)).filter(m => hit([m.name, m.phone, m.msg], q));
  const rows = list.map(m => `<tr><td>${esc(m.name)}</td><td dir="ltr">${esc(m.phone)}</td><td class="wrap">${esc(m.msg)}</td><td>${fmtDate(m.createdAt)}</td>
    <td><span class="chip ${m.read ? 'off' : ''}">${m.read ? 'مقروءة' : 'جديدة'}</span></td>
    <td>${btn('toggle-msg', m.id, m.read ? 'غير مقروءة' : 'تمت القراءة')}${btn('del-msg', m.id, 'حذف')}</td></tr>`);
  return card('الرسائل', list.length, '', list.length ? table(['الاسم', 'الموبايل', 'الرسالة', 'التاريخ', 'الحالة', ''], rows) : none);
}

/* ---------- البانرات ---------- */
function bannersPage() {
  const b = S.settings.banners || [], pr = S.promos || {};
  const gal = b.map((u, i) => `<figure><img src="${esc(imgSrc(u))}" alt="">${btn('del-banner', String(i), 'حذف')}</figure>`).join('');
  const slot = (k, n) => `<div class="slot">${pr[k] ? `<img src="${esc(imgSrc(pr[k]))}" alt="">` : '<span class="thumb ph" style="width:160px;height:70px;line-height:70px">فاضي</span>'}
    <div><b>البانر الإعلاني ${n}</b><br><label class="btn sm" style="display:inline-block;margin-top:8px">${pr[k] ? 'استبدال' : 'رفع صورة'}<input type="file" accept="image/*" hidden data-up="${k}"></label></div></div>`;
  return card('بانرات السلايدر', b.length, `<label class="btn sm">+ إضافة صور<input type="file" accept="image/*" multiple hidden data-up="banner"></label>`,
    (gal ? `<div class="gal">${gal}</div>` : '<div class="empty">مفيش بانرات — الموقع بيعرض الصور الافتراضية.</div>') + '<p class="note">المقاس ثابت (مستطيل 5:2). أي صورة ترفعها بتتقص من النص تلقائيًا؛ الأفضل ترفع صورة مقاسها 1200×480 وتخلّي الكتابة في النص.</p>') +
    card('البانرات الإعلانية', 2, '', slot('p1', 1) + slot('p2', 2));
}

/* ---------- الإعدادات ---------- */
function setPage() {
  return card('الإعدادات', '', '', `
    <div class="li"><span>الحساب الحالي</span><span dir="ltr">${esc(auth.currentUser ? auth.currentUser.email : '')}</span></div>
    <div class="li"><span>المنتجات / الأقسام / العملاء / الطلبات</span><span>${S.products.length} / ${S.cats.length} / ${S.users.length} / ${S.orders.length}</span></div>
    <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn" data-act="seed">نقل البيانات الأولية للقاعدة</button>
      <button class="btn red" data-act="wipe-products">حذف كل المنتجات</button>
      <button class="btn ghost" data-act="logout">تسجيل خروج</button>
    </div>
    <p class="note">زرار "نقل البيانات الأولية" بينقل الأقسام والمنتجات والبانرات الموجودة في الموقع لـ Firebase مرة واحدة عشان تعدّل عليهم من هنا. استخدمه مرة واحدة بس.</p>`);
}

function buildPage(key, q, status) {
  return { orders: () => ordersPage(q, status), products: () => productsPage(q), cats: () => catsPage(q), cust: () => custPage(q),
    msgs: () => msgsPage(q), banners: bannersPage, set: setPage }[key]();
}


/* ================================================================
   تشغيل اللوحة وربط كل الأزرار وتسجيل الدخول
   ================================================================ */
// app.js — تشغيل اللوحة وربط كل الأزرار (آخر ملف بيتحمّل)
let loginMsg = '';
// بنحدّث مستند settings/meta بعد أي تغيير؛ الموقع بيراقبه ويقول للزوار "فيه تحديثات"
const touch = () => db.collection('settings').doc('meta').set({ v: Date.now() }).catch(() => {});

function renderPage() {
  if (currentPage === 'dash') { $('#sub').textContent = 'ملخص الأداء اليوم'; $('#q').placeholder = 'ابحث في الطلبات'; $('#view').innerHTML = buildDashboard(); return; }
  const title = PAGES.find(p => p[0] === currentPage)[1];
  $('#sub').textContent = title; $('#q').placeholder = 'ابحث في ' + title;
  $('#view').innerHTML = buildPage(currentPage, $('#q').value, statusFilter);
}
function updateBadge() {
  const n = S.orders.filter(o => o.status === 'جديدة').length, m = S.messages.filter(x => !x.read).length;
  const b = $('#badge'); b.textContent = n + m; b.style.display = n + m ? '' : 'none';
  $('#drop').innerHTML = (n ? `<div data-go="orders" data-st="جديدة">${n} طلب جديد</div>` : '') + (m ? `<div data-go="msgs">${m} رسالة جديدة</div>` : '') || '<div>لا توجد إشعارات</div>';
}
function onData() { updateBadge(); renderPage(); }   // بيتنادى من store.js مع كل تغيير في القاعدة

/* ---------- الأوامر (data-act) ---------- */
const guard = (fn) => async (...a) => { try { await fn(...a); } catch (e) { showToast('حصل خطأ: ' + (e.code || e.message)); } };
const ACT = {
  close: closeModal,
  'clear-status': () => { statusFilter = ''; renderPage(); },
  'view-order': (id) => orderModal(id),
  'del-order': guard(async (id) => { if (confirm('حذف الطلب نهائيًا؟')) { await db.collection('orders').doc(id).delete(); showToast('تم الحذف'); } }),
  'add-product': () => productForm(''), 'edit-product': (id) => productForm(id),
  'toggle-product': guard(async (id) => { const p = S.products.find(x => x.id === id); await db.collection('products').doc(id).update({ active: p.active === false }); touch(); }),
  'del-product': guard(async (id) => { const p = S.products.find(x => x.id === id); if (confirm('حذف "' + p.name + '"؟')) { await db.collection('products').doc(id).delete(); touch(); showToast('تم الحذف'); } }),
  'add-cat': () => catForm(''), 'edit-cat': (id) => catForm(id),
  'del-cat': guard(async (id) => {
    const c = S.cats.find(x => x.id === id), n = S.products.filter(p => p.cat === c.name).length;
    if (confirm('حذف قسم "' + c.name + '"؟' + (n ? `\nفيه ${n} منتج مش هيظهروا في أي قسم.` : ''))) { await db.collection('categories').doc(id).delete(); touch(); showToast('تم الحذف'); }
  }),
  'view-cust': (id) => custModal(id),
  'toggle-msg': guard(async (id) => { const m = S.messages.find(x => x.id === id); await db.collection('messages').doc(id).update({ read: !m.read }); }),
  'del-msg': guard(async (id) => { if (confirm('حذف الرسالة؟')) await db.collection('messages').doc(id).delete(); }),
  'del-banner': guard(async (i) => {
    const url = (S.settings.banners || [])[+i];
    if (url && confirm('حذف البانر؟')) { await db.collection('settings').doc('home').set({ banners: firebase.firestore.FieldValue.arrayRemove(url) }, { merge: true }); touch(); }
  }),
  seed: guard(async () => {
    if (S.products.length || S.cats.length) return showToast('القاعدة فيها بيانات بالفعل — مش هنكررها');
    if (!confirm('نقل الأقسام والمنتجات والبانرات الأولية لـ Firebase؟')) return;
    const batch = db.batch();
    SEED_MENU.forEach((m, i) => {
      const circle = SEED_CATS.find(c => c.name === m.name);
      batch.set(db.collection('categories').doc(), { name: m.name, en: '', subs: m.subs, subsEn: [], img: '', circle: !!circle, order: i });
    });
    let k = 0;
    SEED_SECTIONS.forEach(s => s.items.forEach(p => batch.set(db.collection('products').doc(), {
      name: p.name, en: p.en, cat: p.cat, sub: p.sub, price: p.price, stock: p.stock ?? null, section: s.title,
      img: '', active: true, rating: p.rating, reviews: p.reviews, order: k++, createdAt: TS()
    })));
    batch.set(db.collection('settings').doc('home'), { banners: [] }, { merge: true });
    await batch.commit(); touch(); showToast('تم نقل البيانات ✓');
  }),
  // حذف كل المنتجات مرة واحدة (عشان تمسح المنتجات التجريبية وتضيف منتجاتك)
  'wipe-products': guard(async () => {
    if (!S.products.length) return showToast('مفيش منتجات');
    if (!confirm('حذف كل المنتجات (' + S.products.length + ') نهائيًا؟')) return;
    const batch = db.batch(); S.products.forEach(p => batch.delete(db.collection('products').doc(p.id)));
    await batch.commit(); touch(); showToast('تم حذف كل المنتجات ✓');
  }),
  logout: () => auth.signOut()
};
function handleAct(el) { const f = ACT[el.dataset.act]; if (f) f(el.dataset.id, el); }

/* ---------- الضغط جوه منطقة المحتوى ---------- */
$('#view').addEventListener('click', (e) => {
  if (e.target.id === 'range') { currentRange = currentRange === 'week' ? 'month' : 'week'; return renderPage(); }
  const pt = e.target.closest('.pt');
  if (pt) { const d = dailySeries()[+pt.dataset.i]; $('#tip').textContent = `${d.label}: ${fmt(d.val)} ج.م`; return; }
  const a = e.target.closest('[data-act]'); if (a) return handleAct(a);
  const g = e.target.closest('[data-go]'); if (g) goTo(g.dataset.go, g.dataset.st || '');
});
$('#modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') return closeModal();
  const a = e.target.closest('[data-act]'); if (a) handleAct(a);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ---------- تغيير حالة الطلب + رفع صور البانرات ---------- */
$('#view').addEventListener('change', guard(async (e) => {
  const t = e.target;
  if (t.dataset.oid) { await db.collection('orders').doc(t.dataset.oid).update({ status: t.value }); return showToast('تم تحديث الحالة ✓'); }
  if (t.dataset.up && t.files.length) {
    showToast('جاري رفع الصور...');
    const ref = db.collection('settings').doc('home'), files = [...t.files];
    if (t.dataset.up === 'banner') {
      for (const f of files) {
        const url = await cropImage(f, 1200, 480, 0.75);   // بانر ثابت 5:2
        // مستند Firestore أقصاه 1 ميجا، فبنتأكد إن مجموع البانرات مش كبير
        const used = (S.settings.banners || []).reduce((n, x) => n + x.length, 0);
        if (used + url.length > 900000) throw new Error('حجم البانرات كبير — احذف بانر قديم الأول');
        await ref.set({ banners: firebase.firestore.FieldValue.arrayUnion(url) }, { merge: true });
        S.settings.banners = [...(S.settings.banners || []), url];
      }
    } else {
      const url = await uploadImage(files[0], 1000, 0.7);
      await db.collection('settings').doc('promos').set({ [t.dataset.up]: url }, { merge: true });
    }
    t.value = ''; touch(); showToast('تم الرفع ✓');
  }
}));

/* ---------- فورمات المنتج والقسم (داخل النافذة) ---------- */
$('#modal').addEventListener('change', (e) => {
  if (e.target.id === 'fCat') fillSubs();
  if (e.target.id === 'fFile' && e.target.files[0]) { const p = $('#prev'); p.src = URL.createObjectURL(e.target.files[0]); p.style.display = 'block'; }
});
$('#modal').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target, type = form.dataset.form, id = form.dataset.id, f = Object.fromEntries(new FormData(form));
  const file = form.querySelector('input[type=file]').files[0], btnEl = form.querySelector('.btn'), err = (m) => { $('#ferr').textContent = m; };
  btnEl.disabled = true; btnEl.textContent = file ? 'جاري رفع الصورة...' : 'جاري الحفظ...';
  try {
    if (type === 'product') {
      const old = S.products.find(x => x.id === id) || {};
      let img = old.img || '';
      if (file) { img = await uploadImage(file, 800, 0.75); }
      const data = {
        name: f.name.trim(), en: (f.en || '').trim() || f.name.trim(), cat: f.cat, sub: f.sub || '', price: Number(f.price),
        stock: f.stock === '' ? null : Number(f.stock), section: f.section || '', img, active: !!f.active,
        unit: (f.unit || '').trim(), oldPrice: f.oldPrice === '' ? null : Number(f.oldPrice), badge: (f.badge || '').trim(),
        desc: (f.desc || '').trim(), ingredients: (f.ingredients || '').trim(),
        sizes: (f.sizes || '').split('\n').map(l => l.split('|').map(x => x.trim())).filter(l => l[0] && l[1]).map(l => ({ label: l[0], price: Number(l[1]) }))
      };
      if (id) await db.collection('products').doc(id).update(data);
      else await db.collection('products').add({ ...data, rating: 0, reviews: 0, order: -Date.now(), createdAt: TS() });
    } else {
      const old = S.cats.find(x => x.id === id) || {};
      let img = old.img || '';
      if (file) { img = await uploadImage(file, 500, 0.75);  }
      const lines = f.subs.split('\n').map(l => l.split('|').map(x => x.trim())).filter(l => l[0]);
      const name = f.name.trim();
      const data = { name, en: (f.en || '').trim(), subs: lines.map(l => l[0]), subsEn: lines.map(l => l[1] || ''), img, circle: !!f.circle, order: Number(f.order) || 0 };
      if (id) {
        await db.collection('categories').doc(id).update(data);
        if (old.name && old.name !== name) {                       // نقل المنتجات للاسم الجديد
          const batch = db.batch(); S.products.filter(p => p.cat === old.name).forEach(p => batch.update(db.collection('products').doc(p.id), { cat: name }));
          await batch.commit();
        }
      } else await db.collection('categories').add(data);
    }
    touch(); closeModal(); showToast('تم الحفظ ✓');
  } catch (ex) { btnEl.disabled = false; btnEl.textContent = 'حفظ'; err('تعذّر الحفظ: ' + (ex.code || ex.message)); }
});

/* ---------- البحث والإشعارات ---------- */
$('#q').addEventListener('input', () => {
  if (currentPage === 'dash') { if (!$('#q').value) return; currentPage = 'orders'; renderNav(); }
  renderPage();
});
$('#bell').addEventListener('click', (e) => { e.stopPropagation(); $('#drop').classList.toggle('show'); });
$('#drop').addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) goTo(g.dataset.go, g.dataset.st || ''); });
document.addEventListener('click', () => $('#drop').classList.remove('show'));

/* ---------- تسجيل دخول الأدمن ---------- */
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target)), b = e.target.querySelector('.btn');
  b.disabled = true; $('#loginErr').textContent = '';
  try { const id = f.email.trim(); await auth.signInWithEmailAndPassword(id.includes('@') ? id : phoneEmail(id), f.pass); }
  catch (ex) { $('#loginErr').textContent = /invalid|wrong|user-not-found/.test(ex.code || '') ? 'البريد أو كلمة المرور غلط' : ex.code === 'auth/operation-not-allowed' ? 'فعّل Email/Password من Firebase ← Authentication ← Sign-in method' : 'تعذّر الدخول: ' + (ex.code || ex.message); }
  b.disabled = false;
});
auth.onAuthStateChanged(async (u) => {
  if (!u) { stopStore(); $('#login').hidden = false; $('#loginErr').textContent = loginMsg; loginMsg = ''; return; }
  try {
    const a = await db.collection('admins').doc(u.uid).get();
    if (!a.exists) { loginMsg = 'الحساب ده مش أدمن. أضف الـ UID ده كـ Document ID في مجموعة admins:  ' + u.uid; await auth.signOut(); return; }
  } catch (ex) { loginMsg = 'تعذّر التحقق من الصلاحية: ' + (ex.code || ex.message); await auth.signOut(); return; }
  $('#login').hidden = true; startStore(); renderNav(); renderPage();
});
renderNav();



/* ================================================================
   الإصدار 2: فروع / مخزون / عروض / تقارير / إعدادات / تنبيه الطلبات
   ================================================================ */
Object.assign(ICONS, {
  branches: '<path d="M3 9l2-5h14l2 5M4 9v11h16V9M9 20v-6h6v6"/>',
  stock:    '<path d="M12 3l8 4v10l-8 4-8-4V7zM4 7l8 4 8-4M12 11v10"/>',
  offers:   '<path d="M5 19L19 5"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
  reports:  '<path d="M4 20V10M10 20V4M16 20v-8M21 20H3"/>'
});
let orderBranch = '', repPeriod = 'day', repBranch = '';
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const field = (label, html) => `<label>${label}</label>${html}`;

// تنبيه بطلب جديد: رسالة + صوت + إشعار المتصفح (لو اتفعّل). شغّال طول ما اللوحة مفتوحة
let _ac = null, _flash = null;
function audioCtx() { try { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); } catch (e) {} return _ac; }
['click', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, audioCtx, { passive: true }));   // المتصفح بيسمح بالصوت بعد أول ضغطة في الصفحة
function chime(rep = 3) {                                 // نغمة من 3 نوتات بتتكرر
  const c = audioCtx(); if (!c) return;
  for (let r = 0; r < rep; r++) [880, 1109, 1319].forEach((f, i) => {
    const t = c.currentTime + r * 1.2 + i * 0.2, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.start(t); o.stop(t + 0.4);
  });
}
function flashTitle() {                                   // لو التاب مش قدامك: العنوان يومض
  if (!document.hidden) return;
  clearInterval(_flash); const base = 'حلو الملك | لوحة التحكم'; let on = false;
  _flash = setInterval(() => { document.title = (on = !on) ? '🔔 طلب جديد!' : base; }, 900);
  const stop = () => { clearInterval(_flash); document.title = base; window.removeEventListener('focus', stop); };
  window.addEventListener('focus', stop);
}
// تنبيه بطلب جديد: رسالة + صوت + إشعار المتصفح + عنوان التاب. شغّال طول ما اللوحة مفتوحة
function newOrderAlert(o) {
  showToast('🔔 طلب جديد #' + o.orderNo + ' — ' + (o.name || '') + ' — ' + fmt(o.total) + ' ج.م');
  chime(3); flashTitle();
  if (window.Notification && Notification.permission === 'granted') new Notification('طلب جديد #' + o.orderNo, { body: (o.name || '') + ' — ' + (o.phone || '') + '\n' + (o.branchName || '') + ' — ' + fmt(o.total) + ' ج.م', requireInteraction: true });
}

/* ---------- رسائل واتساب للعميل (تأكيد الاستلام + تحديثات الحالة) ---------- */
const waNum = (p) => { let n = String(p || '').replace(/\D/g, ''); if (n.startsWith('0')) n = '20' + n.slice(1); return n; };
function orderMsg(o, k) {
  const hi = `أهلًا ${o.name || ''} 👑\n`, no = `طلبك رقم #${o.orderNo}`, br = o.branchName ? ` (فرع ${o.branchName})` : '', pick = o.method === 'pickup';
  const M = {
    recv: `${hi}تم استلام ${no} من حلو الملك${br} ✅ وجاري مراجعته، هنبلغك أول ما يتحضّر.`,
    'قيد التحضير': `${hi}تم تأكيد ${no}${br} ✅ وبنحضّره دلوقتي 🍰`,
    'في الطريق': pick ? `${hi}${no}${br} جاهز للاستلام من الفرع 🎉` : `${hi}${no}${br} في الطريق إليك الآن 🚚 من فضلك جهّز الإجمالي كاش: ${fmt(o.total)} ج.م`,
    'تم التسليم': `${hi}تم تسليم ${no} 🎁 بالهنا والشفا، ونتمنى نشوفك تاني في حلو الملك 👑`,
    'ملغي': `${hi}نعتذر، تم إلغاء ${no}${br}. لأي استفسار كلمنا على نفس الرقم.`
  };
  return M[k] || '';
}
const custWaUrl = (o, text) => `https://wa.me/${waNum(o.phone)}?text=${encodeURIComponent(text)}`;

/* ---------- الطلبات (مع الفرع + خصم المخزون عند تغيير الحالة) ---------- */
function ordersPage(q, status) {
  const list = [...S.orders].sort((a, b) => dOf(b.createdAt) - dOf(a.createdAt))
    .filter(o => (!status || o.status === status) && (!orderBranch || o.branchId === orderBranch) && hit(['#' + o.orderNo, o.name, o.phone, o.addr, o.branchName], q));
  const rows = list.map(o => `<tr><td>#${o.orderNo}</td><td>${esc(o.name)}</td><td dir="ltr">${esc(o.phone)}</td><td>${esc(o.branchName || '—')}</td><td>${o.method === 'pickup' ? 'استلام' : 'توصيل'}</td><td>${fmt(o.total)} ج.م</td>
    <td><select class="st" data-oid="${o.id}">${STATUSES.map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
    <td>${fmtDate(o.createdAt)}</td><td>${btn('view-order', o.id, 'تفاصيل')}${btn('del-order', o.id, 'حذف')}</td></tr>`);
  const tools = `<select class="st" data-obr><option value="">كل الفروع</option>${S.branches.map(b => `<option value="${b.id}" ${b.id === orderBranch ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>` +
    (status ? `<span class="chip">${status}</span><button class="btn ghost sm" data-act="clear-status">إلغاء الفلتر</button>` : '');
  return card('الطلبات', list.length, tools, list.length ? table(['رقم', 'العميل', 'الموبايل', 'الفرع', 'النوع', 'الإجمالي', 'الحالة', 'التاريخ', ''], rows) : none);
}
function orderModal(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return;
  openModal(`<h2>طلب #${o.orderNo}</h2><p class="note">${fmtDate(o.createdAt)} — ${esc(o.status)}</p>
    <div class="li"><span>العميل</span><span>${esc(o.name)}</span></div>
    <div class="li"><span>الموبايل</span><a href="tel:${esc(o.phone)}" dir="ltr" style="color:var(--gold)">${esc(o.phone)}</a></div>
    <div class="li"><span>الفرع</span><span>${esc(o.branchName || '—')}</span></div>
    <div class="li"><span>النوع</span><span>${o.method === 'pickup' ? 'استلام من الفرع' : 'توصيل'}</span></div>
    ${o.method === 'pickup' ? '' : `<div class="li"><span>العنوان</span><span style="white-space:normal;text-align:left">${esc((o.gov || '') + ' - ' + (o.area || '') + ' - ' + (o.addr || ''))}</span></div>`}
    <h3 style="margin:14px 0 4px">المنتجات</h3>
    ${(o.items || []).map(i => `<div class="li"><span>${esc(i.name)} × ${i.qty}</span><span>${fmt(i.price * i.qty)} ج.م</span></div>`).join('')}
    ${o.discount ? `<div class="li"><span>خصم ${esc(o.code)}</span><span>- ${fmt(o.discount)} ج.م</span></div>` : ''}
    ${o.fee ? `<div class="li"><span>رسوم التوصيل</span><span>${fmt(o.fee)} ج.م</span></div>` : ''}
    <div class="li"><b>الإجمالي (كاش)</b><b>${fmt(o.total)} ج.م</b></div>
    <h3 style="margin:14px 0 6px">رسالة واتساب للعميل</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${[['تأكيد الاستلام', 'recv'], ['قيد التحضير', 'قيد التحضير'], [o.method === 'pickup' ? 'جاهز للاستلام' : 'في الطريق', 'في الطريق'], ['تم التسليم', 'تم التسليم']].map(([l, k]) => `<a class="btn ghost sm" target="_blank" rel="noopener" href="${custWaUrl(o, orderMsg(o, k))}">${l}</a>`).join('')}</div>`);
}
// تغيير حالة الطلب: أول ما يتقبل بيتخصم من المخزون، ولو اتلغى بيرجع
async function moveStock(o, dir) {
  for (const it of o.items || []) {
    const ref = db.collection('products').doc(it.id);
    await db.runTransaction(async (tx) => { const d = await tx.get(ref); if (!d.exists || d.data().stock == null) return; tx.update(ref, { stock: Math.max(0, d.data().stock + dir * it.qty) }); });
  }
}
async function setStatus(o, status) {
  const upd = { status };
  if (status !== 'جديدة' && status !== 'ملغي' && !o.stockDone) { await moveStock(o, -1); upd.stockDone = true; }
  if (status === 'ملغي' && o.stockDone) { await moveStock(o, +1); upd.stockDone = false; }
  await db.collection('orders').doc(o.id).update(upd);
}

/* ---------- العملاء (الاسم من آخر طلب لأن التسجيل برقم الموبايل بس) ---------- */
const lastName = (uid) => { const o = S.orders.filter(x => x.uid === uid).sort((a, b) => dOf(b.createdAt) - dOf(a.createdAt))[0]; return o ? o.name : ''; };
function custPage(q) {
  const list = [...S.users].sort((a, b) => dOf(b.createdAt) - dOf(a.createdAt)).filter(u => hit([u.name || lastName(u.id), u.phone], q));
  const rows = list.map(u => { const mine = S.orders.filter(o => o.uid === u.id);
    return `<tr><td>${esc(u.name || lastName(u.id) || '—')}</td><td dir="ltr"><a href="tel:${esc(u.phone)}" style="color:var(--gold)">${esc(u.phone)}</a></td>
      <td>${fmtDate(u.createdAt)}</td><td>${mine.length}</td><td>${fmt(mine.filter(o => o.status !== 'ملغي').reduce((a, o) => a + (o.total || 0), 0))} ج.م</td><td>${btn('view-cust', u.id, 'طلباته')}</td></tr>`; });
  return card('العملاء المسجلين', list.length, '', list.length ? table(['الاسم', 'الموبايل', 'تاريخ التسجيل', 'الطلبات', 'إجمالي المشتريات', ''], rows) : none);
}
function custModal(id) {
  const u = S.users.find(x => x.id === id); if (!u) return;
  const mine = S.orders.filter(o => o.uid === id).sort((a, b) => dOf(b.createdAt) - dOf(a.createdAt));
  openModal(`<h2>${esc(u.name || lastName(id) || u.phone)}</h2><p class="note" dir="ltr" style="text-align:right">${esc(u.phone)}</p><h3 style="margin:14px 0 4px">الطلبات</h3>` +
    (mine.map(o => `<div class="li"><span>#${o.orderNo} — ${esc(o.status)}</span><span>${fmt(o.total)} ج.م</span></div>`).join('') || '<div class="empty">لا توجد طلبات</div>'));
}

/* ---------- المنتجات: فورم موسّع (وحدة / سعر قبل الخصم / أحجام / وصف / مكونات) ---------- */
function productForm(id) {
  if (!S.cats.length) return showToast('ضيف قسم الأول من صفحة الأقسام');
  const p = S.products.find(x => x.id === id) || {};
  openModal(`<h2>${id ? 'تعديل منتج' : 'إضافة منتج'}</h2>
  <form data-form="product" data-id="${esc(id || '')}">
    ${field('الاسم (عربي)', `<input name="name" value="${esc(p.name)}" required>`)}${field('الاسم (English)', `<input name="en" value="${esc(p.en)}">`)}
    <div class="two"><div>${field('القسم', `<select name="cat" id="fCat">${S.cats.map(c => `<option ${c.name === p.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>`)}</div><div>${field('القسم الفرعي', '<select name="sub" id="fSub"></select>')}</div></div>
    <div class="two"><div>${field('السعر (ج.م)', `<input name="price" type="number" min="0" step="0.5" value="${p.price ?? ''}" required>`)}</div><div>${field('السعر قبل الخصم (اختياري)', `<input name="oldPrice" type="number" min="0" step="0.5" value="${p.oldPrice ?? ''}">`)}</div></div>
    <div class="two"><div>${field('الوحدة (الكيلو / قطعة / علبة...)', `<input name="unit" value="${esc(p.unit)}">`)}</div><div>${field('المخزون (فاضي = غير محدود)', `<input name="stock" type="number" min="0" value="${p.stock ?? ''}">`)}</div></div>
    ${field('شارة على الصورة (اختياري: جديد، الأكثر مبيعًا...)', `<input name="badge" value="${esc(p.badge)}">`)}
    ${field('يظهر في صف (الرئيسية)', `<select name="section"><option value="">— لا يظهر في الرئيسية —</option>${HOME_SECTIONS.map(s => `<option ${s === p.section ? 'selected' : ''}>${s}</option>`).join('')}</select>`)}
    ${field('الأحجام (اختياري، كل سطر: الحجم | السعر)', `<textarea name="sizes" rows="3" placeholder="500 جم | 95&#10;1 كجم | 180">${esc((p.sizes || []).map(s => s.label + ' | ' + s.price).join('\n'))}</textarea>`)}
    ${field('الوصف', `<textarea name="desc" rows="2">${esc(p.desc)}</textarea>`)}${field('المكونات', `<textarea name="ingredients" rows="2">${esc(p.ingredients)}</textarea>`)}
    ${field('صورة المنتج', '<input type="file" name="file" accept="image/*" id="fFile">')}
    ${p.img ? `<img class="prev" id="prev" src="${esc(imgSrc(p.img))}" alt="">` : '<img class="prev" id="prev" style="display:none" alt="">'}
    <label class="chk"><input type="checkbox" name="active" ${p.active === false ? '' : 'checked'}> ظاهر في الموقع</label>
    <div class="err" id="ferr"></div><button class="btn">حفظ</button></form>`);
  fillSubs(p.sub);
}

/* ---------- المخزون ---------- */
function stockPage(q) {
  const list = [...S.products].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).filter(p => hit([p.name, p.cat], q));
  const st = (p) => p.stock == null ? '<span class="chip off">غير محدود</span>' : p.stock === 0 ? '<span class="chip" style="background:var(--red);color:#5a0f1a">نفد</span>' : p.stock <= 5 ? '<span class="chip" style="background:var(--gold);color:#3a2a00">منخفض</span>' : '<span class="chip">متوفر</span>';
  const rows = list.map(p => `<tr><td>${thumb(p.img)}</td><td>${esc(p.name)}</td><td>${esc(p.cat)}</td>
    <td><input class="stk" id="stk-${p.id}" type="number" min="0" value="${p.stock ?? ''}" placeholder="غير محدود"></td><td>${st(p)}</td><td>${btn('save-stock', p.id, 'حفظ')}</td></tr>`);
  const low = S.products.filter(p => p.stock != null && p.stock <= 5).length;
  return card('المخزون', list.length, low ? `<span class="chip" style="background:var(--gold);color:#3a2a00">${low} منتج منخفض/نفد</span>` : '', list.length ? table(['', 'المنتج', 'القسم', 'الكمية', 'الحالة', ''], rows) : none) +
    '<p class="note">المخزون بيتخصم تلقائي لما تغيّر حالة الطلب من "جديدة" لأي حالة تانية، وبيرجع لو اتلغى.</p>';
}

/* ---------- الفروع ---------- */
function branchesPage(q) {
  const list = [...S.branches].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).filter(b => hit([b.name, b.area, b.phone], q));
  const rows = list.map(b => `<tr><td>${esc(b.name)}</td><td>${esc(b.area || '—')}</td><td dir="ltr">${esc(b.phone || '—')}</td><td>${fmt(b.fee)} ج.م</td><td>${S.orders.filter(o => o.branchId === b.id).length}</td>
    <td><span class="chip ${b.active === false ? 'off' : ''}">${b.active === false ? 'متوقف' : 'شغال'}</span></td><td>${btn('edit-branch', b.id, 'تعديل')}${btn('del-branch', b.id, 'حذف')}</td></tr>`);
  return card('الفروع', list.length, '<button class="btn sm" data-act="add-branch">+ إضافة فرع</button>', list.length ? table(['الفرع', 'المنطقة', 'رقم واتساب الطلبات', 'رسوم التوصيل', 'الطلبات', 'الحالة', ''], rows) : none) +
    '<p class="note">العميل لازم يختار فرع وقت الطلب. بعد الطلب بيظهر له زرار يبعت تفاصيل الطلب لرقم واتساب الفرع. والطلب بيظهر عندك هنا فورًا مع تنبيه.</p>';
}
function branchForm(id) {
  const b = S.branches.find(x => x.id === id) || {};
  openModal(`<h2>${id ? 'تعديل فرع' : 'إضافة فرع'}</h2><form data-form="branch" data-id="${esc(id || '')}">
    ${field('اسم الفرع', `<input name="name" value="${esc(b.name)}" required>`)}${field('المنطقة / العنوان', `<input name="area" value="${esc(b.area)}">`)}
    ${field('رقم واتساب الفرع — بيستقبل الطلبات والعميل بيتواصل معاه (01xxxxxxxxx)', `<input name="phone" inputmode="tel" value="${esc(b.phone)}" placeholder="01XXXXXXXXX" required pattern="01[0125][0-9]{8}">`)}
    <div class="two"><div>${field('رسوم التوصيل (ج.م)', `<input name="fee" type="number" min="0" value="${b.fee ?? 0}">`)}</div><div>${field('الترتيب', `<input name="order" type="number" value="${b.order ?? S.branches.length}">`)}</div></div>
    <label class="chk"><input type="checkbox" name="active" ${b.active === false ? '' : 'checked'}> الفرع شغال</label><div class="err" id="ferr"></div><button class="btn">حفظ</button></form>`);
}

/* ---------- العروض (أكواد خصم) ---------- */
function offersPage(q) {
  const list = [...S.offers].sort((a, b) => dOf(b.createdAt) - dOf(a.createdAt)).filter(o => hit([o.title, o.code], q));
  const rows = list.map(o => `<tr><td>${esc(o.title)}</td><td><b>${esc(o.code)}</b></td><td>${o.type === 'percent' ? o.value + '%' : fmt(o.value) + ' ج.م'}</td><td>${o.minOrder ? fmt(o.minOrder) + ' ج.م' : '—'}</td><td>${esc(o.endsAt || '—')}</td>
    <td><span class="chip ${o.active === false ? 'off' : ''}">${o.active === false ? 'متوقف' : 'شغال'}</span></td><td>${btn('edit-offer', o.id, 'تعديل')}${btn('toggle-offer', o.id, o.active === false ? 'تشغيل' : 'إيقاف')}${btn('del-offer', o.id, 'حذف')}</td></tr>`);
  return card('العروض', list.length, '<button class="btn sm" data-act="add-offer">+ إضافة عرض</button>', list.length ? table(['العرض', 'الكود', 'الخصم', 'أقل طلب', 'ينتهي', 'الحالة', ''], rows) : none) +
    '<p class="note">خصم المنتج نفسه (سعر قبل/بعد الخصم) بتحطه من فورم المنتج في خانة "السعر قبل الخصم"، وبيظهر تلقائي في صفحة "عروض وخصومات".</p>';
}
function offerForm(id) {
  const o = S.offers.find(x => x.id === id) || {};
  openModal(`<h2>${id ? 'تعديل عرض' : 'إضافة عرض'}</h2><form data-form="offer" data-id="${esc(id || '')}">
    ${field('عنوان العرض', `<input name="title" value="${esc(o.title)}" placeholder="خصم 15% على أول طلب" required>`)}${field('كود الخصم', `<input name="code" value="${esc(o.code)}" style="text-transform:uppercase" required>`)}
    <div class="two"><div>${field('النوع', `<select name="type"><option value="percent" ${o.type !== 'fixed' ? 'selected' : ''}>نسبة %</option><option value="fixed" ${o.type === 'fixed' ? 'selected' : ''}>مبلغ ثابت</option></select>`)}</div><div>${field('قيمة الخصم', `<input name="value" type="number" min="0" value="${o.value ?? ''}" required>`)}</div></div>
    <div class="two"><div>${field('أقل قيمة للطلب (اختياري)', `<input name="minOrder" type="number" min="0" value="${o.minOrder ?? ''}">`)}</div><div>${field('ينتهي في (اختياري)', `<input name="endsAt" type="date" value="${esc(o.endsAt)}">`)}</div></div>
    <label class="chk"><input type="checkbox" name="active" ${o.active === false ? '' : 'checked'}> العرض شغال</label><div class="err" id="ferr"></div><button class="btn">حفظ</button></form>`);
}

/* ---------- التقارير: يوم / أسبوع / شهر / سنة + كل حالات الطلبات + تصدير + مسح ---------- */
function repOrders() {
  const n = new Date(), y = n.getFullYear(), m = n.getMonth(), d = n.getDate();
  const s = repPeriod === 'day' ? new Date(y, m, d) : repPeriod === 'week' ? new Date(y, m, d - 6) : repPeriod === 'month' ? new Date(y, m, 1) : new Date(y, 0, 1);
  return S.orders.filter(o => dOf(o.createdAt) >= s && (!repBranch || o.branchId === repBranch));
}
function reportsPage() {
  const os = repOrders(), live = os.filter(o => o.status !== 'ملغي'), total = sumOf(live);
  const tabs = [['day', 'يوم'], ['week', 'أسبوع'], ['month', 'شهر'], ['year', 'سنة']].map(([k, t]) => `<button class="btn sm ${k === repPeriod ? '' : 'ghost'}" data-act="rep-period" data-id="${k}">${t}</button>`).join('');
  const sel = `<select class="st" data-repbr><option value="">كل الفروع</option>${S.branches.map(b => `<option value="${b.id}" ${b.id === repBranch ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select>`;
  const kp = (t, v) => `<div class="card kpi" style="cursor:default"><div class="h"><span>${t}</span></div><b>${v}</b></div>`;
  const stRows = STATUSES.map(s => { const l = os.filter(o => o.status === s); return `<tr><td><i class="dot" style="background:${STATUS_COLOR[s]}"></i>${s}</td><td>${l.length}</td><td>${fmt(sumOf(l))} ج.م</td></tr>`; });
  const grp = {}; live.forEach(o => { const d = dOf(o.createdAt); const k = repPeriod === 'day' ? d.getHours() : repPeriod === 'year' ? d.getMonth() : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); (grp[k] = grp[k] || { n: 0, v: 0 }).n++; grp[k].v += o.total || 0; });
  const lab = (k) => repPeriod === 'day' ? k + ':00' : repPeriod === 'year' ? MONTHS[k] : new Date(+k).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
  const serRows = Object.keys(grp).sort((a, b) => a - b).map(k => `<tr><td>${lab(k)}</td><td>${grp[k].n}</td><td>${fmt(grp[k].v)} ج.م</td></tr>`);
  const brRows = [...S.branches.map(b => [b.name, live.filter(o => o.branchId === b.id)]), ['بدون فرع', live.filter(o => !o.branchId)]].filter(x => x[1].length).map(([n, l]) => `<tr><td>${esc(n)}</td><td>${l.length}</td><td>${fmt(sumOf(l))} ج.م</td></tr>`);
  const byP = {}; live.forEach(o => (o.items || []).forEach(i => { const e = byP[i.name] || (byP[i.name] = { q: 0, v: 0 }); e.q += i.qty; e.v += i.price * i.qty; }));
  const topRows = Object.entries(byP).sort((a, b) => b[1].v - a[1].v).slice(0, 8).map(([n, e]) => `<tr><td>${esc(n)}</td><td>${e.q}</td><td>${fmt(e.v)} ج.م</td></tr>`);
  const sec = (t, h, rows) => `<div class="card"><h3>${t}</h3>${rows.length ? table(h, rows) : none}</div>`;
  return card('التقارير', os.length, tabs + sel + '<button class="btn ghost sm" data-act="rep-csv">تنزيل CSV</button>',
    `<div class="grid g4">${kp('إجمالي المبيعات', fmt(total) + ' ج.م')}${kp('عدد الطلبات (بدون الملغي)', live.length)}${kp('متوسط الطلب', fmt(live.length ? Math.round(total / live.length) : 0) + ' ج.م')}${kp('مبلغ الملغي', fmt(sumOf(os.filter(o => o.status === 'ملغي'))) + ' ج.م')}</div>`) +
    `<div class="grid g2b">${sec('حالات الطلبات (كلها)', ['الحالة', 'العدد', 'المبلغ'], stRows)}${sec(repPeriod === 'day' ? 'المبيعات بالساعة' : repPeriod === 'year' ? 'المبيعات بالشهر' : 'المبيعات باليوم', ['الفترة', 'الطلبات', 'المبلغ'], serRows)}</div>` +
    `<div class="grid g2b">${sec('حسب الفرع', ['الفرع', 'الطلبات', 'المبلغ'], brRows)}${sec('الأكثر مبيعًا', ['المنتج', 'الكمية', 'المبلغ'], topRows)}</div>` +
    `<div class="card"><h3>إدارة المساحة</h3><p class="note" style="margin:0 0 12px">الطلبات بتاخد مساحة في قاعدة البيانات. نزّل التقرير (CSV) الأول وبعدها امسح الطلبات. العملاء وحساباتهم مش بتتمسح.</p><button class="btn red" data-act="wipe-orders">مسح كل الطلبات (${S.orders.length})</button></div>`;
}
function exportCsv() {
  const rows = [['رقم', 'التاريخ', 'العميل', 'الموبايل', 'الفرع', 'النوع', 'الحالة', 'الإجمالي'], ...repOrders().map(o => [o.orderNo, fmtDate(o.createdAt), o.name, o.phone, o.branchName || '', o.method === 'pickup' ? 'استلام' : 'توصيل', o.status, o.total])];
  const csv = '\ufeff' + rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'report-' + repPeriod + '.csv'; a.click();
}

/* ---------- الإعدادات: كلمة المرور / رقم الأدمن / اللوجو / بيانات الموقع ---------- */
function setPage() {
  const br = S.brand || {}, so = br.social || {}, lg = br.logo;
  return card('الإعدادات', '', '', `
    <div class="li"><span>الحساب الحالي</span><span dir="ltr">${esc(auth.currentUser ? auth.currentUser.email.split('@')[0] : '')}</span></div>
    <h3 style="margin:18px 0 6px">تغيير كلمة المرور</h3>
    <form data-form="pw" class="sf"><div class="two"><div>${field('الحالية', '<input name="cur" type="password" required>')}</div><div>${field('الجديدة (6 حروف على الأقل)', '<input name="nw" type="password" minlength="6" required>')}</div></div><div class="err"></div><button class="btn sm">حفظ كلمة المرور</button></form>
    <h3 style="margin:18px 0 6px">إضافة / تغيير رقم الأدمن</h3>
    <form data-form="adm" class="sf"><div class="two"><div>${field('رقم الموبايل الجديد', '<input name="phone" inputmode="tel" placeholder="01XXXXXXXXX" required>')}</div><div>${field('كلمة المرور', '<input name="pass" type="password" minlength="6" required>')}</div></div>
      <label class="chk"><input type="checkbox" name="removeMe"> شيل صلاحية الحساب الحالي بعد الإضافة (تغيير الرقم)</label><div class="err"></div><button class="btn sm">إضافة الأدمن</button></form>
    <h3 style="margin:18px 0 6px">اللوجو</h3>
    <div class="slot">${lg && lg !== 'none' ? `<img src="${esc(lg)}" alt="" style="width:80px;height:80px;object-fit:contain">` : `<span class="thumb ph" style="width:80px;height:80px;line-height:80px">${lg === 'none' ? 'بدون' : 'افتراضي'}</span>`}
      <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn sm">رفع لوجو جديد<input type="file" accept="image/*" hidden data-up="logo"></label><button class="btn ghost sm" data-act="logo-none">إزالة اللوجو</button><button class="btn ghost sm" data-act="logo-def">الافتراضي</button></div></div>
    <h3 style="margin:18px 0 6px">بيانات الموقع</h3>
    <form data-form="brand" class="sf"><div class="two"><div>${field('الخط الساخن', `<input name="hotline" value="${esc(br.hotline)}" placeholder="16312">`)}</div><div class="fl" style="grid-column:1/-1"><label class="chk"><input type="checkbox" name="serverWa" ${br.serverWa ? 'checked' : ''}> الإرسال التلقائي من السيرفر شغّال (يوقف فتح واتساب اليدوي)</label></div><div>${field('رقم الأدمن لاستلام الطلبات (واتساب) — بيُستخدم لو الفرع ملوش رقم', `<input name="adminPhone" inputmode="tel" value="${esc(br.adminPhone)}" placeholder="01XXXXXXXXX">`)}</div><div>${field('واتساب (رقم)', `<input name="wa" value="${esc(so.wa)}">`)}</div>
      <div>${field('فيسبوك (لينك)', `<input name="fb" value="${esc(so.fb)}">`)}</div><div>${field('انستجرام (لينك)', `<input name="ig" value="${esc(so.ig)}">`)}</div><div>${field('تيك توك (لينك)', `<input name="tt" value="${esc(so.tt)}">`)}</div></div><div class="err"></div><button class="btn sm">حفظ</button></form>
    <h3 style="margin:18px 0 6px">أدوات</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost" data-act="notif">تفعيل إشعارات المتصفح للطلبات</button><button class="btn ghost" data-act="testsound">اختبار صوت الطلبات</button><button class="btn" data-act="seed">نقل البيانات الأولية للقاعدة</button><button class="btn red" data-act="wipe-products">حذف كل المنتجات</button><button class="btn ghost" data-act="logout">تسجيل خروج</button></div>
    <label class="chk"><input type="checkbox" data-autowa ${localStorage.getItem('hm_autowa') !== '0' ? 'checked' : ''}> فتح واتساب العميل برسالة جاهزة عند تغيير حالة الطلب</label>
    <p class="note">التنبيه بالطلبات الجديدة (صوت + رسالة) شغّال طول ما اللوحة مفتوحة. رقم واتساب كل فرع بتضيفه من صفحة الفروع.</p>`);
}
async function addAdmin(phone, pass, removeMe) {              // حساب جديد عن طريق نسخة تانية من Firebase عشان متخرجش من حسابك
  const sec = firebase.initializeApp(firebase.app().options, 'sec' + Date.now());
  try {
    const c = await sec.auth().createUserWithEmailAndPassword(phoneEmail(phone), pass);
    await db.collection('admins').doc(c.user.uid).set({ ok: true, phone, createdAt: TS() });
    await sec.auth().signOut();
  } finally { await sec.delete(); }
  if (removeMe) { await db.collection('admins').doc(auth.currentUser.uid).delete(); await auth.signOut(); }
}
function buildPage(key, q, status) {
  return { orders: () => ordersPage(q, status), products: () => productsPage(q), cats: () => catsPage(q), stock: () => stockPage(q), branches: () => branchesPage(q), offers: () => offersPage(q),
    cust: () => custPage(q), reports: reportsPage, banners: bannersPage, set: setPage }[key]();
}

/* ---------- الأزرار الجديدة ---------- */
Object.assign(ACT, {
  'add-branch': () => branchForm(''), 'edit-branch': (id) => branchForm(id),
  'del-branch': guard(async (id) => { if (confirm('حذف الفرع؟')) { await db.collection('branches').doc(id).delete(); touch(); showToast('تم الحذف'); } }),
  'add-offer': () => offerForm(''), 'edit-offer': (id) => offerForm(id),
  'toggle-offer': guard(async (id) => { const o = S.offers.find(x => x.id === id); await db.collection('offers').doc(id).update({ active: o.active === false }); }),
  'del-offer': guard(async (id) => { if (confirm('حذف العرض؟')) await db.collection('offers').doc(id).delete(); }),
  'save-stock': guard(async (id) => { const v = $('#stk-' + id).value; await db.collection('products').doc(id).update({ stock: v === '' ? null : Math.max(0, Number(v)) }); touch(); showToast('تم حفظ المخزون ✓'); }),
  'rep-period': (id) => { repPeriod = id; renderPage(); }, 'rep-csv': exportCsv,
  'wipe-orders': guard(async () => {
    if (!S.orders.length) return showToast('مفيش طلبات');
    if (prompt('هيتمسح ' + S.orders.length + ' طلب نهائيًا. اكتب كلمة: مسح') !== 'مسح') return;
    const ids = S.orders.map(o => o.id);
    for (let i = 0; i < ids.length; i += 400) { const b = db.batch(); ids.slice(i, i + 400).forEach(x => b.delete(db.collection('orders').doc(x))); await b.commit(); }
    showToast('تم مسح كل الطلبات ✓');
  }),
  'logo-none': guard(async () => { await db.collection('settings').doc('brand').set({ logo: 'none' }, { merge: true }); touch(); showToast('تم إزالة اللوجو'); }),
  'logo-def': guard(async () => { await db.collection('settings').doc('brand').set({ logo: firebase.firestore.FieldValue.delete() }, { merge: true }); touch(); showToast('رجع اللوجو الافتراضي'); }),
  testsound: () => { chime(2); showToast('🔔 ده صوت الطلبات الجديدة'); },
  notif: () => { if (!window.Notification) return showToast('المتصفح مش بيدعم الإشعارات'); Notification.requestPermission().then(p => showToast(p === 'granted' ? 'تم تفعيل الإشعارات ✓' : 'الإشعارات مرفوضة')); },
  seed: guard(async () => {
    if (S.products.length || S.cats.length) return showToast('القاعدة فيها بيانات بالفعل — مش هنكررها');
    if (!confirm('نقل الأقسام والمنتجات والفرع والعرض التجريبي لـ Firebase؟')) return;
    const batch = db.batch(), C = [['عروض وخصومات', []], ['المطعم', ['وجبات', 'سلطات', 'مشروبات']], ['حلويات شرقي', ['كنافة', 'بسبوسة', 'بقلاوة', 'أم علي', 'كحك وبسكويت']], ['حلويات غربي', ['تشيز كيك', 'كب كيك', 'دونات', 'تارت', 'تورتات']],
      ['ميكس سويت', ['علب هدايا', 'ملبن']], ['مخبوزات', ['خبز', 'كرواسون', 'بريوش']], ['شوكولاتة', ['بوكس', 'ألواح']], ['كحك العيد', ['كحك سادة', 'كحك بالعجوة', 'كحك محشي']], ['حلاوة المولد', ['علب المولد', 'عروسة المولد']], ['أيس كريم', ['لتر', 'كوب', 'عبوات عائلية']]];
    C.forEach(([name, subs], i) => batch.set(db.collection('categories').doc(), { name, en: '', subs, subsEn: [], img: '', circle: i !== 1, order: i }));
    const kD = 'كنافة طازة بالقشطة الطبيعية والسمن البلدي، بتتحضر يوميًا وتوصلك سخنة لحد باب البيت.';
    const P = [['كنافة بالقشطة', 'Cream Kunafa', 'حلويات شرقي', 'كنافة', 180, 0, 'الكيلو', 'الأكثر رواجًا', 'جديد', [['500 جم', 95], ['1 كجم', 180], ['2 كجم', 350], ['علبة هدايا', 220]], kD, 'قشطة، سمن بلدي، سميد، فستق مطحون'],
      ['جاتوه الشوكولاتة', 'Chocolate Gateau', 'حلويات غربي', 'تورتات', 320, 0, 'قطعة كاملة', 'الأكثر رواجًا'], ['بقلاوة مشكلة', 'Assorted Baklava', 'حلويات شرقي', 'بقلاوة', 250, 280, 'الكيلو', 'الأكثر رواجًا'],
      ['صندوق هدايا ملكي', 'Royal Gift Box', 'ميكس سويت', 'علب هدايا', 450, 0, 'علبة', 'الأكثر رواجًا'], ['ميني بيتي فور', 'Mini Petit Four', 'حلويات شرقي', 'كحك وبسكويت', 140, 0, '500 جم', 'الأكثر رواجًا'],
      ['بسبوسة بالمكسرات', 'Nuts Basbousa', 'حلويات شرقي', 'بسبوسة', 160, 0, 'الكيلو', 'المنتجات الجديده'], ['أم علي بالمكسرات', 'Om Ali with Nuts', 'حلويات شرقي', 'أم علي', 65, 0, 'طبق فردي', 'المنتجات الجديده'],
      ['كحك بالعجوة', 'Dates Kahk', 'حلويات شرقي', 'كحك وبسكويت', 210, 0, 'الكيلو', 'المنتجات الجديده'], ['أيس كريم مانجو', 'Mango Ice Cream', 'أيس كريم', 'لتر', 95, 0, 'لتر', 'المنتجات الجديده'], ['بريوش بالشوكولاتة', 'Chocolate Brioche', 'مخبوزات', 'بريوش', 25, 0, 'قطعة', 'المنتجات الجديده']];
    P.forEach((p, i) => batch.set(db.collection('products').doc(), { name: p[0], en: p[1], cat: p[2], sub: p[3], price: p[4], oldPrice: p[5] || null, unit: p[6], section: p[7], badge: p[8] || '', sizes: (p[9] || []).map(s => ({ label: s[0], price: s[1] })),
      desc: p[10] || '', ingredients: p[11] || '', stock: null, img: '', active: true, rating: 0, reviews: 0, order: i, createdAt: TS() }));
    batch.set(db.collection('branches').doc(), { name: 'الفرع الرئيسي', area: 'القاهرة', phone: '', fee: 35, order: 0, active: true });
    batch.set(db.collection('offers').doc(), { title: 'خصم 15% على أول طلب', code: 'MALEK15', type: 'percent', value: 15, minOrder: 0, endsAt: '', active: true, createdAt: TS() });
    await batch.commit(); touch(); showToast('تم نقل البيانات ✓');
  })
});

/* ---------- مستمعين خاصة (بتشتغل قبل القديمة) ---------- */
$('#modal').addEventListener('submit', async (e) => {                 // فورم الفرع والعرض
  const t = e.target.dataset.form; if (t !== 'branch' && t !== 'offer') return;
  e.preventDefault(); e.stopImmediatePropagation();
  const f = Object.fromEntries(new FormData(e.target)), id = e.target.dataset.id, b = e.target.querySelector('.btn');
  b.disabled = true;
  try {
    const c = db.collection(t === 'branch' ? 'branches' : 'offers');
    const data = t === 'branch' ? { name: f.name.trim(), area: (f.area || '').trim(), phone: (f.phone || '').trim(), fee: Number(f.fee) || 0, order: Number(f.order) || 0, active: !!f.active }
      : { title: f.title.trim(), code: f.code.trim().toUpperCase(), type: f.type, value: Number(f.value) || 0, minOrder: Number(f.minOrder) || 0, endsAt: f.endsAt || '', active: !!f.active };
    if (id) await c.doc(id).update(data); else await c.add(t === 'offer' ? { ...data, createdAt: TS() } : data);
    touch(); closeModal(); showToast('تم الحفظ ✓');
  } catch (ex) { b.disabled = false; $('#ferr').textContent = 'تعذّر الحفظ: ' + (ex.code || ex.message); }
}, true);
$('#view').addEventListener('change', guard(async (e) => {            // حالة الطلب + فلتر الفرع + اللوجو
  const t = e.target;
  if (t.dataset.oid) {
    e.stopImmediatePropagation(); const o = S.orders.find(x => x.id === t.dataset.oid);
    const ask = localStorage.getItem('hm_autowa') !== '0' && o.phone && t.value !== 'جديدة' && t.value !== o.status && !(S.brand || {}).serverWa;
    let w = null; if (ask) { try { w = window.open('', '_blank'); } catch (er) {} }       // التاب بيتفتح وإحنا في ضغطة الأدمن
    try { await setStatus(o, t.value); } catch (er) { if (w) w.close(); throw er; }
    if (w) w.location.href = custWaUrl(o, orderMsg(o, t.value));
    showToast('تم تحديث الحالة ✓' + (w ? ' — اضغط إرسال في واتساب' : ''));
  }
  else if (t.dataset.autowa !== undefined) { e.stopImmediatePropagation(); localStorage.setItem('hm_autowa', t.checked ? '1' : '0'); showToast(t.checked ? 'هيتفتح واتساب العميل مع كل تغيير حالة' : 'تم إيقاف فتح واتساب التلقائي'); }
  else if (t.dataset.obr !== undefined) { e.stopImmediatePropagation(); orderBranch = t.value; renderPage(); }
  else if (t.dataset.repbr !== undefined) { e.stopImmediatePropagation(); repBranch = t.value; renderPage(); }
  else if (t.dataset.up === 'logo' && t.files.length) {
    e.stopImmediatePropagation(); showToast('جاري رفع اللوجو...');
    const url = await uploadImage(t.files[0], 400, 0.92, 'image/png');
    await db.collection('settings').doc('brand').set({ logo: url }, { merge: true }); t.value = ''; touch(); showToast('تم تغيير اللوجو ✓');
  }
}), true);
$('#view').addEventListener('submit', async (e) => {                  // فورمات الإعدادات
  const t = e.target.dataset.form; if (!['pw', 'adm', 'brand'].includes(t)) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const f = Object.fromEntries(new FormData(e.target)), err = (m) => { e.target.querySelector('.err').textContent = m; }; err('');
  try {
    if (t === 'pw') {
      const u = auth.currentUser; await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, f.cur)); await u.updatePassword(f.nw);
      e.target.reset(); showToast('تم تغيير كلمة المرور ✓');
    } else if (t === 'adm') {
      if (!/^01[0125]\d{8}$/.test(f.phone.trim())) return err('رقم الموبايل غير صحيح');
      await addAdmin(f.phone.trim(), f.pass, !!f.removeMe); e.target.reset(); showToast('تمت إضافة الأدمن ✓');
    } else {
      await db.collection('settings').doc('brand').set({ hotline: f.hotline.trim(), adminPhone: (f.adminPhone || '').trim(), serverWa: !!f.serverWa, social: { wa: f.wa.trim(), fb: f.fb.trim(), ig: f.ig.trim(), tt: f.tt.trim() } }, { merge: true }); touch(); showToast('تم الحفظ ✓');
    }
  } catch (ex) {
    const c = ex.code || '';
    err(/wrong|invalid-credential|invalid-login/.test(c) ? 'كلمة المرور الحالية غلط' : c === 'auth/email-already-in-use' ? 'الرقم ده مسجّل قبل كده' : c === 'auth/weak-password' ? 'كلمة المرور ضعيفة' : 'تعذّر التنفيذ: ' + (c || ex.message));
  }
}, true);
