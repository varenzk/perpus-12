/* ================= NAV ================= */
function showPage(name){
  if((name==='masuk'||name==='daftar') && currentUser()) name='beranda';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.querySelectorAll('.navlink').forEach(b=>b.classList.toggle('active', b.dataset.page===name));
  window.scrollTo({top:0, behavior:'smooth'});
  if(name==='katalog') renderCatalog();
  if(name==='pinjam') renderLoans();
  if(name==='dashboard') renderDashboard();
}
document.querySelector('.navlink[data-page="beranda"]').classList.add('active');

/* ================= SHARED DATA: CATALOG ================= */
const THEME_COLORS = {
  "Fiksi":"#FF6B6B","Sains & Teknologi":"#12B8A6","Sejarah":"#FFC94D",
  "Anak & Remaja":"#8B5CF6","Bisnis & Ekonomi":"#2ECC71"
};
const day=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
let CATALOG = [
  {id:1, title:"Laskar Pelangi", author:"Andrea Hirata", theme:"Fiksi", status:"tersedia", due:null},
  {id:2, title:"Sapiens", author:"Yuval Noah Harari", theme:"Sains & Teknologi", status:"tersedia", due:null},
  {id:3, title:"Negeri 5 Menara", author:"Ahmad Fuadi", theme:"Fiksi", status:"dipinjam", due:day(5)},
  {id:4, title:"Sejarah Nusantara", author:"Tim Penulis", theme:"Sejarah", status:"tersedia", due:null},
  {id:5, title:"Dongeng Sebelum Tidur", author:"Kumpulan Cerita", theme:"Anak & Remaja", status:"tersedia", due:null},
  {id:6, title:"Rich Dad Poor Dad", author:"Robert Kiyosaki", theme:"Bisnis & Ekonomi", status:"dipinjam", due:day(-2)},
  {id:7, title:"Bumi Manusia", author:"Pramoedya Ananta Toer", theme:"Fiksi", status:"tersedia", due:null},
  {id:8, title:"Cosmos", author:"Carl Sagan", theme:"Sains & Teknologi", status:"tersedia", due:null},
  {id:9, title:"Gajah Mada", author:"Langit Kresna Hariadi", theme:"Sejarah", status:"tersedia", due:null},
  {id:10, title:"Petualangan Si Kancil", author:"Cerita Rakyat", theme:"Anak & Remaja", status:"tersedia", due:null},
];
const SHELF_CAP = {"Fiksi":4,"Sains & Teknologi":4,"Sejarah":4,"Anak & Remaja":4,"Bisnis & Ekonomi":4};
const TODAY = new Date(new Date().toISOString().slice(0,10));
let HISTORY = [];

/* ================= DATA BERSAMA DENGAN SITUS ADMIN ================= */
/* Kedua situs memakai kunci localStorage yang sama, jadi harus dibuka dari domain/server yang sama. */
const SK = 'pc-shared';
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unesc = s => String(s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
let ANN = [
  {id:1,t:"🎈 Festival Baca Ceria",b:"Ikuti lomba resensi buku bulan ini, hadiah menarik menanti pembaca paling aktif!"},
  {id:2,t:"🧹 Penataan Ulang Rak",b:"Rak tema Sejarah & Sains sedang dirapikan supaya makin mudah dicari."},
  {id:3,t:"🕒 Jam Buka Diperpanjang",b:"Mulai bulan ini, perpustakaan buka hingga pukul 20.00 setiap hari kerja."}];
function loadShared(){
  try{
    const s = JSON.parse(localStorage.getItem(SK));
    if(s && s.c){
      CATALOG = s.c.map(b=>({...b, title:esc(b.title), author:esc(b.author), status:b.due?'dipinjam':'tersedia'}));
      ANN = s.a || [];
      return true;
    }
  }catch(e){}
  return false;
}
function saveShared(logText){
  try{
    const s = JSON.parse(localStorage.getItem(SK)) || {};
    s.c = CATALOG.map(b=>({id:b.id, title:unesc(b.title), author:unesc(b.author), theme:b.theme, due:b.due}));
    s.a = ANN;
    if(logText) s.l = [logText, ...(s.l||[])].slice(0,20);
    localStorage.setItem(SK, JSON.stringify(s));
  }catch(e){}
}
const ANN_COLORS = ['var(--coral)','var(--teal)','var(--purple)'];
function renderAnn(){
  const el = document.getElementById('annGrid'); if(!el) return;
  el.innerHTML = ANN.length ? ANN.map((x,i)=>`<div class="announce-card" style="background:${ANN_COLORS[i%3]};"><h3>${esc(x.t)}</h3><p>${esc(x.b)}</p></div>`).join('') : `<div class="empty-note">Belum ada pengumuman.</div>`;
}
const hadShared = loadShared();
if(!hadShared) saveShared();
window.addEventListener('storage', e=>{ if(e.key===SK && loadShared()){ refreshAllViews(); renderAnn(); } });

function fmtDate(d){ return new Date(d).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}); }
function dueStatus(due){
  const diff = Math.round((new Date(due)-TODAY)/(1000*60*60*24));
  if(diff<0) return 'telat';
  if(diff<=3) return 'segera';
  return 'aman';
}
function logHistory(text){
  HISTORY.unshift(text);
  renderHistory();
}
function renderHistory(){
  const el = document.getElementById('historyPanel');
  if(!el) return;
  el.innerHTML = HISTORY.length ? HISTORY.slice(0,8).map(h=>`<div class="history-item">${h}</div>`).join('') : `<div class="empty-note">Belum ada aktivitas peminjaman.</div>`;
}

function borrowBook(id){
  const book = CATALOG.find(b=>b.id===id);
  if(!book || book.status==='dipinjam') return false;
  const due = new Date(TODAY); due.setDate(due.getDate()+14);
  book.status='dipinjam'; book.due = due.toISOString().slice(0,10);
  logHistory(`🔖 Meminjam <strong>${book.title}</strong> — jatuh tempo ${fmtDate(book.due)}`);
  saveShared('🔖 '+who()+' meminjam <strong>'+book.title+'</strong>');
  refreshAllViews();
  return true;
}
function returnBook(id){
  const book = CATALOG.find(b=>b.id===id);
  if(!book) return;
  logHistory(`✅ Mengembalikan <strong>${book.title}</strong>`);
  book.status='tersedia'; book.due=null;
  saveShared('✅ '+who()+' mengembalikan <strong>'+book.title+'</strong>');
  refreshAllViews();
}
function extendBook(id){
  const book = CATALOG.find(b=>b.id===id);
  if(!book || !book.due) return;
  const d = new Date(book.due); d.setDate(d.getDate()+7);
  book.due = d.toISOString().slice(0,10);
  logHistory(`⏳ Perpanjang <strong>${book.title}</strong> hingga ${fmtDate(book.due)}`);
  saveShared('⏳ '+who()+' memperpanjang <strong>'+book.title+'</strong>');
  refreshAllViews();
}
function findBookByFragment(text){
  const t = text.toLowerCase();
  return CATALOG.find(b=>t.includes(b.title.toLowerCase()) || b.title.toLowerCase().includes(t.trim()));
}
function refreshAllViews(){
  renderStats(); renderPopular(); renderCatalog(); renderLoans(); renderDashboard();
}

/* ================= BERANDA ================= */
function renderStats(){
  const totalBuku = CATALOG.length;
  const dipinjam = CATALOG.filter(b=>b.status==='dipinjam').length;
  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card"><div class="icon">📚</div><div class="num">${totalBuku}</div><div class="label">Total Buku</div></div>
    <div class="stat-card"><div class="icon">🔖</div><div class="num">${dipinjam}</div><div class="label">Sedang Dipinjam</div></div>
    <div class="stat-card"><div class="icon">🧑‍🤝‍🧑</div><div class="num">128</div><div class="label">Anggota Aktif</div></div>
    <div class="stat-card"><div class="icon">🎨</div><div class="num">${Object.keys(SHELF_CAP).length}</div><div class="label">Tema Rak</div></div>`;
}
function bookCardHtml(b){
  const color = THEME_COLORS[b.theme];
  return `
    <div class="book-card">
      <div class="book-cover" style="background:${color}">📕</div>
      <span class="theme-tag" style="background:${color}">${b.theme}</span>
      <h3>${b.title}</h3>
      <div class="author">${b.author}</div>
      ${b.status==='tersedia'
        ? `<span class="status-badge tersedia">● Tersedia</span><button class="btn btn-coral" onclick="borrowBook(${b.id})">Pinjam</button>`
        : `<span class="status-badge dipinjam">● Dipinjam s/d ${fmtDate(b.due)}</span><button class="btn btn-outline" disabled>Tidak tersedia</button>`}
    </div>`;
}
function renderPopular(){
  const picks = CATALOG.slice(0,4);
  document.getElementById('popularGrid').innerHTML = picks.map(bookCardHtml).join('');
}
function heroSearch(){
  const q = document.getElementById('heroSearch').value;
  showPage('katalog');
  document.getElementById('catalogSearch').value = q;
  renderCatalog();
}

/* ================= KATALOG ================= */
let activeThemeFilter = 'Semua';
function renderFilterRow(){
  const themes = ['Semua', ...Object.keys(THEME_COLORS)];
  document.getElementById('filterRow').innerHTML = themes.map(t=>
    `<button class="filter-pill ${t===activeThemeFilter?'active':''}" onclick="setThemeFilter('${t}')">${t}</button>`
  ).join('');
}
function setThemeFilter(t){ activeThemeFilter=t; renderFilterRow(); renderCatalog(); }
function renderCatalog(){
  renderFilterRow();
  const q = (document.getElementById('catalogSearch')?.value || '').toLowerCase();
  let list = CATALOG.filter(b => (activeThemeFilter==='Semua' || b.theme===activeThemeFilter)
    && (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)));
  document.getElementById('catalogGrid').innerHTML = list.length ? list.map(bookCardHtml).join('')
    : `<div class="empty-note">Tidak ada buku yang cocok.</div>`;
}

/* ================= PINJAM ================= */
function renderLoans(){
  const loans = CATALOG.filter(b=>b.status==='dipinjam');
  const el = document.getElementById('loanList');
  el.innerHTML = loans.length ? loans.map(b=>{
    const st = dueStatus(b.due);
    const label = st==='telat' ? 'Terlambat!' : st==='segera' ? 'Segera jatuh tempo' : 'Aman';
    return `
    <div class="loan-card">
      <div class="loan-info">
        <h3>${b.title}</h3>
        <div class="author">${b.author} · <span class="theme-tag" style="background:${THEME_COLORS[b.theme]}">${b.theme}</span></div>
        <div class="due ${st}">📅 Jatuh tempo ${fmtDate(b.due)} — ${label}</div>
      </div>
      <div class="loan-actions">
        <button class="btn btn-teal" onclick="extendBook(${b.id})">Perpanjang</button>
        <button class="btn btn-coral" onclick="returnBook(${b.id})">Kembalikan</button>
      </div>
    </div>`;
  }).join('') : `<div class="empty-note">Kamu belum meminjam buku apa pun. Yuk jelajahi <a href="#" onclick="showPage('katalog')">katalog</a>!</div>`;
  renderHistory();
}

/* ================= CHAT ================= */
let chatLog = [];
function pushChat(role, text){
  chatLog.push({role, text});
  const body = document.getElementById('chatBody');
  body.innerHTML = chatLog.map(m=>`<div class="msg ${m.role}">${m.text}</div>`).join('');
  body.scrollTop = body.scrollHeight;
}
function initChat(){
  if(chatLog.length) return;
  pushChat('bot', "Halo! Aku Pak Budi, pustakawan digital yang dibantu Funny AI 🤖📚. Mau cari buku, pinjam, atau kembalikan? Tulis saja pesanmu!");
}
function quickChat(text){
  document.getElementById('chatInput').value = text;
  sendChat();
}
function sendChat(){
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;
  pushChat('user', text);
  input.value='';
  setTimeout(()=> pushChat('bot', botReply(text)), 400);
}
function botReply(text){
  const t = text.toLowerCase();
  if(t.includes('jam buka') || t.includes('jam operasional')){
    return "Kami buka Senin–Jumat 08.00–20.00, Sabtu 09.00–15.00, Minggu tutup 🕒.";
  }
  if(t.includes('kembalikan')){
    const book = findBookByFragment(t.replace('kembalikan',''));
    if(book && book.status==='dipinjam'){ returnBook(book.id); return `Sudah kucatat, <strong>${book.title}</strong> sudah dikembalikan. Terima kasih! ✅`; }
    if(book) return `Sepertinya <strong>${book.title}</strong> belum tercatat sedang dipinjam.`;
    return "Buku apa yang mau dikembalikan? Sertakan judulnya ya, mis. 'kembalikan Sapiens'.";
  }
  if(t.includes('pinjam')){
    const book = findBookByFragment(t.replace('pinjam',''));
    if(book && book.status==='tersedia'){ borrowBook(book.id); return `Sip! <strong>${book.title}</strong> sudah aku pinjamkan untukmu, jatuh tempo ${fmtDate(book.due)} 🔖.`; }
    if(book) return `Waduh, <strong>${book.title}</strong> sedang dipinjam orang lain sampai ${fmtDate(book.due)}. Mau kucarikan tema serupa?`;
    return "Judul buku apa yang mau dipinjam? Coba sebutkan judulnya, mis. 'pinjam Sapiens'.";
  }
  if(t.includes('cari')){
    const foundTheme = Object.keys(THEME_COLORS).find(th=>t.includes(th.toLowerCase().split(' ')[0]));
    if(foundTheme){
      const results = CATALOG.filter(b=>b.theme===foundTheme && b.status==='tersedia').map(b=>b.title);
      return results.length ? `Buku tema ${foundTheme} yang tersedia: ${results.join(', ')} 📚` : `Semua buku tema ${foundTheme} sedang dipinjam nih.`;
    }
    return "Mau cari tema apa? Ada Fiksi, Sains & Teknologi, Sejarah, Anak & Remaja, atau Bisnis & Ekonomi.";
  }
  if(t.includes('halo') || t.includes('hai') || t.includes('pagi') || t.includes('siang')){
    return "Halo juga! Ada yang bisa kubantu terkait buku hari ini? 😊";
  }
  if(t.includes('terima kasih') || t.includes('makasih')){
    return "Sama-sama! Senang bisa bantu 🎉. Selamat membaca!";
  }
  return "Hmm, aku belum paham maksudnya 🤔. Coba ketik 'pinjam <judul>', 'kembalikan <judul>', 'cari <tema>', atau 'jam buka'.";
}

/* ================= INFO / FAQ ================= */
const FAQS = [
  ["Bagaimana cara membuat kartu anggota?","Daftar langsung di meja layanan dengan membawa KTP/KTA, gratis untuk warga sekitar."],
  ["Berapa lama batas waktu peminjaman?","Standarnya 14 hari, bisa diperpanjang 7 hari lagi lewat halaman Pinjam Buku atau chat pustakawan."],
  ["Apakah bisa pinjam lewat chat?","Bisa! Ketik 'pinjam <judul buku>' di halaman Chat Pustakawan, sistem akan mencatatnya otomatis."],
  ["Bagaimana jika buku hilang atau rusak?","Silakan lapor ke meja layanan, akan ada penggantian sesuai kebijakan perpustakaan."],
];
function renderFaq(){
  document.getElementById('faqList').innerHTML = FAQS.map((f,i)=>`
    <div class="faq-item" id="faq-${i}" onclick="toggleFaq(${i})">
      <div class="faq-q">${f[0]} <span>+</span></div>
      <div class="faq-a">${f[1]}</div>
    </div>`).join('');
}
function toggleFaq(i){ document.getElementById('faq-'+i).classList.toggle('open'); }

/* ================= KLASIFIKASI DEMO ================= */
const THEME_KEYWORDS = {
  "Fiksi": ["cerita","novel","petualangan","kisah","dunia","fantasi","karakter","kehidupan","cinta"],
  "Sains & Teknologi": ["sains","teknologi","robot","luar angkasa","planet","fisika","komputer","penelitian","eksperimen"],
  "Sejarah": ["sejarah","perang","kerajaan","masa lalu","peristiwa","kolonial","abad"],
  "Anak & Remaja": ["anak","remaja","dongeng","sekolah","persahabatan"],
  "Bisnis & Ekonomi": ["bisnis","ekonomi","uang","investasi","perusahaan","strategi","pasar"],
};
function layoutBubbles(){
  const field = document.getElementById('bubbleField');
  field.innerHTML='';
  const names = Object.keys(THEME_COLORS);
  const w = field.clientWidth || 600, h = field.clientHeight || 190;
  const positions = [[0.08,0.15],[0.42,0.05],[0.75,0.3],[0.55,0.62],[0.15,0.65]];
  names.forEach((name,i)=>{
    const b = document.createElement('div');
    b.className='bubble'; b.id='bub-'+i;
    b.textContent = name;
    const size = 74;
    b.style.width=size+'px'; b.style.height=size+'px';
    b.style.left = (positions[i][0]*w)+'px';
    b.style.top = (positions[i][1]*h)+'px';
    b.style.background = THEME_COLORS[name];
    field.appendChild(b);
  });
}
function runClassifyDemo(){
  const text = document.getElementById('clsInput').value.toLowerCase();
  layoutBubbles();
  let best = Object.keys(THEME_COLORS)[0], bestScore=-1;
  Object.entries(THEME_KEYWORDS).forEach(([theme,kws])=>{
    let score = kws.reduce((acc,k)=> acc + (text.includes(k)?1:0), 0);
    if(score>bestScore){bestScore=score; best=theme;}
  });
  const names = Object.keys(THEME_COLORS);
  const idx = names.indexOf(best);
  setTimeout(()=>{
    document.querySelectorAll('#bubbleField .bubble').forEach(b=>b.classList.remove('match'));
    const el = document.getElementById('bub-'+idx);
    if(el) el.classList.add('match');
  }, 150);
}

/* ================= SCAN DEMO ================= */
async function runScanDemo(){
  const q = document.getElementById('scanInput').value.trim();
  const line = document.getElementById('scanLine');
  const resultEl = document.getElementById('scanResult');
  resultEl.innerHTML='';
  if(!q){ resultEl.textContent='Masukkan ISBN terlebih dahulu.'; return; }
  line.classList.add('scanning');
  try{
    const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:'+encodeURIComponent(q.replace(/-/g,''))+'&maxResults=1');
    const data = await res.json();
    line.classList.remove('scanning');
    if(data.items && data.items.length){
      const info = data.items[0].volumeInfo;
      resultEl.innerHTML = `
        ${info.imageLinks? `<img src="${info.imageLinks.thumbnail}">`:''}
        <strong>${(info.title||'')}</strong><br>
        ${(info.authors||[]).join(', ')}<br>
        <span style="color:#7a6e75;">Metadata ditarik otomatis dari database eksternal.</span>`;
    } else {
      resultEl.textContent = 'Tidak ditemukan di database eksternal.';
    }
  }catch(e){
    line.classList.remove('scanning');
    resultEl.textContent = 'Gagal memindai (jaringan bermasalah).';
  }
}

/* ================= TATA LETAK DEMO ================= */
const LAYOUT_THEMES = Object.keys(THEME_COLORS).map(name=>({name, color:THEME_COLORS[name], val: Math.floor(Math.random()*60)+30}));
function renderSliders(){
  const wrap = document.getElementById('sliderRows');
  wrap.innerHTML = LAYOUT_THEMES.map((t,i)=>`
    <div class="theme-row">
      <label>${t.name}</label>
      <input type="range" min="0" max="100" value="${t.val}" oninput="updateLayoutVal(${i}, this.value)">
      <span class="val" id="valNum-${i}">${t.val}</span>
    </div>`).join('');
  renderRank();
}
function updateLayoutVal(i, v){
  LAYOUT_THEMES[i].val = parseInt(v);
  document.getElementById('valNum-'+i).textContent = v;
  renderRank();
}
function renderRank(){
  const sorted = [...LAYOUT_THEMES].sort((a,b)=>b.val-a.val);
  document.getElementById('rankList').innerHTML = sorted.map(t=>
    `<li><span class="swatch" style="background:${t.color}"></span>${t.name} — peminjaman ${t.val}%</li>`
  ).join('');
}

/* ================= DASHBOARD (derived from CATALOG) ================= */
function renderDashboard(){
  const el = document.getElementById('dashMockup');
  if(!el) return;
  const html = Object.keys(THEME_COLORS).map(theme=>{
    const count = CATALOG.filter(b=>b.theme===theme && b.status==='tersedia').length;
    const cap = SHELF_CAP[theme];
    const pct = Math.min(100, Math.round((count/cap)*100));
    const note = count>=cap ? '<span class="warn">⚠️ penuh</span>' : '';
    return `
      <div class="mockup-shelf">
        <div class="top"><span>Rak — ${theme}</span><span>${count}/${cap} ${note}</span></div>
        <div class="mockup-bar"><div style="width:${pct}%;background:${THEME_COLORS[theme]}"></div></div>
      </div>`;
  }).join('');
  el.innerHTML = html;

  const borrowed = CATALOG.filter(b=>b.status==='dipinjam');
  const recoEl = document.getElementById('recoList');
  if(recoEl){
    recoEl.innerHTML = borrowed.length ? borrowed.map(b=>`
      <div class="reco-item"><span><strong>${b.title}</strong> akan kembali ke rak ${b.theme} setelah dikembalikan (jatuh tempo ${fmtDate(b.due)})</span><span class="badge">dipantau</span></div>
    `).join('') : `<div class="empty-note">Semua buku sudah berada di rak yang sesuai 🎉</div>`;
  }
}

/* ================= DATA SCHEMA ================= */
const DATA_CATEGORIES = [
  {icon:"🪪", color:"#FF6B6B", title:"Data Identitas Buku (Metadata Dasar)", fields:[
    ["Judul buku","wajib"], ["Nama penulis","wajib"], ["ISBN","kunci utama"],
    ["Penerbit & tahun terbit","penting"], ["Edisi (jika ada)","opsional"],
  ]},
  {icon:"🧭", color:"#12B8A6", title:"Data Konten/Tema", fields:[
    ["Sinopsis / deskripsi singkat","wajib"], ["Kata kunci (keywords) / tag tema","penting"],
    ["Kategori/genre existing dari katalog lama","opsional"], ["Daftar isi / bab utama","opsional"],
  ]},
  {icon:"🖼️", color:"#FFC94D", title:"Data Visual", fields:[
    ["Foto/scan sampul buku","penting"], ["Foto punggung buku (spine)","opsional"],
  ]},
  {icon:"🏛️", color:"#8B5CF6", title:"Data Fisik & Lokasi", fields:[
    ["Kondisi & kapasitas tiap rak","wajib"], ["Lokasi rak saat ini (nomor rak/lorong)","wajib"],
    ["Dimensi buku (tebal, tinggi)","opsional"],
  ]},
  {icon:"📈", color:"#2ECC71", title:"Data Perilaku Pengguna", fields:[
    ["Riwayat peminjaman","opsional"], ["Data pencarian pengguna di katalog","opsional"],
  ]},
  {icon:"🌐", color:"#3A86FF", title:"Data Referensi Eksternal", fields:[
    ["Google Books API / WorldCat","pengaya"], ["Perpustakaan Nasional","pengaya"],
    ["Standar Dewey Decimal (DDC) / LCC","standar"],
  ]},
];
function renderDataCards(){
  const grid = document.getElementById('dataGrid');
  grid.innerHTML = DATA_CATEGORIES.map((c,i)=>`
    <div class="data-card" id="dcard-${i}" onclick="toggleDataCard(${i})">
      <div class="head">
        <div class="left"><span class="icon">${c.icon}</span><h3>${c.title}</h3></div>
        <span class="toggle">+</span>
      </div>
      <ul class="fields">
        ${c.fields.map(f=>`<li>${f[0]} <span class="tag" style="background:${c.color}">${f[1]}</span></li>`).join('')}
      </ul>
    </div>`).join('');
}
function toggleDataCard(i){ document.getElementById('dcard-'+i).classList.toggle('open'); }

/* ================= ANIMASI ANGKA ================= */
function animateNums(sel){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  document.querySelectorAll(sel).forEach(el=>{
    const to=+el.textContent; if(!to) return;
    const t0=performance.now();
    (function step(t){
      const p=Math.min(1,(t-t0)/700);
      el.textContent=Math.round(to*(1-Math.pow(1-p,3)));
      if(p<1) requestAnimationFrame(step);
    })(t0);
  });
}
const _renderStats=renderStats;
renderStats=function(){_renderStats();animateNums('#statsRow .num');};

/* ================= AKUN: DAFTAR & MASUK ================= */
/* Prototipe: akun disimpan di localStorage browser ini saja. Kata sandi di-hash dengan salt,
   tetapi pengecekan tetap terjadi di browser, jadi belum aman untuk data sungguhan. */
const UK = 'pc-users', SESS = 'pc-session';
const qid = id => document.getElementById(id);
const getUsers = () => { try{ return JSON.parse(localStorage.getItem(UK)) || []; }catch(e){ return []; } };
const setUsers = u => { try{ localStorage.setItem(UK, JSON.stringify(u)); }catch(e){} };
function currentUser(){
  try{ const e = localStorage.getItem(SESS); return getUsers().find(u=>u.email===e) || null; }catch(e){ return null; }
}
const who = () => { const u = currentUser(); return u ? esc(u.nama) : 'Anggota'; };
const newSalt = () => [...crypto.getRandomValues(new Uint8Array(8))].map(x=>x.toString(16).padStart(2,'0')).join('');
async function hashPw(pw, salt){
  const data = new TextEncoder().encode(salt+':'+pw);
  if(window.crypto && crypto.subtle){
    const b = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  let h = 5381; for(const c of data) h = ((h<<5)+h+c)>>>0;   // cadangan sederhana bila browser tak mendukung SHA-256
  return 'x'+h.toString(16);
}
async function doRegister(ev){
  ev.preventDefault();
  const err = t => { qid('regErr').textContent = t; };
  const nama = qid('regNama').value.trim(), email = qid('regEmail').value.trim().toLowerCase();
  const p1 = qid('regPw').value, p2 = qid('regPw2').value;
  if(nama.length < 2) return err('Isi nama lengkap, minimal 2 huruf.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Format email belum benar, contoh: nama@email.com.');
  if(p1.length < 8) return err('Kata sandi minimal 8 karakter.');
  if(p1 !== p2) return err('Kata sandi dan ulangannya belum sama.');
  const users = getUsers();
  if(users.some(u=>u.email===email)) return err('Email ini sudah terdaftar. Silakan masuk.');
  const salt = newSalt();
  users.push({nama, email, salt, hash: await hashPw(p1, salt),
    nomor: 'LIB-'+new Date().getFullYear()+'-'+String(users.length+1).padStart(5,'0')});
  setUsers(users);
  try{ localStorage.setItem(SESS, email); }catch(e){}
  ev.target.reset(); err(''); afterAuth();
}
async function doLogin(ev){
  ev.preventDefault();
  const email = qid('loginEmail').value.trim().toLowerCase(), pw = qid('loginPw').value;
  const u = getUsers().find(x=>x.email===email);
  if(!u || await hashPw(pw, u.salt) !== u.hash){ qid('loginErr').textContent = 'Email atau kata sandi salah.'; return; }
  try{ localStorage.setItem(SESS, email); }catch(e){}
  ev.target.reset(); qid('loginErr').textContent = ''; afterAuth();
}
function logout(){ try{ localStorage.removeItem(SESS); }catch(e){} afterAuth(); }
function afterAuth(){ renderAuth(); renderMember(); showPage('beranda'); }
function renderAuth(){
  const u = currentUser();
  qid('authBox').innerHTML = u
    ? `<span class="hello">👋 Halo, ${esc(u.nama.split(' ')[0])}</span><button class="pill" onclick="logout()">Keluar</button>`
    : `<button class="pill navlink" data-page="masuk" onclick="showPage('masuk')">Masuk</button><button class="pill navlink" data-page="daftar" onclick="showPage('daftar')">Daftar</button>`;
}
function renderMember(){
  const u = currentUser();
  qid('memberCard').innerHTML = u
    ? `<div class="member-card">
        <div class="row"><span class="name">${esc(u.nama)}</span><span>🪪</span></div>
        <div class="id">${esc(u.nomor)}</div>
        <div class="row" style="margin-top:14px;"><span class="meta">Berlaku hingga 31 Des ${new Date().getFullYear()}</span><span class="meta">Maks. 5 buku</span></div>
      </div>`
    : `<div class="panel" style="max-width:360px;margin-bottom:24px;">
        <h2>🪪 Kartu Anggota</h2>
        <p style="font-size:.88rem;color:#54494f;margin:0 0 14px;">Masuk atau daftar untuk mendapat kartu anggota digitalmu.</p>
        <div style="display:flex;gap:8px;"><button class="btn btn-coral" onclick="showPage('masuk')">Masuk</button><button class="btn btn-outline" onclick="showPage('daftar')">Daftar</button></div>
      </div>`;
}

/* ================= INIT ================= */
renderAnn();
renderStats();
renderPopular();
renderFilterRow();
renderCatalog();
renderLoans();
initChat();
renderFaq();
layoutBubbles();
renderSliders();
renderDashboard();
renderDataCards();
renderAuth();
renderMember();
