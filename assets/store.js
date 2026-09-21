(()=>{
  const KEY="midhoStudioDataV2";
  const AUTH_KEY="midhoStudioAdminAuthV1";

  const defaults={
    site:{
      heroTitle:"Visual yang kuat. Bisnis yang lebih hidup.",
      heroDescription:"Midho Studio membantu brand tampil lebih profesional melalui desain, identitas visual, website, dan kebutuhan digital yang dikerjakan dengan detail.",
      about:"Creative digital studio untuk desain yang lebih jelas, modern, dan bernilai.",
      whatsapp:"",
      lynk:"",
      instagram:"",
      email:"",
      location:"Palu, Sulawesi Tengah",
      maintenanceText:""
    },
    services:[
      {id:"svc-brand",name:"Brand Identity",description:"Logo, visual identity, brand guideline, dan sistem desain yang konsisten.",featured:true},
      {id:"svc-design",name:"Graphic Design",description:"Materi promosi yang bersih, komunikatif, dan tetap punya karakter.",featured:true},
      {id:"svc-web",name:"Website Design",description:"Landing page dan website bisnis modern, responsif, cepat, dan fokus konversi.",featured:true},
      {id:"svc-print",name:"Print & Merchandise",description:"Desain siap produksi untuk kebutuhan cetak, kemasan, dan merchandise.",featured:false}
    ],
    products:[
      {id:"prd-1",name:"Brand Starter Kit",category:"Branding",description:"Paket dasar identitas visual untuk bisnis yang baru mulai membangun brand.",price:350000,featured:true,lynk:""},
      {id:"prd-2",name:"Social Media Design Pack",category:"Graphic Design",description:"Paket desain konten visual untuk kebutuhan promosi media sosial.",price:250000,featured:true,lynk:""},
      {id:"prd-3",name:"Business Landing Page",category:"Website",description:"Landing page modern untuk profil bisnis, promosi, dan konversi.",price:0,featured:true,lynk:""}
    ],
    pricing:[
      {id:"price-1",label:"Starter",name:"Design Essentials",description:"Cocok untuk kebutuhan visual rutin dan materi promosi.",priceText:"Rp150K",featured:false,features:["1 kebutuhan desain","2x revisi minor","File final siap pakai","Support setelah delivery"]},
      {id:"price-2",label:"Growth",name:"Brand & Campaign",description:"Untuk brand yang ingin membangun visual lebih konsisten.",priceText:"Rp350K",featured:true,features:["Konsep visual terarah","Multi-asset design","3x revisi minor","Priority support"]},
      {id:"price-3",label:"Custom",name:"Website & Project",description:"Untuk kebutuhan digital yang lebih lengkap dan spesifik.",priceText:"Custom",featured:false,features:["Scope sesuai project","UI/UX & development","Progress terpantau","Support setelah launch"]}
    ],
    portfolio:[
      {id:"port-1",title:"Northfield — Visual System",category:"brand",categoryLabel:"Brand Identity",style:"a",year:"2026"},
      {id:"port-2",title:"Oasis — Digital Presence",category:"digital",categoryLabel:"Web Design",style:"b",year:"2026"},
      {id:"port-3",title:"Mono — Product Series",category:"print",categoryLabel:"Packaging",style:"c",year:"2026"},
      {id:"port-4",title:"Flow — Business Dashboard",category:"digital",categoryLabel:"Digital Product",style:"d",year:"2026"}
    ],
    orders:[
      {id:"MS-240921",project:"Brand Identity — Aster",client:"Aster Coffee",service:"Branding",date:"2026-09-15",deadline:"2026-09-28",amount:3500000,status:"berlangsung",progress:[{label:"Brief diterima",done:true},{label:"Konsep awal",done:true},{label:"Review klien",done:true},{label:"Finalisasi",done:false}]},
      {id:"MS-200921",project:"Landing Page — Nusa",client:"Nusa Kreatif",service:"Website",date:"2026-09-10",deadline:"2026-09-25",amount:4800000,status:"revisi",progress:[{label:"Brief diterima",done:true},{label:"Wireframe",done:true},{label:"Development",done:true},{label:"Revisi final",done:false}]},
      {id:"MS-180921",project:"Campaign Kit — Luma",client:"Luma Skin",service:"Graphic Design",date:"2026-08-28",deadline:"2026-09-22",amount:1900000,status:"selesai",progress:[{label:"Brief diterima",done:true},{label:"Desain",done:true},{label:"Approval",done:true},{label:"Delivery",done:true}]},
      {id:"MS-160921",project:"Packaging — Sora",client:"Sora Goods",service:"Packaging",date:"2026-08-15",deadline:"2026-09-30",amount:2600000,status:"berlangsung",progress:[{label:"Brief diterima",done:true},{label:"Konsep",done:true},{label:"Mockup",done:false},{label:"Final artwork",done:false}]}
    ]
  };

  function clone(v){return JSON.parse(JSON.stringify(v))}
  function load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(!raw) return clone(defaults);
      const parsed=JSON.parse(raw);
      return {
        site:{...defaults.site,...(parsed.site||{})},
        services:Array.isArray(parsed.services)?parsed.services:clone(defaults.services),
        products:Array.isArray(parsed.products)?parsed.products:clone(defaults.products),
        pricing:Array.isArray(parsed.pricing)?parsed.pricing:clone(defaults.pricing),
        portfolio:Array.isArray(parsed.portfolio)?parsed.portfolio:clone(defaults.portfolio),
        orders:Array.isArray(parsed.orders)?parsed.orders:clone(defaults.orders)
      };
    }catch(e){return clone(defaults)}
  }
  function save(data){localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent("midho:data",{detail:data}))}
  function reset(){localStorage.removeItem(KEY);return load()}
  function id(prefix){return prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7)}
  function money(value){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(value||0))}
  function progress(order){const p=order.progress||[];if(!p.length)return 0;return Math.round((p.filter(x=>x.done).length/p.length)*100)}
  async function hash(text){
    if(window.crypto?.subtle){
      const bytes=new TextEncoder().encode(text);
      const buf=await crypto.subtle.digest("SHA-256",bytes);
      return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
    }
    return btoa(unescape(encodeURIComponent(text)));
  }
  function getAuth(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||"null")}catch(e){return null}}
  async function setAuth(email,password){
    const auth={email:email.trim().toLowerCase(),hash:await hash(password),createdAt:new Date().toISOString()};
    localStorage.setItem(AUTH_KEY,JSON.stringify(auth));return auth;
  }
  async function verifyAuth(email,password){
    const auth=getAuth();if(!auth)return false;
    return auth.email===email.trim().toLowerCase() && auth.hash===await hash(password);
  }
  function clearAuth(){localStorage.removeItem(AUTH_KEY)}

  window.MidhoStore={KEY,AUTH_KEY,defaults,load,save,reset,id,money,progress,getAuth,setAuth,verifyAuth,clearAuth};
})();