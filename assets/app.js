(()=>{
  const CONFIG={whatsapp:"",lynk:""};
  const toast=document.getElementById("toast");
  const notify=(message)=>{if(!toast)return;toast.textContent=message;toast.classList.add("show");clearTimeout(window.__midhoToast);window.__midhoToast=setTimeout(()=>toast.classList.remove("show"),2600)};
  document.querySelectorAll("[data-whatsapp]").forEach(el=>el.addEventListener("click",e=>{if(CONFIG.whatsapp){el.href="https://wa.me/"+CONFIG.whatsapp;return}e.preventDefault();notify("Nomor WhatsApp belum diatur di assets/app.js")}));
  document.querySelectorAll("[data-lynk]").forEach(el=>el.addEventListener("click",e=>{if(CONFIG.lynk){el.href=CONFIG.lynk;return}e.preventDefault();notify("Link lynk.id belum diatur di assets/app.js")}));
  const menu=document.querySelector(".menu-toggle"),links=document.querySelector(".navlinks");
  if(menu&&links){menu.addEventListener("click",()=>links.classList.toggle("open"));links.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>links.classList.remove("open")))}
  const filters=document.querySelectorAll("[data-filter]"),works=document.querySelectorAll("[data-category]");
  filters.forEach(btn=>btn.addEventListener("click",()=>{filters.forEach(x=>x.classList.remove("active"));btn.classList.add("active");const f=btn.dataset.filter;works.forEach(card=>card.classList.toggle("hidden",!(f==="all"||card.dataset.category===f)))}));
  if("IntersectionObserver"in window){const ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");ob.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(el=>ob.observe(el))}else{document.querySelectorAll(".reveal").forEach(el=>el.classList.add("visible"))}
  const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
  const adminMenu=document.querySelector(".admin-menu"),sidebar=document.querySelector(".sidebar");
  if(adminMenu&&sidebar)adminMenu.addEventListener("click",()=>sidebar.classList.toggle("open"));
  document.querySelectorAll(".side-item").forEach(item=>item.addEventListener("click",()=>{document.querySelectorAll(".side-item").forEach(i=>i.classList.remove("active"));item.classList.add("active");notify("Modul ini akan dihubungkan ke database Supabase.")}));
})();