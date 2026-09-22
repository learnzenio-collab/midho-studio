(()=>{
const A=window.MidhoAPI;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const state={data:null,section:"overview",query:"",status:"all",payment:"all"};
function toast(msg,type="ok"){const t=$("#adminToast");if(!t)return;t.textContent=msg;t.className="admin-toast show"+(type==="err"?" err":"");clearTimeout(t._x);t._x=setTimeout(()=>t.className="admin-toast",3000)}
function initials(name){return String(name||"?").split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()}
function statusLabel(s){return ({brief:"Brief",dikerjakan:"Dikerjakan",review:"Review",revisi:"Revisi",selesai:"Selesai",berlangsung:"Dikerjakan"})[s]||s||"—"}
function paymentLabel(s){return ({belum_bayar:"Belum Bayar",dp:"DP",lunas:"Lunas"})[s]||s||"—"}
function fmtDate(v){if(!v)return"—";const d=new Date(v+"T00:00:00");return isNaN(d)?"—":d.toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"})}
function fmtDateTime(v){if(!v)return"—";const d=new Date(v);return d.toLocaleString("id-ID",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
function deadlineInfo(v,status){if(!v||status==="selesai")return{label:"—",late:false,days:null};const today=new Date();today.setHours(0,0,0,0);const d=new Date(v+"T00:00:00");const n=Math.ceil((d-today)/86400000);return{days:n,late:n<0,label:n<0?Math.abs(n)+" hari terlambat":n===0?"Hari ini":n===1?"Besok":n+" hari lagi"}}
function clientOf(order){return (state.data?.clients||[]).find(c=>c.id===order.client_id)||{name:order.client||"—",whatsapp:"",email:"",brand:""}}
function activitiesFor(id){return (state.data?.activities||[]).filter(a=>a.order_id===id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))}
function portfolioUrl(x){return x.image_path?A.publicAsset("portfolio",x.image_path):(x.image_url||"")}
function logoUrl(site){return site?.logo_path?A.publicAsset("site-assets",site.logo_path):"/assets/midho-logo-white.png"}
function pageHead(kicker,title,desc,action){return '<div class="page-head"><div><small>'+esc(kicker)+'</small><h1>'+esc(title)+'</h1>'+(desc?'<p>'+esc(desc)+'</p>':'')+'</div>'+(action||"")+'</div>'}
function modal(title,body,wide=false){
  $("#modalRoot").innerHTML='<div class="modal-backdrop" data-modal-backdrop><section class="modal-card '+(wide?"wide":"")+'" data-modal-card><header class="modal-head"><h2>'+esc(title)+'</h2><button type="button" data-close-modal aria-label="Tutup">×</button></header>'+body+'</section></div>';
  const first=$("#modalRoot input:not([type=hidden]), #modalRoot select, #modalRoot textarea");
  setTimeout(()=>first?.focus(),20);
}
function closeModal(){const root=$("#modalRoot");if(root)root.innerHTML=""}
async function reload(){state.data=await A.snapshot();$$("[data-brand-logo]").forEach(x=>x.src=logoUrl(state.data.site||{}));return state.data}
async function enter(){await reload();$("#loginView").hidden=true;$("#adminView").hidden=false;window.MidhoAdminPages.render()}
window.MidhoAdmin={A,$,$$,esc,state,toast,initials,statusLabel,paymentLabel,fmtDate,fmtDateTime,deadlineInfo,clientOf,activitiesFor,portfolioUrl,logoUrl,pageHead,modal,closeModal,reload,enter};
})();