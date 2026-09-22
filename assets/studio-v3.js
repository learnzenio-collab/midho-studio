(()=>{
const A=window.MidhoAPI,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const toast=m=>{const t=$("#toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove("show"),2200)};
const waUrl=(number,message)=>"https://wa.me/"+String(number||"").replace(/\D/g,"")+"?text="+encodeURIComponent(message||"Halo Midho Studio, saya ingin konsultasi.");
function asset(site,key,fallback){const p=site&&site[key];return p?A.publicAsset("site-assets",p):fallback}
function pimg(x){return x.image_path?A.publicAsset("portfolio",x.image_path):(x.image_url||"")}
function bindWA(site){
  const n=site.whatsapp||"6283133610239";
  $$("[data-whatsapp]").forEach(el=>{el.href=waUrl(n,"Halo Midho Studio, saya ingin konsultasi mengenai layanan yang tersedia.");el.target="_blank";el.rel="noopener"});
}
function priceMessage(site,p){return waUrl(site.whatsapp||"6283133610239","Halo Midho Studio, saya tertarik "+(p.label||p.name)+" — "+(p.price_text||"")+". Saya ingin konsultasi dan pesan paket ini.")}
function renderServices(data,site){
  const box=$("#serviceGrid"); if(!box)return;
  const list=(data||[]).slice(0,4);
  const marks=["Aa","▤","</>","◫"];
  box.innerHTML=list.map((x,i)=>'<article class="service-card"><span class="num">0'+(i+1)+'</span><div class="service-mark">'+marks[i%marks.length]+'</div><h3>'+esc(x.name)+'</h3><p>'+esc(x.description||"")+'</p><a href="'+esc(site.lynk||"https://lynk.id/midhostudio")+'" target="_blank" rel="noopener">Lihat & pesan ↗</a></article>').join("")||'<p class="empty">Layanan akan segera tersedia.</p>';
}
function renderPortfolio(data){
  const box=$("#portfolioGrid");if(!box)return;
  const list=(data||[]).filter(x=>x.featured!==false);
  box.innerHTML=list.map(x=>'<article class="portfolio-card" data-cat="'+esc(x.category||"digital")+'" data-open-work="'+esc(x.id)+'"><div class="portfolio-image"><img loading="lazy" decoding="async" src="'+esc(pimg(x))+'" alt="'+esc(x.image_alt||x.title)+'"></div><div class="portfolio-meta"><span>'+esc(x.category_label||x.category||"Project")+'</span><h3>'+esc(x.title)+'</h3></div></article>').join("");
  const first=list[0],second=list[1]||first;
  if(first&&$("#heroWork1"))$("#heroWork1").src=pimg(first);
  if(second&&$("#heroWork2"))$("#heroWork2").src=pimg(second);
}
function renderProducts(data,site){
  const box=$("#productGrid");if(!box)return;
  const buy=site.lynk||"https://lynk.id/midhostudio";
  const list=(data||[]).filter(x=>x.featured);
  box.innerHTML=list.map(x=>'<article class="product-card"><span class="product-type">'+esc(x.category||"Produk")+'</span><h3>'+esc(x.name)+'</h3><p>'+esc(x.description||"")+'</p><footer><strong>'+(Number(x.price)>0?A.money(x.price):"Custom")+'</strong><a href="'+esc(x.lynk_url||buy)+'" target="_blank" rel="noopener">Beli / Detail ↗</a></footer></article>').join("")||'<article class="product-card"><span class="product-type">Midho Studio</span><h3>Lihat semua layanan</h3><p>Pilih layanan yang sesuai kebutuhanmu.</p><footer><strong>Mulai sekarang</strong><a href="'+esc(buy)+'" target="_blank" rel="noopener">Buka Lynk.id ↗</a></footer></article>';
}
function renderPricing(data,site){
  const box=$("#priceGrid");if(!box)return;
  const list=(data||[]).slice(0,3);
  box.innerHTML=list.map((p,i)=>'<article class="price-card '+(p.featured?"featured":"")+'"><span class="price-label">'+esc(p.label||"Paket")+'</span><h3>'+esc(p.name)+'</h3><div class="price">'+esc(p.price_text)+'</div><ul>'+((p.features||[]).map(f=>'<li>'+esc(f)+'</li>').join(""))+'</ul><a href="'+priceMessage(site,p)+'" target="_blank" rel="noopener">Pilih paket via WhatsApp ↗</a></article>').join("");
}
function setContact(site){
  $("#aboutText").textContent=site.about||"Creative digital studio untuk desain yang lebih jelas, modern, dan bernilai.";
  const e=$("#publicEmail");e.textContent=site.email||"—";e.href=site.email?"mailto:"+site.email:"#";
  const ig=$("#publicInstagram");ig.textContent=site.instagram||"—";ig.href=site.instagram||"#";
  $("#publicLocation").textContent=site.location||"—";
  const logo=asset(site,"logo_path","/assets/midho-logo-white.png");$$("[data-brand-logo]").forEach(x=>x.src=logo);
}
function filters(){
  $("#portfolioFilters")?.addEventListener("click",e=>{const b=e.target.closest("button[data-filter]");if(!b)return;$$("#portfolioFilters button").forEach(x=>x.classList.toggle("active",x===b));$$(".portfolio-card").forEach(c=>c.hidden=b.dataset.filter!=="all"&&c.dataset.cat!==b.dataset.filter)});
}
function lightbox(data){
  const lb=$("#lightbox");if(!lb)return;
  document.addEventListener("click",e=>{const c=e.target.closest("[data-open-work]");if(c){const x=(data||[]).find(v=>String(v.id)===c.dataset.openWork);if(!x)return;lb.querySelector("img").src=pimg(x);lb.querySelector("img").alt=x.image_alt||x.title;lb.querySelector("span").textContent=x.category_label||x.category||"Portfolio";lb.querySelector("strong").textContent=x.title;lb.hidden=false;document.body.style.overflow="hidden"}if(e.target===lb||e.target===lb.querySelector("button")){lb.hidden=true;document.body.style.overflow=""}});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!lb.hidden){lb.hidden=true;document.body.style.overflow=""}});
}
function nav(){
  const rail=$("#siteRail"),btn=$("#mobileMenu");
  btn?.addEventListener("click",()=>rail.classList.toggle("open"));
  $$("[data-section-link]").forEach(a=>a.addEventListener("click",()=>rail.classList.remove("open")));
  document.addEventListener("click",e=>{if(innerWidth<=860&&rail.classList.contains("open")&&!e.target.closest("#siteRail")&&!e.target.closest("#mobileMenu"))rail.classList.remove("open")});
  const obs=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){$$("[data-section-link]").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+en.target.id))}}),{rootMargin:"-30% 0px -60% 0px"});
  ["layanan","portfolio","produk","harga","tentang"].forEach(id=>{const el=$("#"+id);if(el)obs.observe(el)});
}
async function init(){
  $("#year").textContent=new Date().getFullYear();
  nav();filters();
  try{
    const d=await A.publicData(),site=d.site||{};
    bindWA(site);setContact(site);renderServices(d.services,site);renderPortfolio(d.portfolio);renderProducts(d.products,site);renderPricing(d.pricing,site);lightbox(d.portfolio);
  }catch(err){console.error(err);toast("Sebagian data belum berhasil dimuat.");bindWA({whatsapp:"6283133610239"});}
}
init();
})();