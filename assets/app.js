(()=>{
  const S=window.MidhoStore;
  const data=S?S.load():null;
  const toast=document.getElementById("toast");
  const notify=(message)=>{if(!toast)return;toast.textContent=message;toast.classList.add("show");clearTimeout(window.__midhoToast);window.__midhoToast=setTimeout(()=>toast.classList.remove("show"),2600)};
  const getSite=()=>S?S.load().site:{whatsapp:"",lynk:""};
  function bindCtas(){
    document.querySelectorAll("[data-whatsapp]").forEach(el=>{
      el.onclick=(e)=>{const site=getSite();if(site.whatsapp){el.href="https://wa.me/"+site.whatsapp;return}e.preventDefault();notify("Nomor WhatsApp belum diatur oleh admin.")};
    });
    document.querySelectorAll("[data-lynk]").forEach(el=>{
      el.onclick=(e)=>{const site=getSite();if(site.lynk){el.href=site.lynk;return}e.preventDefault();notify("Link lynk.id belum diatur oleh admin.")};
    });
  }
  function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
  function renderPublic(){
    if(!S) return;
    const d=S.load(),site=d.site;
    const hero=document.querySelector(".hero-copy h1");
    if(hero&&site.heroTitle){
      const parts=site.heroTitle.split(". ");
      hero.innerHTML=parts.length>1?esc(parts[0])+".<br><span>"+esc(parts.slice(1).join(". "))+"</span>":esc(site.heroTitle);
    }
    const heroP=document.querySelector(".hero-copy>p"); if(heroP)heroP.textContent=site.heroDescription||"";
    const about=document.getElementById("publicAbout");if(about)about.textContent=site.about||"";
    const loc=document.getElementById("publicLocation");if(loc)loc.textContent=site.location||"—";
    const email=document.getElementById("publicEmail");if(email){email.textContent=site.email||"—";email.href=site.email?"mailto:"+site.email:"#"}
    const ig=document.getElementById("publicInstagram");if(ig){ig.textContent=site.instagram||"—";ig.href=site.instagram||"#"}

    const sg=document.querySelector(".service-grid");
    if(sg)sg.innerHTML=d.services.map((x,i)=>`<article class="service-card ${x.featured?"featured":""} reveal visible"><div class="service-top"><span>${String(i+1).padStart(2,"0")}</span><b>↗</b></div><div class="service-icon">${i===0?"Aa":i===1?"▤":i===2?"</>":"◫"}</div><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p></article>`).join("");

    const pg=document.getElementById("productGrid");
    if(pg)pg.innerHTML=d.products.filter(x=>x.featured).map(x=>`<article class="product-card reveal visible"><span class="product-label">${esc(x.category)}</span><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p><div class="product-bottom"><strong>${Number(x.price)>0?S.money(x.price):"Custom"}</strong><a class="btn btn-primary" href="${esc(x.lynk||site.lynk||"#")}" ${(x.lynk||site.lynk)?"target=\"_blank\"":"data-lynk"}>Beli / Lihat Detail ↗</a></div></article>`).join("")||'<p class="empty">Produk unggulan akan tampil di sini.</p>';

    const priceGrid=document.querySelector(".price-grid");
    if(priceGrid)priceGrid.innerHTML=d.pricing.map(x=>`<article class="price-card ${x.featured?"popular":""} reveal visible">${x.featured?'<span class="popular-badge">Unggulan</span>':""}<span class="price-label">${esc(x.label)}</span><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p><div class="price">Mulai<strong>${esc(x.priceText)}</strong></div><ul>${(x.features||[]).map(f=>`<li>${esc(f)}</li>`).join("")}</ul><a class="btn ${x.featured?"btn-primary":"btn-outline"} btn-block" href="#" data-whatsapp>Konsultasikan</a></article>`).join("");

    const workGrid=document.querySelector(".work-grid");
    if(workGrid)workGrid.innerHTML=d.portfolio.map((x,i)=>`<article class="work-card reveal visible" data-category="${esc(x.category)}"><div class="work-art art-${esc(x.style||["a","b","c","d"][i%4])}">${x.style==="a"?'<span>'+esc(x.year||"")+'</span><strong>'+esc((x.title||"").split(" — ")[0])+'</strong><small>'+esc(x.categoryLabel)+'</small>':x.style==="b"?'<div class="phone"><div><span></span><strong>'+esc((x.title||"Project").split(" — ")[0].toUpperCase())+'</strong><small>'+esc(x.categoryLabel)+'</small><i></i><i></i></div></div>':x.style==="c"?'<div class="pack one">M.</div><div class="pack two">M.</div><div class="pack three">M.</div>':'<div class="dash"><aside></aside><section><header><i></i><i></i></header><div><b></b><b></b><b></b></div><footer></footer></section></div>'}</div><div class="work-meta"><div><span>${esc(x.categoryLabel)}</span><h3>${esc(x.title)}</h3></div><b>↗</b></div></article>`).join("");
    bindCtas();
  }

  renderPublic();
  window.addEventListener("midho:data",renderPublic);

  const menu=document.querySelector(".menu-toggle"),links=document.querySelector(".navlinks");
  if(menu&&links){menu.addEventListener("click",()=>links.classList.toggle("open"));links.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")))}
  const filters=document.querySelectorAll("[data-filter]");
  filters.forEach(btn=>btn.addEventListener("click",()=>{filters.forEach(x=>x.classList.remove("active"));btn.classList.add("active");const f=btn.dataset.filter;document.querySelectorAll("[data-category]").forEach(card=>card.classList.toggle("hidden",!(f==="all"||card.dataset.category===f)))}));
  if("IntersectionObserver"in window){const ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");ob.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(el=>ob.observe(el))}else document.querySelectorAll(".reveal").forEach(el=>el.classList.add("visible"));
  const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
  const adminMenu=document.querySelector(".admin-menu"),sidebar=document.querySelector(".sidebar");if(adminMenu&&sidebar)adminMenu.addEventListener("click",()=>sidebar.classList.toggle("open"));
})();