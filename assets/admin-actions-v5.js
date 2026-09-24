(()=>{
const M=window.MidhoAdmin,{A,$,$$,esc,state,toast,fmtDateTime,activitiesFor,clientOf,modal,closeModal,reload,enter}=M;
const P=window.MidhoAdminPages;

// Modal forms are application UI, never navigation forms.
// Capture phase guarantees the browser cannot reload /admin/ even if a later handler throws.
document.addEventListener("submit",e=>{
  if(e.target && e.target.closest && e.target.closest("#modalRoot")) e.preventDefault();
},true);

function handleAdminError(err){
  if(err?.auth===true){
    A.logout();
    closeModal();
    $("#adminView").hidden=true;
    $("#loginView").hidden=false;
    toast("Sesi admin berakhir. Masukkan PIN lagi.","err");
    return;
  }
  toast(err?.message||"Terjadi kesalahan. Coba lagi.","err");
}
function orderCode(){const d=new Date(),s=d.toISOString().slice(0,10).replace(/-/g,""),r=Math.random().toString(36).slice(2,6).toUpperCase();return "MDH-"+s+"-"+r}
function field(label,input,full=false){return '<div class="field '+(full?"full":"")+'"><label>'+esc(label)+'</label>'+input+'</div>'}
function modalForm(title,id,body,wide=false){modal(title,'<form id="'+id+'" autocomplete="off"><div class="modal-body">'+body+'</div><footer class="modal-foot"><button type="button" class="btn btn-outline" data-close-modal>Batal</button><button type="button" class="btn btn-primary" data-save-form="'+id+'">Simpan</button></footer></form>',wide)}
function clientModal(c={}){
  modalForm(c.id?"Edit Klien":"Tambah Klien","clientForm",
    '<input type="hidden" name="id" value="'+esc(c.id||"")+'">'+
    '<div class="form-grid">'+
    field("Nama klien",'<input name="name" required value="'+esc(c.name||"")+'">')+
    field("Brand / Usaha",'<input name="brand" value="'+esc(c.brand||"")+'">')+
    field("WhatsApp",'<input name="whatsapp" inputmode="tel" value="'+esc(c.whatsapp||"")+'" placeholder="628...">')+
    field("Email",'<input name="email" type="email" value="'+esc(c.email||"")+'">')+
    field("Status",'<select name="status"><option value="aktif" '+(c.status!=="arsip"?"selected":"")+'>Aktif</option><option value="arsip" '+(c.status==="arsip"?"selected":"")+'>Arsip</option></select>')+
    field("Catatan internal",'<textarea name="notes" placeholder="Preferensi desain, warna, catatan revisi, dll.">'+esc(c.notes||"")+'</textarea>',true)+
    '</div>'
  );
}
function projectModal(o={}){
  const clients=state.data.clients||[],services=state.data.services||[];
  const progress=(o.progress&&o.progress.length?o.progress:[
    {label:"Brief diterima",done:false},{label:"Konsep / arah visual",done:false},{label:"Desain awal",done:false},{label:"Review klien",done:false},{label:"Revisi",done:false},{label:"Final file",done:false}
  ]);
  const acts=o.id?activitiesFor(o.id):[];
  const st=o.status==="berlangsung"?"dikerjakan":(o.status||"brief");
  const body=
    '<input type="hidden" name="id" value="'+esc(o.id||"")+'">'+
    '<input type="hidden" name="order_code" value="'+esc(o.order_code||orderCode())+'">'+
    '<div class="form-grid">'+
      field("Klien",'<select name="client_id" required><option value="">Pilih klien</option>'+clients.map(c=>'<option value="'+c.id+'" '+(c.id===o.client_id?"selected":"")+'>'+esc(c.name+(c.brand?" — "+c.brand:""))+'</option>').join("")+'</select>')+
      field("Nama project",'<input name="project" required value="'+esc(o.project||"")+'">')+
      field("Layanan",'<input name="service" list="serviceList" value="'+esc(o.service||"")+'"><datalist id="serviceList">'+services.map(s=>'<option value="'+esc(s.name)+'"></option>').join("")+'</datalist>')+
      field("Prioritas",'<select name="priority"><option value="normal" '+(o.priority!=="prioritas"?"selected":"")+'>Normal</option><option value="prioritas" '+(o.priority==="prioritas"?"selected":"")+'>Prioritas</option></select>')+
      field("Tanggal masuk",'<input name="order_date" type="date" value="'+esc(o.order_date||new Date().toISOString().slice(0,10))+'">')+
      field("Deadline",'<input name="deadline" type="date" value="'+esc(o.deadline||"")+'">')+
      field("Status",'<select name="status"><option value="brief" '+(st==="brief"?"selected":"")+'>Brief</option><option value="dikerjakan" '+(st==="dikerjakan"?"selected":"")+'>Dikerjakan</option><option value="review" '+(st==="review"?"selected":"")+'>Review</option><option value="revisi" '+(st==="revisi"?"selected":"")+'>Revisi</option><option value="selesai" '+(st==="selesai"?"selected":"")+'>Selesai</option></select>')+
      field("Pembayaran",'<select name="payment_status"><option value="belum_bayar" '+((o.payment_status||"belum_bayar")==="belum_bayar"?"selected":"")+'>Belum Bayar</option><option value="dp" '+(o.payment_status==="dp"?"selected":"")+'>DP</option><option value="lunas" '+(o.payment_status==="lunas"?"selected":"")+'>Lunas</option></select>')+
      field("Nilai project",'<input name="amount" type="number" min="0" value="'+esc(o.amount||0)+'">')+
      field("Sudah dibayar",'<input name="paid_amount" type="number" min="0" value="'+esc(o.paid_amount||0)+'">')+
      field("Revisi digunakan",'<input name="revision_used" type="number" min="0" value="'+esc(o.revision_used||0)+'">')+
      field("Batas revisi",'<input name="revision_limit" type="number" min="0" value="'+esc(o.revision_limit??2)+'">')+
      field("Link brief / referensi",'<input name="brief_link" value="'+esc(o.brief_link||"")+'" placeholder="https://...">',true)+
      field("Link file final",'<input name="final_link" value="'+esc(o.final_link||"")+'" placeholder="https://...">',true)+
      field("Catatan project",'<textarea name="notes">'+esc(o.notes||"")+'</textarea>',true)+
      '<div class="field full"><label>Progress Checklist</label><div class="progress-editor">'+progress.map((p,i)=>'<label class="progress-row"><input type="checkbox" name="progress_done_'+i+'" '+(p.done?"checked":"")+'><input name="progress_label_'+i+'" value="'+esc(p.label||"")+'"></label>').join("")+'</div></div>'+
      (o.id?'<div class="field full"><label>Riwayat aktivitas</label><div class="timeline">'+(acts.map(a=>'<div class="timeline-item"><strong>'+esc(a.note)+'</strong><small>'+fmtDateTime(a.created_at)+'</small></div>').join("")||'<span class="empty">Belum ada aktivitas.</span>')+'</div></div>':'')+
    '</div>';
  modalForm(o.id?"Detail Project":"Project Baru","projectForm",body,true);
}
function portfolioModal(x={}){
  const current=x.id&&M.portfolioUrl(x)?'<div class="portfolio-current"><img src="'+esc(M.portfolioUrl(x))+'" alt="'+esc(x.title||"Portfolio")+'"><small>Gambar saat ini</small></div>':'';
  modal(x.id?"Edit Portfolio":"Tambah Portfolio",
    '<form id="portfolioForm" autocomplete="off">'+
      '<div class="modal-body">'+
        '<input type="hidden" name="id" value="'+esc(x.id||"")+'">'+
        '<div class="form-grid compact-form">'+
          field("Judul",'<input name="title" required value="'+esc(x.title||"")+'" placeholder="Nama karya">',true)+
          field("Kategori",'<select name="category"><option value="digital" '+(x.category==="digital"||!x.category?"selected":"")+'>Digital</option><option value="brand" '+(x.category==="brand"?"selected":"")+'>Branding</option><option value="print" '+(x.category==="print"?"selected":"")+'>Print</option></select>')+
          field("Gambar portfolio",'<input name="image" type="file" '+(!x.id?"required":"")+' accept="image/jpeg,image/png,image/webp,image/gif"><span class="upload-note">JPG / PNG / WebP / GIF · maksimal 15 MB.</span>',true)+
          current+
        '</div>'+
      '</div>'+
      '<footer class="modal-foot">'+
        '<button type="button" class="btn btn-outline" data-close-modal>Batal</button>'+
        '<button type="button" class="btn btn-primary" data-save-portfolio>Simpan</button>'+
      '</footer>'+
    '</form>'
  );
}
function priceModal(x){
  modalForm("Edit Paket Harga","priceForm",
    '<input type="hidden" name="id" value="'+esc(x.id)+'"><div class="form-grid">'+
    field("Label",'<input name="label" value="'+esc(x.label||"")+'">')+
    field("Nama paket",'<input name="name" required value="'+esc(x.name||"")+'">')+
    field("Harga",'<input name="price_text" value="'+esc(x.price_text||"")+'">')+
    field("Fitur (1 per baris)",'<textarea name="features">'+esc((x.features||[]).join("\n"))+'</textarea>',true)+
    '<div class="field"><label><input type="checkbox" name="featured" '+(x.featured?"checked":"")+'> Tandai paket utama</label></div>'+
    '</div>'
  );
}
async function savePortfolioForm(form){
  const f=new FormData(form);
  const id=String(f.get("id")||"");
  const title=String(f.get("title")||"").trim();
  const category=String(f.get("category")||"digital");
  const file=f.get("image");
  const btn=form.querySelector("[data-save-portfolio]");

  if(!title){toast("Judul portfolio wajib diisi.","err");form.querySelector('[name="title"]')?.focus();return}
  if(!id&&(!file||!file.size)){toast("Pilih gambar portfolio terlebih dahulu.","err");return}
  if(file&&file.size>15*1024*1024){toast("Ukuran gambar maksimal 15 MB.","err");return}

  try{
    btn.disabled=true;
    let response;

    if(file&&file.size){
      btn.textContent="Mengunggah 0%";
      response=await A.uploadPortfolio(file,{id,title,category},p=>{btn.textContent="Mengunggah "+p+"%"});
    }else{
      btn.textContent="Menyimpan...";
      const labels={digital:"Digital Design",brand:"Branding",print:"Print Design"};
      response=await A.upsert("portfolio",{id,title,category,category_label:labels[category]||"Digital Design",image_alt:title,updated_at:new Date().toISOString()});
    }

    const saved=response?.data;
    if(!saved||!saved.id)throw new Error("Server tidak mengembalikan data portfolio yang tersimpan.");

    const list=[...(state.data.portfolio||[])];
    const ix=list.findIndex(x=>x.id===saved.id);
    if(ix>=0)list[ix]={...list[ix],...saved}; else list.push(saved);
    list.sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0));
    state.data.portfolio=list;

    closeModal();
    state.section="portfolio";
    P.render();
    toast("Portfolio berhasil disimpan.");
  }catch(err){
    // Upload/network errors stay inside the dashboard. Only a proven auth failure may show login.
    handleAdminError(err);
  }finally{
    if(btn&&btn.isConnected){btn.disabled=false;btn.textContent="Simpan"}
  }
}


async function saveClientForm(form){
  const f=new FormData(form),id=String(f.get("id")||""),name=String(f.get("name")||"").trim();
  const btn=form.querySelector('[data-save-form="clientForm"]');
  if(!name){toast("Nama klien wajib diisi.","err");form.querySelector('[name="name"]')?.focus();return}
  try{
    btn.disabled=true;btn.textContent="Menyimpan...";
    const row={name,brand:String(f.get("brand")||"").trim(),whatsapp:String(f.get("whatsapp")||"").replace(/\D/g,""),email:String(f.get("email")||"").trim(),status:f.get("status")||"aktif",notes:String(f.get("notes")||"").trim(),updated_at:new Date().toISOString()};
    if(id)row.id=id;
    const res=await A.upsert("clients",row);
    const saved=res?.data;if(!saved?.id)throw new Error("Data klien tidak berhasil disimpan.");
    const list=[...(state.data.clients||[])],ix=list.findIndex(x=>x.id===saved.id);
    if(ix>=0)list[ix]={...list[ix],...saved};else list.unshift(saved);
    state.data.clients=list;
    closeModal();state.section="clients";P.render();toast("Klien berhasil disimpan.");
  }catch(err){handleAdminError(err)}
  finally{if(btn?.isConnected){btn.disabled=false;btn.textContent="Simpan"}}
}

async function saveProjectForm(form){
  const f=new FormData(form),id=String(f.get("id")||"");
  const btn=form.querySelector('[data-save-form="projectForm"]');
  const client=(state.data.clients||[]).find(c=>c.id===f.get("client_id"));
  if(!client){toast("Pilih klien terlebih dahulu.","err");return}
  const project=String(f.get("project")||"").trim();
  if(!project){toast("Nama project wajib diisi.","err");form.querySelector('[name="project"]')?.focus();return}
  const progress=[];for(let i=0;i<12;i++){const label=f.get("progress_label_"+i);if(label)progress.push({label:String(label),done:f.get("progress_done_"+i)==="on"})}
  const row={id:id||undefined,order_code:f.get("order_code"),client_id:client.id,client:client.name,project,service:f.get("service")||"",priority:f.get("priority")||"normal",order_date:f.get("order_date")||new Date().toISOString().slice(0,10),deadline:f.get("deadline")||null,status:f.get("status")||"brief",payment_status:f.get("payment_status")||"belum_bayar",amount:Number(f.get("amount")||0),paid_amount:Number(f.get("paid_amount")||0),revision_used:Number(f.get("revision_used")||0),revision_limit:Number(f.get("revision_limit")||0),brief_link:f.get("brief_link")||"",final_link:f.get("final_link")||"",notes:f.get("notes")||"",progress};
  try{
    btn.disabled=true;btn.textContent="Menyimpan...";
    const res=await A.saveOrder(row),saved=res?.data;
    if(!saved?.id)throw new Error("Project tidak berhasil disimpan.");
    const list=[...(state.data.orders||[])],ix=list.findIndex(x=>x.id===saved.id);
    const merged={...(ix>=0?list[ix]:{}),...saved,progress};
    if(ix>=0)list[ix]=merged;else list.unshift(merged);
    state.data.orders=list;
    closeModal();state.section="projects";P.render();toast("Project berhasil disimpan.");
  }catch(err){handleAdminError(err)}
  finally{if(btn?.isConnected){btn.disabled=false;btn.textContent="Simpan"}}
}

async function savePriceForm(form){
  const f=new FormData(form),id=String(f.get("id")||""),name=String(f.get("name")||"").trim();
  const btn=form.querySelector('[data-save-form="priceForm"]');
  if(!name){toast("Nama paket wajib diisi.","err");return}
  try{
    btn.disabled=true;btn.textContent="Menyimpan...";
    const row={id,label:String(f.get("label")||""),name,price_text:String(f.get("price_text")||""),featured:f.get("featured")==="on",features:String(f.get("features")||"").split("\n").map(x=>x.trim()).filter(Boolean),updated_at:new Date().toISOString()};
    const res=await A.upsert("pricing",row),saved=res?.data;
    if(!saved?.id)throw new Error("Paket harga tidak berhasil disimpan.");
    const list=[...(state.data.pricing||[])],ix=list.findIndex(x=>x.id===saved.id);
    if(ix>=0)list[ix]={...list[ix],...saved};else list.push(saved);
    state.data.pricing=list;
    closeModal();state.section="pricing";P.render();toast("Paket harga berhasil diperbarui.");
  }catch(err){handleAdminError(err)}
  finally{if(btn?.isConnected){btn.disabled=false;btn.textContent="Simpan"}}
}

async function saveSiteSettings(form){
  const f=new FormData(form),btn=form.querySelector("[data-save-site]");
  try{
    btn.disabled=true;btn.textContent="Menyimpan...";
    const row={id:1,whatsapp:String(f.get("whatsapp")||"").replace(/\D/g,""),lynk:String(f.get("lynk")||"https://lynk.id/midhostudio").trim(),email:String(f.get("email")||"").trim(),instagram:String(f.get("instagram")||"").trim(),location:String(f.get("location")||"").trim(),about:String(f.get("about")||"").trim(),updated_at:new Date().toISOString()};
    const res=await A.upsert("site_settings",row),saved=res?.data;
    if(!saved)throw new Error("Pengaturan website tidak berhasil disimpan.");
    state.data.site={...(state.data.site||{}),...saved};
    toast("Pengaturan website berhasil disimpan.");
  }catch(err){handleAdminError(err)}
  finally{if(btn?.isConnected){btn.disabled=false;btn.textContent="Simpan Pengaturan"}}
}

async function saveBrandAsset(form,kind){
  const input=form.querySelector('input[type="file"]'),file=input?.files?.[0];
  const btn=form.querySelector(kind==="logo"?"[data-save-logo]":"[data-save-favicon]");
  if(!file)return toast("Pilih file terlebih dahulu.","err");
  try{
    btn.disabled=true;btn.textContent="Mengunggah 0%";
    const up=await A.upload("site-assets",file,p=>btn.textContent="Mengunggah "+p+"%");
    const row={id:1};row[kind==="logo"?"logo_path":"favicon_path"]=up.path;
    const res=await A.upsert("site_settings",row);
    state.data.site={...(state.data.site||{}),...(res?.data||row)};
    $("[data-brand-logo]").forEach(x=>x.src=M.logoUrl(state.data.site));
    toast(kind==="logo"?"Logo berhasil diganti.":"Favicon berhasil diganti.");
  }catch(err){handleAdminError(err)}
  finally{if(btn?.isConnected){btn.disabled=false;btn.textContent=kind==="logo"?"Ganti Logo":"Ganti Favicon"}}
}

function waProject(id){
  const o=(state.data.orders||[]).find(x=>x.id===id);if(!o)return;
  const c=clientOf(o);if(!c.whatsapp)return toast("Nomor WhatsApp klien belum diisi.","err");
  const status=M.statusLabel(o.status),p=(o.progress||[]),pct=p.length?Math.round(p.filter(x=>x.done).length/p.length*100):0;
  const msg="Halo "+c.name+", update project *"+o.project+"* dari Midho Studio:\n\nStatus: "+status+"\nProgress: "+pct+"%"+(o.deadline?"\nDeadline: "+M.fmtDate(o.deadline):"")+"\n\nJika ada feedback, silakan kabari di sini ya.";
  window.open("https://wa.me/"+String(c.whatsapp).replace(/\D/g,"")+"?text="+encodeURIComponent(msg),"_blank","noopener");
}
async function afterSave(msg){
  try{await reload();P.render();closeModal();toast(msg)}
  catch(err){
    if(err?.auth===true) handleAdminError(err);
    else toast("Data tersimpan, tetapi daftar belum termuat ulang. Coba buka menu ini lagi.","err");
    throw err;
  }
}
function applyClientFilters(){
  const q=($("#clientSearch")?.value||"").toLowerCase(),st=$("#clientStatus")?.value||"all";
  $$(".data-table tbody tr").forEach(tr=>{if(tr.querySelector(".empty"))return;const okQ=!q||tr.innerText.toLowerCase().includes(q),okS=st==="all"||tr.innerText.toLowerCase().includes(st);tr.style.display=okQ&&okS?"":"none"});
}
function applyProjectFilters(){
  const q=($("#projectSearch")?.value||"").toLowerCase(),st=$("#projectStatus")?.value||"all",pay=$("#paymentFilter")?.value||"all";
  $$(".data-table tbody tr").forEach(tr=>{if(tr.querySelector(".empty"))return;const okQ=!q||tr.innerText.toLowerCase().includes(q),s=tr.querySelector(".status-pill"),p=tr.querySelector(".pay-pill"),okS=st==="all"||s?.classList.contains(st),okP=pay==="all"||p?.classList.contains(pay);tr.style.display=okQ&&okS&&okP?"":"none"});
}
document.addEventListener("click",async e=>{
  const closeButton=e.target.closest("[data-close-modal]");
  if(closeButton){e.preventDefault();closeModal();return}
  const portfolioSave=e.target.closest("[data-save-portfolio]");
  if(portfolioSave){e.preventDefault();const form=portfolioSave.closest("#portfolioForm");if(form)await savePortfolioForm(form);return}
  const directSave=e.target.closest("[data-save-form]");
  if(directSave){
    e.preventDefault();
    const form=directSave.closest("form");
    if(!form)return;
    if(directSave.dataset.saveForm==="clientForm")await saveClientForm(form);
    else if(directSave.dataset.saveForm==="projectForm")await saveProjectForm(form);
    else if(directSave.dataset.saveForm==="priceForm")await savePriceForm(form);
    return;
  }
  const siteSave=e.target.closest("[data-save-site]");
  if(siteSave){e.preventDefault();const form=siteSave.closest("#siteSettingsForm");if(form)await saveSiteSettings(form);return}
  const logoSave=e.target.closest("[data-save-logo]");
  if(logoSave){e.preventDefault();const form=logoSave.closest("#logoForm");if(form)await saveBrandAsset(form,"logo");return}
  const faviconSave=e.target.closest("[data-save-favicon]");
  if(faviconSave){e.preventDefault();const form=faviconSave.closest("#faviconForm");if(form)await saveBrandAsset(form,"favicon");return}
  if(e.target.matches("[data-modal-backdrop]")){closeModal();return}
  const n=e.target.closest("[data-nav]");if(n){state.section=n.dataset.nav;state.query="";P.render();$("#adminRail").classList.remove("open");return}
  const act=e.target.closest("[data-action]")?.dataset.action;
  if(act==="new-client")return clientModal();
  if(act==="new-project"){if(!(state.data.clients||[]).length){toast("Tambahkan klien terlebih dahulu.","err");state.section="clients";P.render();return}return projectModal()}
  if(act==="new-portfolio")return portfolioModal();
  const ec=e.target.closest("[data-edit-client]");if(ec)return clientModal((state.data.clients||[]).find(x=>x.id===ec.dataset.editClient)||{});
  const ep=e.target.closest("[data-edit-project]");if(ep)return projectModal((state.data.orders||[]).find(x=>x.id===ep.dataset.editProject)||{});
  const ew=e.target.closest("[data-project-wa]");if(ew)return waProject(ew.dataset.projectWa);
  const ef=e.target.closest("[data-edit-portfolio]");if(ef)return portfolioModal((state.data.portfolio||[]).find(x=>x.id===ef.dataset.editPortfolio)||{});
  const eh=e.target.closest("[data-edit-price]");if(eh)return priceModal((state.data.pricing||[]).find(x=>x.id===eh.dataset.editPrice));
  const deletes=[
    ["[data-delete-client]","clients","deleteClient","Hapus klien ini? Project lama tetap tersimpan."],
    ["[data-delete-project]","orders","deleteProject","Hapus project dan seluruh progress/riwayatnya?"],
    ["[data-delete-portfolio]","portfolio","deletePortfolio","Hapus portfolio ini? File upload di Storage juga ikut dihapus."],
  ];
  for(const [sel,table,key,msg] of deletes){const el=e.target.closest(sel);if(el){if(confirm(msg)){try{await A.remove(table,el.dataset[key]);await afterSave("Data dihapus.")}catch(err){handleAdminError(err)}}return}}
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&$("#modalRoot")?.children.length){closeModal();return}
  if(e.key==="Enter"){
    const form=e.target?.closest?.("#portfolioForm");
    if(form && e.target?.tagName!=="TEXTAREA"){
      e.preventDefault();
      const save=form.querySelector("[data-save-portfolio]");
      if(save&&!save.disabled)save.click();
    }
  }
});
document.addEventListener("input",e=>{if(e.target.id==="clientSearch")applyClientFilters();if(e.target.id==="projectSearch")applyProjectFilters()});
document.addEventListener("change",e=>{if(e.target.id==="clientStatus")applyClientFilters();if(["projectStatus","paymentFilter"].includes(e.target.id))applyProjectFilters()});
document.addEventListener("submit",async e=>{
  e.preventDefault();
  if(e.target.id==="pinForm"){
    const b=e.target.querySelector("button");b.disabled=true;
    try{await A.login(new FormData(e.target).get("pin"));await enter()}
    catch(err){toast(err.message||"PIN salah","err")}
    finally{b.disabled=false}
  }
});
$("#logoutBtn").addEventListener("click",()=>{A.logout();closeModal();$("#adminView").hidden=true;$("#loginView").hidden=false});
$("#adminMenu").addEventListener("click",()=>$("#adminRail").classList.toggle("open"));
document.addEventListener("click",e=>{if(innerWidth<=900&&$("#adminRail").classList.contains("open")&&!e.target.closest("#adminRail")&&!e.target.closest("#adminMenu"))$("#adminRail").classList.remove("open")});
window.MidhoAdminActions={clientModal,projectModal,portfolioModal,priceModal};
if(A.hasToken())enter().catch(err=>{
  if(err?.auth===true) handleAdminError(err);
  else toast("Dashboard belum berhasil dimuat. Refresh halaman untuk mencoba lagi.","err");
});
})();