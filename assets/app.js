(()=>{
const A=window.MidhoAPI;
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const esc=(v="")=>String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const toast=(m)=>{const t=$("#toast");if(!t)return;t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400)};
function bindCtas(site){
  $$("[data-whatsapp]").forEach(el=>el.onclick=e=>{if(site.whatsapp){el.href="https://wa.me/"+site.whatsapp;el.target="_blank";return}e.preventDefault();toast("Nomor WhatsApp belum diatur admin.")});
  $$("[data-lynk]").forEach(el=>el.onclick=e=>{if(site.lynk){el.href=site.lynk;el.target="_blank";return}e.preventDefault();toast("Link lynk.id belum diatur admin.")});
}
function applyBrand(site){
  const logo=site.logo_path?A.publicAsset("site-assets",site.logo_path):"/assets/midho-logo-white.png";
  $$("[data-brand-logo]").forEach(img=>img.src=logo);
  const fav=site.favicon_path?A.publicAsset("site-assets",site.favicon_path):"/assets/midho-logo-white.png";
  let link=document.querySelector('link[rel="icon"]');if(!link){link=document.createElement("link");link.rel="icon";document.head.appendChild(link)}link.href=fav;
}
async function render(){
  if(!A)return;
  try{
    const d=await A.publicData(),s=d.site||{};
    applyBrand(s);
    const hero=$(".hero-copy h1");if(hero&&s.hero_title){const i=s.hero_title.indexOf(". ");hero.innerHTML=i>0?esc(s.hero_title.slice(0,i+1))+"<br><span>"+esc(s.hero_title.slice(i+2))+"</span>":esc(s.hero_title)}
    const hp=$(".hero-copy>p");if(hp)hp.textContent=s.hero_description||"";
    const about=$("#publicAbout");if(about)about.textContent=s.about||"";
    const loc=$("#publicLocation");if(loc)loc.textContent=s.location||"—";
    const email=$("#publicEmail");if(email){email.textContent=s.email||"—";email.href=s.email?"mailto:"+s.email:"#"}
    const ig=$("#publicInstagram");if(ig){ig.textContent=s.instagram||"—";ig.href=s.instagram||"#"}
    const services=$(".service-grid");if(services)services.innerHTML=d.services.map((x,i)=>`<article class="service-card ${x.featured?"featured":""} reveal visible"><div class="service-top"><span>${String(i+1).padStart(2,"0")}</span><b>↗</b></div><div class="service-icon">${["Aa","▤","</>","◫"][i%4]}</div><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p></article>`).join("");
    const products=$("#productGrid");if(products)products.innerHTML=d.products.filter(x=>x.featured).map(x=>`<article class="product-card reveal visible"><span class="product-label">${esc(x.category)}</span><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p><div class="product-bottom"><strong>${Number(x.price)>0?A.money(x.price):"Custom"}</strong><a class="btn btn-primary" href="${esc(x.lynk_url||s.lynk||"#")}" ${(x.lynk_url||s.lynk)?'target="_blank"':'data-lynk'}>Beli / Detail ↗</a></div></article>`).join("")||'<p class="empty">Belum ada produk unggulan.</p>';
    const pricing=$(".price-grid");if(pricing)pricing.innerHTML=d.pricing.map(x=>`<article class="price-card ${x.featured?"popular":""} reveal visible">${x.featured?'<span class="popular-badge">Unggulan</span>':""}<span class="price-label">${esc(x.label)}</span><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p><div class="price">Mulai<strong>${esc(x.price_text)}</strong></div><ul>${(x.features||[]).map(f=>`<li>${esc(f)}</li>`).join("")}</ul><a class="btn ${x.featured?"btn-primary":"btn-outline"} btn-block" href="#" data-whatsapp>Konsultasikan</a></article>`).join("");
    const works=$(".work-grid");if(works)works.innerHTML=d.portfolio.map((x,i)=>{const img=x.image_path?A.publicAsset("portfolio",x.image_path):(x.image_url||"");return `<article class="work-card reveal visible" data-category="${esc(x.category)}"><div class="work-art ${img?"has-image":""}">${img?`<img src="${img}" alt="${esc(x.image_alt||x.title)}" loading="lazy">`:`<div class="portfolio-placeholder-public"><strong>${esc((x.title||"Project").split(" — ")[0])}</strong></div>`}</div><div class="work-meta"><div><span>${esc(x.category_label)}</span><h3>${esc(x.title)}</h3></div><b>↗</b></div></article>`}).join("");
    bindCtas(s);
  }catch(e){console.error(e);toast("Gagal memuat data website.")}
}
render();
const menu=$(".menu-toggle"),links=$(".navlinks");if(menu&&links){menu.addEventListener("click",()=>links.classList.toggle("open"));$$("a",links).forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")))}
document.addEventListener("click",e=>{const f=e.target.closest("[data-filter]");if(f){$$("[data-filter]").forEach(x=>x.classList.remove("active"));f.classList.add("active");$$("[data-category]").forEach(card=>card.classList.toggle("hidden",!(f.dataset.filter==="all"||card.dataset.category===f.dataset.filter)))}})
if("IntersectionObserver"in window){const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");ob.unobserve(e.target)}}),{threshold:.12});$$(".reveal").forEach(el=>ob.observe(el))}else $$(".reveal").forEach(el=>el.classList.add("visible"));
const year=$("#year");if(year)year.textContent=new Date().getFullYear();
})();