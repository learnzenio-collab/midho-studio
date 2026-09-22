(()=>{
const M=window.MidhoAdmin,{A,$,$$,esc,state,toast,fmtDateTime,activitiesFor,clientOf,modal,closeModal,reload,enter}=M;
const P=window.MidhoAdminPages;
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
function modalForm(title,id,body,wide=false){modal(title,'<form id="'+id+'"><div class="modal-body">'+body+'</div><footer class="modal-foot"><button type="button" class="btn btn-outline" data-close-modal>Batal</button><button type="submit" class="btn btn-primary">Simpan</button></footer></form>',wide)}
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
  modalForm(x.id?"Edit Portfolio":"Tambah Portfolio","portfolioForm",
    '<input type="hidden" name="id" value="'+esc(x.id||"")+'">'+
    '<div class="form-grid compact-form">'+
      field("Judul",'<input name="title" required value="'+esc(x.title||"")+'" placeholder="Nama karya">',true)+
      field("Kategori",'<select name="category"><option value="digital" '+(x.category==="digital"||!x.category?"selected":"")+'>Digital</option><option value="brand" '+(x.category==="brand"?"selected":"")+'>Branding</option><option value="print" '+(x.category==="print"?"selected":"")+'>Print</option></select>')+
      field("Gambar portfolio",'<input name="image" type="file" '+(!x.id?"required":"")+' accept="image/jpeg,image/png,image/webp,image/gif"><span class="upload-note">JPG / PNG / WebP / GIF · maksimal 15 MB. File disimpan langsung ke Supabase Storage.</span>',true)+
      current+
    '</div>'
  );
}
function productModal(x={}){
  modalForm(x.id?"Edit Produk":"Tambah Produk","productForm",
    '<input type="hidden" name="id" value="'+esc(x.id||"")+'"><div class="form-grid">'+
    field("Nama produk",'<input name="name" required value="'+esc(x.name||"")+'">')+
    field("Kategori",'<input name="category" value="'+esc(x.category||"")+'">')+
    field("Harga",'<input name="price" type="number" min="0" value="'+esc(x.price||0)+'">')+
    field("Link Lynk.id",'<input name="lynk_url" value="'+esc(x.lynk_url||state.data.site?.lynk||"https://lynk.id/midhostudio")+'">')+
    field("Deskripsi singkat",'<textarea name="description">'+esc(x.description||"")+'</textarea>',true)+
    '<div class="field"><label><input type="checkbox" name="featured" '+(x.featured!==false?"checked":"")+'> Tampilkan di website</label></div>'+
    '</div>'
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
  if(e.target.matches("[data-modal-backdrop]")){closeModal();return}
  const n=e.target.closest("[data-nav]");if(n){state.section=n.dataset.nav;state.query="";P.render();$("#adminRail").classList.remove("open");return}
  const act=e.target.closest("[data-action]")?.dataset.action;
  if(act==="new-client")return clientModal();
  if(act==="new-project"){if(!(state.data.clients||[]).length){toast("Tambahkan klien terlebih dahulu.","err");state.section="clients";P.render();return}return projectModal()}
  if(act==="new-portfolio")return portfolioModal();
  if(act==="new-product")return productModal();
  const ec=e.target.closest("[data-edit-client]");if(ec)return clientModal((state.data.clients||[]).find(x=>x.id===ec.dataset.editClient)||{});
  const ep=e.target.closest("[data-edit-project]");if(ep)return projectModal((state.data.orders||[]).find(x=>x.id===ep.dataset.editProject)||{});
  const ew=e.target.closest("[data-project-wa]");if(ew)return waProject(ew.dataset.projectWa);
  const ef=e.target.closest("[data-edit-portfolio]");if(ef)return portfolioModal((state.data.portfolio||[]).find(x=>x.id===ef.dataset.editPortfolio)||{});
  const eu=e.target.closest("[data-edit-product]");if(eu)return productModal((state.data.products||[]).find(x=>x.id===eu.dataset.editProduct)||{});
  const eh=e.target.closest("[data-edit-price]");if(eh)return priceModal((state.data.pricing||[]).find(x=>x.id===eh.dataset.editPrice));
  const deletes=[
    ["[data-delete-client]","clients","deleteClient","Hapus klien ini? Project lama tetap tersimpan."],
    ["[data-delete-project]","orders","deleteProject","Hapus project dan seluruh progress/riwayatnya?"],
    ["[data-delete-portfolio]","portfolio","deletePortfolio","Hapus portfolio ini? File upload di Storage juga ikut dihapus."],
    ["[data-delete-product]","products","deleteProduct","Hapus produk ini?"]
  ];
  for(const [sel,table,key,msg] of deletes){const el=e.target.closest(sel);if(el){if(confirm(msg)){try{await A.remove(table,el.dataset[key]);await afterSave("Data dihapus.")}catch(err){handleAdminError(err)}}return}}
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("#modalRoot")?.children.length)closeModal()});
document.addEventListener("input",e=>{if(e.target.id==="clientSearch")applyClientFilters();if(e.target.id==="projectSearch")applyProjectFilters()});
document.addEventListener("change",e=>{if(e.target.id==="clientStatus")applyClientFilters();if(["projectStatus","paymentFilter"].includes(e.target.id))applyProjectFilters()});
document.addEventListener("submit",async e=>{
  if(e.target.id==="pinForm"){e.preventDefault();const b=e.target.querySelector("button");b.disabled=true;try{await A.login(new FormData(e.target).get("pin"));await enter()}catch(err){toast(err.message||"PIN salah","err")}finally{b.disabled=false}return}
  if(e.target.id==="clientForm"){e.preventDefault();const f=new FormData(e.target),id=f.get("id"),row={name:f.get("name"),brand:f.get("brand")||"",whatsapp:String(f.get("whatsapp")||"").replace(/\s/g,""),email:f.get("email")||"",status:f.get("status"),notes:f.get("notes")||"",updated_at:new Date().toISOString()};if(id)row.id=id;try{await A.upsert("clients",row);await afterSave("Klien tersimpan.")}catch(err){handleAdminError(err)}return}
  if(e.target.id==="projectForm"){e.preventDefault();const f=new FormData(e.target),id=f.get("id"),client=(state.data.clients||[]).find(c=>c.id===f.get("client_id"));if(!client)return toast("Pilih klien.","err");const progress=[];for(let i=0;i<12;i++){const label=f.get("progress_label_"+i);if(label)progress.push({label,done:f.get("progress_done_"+i)==="on"})}const row={id:id||undefined,order_code:f.get("order_code"),client_id:client.id,client:client.name,project:f.get("project"),service:f.get("service")||"",priority:f.get("priority"),order_date:f.get("order_date"),deadline:f.get("deadline")||null,status:f.get("status"),payment_status:f.get("payment_status"),amount:Number(f.get("amount")||0),paid_amount:Number(f.get("paid_amount")||0),revision_used:Number(f.get("revision_used")||0),revision_limit:Number(f.get("revision_limit")||0),brief_link:f.get("brief_link")||"",final_link:f.get("final_link")||"",notes:f.get("notes")||"",progress};try{await A.saveOrder(row);await afterSave("Project tersimpan.")}catch(err){handleAdminError(err)}return}
  if(e.target.id==="portfolioForm"){
    e.preventDefault();
    const f=new FormData(e.target),id=f.get("id"),old=(state.data.portfolio||[]).find(x=>x.id===id)||{};
    let image_path=old.image_path||null,image_url=old.image_url||null;
    const file=f.get("image"),btn=e.target.querySelector(".btn-primary");
    try{
      if(!id&&(!file||!file.size))throw new Error("Pilih gambar portfolio terlebih dahulu.");
      if(file&&file.size){
        if(file.size>15*1024*1024)throw new Error("Ukuran gambar maksimal 15 MB.");
        btn.disabled=true;btn.textContent="Mengunggah 0%";
        const up=await A.upload("portfolio",file,p=>btn.textContent="Mengunggah "+p+"%");
        image_path=up.path;image_url=null;
      }
      const category=f.get("category")||"digital";
      const labels={digital:"Digital Design",brand:"Branding",print:"Print Design"};
      const row={
        title:f.get("title"),
        category,
        category_label:labels[category]||"Digital Design",
        year:old.year||String(new Date().getFullYear()),
        description:old.description||"",
        image_alt:f.get("title"),
        featured:true,
        sort_order:Number(old.sort_order??((state.data.portfolio||[]).length+1)),
        image_path,image_url
      };
      if(id)row.id=id;
      await A.upsert("portfolio",row);
      await afterSave("Portfolio tersimpan.");
    }catch(err){handleAdminError(err)}
    finally{btn.disabled=false;btn.textContent="Simpan"}
    return;
  }
  if(e.target.id==="productForm"){e.preventDefault();const f=new FormData(e.target),id=f.get("id"),old=(state.data.products||[]).find(x=>x.id===id)||{},row={name:f.get("name"),category:f.get("category")||"",price:Number(f.get("price")||0),lynk_url:f.get("lynk_url")||state.data.site?.lynk||"https://lynk.id/midhostudio",description:f.get("description")||"",featured:f.get("featured")==="on",sort_order:Number(old.sort_order??((state.data.products||[]).length+1))};if(id)row.id=id;try{await A.upsert("products",row);await afterSave("Produk tersimpan.")}catch(err){handleAdminError(err)}return}
  if(e.target.id==="priceForm"){e.preventDefault();const f=new FormData(e.target),row={id:f.get("id"),label:f.get("label")||"",name:f.get("name"),price_text:f.get("price_text")||"",featured:f.get("featured")==="on",features:String(f.get("features")||"").split("\n").map(x=>x.trim()).filter(Boolean)};try{await A.upsert("pricing",row);await afterSave("Paket harga diperbarui.")}catch(err){handleAdminError(err)}return}
  if(e.target.id==="siteSettingsForm"){e.preventDefault();const f=new FormData(e.target),row={id:1,whatsapp:String(f.get("whatsapp")||"").replace(/\s/g,""),lynk:f.get("lynk")||"https://lynk.id/midhostudio",email:f.get("email")||"",instagram:f.get("instagram")||"",location:f.get("location")||"",about:f.get("about")||""};try{await A.upsert("site_settings",row);await afterSave("Pengaturan website diperbarui.")}catch(err){handleAdminError(err)}return}
  if(e.target.id==="logoForm"||e.target.id==="faviconForm"){e.preventDefault();const file=new FormData(e.target).get("file");if(!file?.size)return toast("Pilih file terlebih dahulu.","err");const btn=e.target.querySelector("button[type=submit]");try{btn.disabled=true;btn.textContent="Mengunggah...";const up=await A.upload("site-assets",file);const row={id:1};row[e.target.id==="logoForm"?"logo_path":"favicon_path"]=up.path;await A.upsert("site_settings",row);await afterSave("Asset brand berhasil diganti.")}catch(err){handleAdminError(err)}finally{btn.disabled=false;btn.textContent=e.target.id==="logoForm"?"Ganti Logo":"Ganti Favicon"}return}
});
$("#logoutBtn").addEventListener("click",()=>{A.logout();closeModal();$("#adminView").hidden=true;$("#loginView").hidden=false});
$("#adminMenu").addEventListener("click",()=>$("#adminRail").classList.toggle("open"));
document.addEventListener("click",e=>{if(innerWidth<=900&&$("#adminRail").classList.contains("open")&&!e.target.closest("#adminRail")&&!e.target.closest("#adminMenu"))$("#adminRail").classList.remove("open")});
window.MidhoAdminActions={clientModal,projectModal,portfolioModal,productModal,priceModal};
if(A.hasToken())enter().catch(err=>{
  if(err?.auth===true) handleAdminError(err);
  else toast("Dashboard belum berhasil dimuat. Refresh halaman untuk mencoba lagi.","err");
});
})();