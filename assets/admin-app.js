(()=>{
const A=window.MidhoAPI,$=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
let state={data:null,section:"overview",status:"all",from:"",to:""};

const esc=(v="")=>String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const toast=(m,type="ok")=>{const t=$("#adminToast");if(!t)return;t.textContent=m;t.className="admin-toast show "+type;setTimeout(()=>t.classList.remove("show"),2600)};
const statusLabel=s=>s==="selesai"?"Selesai":s==="revisi"?"Revisi":"Berlangsung";
const orders=()=>state.data.orders.filter(o=>(state.status==="all"||o.status===state.status)&&(!state.from||o.order_date>=state.from)&&(!state.to||o.order_date<=state.to));
const reload=async()=>{state.data=await A.snapshot();render();};

async function enter(){
  $("#loginView").hidden=true;$("#adminView").hidden=false;
  try{await reload()}catch(e){A.logout();$("#adminView").hidden=true;$("#loginView").hidden=false;toast("Sesi berakhir, masukkan PIN lagi.","err")}
}
$("#pinForm").addEventListener("submit",async e=>{
  e.preventDefault();const btn=e.submitter;btn.disabled=true;
  try{await A.login(new FormData(e.target).get("pin"));e.target.reset();await enter()}catch(err){toast(err.message||"PIN salah","err")}finally{btn.disabled=false}
});
$("#logoutBtn").addEventListener("click",()=>{A.logout();$("#adminView").hidden=true;$("#loginView").hidden=false;});
if(A.hasToken()) enter();

function navTitle(){return ({overview:"Overview",orders:"Orders",services:"Layanan",products:"Produk",pricing:"Harga",portfolio:"Portfolio",content:"Konten Website",branding:"Logo & Favicon"})[state.section]||"Settings"}
function render(){
  $$(".side-item[data-nav]").forEach(x=>x.classList.toggle("active",x.dataset.nav===state.section));
  $("#adminCurrent").textContent=navTitle();
  if(state.section==="overview")overview();
  else if(state.section==="orders")ordersPage();
  else if(["services","products","pricing","portfolio"].includes(state.section))contentList(state.section);
  else if(state.section==="content")siteSettings();
  else if(state.section==="branding")branding();
}
document.addEventListener("click",e=>{
  const n=e.target.closest("[data-nav]");if(n){state.section=n.dataset.nav;render();return}
  const a=e.target.closest("[data-action]");if(a){handleAction(a);return}
  const eo=e.target.closest("[data-edit-order]");if(eo){orderModal(state.data.orders.find(x=>x.id===eo.dataset.editOrder));return}
  const ec=e.target.closest("[data-edit-content]");if(ec){contentModal(ec.dataset.type,state.data[ec.dataset.type].find(x=>x.id===ec.dataset.editContent));return}
  const dc=e.target.closest("[data-delete-content]");if(dc)deleteContent(dc.dataset.type,dc.dataset.deleteContent);
});
document.addEventListener("change",e=>{
  if(e.target.id==="statusFilter"){state.status=e.target.value;render()}
  if(e.target.id==="fromFilter"){state.from=e.target.value;render()}
  if(e.target.id==="toFilter"){state.to=e.target.value;render()}
});

function overview(){
  const all=state.data.orders,done=all.filter(x=>x.status==="selesai").length,active=all.filter(x=>x.status==="berlangsung").length;
  const rev=all.filter(x=>x.status==="selesai").reduce((s,x)=>s+Number(x.amount||0),0);
  const byMonth={};all.forEach(o=>{const k=(o.order_date||"").slice(0,7);if(k)byMonth[k]=(byMonth[k]||0)+Number(o.amount||0)});
  const months=Object.keys(byMonth).sort().slice(-6),max=Math.max(1,...months.map(x=>byMonth[x]));
  $("#mainContent").innerHTML=`
  <div class="admin-heading"><div><span class="hello">Midho Studio Admin</span><h1>Business overview</h1><p>Data langsung dari Supabase.</p></div><button class="btn btn-primary compact" data-action="new-order">+ Tambah Order</button></div>
  <section class="stat-grid">
    <article class="stat-card"><div class="stat-icon">Rp</div><div><span>Total Revenue</span><strong>${A.money(rev)}</strong><small>Order selesai</small></div></article>
    <article class="stat-card"><div class="stat-icon">▣</div><div><span>Total Order</span><strong>${all.length}</strong><small>Semua periode</small></div></article>
    <article class="stat-card"><div class="stat-icon">◌</div><div><span>Berlangsung</span><strong>${active}</strong><small>Project aktif</small></div></article>
    <article class="stat-card"><div class="stat-icon">✓</div><div><span>Selesai</span><strong>${done}</strong><small>${all.length?Math.round(done/all.length*100):0}% completion</small></div></article>
  </section>
  <section class="admin-grid">
    <article class="panel"><div class="panel-head"><div><span>Revenue analytics</span><h3>6 bulan terakhir</h3></div></div>
      <div class="bar-chart">${months.map(m=>`<div class="bar-col"><div class="bar-value">${A.money(byMonth[m]).replace("Rp","").trim()}</div><div class="bar-track"><i style="height:${Math.max(5,Math.round(byMonth[m]/max*100))}%"></i></div><small>${m.slice(5)}/${m.slice(2,4)}</small></div>`).join("")||'<p class="empty">Belum ada data.</p>'}</div>
    </article>
    <article class="panel"><div class="panel-head"><div><span>Quick access</span><h3>Kelola website</h3></div></div>
      <div class="quick-grid"><button data-nav="portfolio">Upload Portfolio</button><button data-nav="products">Kelola Produk</button><button data-nav="pricing">Kelola Harga</button><button data-nav="branding">Logo & Favicon</button></div>
    </article>
  </section>
  ${orderTable(all.slice(0,5),true)}`;
}

function filterBar(){return `<section class="admin-filterbar panel"><div><label>Status</label><select id="statusFilter"><option value="all">Semua</option><option value="berlangsung">Berlangsung</option><option value="revisi">Revisi</option><option value="selesai">Selesai</option></select></div><div><label>Dari</label><input id="fromFilter" type="date" value="${state.from}"></div><div><label>Sampai</label><input id="toFilter" type="date" value="${state.to}"></div><button class="btn btn-outline compact" data-action="reset-filter">Reset</button></section>`}
function ordersPage(){ $("#mainContent").innerHTML=`<div class="admin-heading"><div><span class="hello">Management</span><h1>Orders</h1><p>Tambah, edit, hapus, filter, dan checklist progres.</p></div><button class="btn btn-primary compact" data-action="new-order">+ Tambah Order</button></div>${filterBar()}${orderTable(orders())}`;$("#statusFilter").value=state.status;}
function orderTable(rows,compact=false){return `<section class="panel order-panel"><div class="panel-head order-head"><div><span>Orders</span><h3>${compact?"Order terbaru":"Daftar order"}</h3></div></div><div class="table-wrap"><table><thead><tr><th>PROJECT</th><th>CLIENT</th><th>LAYANAN</th><th>TANGGAL</th><th>DEADLINE</th><th>NILAI</th><th>PROGRESS</th><th>STATUS</th><th></th></tr></thead><tbody>${rows.map(o=>`<tr><td><strong>${esc(o.project)}</strong><small>${esc(o.order_code)}</small></td><td>${esc(o.client)}</td><td>${esc(o.service)}</td><td>${esc(o.order_date)}</td><td>${esc(o.deadline||"-")}</td><td>${A.money(o.amount)}</td><td><div class="progress-cell"><div class="progress-bar"><i style="width:${A.progress(o)}%"></i></div><span>${A.progress(o)}%</span></div></td><td><span class="status ${o.status==="selesai"?"done":o.status==="revisi"?"revision":"in-progress"}">${statusLabel(o.status)}</span></td><td><button class="row-action" data-edit-order="${o.id}">Edit</button></td></tr>`).join("")||'<tr><td colspan="9" class="empty">Belum ada order.</td></tr>'}</tbody></table></div></section>`}

function contentList(type){
  const meta={services:["Layanan","Kelola daftar layanan publik."],products:["Produk","Kelola produk unggulan dan link penjualan."],pricing:["Paket Harga","Kelola harga, fitur, dan paket unggulan."],portfolio:["Portfolio","Upload gambar project, edit informasi, atau hapus sepenuhnya."]}[type];
  $("#mainContent").innerHTML=`<div class="admin-heading"><div><span class="hello">Website content</span><h1>${meta[0]}</h1><p>${meta[1]}</p></div><button class="btn btn-primary compact" data-action="new-content" data-type="${type}">+ Tambah</button></div><div class="${type==="portfolio"?"portfolio-admin-grid":"content-list"}">${state.data[type].map(x=>contentCard(type,x)).join("")||'<p class="empty">Belum ada data.</p>'}</div>`;
}
function contentCard(type,x){
  if(type==="portfolio"){
    const img=x.image_path?A.publicAsset("portfolio",x.image_path):(x.image_url||"");
    return `<article class="portfolio-admin-card panel">${img?`<img src="${img}" alt="${esc(x.image_alt||x.title)}">`:'<div class="portfolio-placeholder">No image</div>'}<div><span class="content-kicker">${esc(x.category_label)}</span><h3>${esc(x.title)}</h3><p>${esc(x.year||"")}</p></div><div class="content-actions"><button class="btn btn-outline compact" data-edit-content="${x.id}" data-type="portfolio">Edit</button><button class="btn btn-danger compact" data-delete-content="${x.id}" data-type="portfolio">Hapus</button></div></article>`
  }
  const sub=type==="products"?A.money(x.price):type==="pricing"?x.price_text:x.description;
  return `<article class="content-row panel"><div><span class="content-kicker">${type}</span><h3>${esc(x.name)}</h3><p>${esc(sub||"")}</p></div><div class="content-actions"><button class="btn btn-outline compact" data-edit-content="${x.id}" data-type="${type}">Edit</button><button class="btn btn-danger compact" data-delete-content="${x.id}" data-type="${type}">Hapus</button></div></article>`
}

function siteSettings(){
  const s=state.data.site||{};
  $("#mainContent").innerHTML=`<div class="admin-heading"><div><span class="hello">Website</span><h1>Konten Website</h1><p>Semua perubahan langsung tersimpan ke Supabase dan tampil di website.</p></div></div>
  <form class="panel settings-form" id="siteForm">
    <div class="field full"><label>Headline hero</label><input name="hero_title" value="${esc(s.hero_title||"")}"></div>
    <div class="field full"><label>Deskripsi hero</label><textarea name="hero_description">${esc(s.hero_description||"")}</textarea></div>
    <div class="field full"><label>Profil Midho Studio</label><textarea name="about">${esc(s.about||"")}</textarea></div>
    <div class="field"><label>WhatsApp</label><input name="whatsapp" value="${esc(s.whatsapp||"")}" placeholder="628..."></div>
    <div class="field"><label>lynk.id</label><input name="lynk" value="${esc(s.lynk||"")}"></div>
    <div class="field"><label>Instagram</label><input name="instagram" value="${esc(s.instagram||"")}"></div>
    <div class="field"><label>Email</label><input name="email" value="${esc(s.email||"")}"></div>
    <div class="field full"><label>Lokasi</label><input name="location" value="${esc(s.location||"")}"></div>
    <div class="field full"><button class="btn btn-primary">Simpan Semua</button></div>
  </form>`;
}
function branding(){
  const s=state.data.site||{},logo=s.logo_path?A.publicAsset("site-assets",s.logo_path):"/assets/midho-logo-white.png",fav=s.favicon_path?A.publicAsset("site-assets",s.favicon_path):"/assets/midho-logo-white.png";
  $("#mainContent").innerHTML=`<div class="admin-heading"><div><span class="hello">Brand assets</span><h1>Logo & Favicon</h1><p>Ganti logo website dan favicon langsung dari dashboard.</p></div></div>
  <div class="brand-settings-grid">
    <form class="panel asset-form" id="logoForm"><h3>Logo Website</h3><div class="asset-preview blue"><img src="${logo}" alt=""></div><input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required><button class="btn btn-primary">Upload & Ganti Logo</button></form>
    <form class="panel asset-form" id="faviconForm"><h3>Favicon</h3><div class="asset-preview"><img src="${fav}" alt=""></div><input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" required><button class="btn btn-primary">Upload & Ganti Favicon</button></form>
  </div>`;
}

function modal(html){$("#modalRoot").innerHTML=`<div class="modal-backdrop"><div class="modal-card"><button class="modal-close" data-action="close-modal">×</button>${html}</div></div>`}
function orderModal(o){
  o=o||{id:"",order_code:"MS-"+Date.now().toString().slice(-6),project:"",client:"",service:"",order_date:new Date().toISOString().slice(0,10),deadline:"",amount:0,status:"berlangsung",notes:"",progress:[{label:"Brief diterima",done:false},{label:"Pengerjaan",done:false},{label:"Review / revisi",done:false},{label:"Final / delivery",done:false}]};
  modal(`<h2>${o.id?"Edit":"Tambah"} Order</h2><form id="orderForm" class="modal-form"><input type="hidden" name="id" value="${esc(o.id)}"><div class="field"><label>Kode Order</label><input name="order_code" value="${esc(o.order_code)}" required></div><div class="field"><label>Project</label><input name="project" value="${esc(o.project)}" required></div><div class="field"><label>Client</label><input name="client" value="${esc(o.client)}" required></div><div class="field"><label>Layanan</label><input name="service" value="${esc(o.service)}"></div><div class="field"><label>Tanggal</label><input type="date" name="order_date" value="${esc(o.order_date)}"></div><div class="field"><label>Deadline</label><input type="date" name="deadline" value="${esc(o.deadline||"")}"></div><div class="field"><label>Nilai Project</label><input type="number" name="amount" value="${Number(o.amount||0)}"></div><div class="field"><label>Status</label><select name="status"><option value="berlangsung" ${o.status==="berlangsung"?"selected":""}>Berlangsung</option><option value="revisi" ${o.status==="revisi"?"selected":""}>Revisi</option><option value="selesai" ${o.status==="selesai"?"selected":""}>Selesai</option></select></div><div class="field full"><label>Catatan</label><textarea name="notes">${esc(o.notes||"")}</textarea></div><div class="field full"><label>Checklist Progress</label><div class="checklist">${(o.progress||[]).map((p,i)=>`<label><input type="checkbox" name="pd${i}" ${p.done?"checked":""}><input name="pl${i}" value="${esc(p.label)}"></label>`).join("")}</div></div><div class="modal-actions">${o.id?`<button type="button" class="btn btn-danger" data-action="delete-order" data-id="${o.id}">Hapus</button>`:""}<button class="btn btn-primary">Simpan</button></div></form>`);
}
function contentModal(type,x={}){
  const isP=type==="products",isPr=type==="pricing",isPort=type==="portfolio";
  modal(`<h2>${x.id?"Edit":"Tambah"} ${type}</h2><form id="contentForm" data-type="${type}" class="modal-form" enctype="multipart/form-data"><input type="hidden" name="id" value="${esc(x.id||"")}"><div class="field full"><label>${isPort?"Judul":"Nama"}</label><input name="name" value="${esc(x.name||x.title||"")}" required></div>
  ${isP?`<div class="field"><label>Kategori</label><input name="category" value="${esc(x.category||"")}"></div><div class="field"><label>Harga</label><input type="number" name="price" value="${Number(x.price||0)}"></div><div class="field full"><label>Deskripsi</label><textarea name="description">${esc(x.description||"")}</textarea></div><div class="field full"><label>Link lynk.id</label><input name="lynk_url" value="${esc(x.lynk_url||"")}"></div>`:isPr?`<div class="field"><label>Label</label><input name="label" value="${esc(x.label||"")}"></div><div class="field"><label>Harga Tampil</label><input name="price_text" value="${esc(x.price_text||"")}"></div><div class="field full"><label>Deskripsi</label><textarea name="description">${esc(x.description||"")}</textarea></div><div class="field full"><label>Fitur, satu per baris</label><textarea name="features">${esc((x.features||[]).join("\n"))}</textarea></div>`:isPort?`<div class="field"><label>Kategori</label><select name="category"><option value="brand">Branding</option><option value="digital">Digital</option><option value="print">Print</option></select></div><div class="field"><label>Label Kategori</label><input name="category_label" value="${esc(x.category_label||"")}"></div><div class="field"><label>Tahun</label><input name="year" value="${esc(x.year||new Date().getFullYear())}"></div><div class="field"><label>Alt Gambar</label><input name="image_alt" value="${esc(x.image_alt||"")}"></div><div class="field full"><label>Deskripsi</label><textarea name="description">${esc(x.description||"")}</textarea></div><div class="field full"><label>Gambar Portfolio ${x.image_path?"(kosongkan jika tidak diganti)":""}</label><input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif"></div>`:`<div class="field full"><label>Deskripsi</label><textarea name="description">${esc(x.description||"")}</textarea></div>`}<div class="field full"><label class="toggle"><input type="checkbox" name="featured" ${x.featured?"checked":""}> Featured</label></div><div class="modal-actions"><button class="btn btn-primary">Simpan</button></div></form>`);
  if(isPort&&x.category)$('#contentForm [name="category"]').value=x.category;
}

async function handleAction(a){
  if(a.dataset.action==="close-modal")$("#modalRoot").innerHTML="";
  if(a.dataset.action==="new-order")orderModal();
  if(a.dataset.action==="new-content")contentModal(a.dataset.type);
  if(a.dataset.action==="reset-filter"){state.status="all";state.from="";state.to="";render()}
  if(a.dataset.action==="delete-order"&&confirm("Hapus order ini? Progress terkait juga akan dihapus dari database.")){await A.remove("orders",a.dataset.id);$("#modalRoot").innerHTML="";await reload();toast("Order dihapus.");}
}
async function deleteContent(type,id){
  if(!confirm("Hapus data ini? Jika portfolio memiliki gambar, file Storage Supabase juga ikut dihapus."))return;
  try{await A.remove(type,id);await reload();toast("Data berhasil dihapus.")}catch(e){toast(e.message,"err")}
}

document.addEventListener("submit",async e=>{
  if(e.target.id==="orderForm"){e.preventDefault();const f=new FormData(e.target),progress=[];for(let i=0;i<12;i++){const label=(f.get("pl"+i)||"").toString().trim();if(label)progress.push({label,done:f.get("pd"+i)==="on"})}const order={id:f.get("id")||undefined,order_code:f.get("order_code"),project:f.get("project"),client:f.get("client"),service:f.get("service"),order_date:f.get("order_date"),deadline:f.get("deadline")||null,amount:Number(f.get("amount")||0),status:f.get("status"),notes:f.get("notes")||"",progress};try{await A.saveOrder(order);$("#modalRoot").innerHTML="";await reload();toast("Order tersimpan.")}catch(err){toast(err.message,"err")}return}
  if(e.target.id==="contentForm"){e.preventDefault();const f=new FormData(e.target),type=e.target.dataset.type,id=f.get("id")||undefined;try{
    let row={id,featured:f.get("featured")==="on"};
    if(type==="services")row={...row,name:f.get("name"),description:f.get("description")||""};
    if(type==="products")row={...row,name:f.get("name"),category:f.get("category")||"",description:f.get("description")||"",price:Number(f.get("price")||0),lynk_url:f.get("lynk_url")||""};
    if(type==="pricing")row={...row,name:f.get("name"),label:f.get("label")||"",price_text:f.get("price_text")||"",description:f.get("description")||"",features:(f.get("features")||"").split("\n").map(x=>x.trim()).filter(Boolean)};
    if(type==="portfolio"){const existing=state.data.portfolio.find(x=>x.id===id)||{};let image_path=existing.image_path||null;let image_url=existing.image_url||null;const file=f.get("image");if(file&&file.size){const up=await A.upload("portfolio",file);image_path=up.path;image_url=null}row={...row,title:f.get("name"),category:f.get("category"),category_label:f.get("category_label")||"",year:f.get("year")||"",description:f.get("description")||"",image_alt:f.get("image_alt")||"",image_path,image_url};}
    if(!row.id)delete row.id;await A.upsert(type,row);$("#modalRoot").innerHTML="";await reload();toast("Konten tersimpan.");
  }catch(err){toast(err.message,"err")}return}
  if(e.target.id==="siteForm"){e.preventDefault();const f=new FormData(e.target),row={id:1};["hero_title","hero_description","about","whatsapp","lynk","instagram","email","location"].forEach(k=>row[k]=f.get(k)||"");try{await A.upsert("site_settings",row);await reload();toast("Konten website diperbarui.")}catch(err){toast(err.message,"err")}return}
  if(e.target.id==="logoForm"||e.target.id==="faviconForm"){e.preventDefault();const file=new FormData(e.target).get("file");if(!file?.size)return;try{const up=await A.upload("site-assets",file);const row={id:1,[e.target.id==="logoForm"?"logo_path":"favicon_path"]:up.path};await A.upsert("site_settings",row);await reload();toast("Asset brand berhasil diganti.")}catch(err){toast(err.message,"err")}return}
});
})();