(()=>{
const M=window.MidhoAdmin,{A,$,$$,esc,state,initials,statusLabel,paymentLabel,fmtDate,deadlineInfo,clientOf,portfolioUrl,pageHead}=M;
function currentTitle(){return({overview:"Overview",clients:"Klien",projects:"Project",portfolio:"Portfolio",settings:"Pengaturan"})[state.section]||"Overview"}
function projectProgress(o){const p=o.progress||[];return p.length?Math.round(p.filter(x=>x.done).length/p.length*100):0}
function render(){
  $$(".admin-rail [data-nav]").forEach(x=>x.classList.toggle("active",x.dataset.nav===state.section));
  $("#adminCurrent").textContent=currentTitle();
  if(state.section==="overview")overview();
  else if(state.section==="clients")clientsPage();
  else if(state.section==="projects")projectsPage();
  else if(state.section==="portfolio")portfolioPage();
  else settingsPage();
}
function overview(){
  const d=state.data||{},orders=d.orders||[],clients=d.clients||[];
  const now=new Date(),ym=now.toISOString().slice(0,7);
  const active=orders.filter(o=>o.status!=="selesai").length;
  const revisions=orders.filter(o=>o.status==="revisi").length;
  const completed=orders.filter(o=>o.status==="selesai"&&String(o.order_date||"").slice(0,7)===ym).length;
  const receivable=orders.reduce((s,o)=>s+Math.max(0,Number(o.amount||0)-Number(o.paid_amount||0)),0);
  const months=[];for(let i=5;i>=0;i--){const x=new Date(now.getFullYear(),now.getMonth()-i,1);months.push(x.toISOString().slice(0,7))}
  const totals=months.map(m=>orders.filter(o=>String(o.order_date||"").slice(0,7)===m).reduce((s,o)=>s+Number(o.amount||0),0));
  const paid=months.map(m=>orders.filter(o=>String(o.order_date||"").slice(0,7)===m).reduce((s,o)=>s+Number(o.paid_amount||0),0));
  const max=Math.max(1,...totals,...paid);
  const deadlines=orders.filter(o=>o.status!=="selesai"&&o.deadline).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline))).slice(0,5);
  const latest=orders.slice(0,5);
  $("#mainContent").innerHTML=
    pageHead("Workspace","Selamat datang, Admin","Pantau klien, project, pembayaran, dan deadline dari satu tempat.",'<button class="btn btn-primary" data-action="new-project">+ Project Baru</button>')+
    '<section class="stat-grid">'+
      '<article class="stat"><span>Klien aktif</span><strong>'+clients.filter(c=>c.status==="aktif").length+'</strong><small>'+clients.length+' total klien</small></article>'+
      '<article class="stat"><span>Project aktif</span><strong>'+active+'</strong><small>Belum selesai</small></article>'+
      '<article class="stat alert"><span>Revisi</span><strong>'+revisions+'</strong><small>Perlu perhatian</small></article>'+
      '<article class="stat"><span>Selesai bulan ini</span><strong>'+completed+'</strong><small>'+now.toLocaleDateString("id-ID",{month:"long"})+'</small></article>'+
      '<article class="stat money"><span>Belum tertagih</span><strong>'+A.money(receivable)+'</strong><small>Sisa pembayaran</small></article>'+
    '</section>'+
    '<section class="panel-grid">'+
      '<article class="panel"><div class="panel-head"><div><span>Analitik bulanan</span><h3>Nilai project vs pembayaran</h3></div><div class="chart-legend"><span><b></b>Nilai</span><span><b class="paid"></b>Dibayar</span></div></div><div class="monthly-chart">'+months.map((m,i)=>'<div class="month-col"><div class="month-bars"><i style="height:'+Math.max(3,Math.round(totals[i]/max*100))+'%"></i><i class="paid" style="height:'+Math.max(3,Math.round(paid[i]/max*100))+'%"></i></div><small>'+new Date(m+"-01").toLocaleDateString("id-ID",{month:"short"})+'</small></div>').join("")+'</div></article>'+
      '<article class="panel"><div class="panel-head"><div><span>Deadline</span><h3>Project terdekat</h3></div></div><div class="deadline-list">'+(deadlines.map(o=>{const di=deadlineInfo(o.deadline,o.status),c=clientOf(o);return '<div class="deadline-item"><div><strong>'+esc(o.project)+'</strong><small>'+esc(c.name)+' · '+fmtDate(o.deadline)+'</small></div><span class="deadline-badge '+(di.late?"late":"")+'">'+esc(di.label)+'</span></div>'}).join("")||'<div class="empty">Belum ada deadline aktif.</div>')+'</div></article>'+
    '</section>'+
    projectTable(latest,"Project terbaru");
}
function clientRows(){
  const q=state.query.toLowerCase();
  return (state.data.clients||[]).filter(c=>!q||[c.name,c.brand,c.whatsapp,c.email].join(" ").toLowerCase().includes(q));
}
function clientsPage(){
  const rows=clientRows();
  $("#mainContent").innerHTML=
    pageHead("CRM","Daftar Klien","Satu profil untuk riwayat project, kontak, dan catatan.",'<button class="btn btn-primary" data-action="new-client">+ Tambah Klien</button>')+
    '<div class="toolbar"><input class="grow" id="clientSearch" placeholder="Cari nama, brand, WhatsApp..." value="'+esc(state.query)+'"><select id="clientStatus"><option value="all">Semua status</option><option value="aktif">Aktif</option><option value="arsip">Arsip</option></select></div>'+
    '<section class="table-panel"><div class="table-head"><h3>Klien</h3><span>'+rows.length+' data</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>KLIEN</th><th>KONTAK</th><th>PROJECT</th><th>TOTAL NILAI</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>'+
    (rows.map(c=>{const projects=(state.data.orders||[]).filter(o=>o.client_id===c.id),sum=projects.reduce((s,o)=>s+Number(o.amount||0),0);return '<tr><td><div class="client-cell"><span class="avatar">'+initials(c.name)+'</span><div><strong>'+esc(c.name)+'</strong><small>'+esc(c.brand||"Tanpa brand")+'</small></div></div></td><td>'+esc(c.whatsapp||"—")+'<small>'+esc(c.email||"")+'</small></td><td><strong>'+projects.length+'</strong><small>'+projects.filter(o=>o.status!=="selesai").length+' aktif</small></td><td>'+A.money(sum)+'</td><td><span class="status-pill '+(c.status==="arsip"?"brief":"selesai")+'">'+esc(c.status==="arsip"?"Arsip":"Aktif")+'</span></td><td><div class="row-actions">'+(c.whatsapp?'<a class="row-btn wa" target="_blank" rel="noopener" href="https://wa.me/'+esc(String(c.whatsapp).replace(/\D/g,""))+'">WA</a>':'')+'<button class="row-btn" data-edit-client="'+c.id+'">Edit</button><button class="row-btn danger" data-delete-client="'+c.id+'">Hapus</button></div></td></tr>'}).join("")||'<tr><td colspan="6" class="empty">Belum ada klien.</td></tr>')+
    '</tbody></table></div></section>';
}
function projectRows(){
  const q=state.query.toLowerCase();
  return (state.data.orders||[]).filter(o=>{
    const c=clientOf(o);
    return(!q||[o.project,o.service,c.name,c.brand].join(" ").toLowerCase().includes(q))&&(state.status==="all"||o.status===state.status)&&(state.payment==="all"||o.payment_status===state.payment)
  });
}
function projectTable(rows,title="Daftar project"){
  return '<section class="table-panel"><div class="table-head"><h3>'+esc(title)+'</h3><span>'+rows.length+' data</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>PROJECT</th><th>KLIEN</th><th>STATUS</th><th>DEADLINE</th><th>PEMBAYARAN</th><th>REVISI</th><th>PROGRESS</th><th>AKSI</th></tr></thead><tbody>'+
  (rows.map(o=>{const c=clientOf(o),p=projectProgress(o),di=deadlineInfo(o.deadline,o.status);return '<tr><td><strong>'+esc(o.project)+'</strong><small>'+esc(o.service||"")+' · '+A.money(o.amount)+'</small></td><td><div class="client-cell"><span class="avatar">'+initials(c.name)+'</span><div><strong>'+esc(c.name)+'</strong><small>'+esc(c.brand||"")+'</small></div></div></td><td><span class="status-pill '+esc(o.status||"brief")+'">'+esc(statusLabel(o.status))+'</span> '+(o.priority==="prioritas"?'<span class="priority-pill prioritas">Prioritas</span>':'')+'</td><td>'+fmtDate(o.deadline)+'<small class="'+(di.late?"late-text":"")+'">'+esc(di.label)+'</small></td><td><span class="pay-pill '+esc(o.payment_status||"belum_bayar")+'">'+esc(paymentLabel(o.payment_status))+'</span><small>'+A.money(o.paid_amount||0)+' / '+A.money(o.amount||0)+'</small></td><td>'+Number(o.revision_used||0)+' / '+Number(o.revision_limit||0)+'</td><td><div class="progress-mini"><div><i style="width:'+p+'%"></i></div><span>'+p+'%</span></div></td><td><div class="row-actions">'+(c.whatsapp?'<button class="row-btn wa" data-project-wa="'+o.id+'">WA</button>':'')+'<button class="row-btn" data-edit-project="'+o.id+'">Buka</button><button class="row-btn danger" data-delete-project="'+o.id+'">Hapus</button></div></td></tr>'}).join("")||'<tr><td colspan="8" class="empty">Belum ada project.</td></tr>')+
  '</tbody></table></div></section>';
}
function projectsPage(){
  const rows=projectRows();
  $("#mainContent").innerHTML=
    pageHead("Project Tracker","Project","Status, deadline, revisi, pembayaran, dan progres.",'<button class="btn btn-primary" data-action="new-project">+ Project Baru</button>')+
    '<div class="toolbar"><input class="grow" id="projectSearch" placeholder="Cari project atau klien..." value="'+esc(state.query)+'"><select id="projectStatus"><option value="all">Semua status</option><option value="brief">Brief</option><option value="dikerjakan">Dikerjakan</option><option value="review">Review</option><option value="revisi">Revisi</option><option value="selesai">Selesai</option></select><select id="paymentFilter"><option value="all">Semua pembayaran</option><option value="belum_bayar">Belum Bayar</option><option value="dp">DP</option><option value="lunas">Lunas</option></select></div>'+
    projectTable(rows);
  $("#projectStatus").value=state.status;$("#paymentFilter").value=state.payment;
}
function portfolioPage(){
  const list=state.data.portfolio||[];
  $("#mainContent").innerHTML=
    pageHead("Website","Portfolio","Upload gambar HD, edit metadata, atau hapus karya.",'<button class="btn btn-primary" data-action="new-portfolio">+ Tambah Portfolio</button>')+
    '<div class="cards-grid">'+(list.map(x=>'<article class="manage-card"><img src="'+esc(portfolioUrl(x))+'" alt="'+esc(x.image_alt||x.title)+'"><div class="meta"><span>'+esc(x.category_label||x.category)+'</span><h3>'+esc(x.title)+'</h3><div class="actions"><button class="row-btn" data-edit-portfolio="'+x.id+'">Edit</button><button class="row-btn danger" data-delete-portfolio="'+x.id+'">Hapus</button></div></div></article>').join("")||'<div class="empty">Belum ada portfolio.</div>')+'</div>';
}
function settingsPage(){
  const s=state.data.site||{},prices=state.data.pricing||[];
  $("#mainContent").innerHTML=
    pageHead("Website","Pengaturan","Kontak, link penjualan, paket harga, dan identitas brand.")+
    '<div class="settings-grid"><div class="settings-stack">'+
      '<form class="settings-card" id="siteSettingsForm"><h3>Kontak & Link Penjualan</h3><div class="form-grid"><div class="field"><label>WhatsApp konsultasi</label><input name="whatsapp" value="'+esc(s.whatsapp||"")+'"></div><div class="field"><label>Lynk.id</label><input name="lynk" value="'+esc(s.lynk||"https://lynk.id/midhostudio")+'"></div><div class="field"><label>Email</label><input name="email" type="email" value="'+esc(s.email||"")+'"></div><div class="field"><label>Instagram / URL</label><input name="instagram" value="'+esc(s.instagram||"")+'"></div><div class="field full"><label>Lokasi</label><input name="location" value="'+esc(s.location||"")+'"></div><div class="field full"><label>Tentang singkat</label><textarea name="about">'+esc(s.about||"")+'</textarea></div></div><div class="settings-actions"><button class="btn btn-primary">Simpan Pengaturan</button></div></form>'+
      '<section class="settings-card"><h3>Paket Harga</h3><div class="table-wrap"><table class="data-table"><thead><tr><th>PAKET</th><th>HARGA</th><th>AKSI</th></tr></thead><tbody>'+prices.map(p=>'<tr><td><strong>'+esc(p.name)+'</strong><small>'+esc(p.label||"")+'</small></td><td>'+esc(p.price_text)+'</td><td><button class="row-btn" data-edit-price="'+p.id+'">Edit</button></td></tr>').join("")+'</tbody></table></div></section>'+
    '</div><div class="settings-stack">'+
      '<form class="settings-card" id="logoForm"><h3>Logo</h3><div class="field"><label>Upload logo baru</label><input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"><span class="upload-note">PNG / JPG / WebP / SVG, maksimal 8 MB.</span></div><div class="settings-actions"><button class="btn btn-outline">Ganti Logo</button></div></form>'+
      '<form class="settings-card" id="faviconForm"><h3>Favicon</h3><div class="field"><label>Upload favicon</label><input type="file" name="file" accept="image/png,image/x-icon,image/vnd.microsoft.icon"><span class="upload-note">Gunakan logo Midho Studio versi icon.</span></div><div class="settings-actions"><button class="btn btn-outline">Ganti Favicon</button></div></form>'+
    '</div></div>';
}
window.MidhoAdminPages={render,overview,clientsPage,projectsPage,portfolioPage,settingsPage,projectTable};
})();