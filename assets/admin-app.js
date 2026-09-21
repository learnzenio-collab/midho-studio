(()=>{
  const S=window.MidhoStore;
  if(!S) return;
  const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
  const state={data:S.load(),section:"overview",filterStatus:"all",from:"",to:"",editOrder:null};

  const app=$("#adminApp");
  const loginView=$("#loginView");
  const setupView=$("#setupView");
  const adminView=$("#adminView");

  function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
  function save(){S.save(state.data);renderAll()}
  function statusLabel(s){return s==="selesai"?"Selesai":s==="revisi"?"Revisi":"Berlangsung"}
  function filteredOrders(){
    return state.data.orders.filter(o=>{
      const byStatus=state.filterStatus==="all"||o.status===state.filterStatus;
      const d=o.date||"";
      const byFrom=!state.from||d>=state.from;
      const byTo=!state.to||d<=state.to;
      return byStatus&&byFrom&&byTo;
    })
  }
  function revenue(orders){return orders.filter(o=>o.status==="selesai").reduce((a,b)=>a+Number(b.amount||0),0)}
  function renderOverview(){
    const orders=filteredOrders(), all=state.data.orders;
    const done=all.filter(o=>o.status==="selesai").length;
    const active=all.filter(o=>o.status==="berlangsung").length;
    const rev=revenue(all);
    const byMonth={};
    all.forEach(o=>{const k=(o.date||"").slice(0,7); if(k)byMonth[k]=(byMonth[k]||0)+Number(o.amount||0)});
    const months=Object.keys(byMonth).sort().slice(-6);
    const max=Math.max(1,...months.map(m=>byMonth[m]));
    $("#mainContent").innerHTML=`
      <div class="admin-heading">
        <div><span class="hello">Midho Studio Admin</span><h1>Business overview</h1><p>Pantau performa bisnis dan progres order dalam satu tempat.</p></div>
        <div class="heading-actions"><button class="btn btn-outline compact" data-action="export">Export JSON</button><button class="btn btn-primary compact" data-action="new-order">+ Tambah Order</button></div>
      </div>
      <section class="admin-filterbar panel">
        <div><label>Status</label><select id="statusFilter"><option value="all">Semua</option><option value="berlangsung">Berlangsung</option><option value="revisi">Revisi</option><option value="selesai">Selesai</option></select></div>
        <div><label>Dari tanggal</label><input type="date" id="fromFilter" value="${esc(state.from)}"></div>
        <div><label>Sampai tanggal</label><input type="date" id="toFilter" value="${esc(state.to)}"></div>
        <button class="btn btn-outline compact" data-action="clear-filter">Reset Filter</button>
      </section>
      <section class="stat-grid">
        <article class="stat-card"><div class="stat-icon">Rp</div><div><span>Total Revenue</span><strong>${S.money(rev)}</strong><small>Order selesai</small></div></article>
        <article class="stat-card"><div class="stat-icon">▣</div><div><span>Total Order</span><strong>${all.length}</strong><small>${orders.length} tampil setelah filter</small></div></article>
        <article class="stat-card"><div class="stat-icon">◌</div><div><span>Berlangsung</span><strong>${active}</strong><small>Project aktif</small></div></article>
        <article class="stat-card"><div class="stat-icon">✓</div><div><span>Selesai</span><strong>${done}</strong><small>${all.length?Math.round(done/all.length*100):0}% completion rate</small></div></article>
      </section>
      <section class="admin-grid">
        <article class="panel">
          <div class="panel-head"><div><span>Revenue analytics</span><h3>Penjualan 6 bulan terakhir</h3></div></div>
          <div class="bar-chart">${months.length?months.map(m=>`<div class="bar-col"><div class="bar-value">${S.money(byMonth[m]).replace("Rp","").trim()}</div><div class="bar-track"><i style="height:${Math.max(5,Math.round(byMonth[m]/max*100))}%"></i></div><small>${m.slice(5)}/${m.slice(2,4)}</small></div>`).join(""):'<p class="empty">Belum ada data.</p>'}</div>
        </article>
        <article class="panel">
          <div class="panel-head"><div><span>Order status</span><h3>Distribusi project</h3></div></div>
          <div class="donut-row"><div class="donut" style="background:conic-gradient(#0E43AB 0 ${all.length?done/all.length*100:0}%,#7CA4F2 ${all.length?done/all.length*100:0}% ${all.length?(done+active)/all.length*100:0}%,#E8D7A5 0)"><div><strong>${all.length}</strong><span>Orders</span></div></div>
          <div class="legend"><div><i></i><span>Selesai</span><strong>${done}</strong></div><div><i></i><span>Berlangsung</span><strong>${active}</strong></div><div><i></i><span>Revisi</span><strong>${all.filter(o=>o.status==="revisi").length}</strong></div></div></div>
        </article>
      </section>
      ${ordersTable(orders,true)}
    `;
    $("#statusFilter").value=state.filterStatus;
  }
  function ordersTable(orders,compact=false){
    return `<section class="panel order-panel">
      <div class="panel-head order-head"><div><span>Orders</span><h3>${compact?"Order terbaru":"Manajemen order"}</h3></div>${compact?'<button class="text-button" data-nav="orders">Lihat semua →</button>':'<button class="btn btn-primary compact" data-action="new-order">+ Tambah Order</button>'}</div>
      <div class="table-wrap"><table><thead><tr><th>PROJECT</th><th>CLIENT</th><th>LAYANAN</th><th>TANGGAL</th><th>DEADLINE</th><th>NILAI</th><th>PROGRESS</th><th>STATUS</th><th></th></tr></thead>
      <tbody>${orders.map(o=>`<tr><td><strong>${esc(o.project)}</strong><small>#${esc(o.id)}</small></td><td>${esc(o.client)}</td><td>${esc(o.service)}</td><td>${esc(o.date)}</td><td>${esc(o.deadline)}</td><td>${S.money(o.amount)}</td><td><div class="progress-cell"><div class="progress-bar"><i style="width:${S.progress(o)}%"></i></div><span>${S.progress(o)}%</span></div></td><td><span class="status ${o.status==="selesai"?"done":o.status==="revisi"?"revision":"in-progress"}">${statusLabel(o.status)}</span></td><td><button class="row-action" data-edit-order="${esc(o.id)}">Edit</button></td></tr>`).join("")||'<tr><td colspan="9" class="empty">Belum ada order.</td></tr>'}</tbody></table></div>
    </section>`
  }
  function renderOrders(){
    $("#mainContent").innerHTML=`<div class="admin-heading"><div><span class="hello">Workspace</span><h1>Orders</h1><p>Kelola order, nilai project, deadline, status, dan checklist progres.</p></div></div>${ordersTable(filteredOrders())}`;
  }
  function renderContentManager(type){
    const map={services:["Layanan","services"],products:["Produk unggulan","products"],pricing:["Paket harga","pricing"],portfolio:["Portfolio","portfolio"]};
    const [title,key]=map[type]; const items=state.data[key];
    $("#mainContent").innerHTML=`
      <div class="admin-heading"><div><span class="hello">Website content</span><h1>${title}</h1><p>Kelola konten yang tampil pada website publik.</p></div><button class="btn btn-primary compact" data-action="add-content" data-type="${type}">+ Tambah</button></div>
      <div class="content-list">${items.map(item=>contentCard(type,item)).join("")||'<p class="empty">Belum ada data.</p>'}</div>
    `;
  }
  function contentCard(type,item){
    const subtitle=type==="products"?S.money(item.price):type==="pricing"?item.priceText:type==="portfolio"?item.categoryLabel:item.description;
    return `<article class="content-row panel"><div><span class="content-kicker">${esc(type)}</span><h3>${esc(item.name||item.title)}</h3><p>${esc(subtitle||"")}</p></div><div class="content-actions"><button class="btn btn-outline compact" data-edit-content="${esc(item.id)}" data-type="${type}">Edit</button><button class="btn btn-danger compact" data-delete-content="${esc(item.id)}" data-type="${type}">Hapus</button></div></article>`
  }
  function renderSiteSettings(){
    const s=state.data.site;
    $("#mainContent").innerHTML=`
      <div class="admin-heading"><div><span class="hello">Website</span><h1>Konten & kontak</h1><p>Ubah hero, profil, kontak, WhatsApp, sosial media, dan link penjualan.</p></div></div>
      <form class="panel settings-form" id="siteForm">
        <div class="field full"><label>Headline hero</label><input name="heroTitle" value="${esc(s.heroTitle)}"></div>
        <div class="field full"><label>Deskripsi hero</label><textarea name="heroDescription" rows="4">${esc(s.heroDescription)}</textarea></div>
        <div class="field full"><label>Profil singkat</label><textarea name="about" rows="3">${esc(s.about)}</textarea></div>
        <div class="field"><label>WhatsApp (format 628...)</label><input name="whatsapp" value="${esc(s.whatsapp)}"></div>
        <div class="field"><label>lynk.id</label><input name="lynk" value="${esc(s.lynk)}"></div>
        <div class="field"><label>Instagram</label><input name="instagram" value="${esc(s.instagram)}"></div>
        <div class="field"><label>Email</label><input name="email" value="${esc(s.email)}"></div>
        <div class="field full"><label>Lokasi</label><input name="location" value="${esc(s.location)}"></div>
        <div class="field full"><button class="btn btn-primary">Simpan perubahan</button></div>
      </form>
    `;
  }
  function renderSettings(){
    $("#mainContent").innerHTML=`
      <div class="admin-heading"><div><span class="hello">System</span><h1>Settings</h1><p>Kelola data lokal dan akun admin browser ini.</p></div></div>
      <div class="settings-grid">
        <article class="panel"><h3>Backup data</h3><p>Download seluruh order dan konten website sebagai JSON.</p><button class="btn btn-outline" data-action="export">Download backup</button></article>
        <article class="panel"><h3>Import data</h3><p>Restore data dari file JSON Midho Studio.</p><input type="file" id="importFile" accept="application/json"><button class="btn btn-outline" data-action="import">Import</button></article>
        <article class="panel danger-zone"><h3>Reset data demo</h3><p>Mengembalikan konten dan order ke data awal.</p><button class="btn btn-danger" data-action="reset">Reset data</button></article>
      </div>`;
  }
  function renderAll(){
    $$(".side-item").forEach(b=>b.classList.toggle("active",b.dataset.nav===state.section));
    if(state.section==="overview")renderOverview();
    else if(state.section==="orders")renderOrders();
    else if(["services","products","pricing","portfolio"].includes(state.section))renderContentManager(state.section);
    else if(state.section==="content")renderSiteSettings();
    else renderSettings();
  }

  function modal(html){$("#modalRoot").innerHTML=`<div class="modal-backdrop"><div class="modal-card"><button class="modal-close" data-action="close-modal">×</button>${html}</div></div>`}
  function orderModal(order){
    const o=order||{id:"",project:"",client:"",service:"",date:new Date().toISOString().slice(0,10),deadline:"",amount:0,status:"berlangsung",progress:[{label:"Brief diterima",done:false},{label:"Konsep / pengerjaan",done:false},{label:"Review / revisi",done:false},{label:"Final / delivery",done:false}]};
    modal(`<h2>${order?"Edit order":"Tambah order"}</h2><form id="orderForm" class="modal-form">
      <input type="hidden" name="originalId" value="${esc(o.id)}">
      <div class="field"><label>ID order</label><input name="id" value="${esc(o.id||("MS-"+Date.now().toString().slice(-6)))}" required></div>
      <div class="field"><label>Project</label><input name="project" value="${esc(o.project)}" required></div>
      <div class="field"><label>Client</label><input name="client" value="${esc(o.client)}" required></div>
      <div class="field"><label>Layanan</label><input name="service" value="${esc(o.service)}" required></div>
      <div class="field"><label>Tanggal order</label><input type="date" name="date" value="${esc(o.date)}" required></div>
      <div class="field"><label>Deadline</label><input type="date" name="deadline" value="${esc(o.deadline)}"></div>
      <div class="field"><label>Nilai project</label><input type="number" min="0" name="amount" value="${Number(o.amount||0)}"></div>
      <div class="field"><label>Status</label><select name="status"><option value="berlangsung" ${o.status==="berlangsung"?"selected":""}>Berlangsung</option><option value="revisi" ${o.status==="revisi"?"selected":""}>Revisi</option><option value="selesai" ${o.status==="selesai"?"selected":""}>Selesai</option></select></div>
      <div class="field full"><label>Checklist progres</label><div class="checklist">${(o.progress||[]).map((p,i)=>`<label><input type="checkbox" name="pdone${i}" ${p.done?"checked":""}><input name="plabel${i}" value="${esc(p.label)}"></label>`).join("")}</div></div>
      <div class="modal-actions">${order?'<button type="button" class="btn btn-danger" data-delete-order="'+esc(o.id)+'">Hapus</button>':""}<button class="btn btn-primary">Simpan</button></div>
    </form>`)
  }
  function contentModal(type,item){
    const isProduct=type==="products", isPrice=type==="pricing", isPort=type==="portfolio";
    modal(`<h2>${item?"Edit":"Tambah"} ${type}</h2><form id="contentForm" class="modal-form" data-type="${type}">
      <input type="hidden" name="id" value="${esc(item?.id||"")}">
      <div class="field full"><label>${isPort?"Judul":"Nama"}</label><input name="name" value="${esc(item?.name||item?.title||"")}" required></div>
      ${isProduct?`<div class="field"><label>Kategori</label><input name="category" value="${esc(item?.category||"")}"></div><div class="field"><label>Harga</label><input type="number" name="price" value="${Number(item?.price||0)}"></div><div class="field full"><label>Deskripsi</label><textarea name="description">${esc(item?.description||"")}</textarea></div><div class="field full"><label>Link lynk.id khusus produk</label><input name="lynk" value="${esc(item?.lynk||"")}"></div>`:isPrice?`<div class="field"><label>Label</label><input name="label" value="${esc(item?.label||"")}"></div><div class="field"><label>Harga tampil</label><input name="priceText" value="${esc(item?.priceText||"")}"></div><div class="field full"><label>Deskripsi</label><textarea name="description">${esc(item?.description||"")}</textarea></div><div class="field full"><label>Fitur (1 baris = 1 fitur)</label><textarea name="features" rows="5">${esc((item?.features||[]).join("\n"))}</textarea></div>`:isPort?`<div class="field"><label>Kategori</label><select name="category"><option value="brand">Branding</option><option value="digital">Digital</option><option value="print">Print</option></select></div><div class="field"><label>Label kategori</label><input name="categoryLabel" value="${esc(item?.categoryLabel||"")}"></div><div class="field"><label>Tahun</label><input name="year" value="${esc(item?.year||"2026")}"></div>`:`<div class="field full"><label>Deskripsi</label><textarea name="description">${esc(item?.description||"")}</textarea></div>`}
      <div class="field full"><label class="toggle"><input type="checkbox" name="featured" ${item?.featured?"checked":""}> Featured</label></div>
      <div class="modal-actions"><button class="btn btn-primary">Simpan</button></div>
    </form>`)
    if(isPort&&item) $('#contentForm [name="category"]').value=item.category||"brand";
  }

  document.addEventListener("click",e=>{
    const nav=e.target.closest("[data-nav]"); if(nav){state.section=nav.dataset.nav;renderAll();return}
    const a=e.target.closest("[data-action]"); if(a){
      const act=a.dataset.action;
      if(act==="new-order")orderModal();
      if(act==="close-modal")$("#modalRoot").innerHTML="";
      if(act==="clear-filter"){state.filterStatus="all";state.from="";state.to="";renderAll()}
      if(act==="add-content")contentModal(a.dataset.type);
      if(act==="export"){const blob=new Blob([JSON.stringify(state.data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const x=document.createElement("a");x.href=url;x.download="midho-studio-backup.json";x.click();URL.revokeObjectURL(url)}
      if(act==="reset"&&confirm("Reset semua data ke data demo awal?")){state.data=S.reset();renderAll()}
      if(act==="import"){const f=$("#importFile")?.files?.[0];if(!f)return alert("Pilih file JSON dulu.");const r=new FileReader();r.onload=()=>{try{state.data=JSON.parse(r.result);S.save(state.data);renderAll();alert("Import berhasil.")}catch(err){alert("File JSON tidak valid.")}};r.readAsText(f)}
      return;
    }
    const edit=e.target.closest("[data-edit-order]");if(edit){orderModal(state.data.orders.find(o=>o.id===edit.dataset.editOrder));return}
    const del=e.target.closest("[data-delete-order]");if(del&&confirm("Hapus order ini?")){state.data.orders=state.data.orders.filter(o=>o.id!==del.dataset.deleteOrder);save();$("#modalRoot").innerHTML="";return}
    const editC=e.target.closest("[data-edit-content]");if(editC){const key=editC.dataset.type;contentModal(key,state.data[key].find(x=>x.id===editC.dataset.editContent));return}
    const delC=e.target.closest("[data-delete-content]");if(delC&&confirm("Hapus konten ini?")){const key=delC.dataset.type;state.data[key]=state.data[key].filter(x=>x.id!==delC.dataset.deleteContent);save();return}
  });

  document.addEventListener("change",e=>{
    if(e.target.id==="statusFilter"){state.filterStatus=e.target.value;renderAll()}
    if(e.target.id==="fromFilter"){state.from=e.target.value;renderAll()}
    if(e.target.id==="toFilter"){state.to=e.target.value;renderAll()}
  });

  document.addEventListener("submit",e=>{
    if(e.target.id==="orderForm"){
      e.preventDefault();const f=new FormData(e.target), original=f.get("originalId"), id=f.get("id").trim();
      const progress=[];for(let i=0;i<4;i++){const label=(f.get("plabel"+i)||"").trim();if(label)progress.push({label,done:f.get("pdone"+i)==="on"})}
      const obj={id,project:f.get("project").trim(),client:f.get("client").trim(),service:f.get("service").trim(),date:f.get("date"),deadline:f.get("deadline"),amount:Number(f.get("amount")||0),status:f.get("status"),progress};
      if(original){state.data.orders=state.data.orders.map(o=>o.id===original?obj:o)}else state.data.orders.unshift(obj);
      save();$("#modalRoot").innerHTML="";return;
    }
    if(e.target.id==="contentForm"){
      e.preventDefault();const f=new FormData(e.target),type=e.target.dataset.type,id=f.get("id")||S.id(type.slice(0,3));
      let obj={id,featured:f.get("featured")==="on"};
      if(type==="products")obj={...obj,name:f.get("name").trim(),category:f.get("category").trim(),price:Number(f.get("price")||0),description:f.get("description").trim(),lynk:f.get("lynk").trim()};
      if(type==="pricing")obj={...obj,name:f.get("name").trim(),label:f.get("label").trim(),priceText:f.get("priceText").trim(),description:f.get("description").trim(),features:f.get("features").split("\n").map(x=>x.trim()).filter(Boolean)};
      if(type==="portfolio")obj={...obj,title:f.get("name").trim(),category:f.get("category"),categoryLabel:f.get("categoryLabel").trim(),year:f.get("year").trim(),style:(state.data.portfolio.find(x=>x.id===id)?.style)||["a","b","c","d"][state.data.portfolio.length%4]};
      if(type==="services")obj={...obj,name:f.get("name").trim(),description:f.get("description").trim()};
      const arr=state.data[type]; const exists=arr.some(x=>x.id===id); state.data[type]=exists?arr.map(x=>x.id===id?obj:x):[obj,...arr];save();$("#modalRoot").innerHTML="";return;
    }
    if(e.target.id==="siteForm"){
      e.preventDefault();const f=new FormData(e.target);["heroTitle","heroDescription","about","whatsapp","lynk","instagram","email","location"].forEach(k=>state.data.site[k]=(f.get(k)||"").trim());save();alert("Konten website tersimpan.");return;
    }
  });

  async function start(){
    const auth=S.getAuth();
    if(!auth){setupView.hidden=false;loginView.hidden=true;adminView.hidden=true;return}
    loginView.hidden=false;setupView.hidden=true;adminView.hidden=true;
  }
  $("#setupForm")?.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target);const email=f.get("email"),p=f.get("password"),p2=f.get("password2");if(p.length<6)return alert("Password minimal 6 karakter.");if(p!==p2)return alert("Konfirmasi password tidak sama.");await S.setAuth(email,p);setupView.hidden=true;loginView.hidden=false;});
  $("#loginForm")?.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target);if(await S.verifyAuth(f.get("email"),f.get("password"))){sessionStorage.setItem("midho-session","1");loginView.hidden=true;adminView.hidden=false;renderAll()}else alert("Email atau password salah.");});
  $("#logoutBtn")?.addEventListener("click",()=>{sessionStorage.removeItem("midho-session");adminView.hidden=true;loginView.hidden=false;});
  if(sessionStorage.getItem("midho-session")==="1"&&S.getAuth()){setupView.hidden=true;loginView.hidden=true;adminView.hidden=false;renderAll()}else start();
})();