(()=>{
  const URL="https://rlapjgbrheovqidhoswo.supabase.co";
  const KEY="sb_publishable_es_0A2Lobuum2ndY53xaNA_Cyyn4trG";
  const ADMIN=URL+"/functions/v1/admin-api";
  const TOKEN_KEY="midho_admin_token";

  async function request(path,opts={}){
    const res=await fetch(URL+"/rest/v1/"+path,{
      ...opts,
      headers:{apikey:KEY,Authorization:"Bearer "+KEY,"Content-Type":"application/json",...(opts.headers||{})}
    });
    if(!res.ok){const err=new Error(await res.text()||"Request gagal");err.status=res.status;throw err}
    const text=await res.text(); return text?JSON.parse(text):null;
  }
  async function publicData(){
    const [site,services,products,pricing,portfolio]=await Promise.all([
      request("site_settings?id=eq.1&select=*"),
      request("services?select=*&order=sort_order.asc"),
      request("products?select=*&order=sort_order.asc"),
      request("pricing?select=*&order=sort_order.asc"),
      request("portfolio?select=*&order=sort_order.asc")
    ]);
    return {site:site?.[0]||{},services:services||[],products:products||[],pricing:pricing||[],portfolio:portfolio||[]};
  }
  async function adminCall(payload,token=sessionStorage.getItem(TOKEN_KEY)||""){
    let res;
    try{
      res=await fetch(ADMIN,{method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:JSON.stringify(payload)});
    }catch(e){
      const err=new Error("Koneksi ke dashboard gagal. Periksa internet lalu coba lagi.");
      err.status=0; throw err;
    }
    const data=await res.json().catch(()=>({}));
    if(!res.ok){const err=new Error(data.error||"Request gagal");err.status=res.status;throw err}
    return data;
  }
  async function login(pin){const r=await adminCall({action:"login",pin},"");sessionStorage.setItem(TOKEN_KEY,r.token);return r}
  async function snapshot(){return adminCall({action:"snapshot"})}
  async function upsert(table,row){return adminCall({action:"upsert",table,row})}
  async function remove(table,id){return adminCall({action:"delete",table,id})}
  async function saveOrder(order){return adminCall({action:"save_order",order})}
  async function upload(bucket,file,onProgress){
    if(!file||!file.size)throw new Error("File tidak valid.");
    const signed=await adminCall({action:"create_upload",bucket,filename:file.name,contentType:file.type,size:file.size});
    await new Promise((resolve,reject)=>{
      const xhr=new XMLHttpRequest();
      xhr.open("PUT",signed.signedUrl,true);
      if(file.type)xhr.setRequestHeader("Content-Type",file.type);
      xhr.setRequestHeader("x-upsert","false");
      xhr.upload.onprogress=e=>{if(e.lengthComputable&&typeof onProgress==="function")onProgress(Math.round(e.loaded/e.total*100))};
      xhr.onerror=()=>reject(new Error("Upload gagal. Periksa koneksi lalu coba lagi."));
      xhr.onabort=()=>reject(new Error("Upload dibatalkan."));
      xhr.onload=()=>{
        if(xhr.status>=200&&xhr.status<300){if(typeof onProgress==="function")onProgress(100);resolve()}
        else{
          let msg="Upload gagal";
          try{const j=JSON.parse(xhr.responseText);msg=j.message||j.error||msg}catch{}
          reject(new Error(msg+" ("+xhr.status+")"));
        }
      };
      xhr.send(file);
    });
    return signed;
  }
  async function deleteAsset(bucket,path){return adminCall({action:"delete_asset",bucket,path})}
  function logout(){sessionStorage.removeItem(TOKEN_KEY)}
  function hasToken(){return !!sessionStorage.getItem(TOKEN_KEY)}
  function money(v){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(v||0))}
  function publicAsset(bucket,path){return path?URL+"/storage/v1/object/public/"+bucket+"/"+encodeURIComponent(path).replace(/%2F/g,"/"):""}
  function progress(order){const p=order.progress||[];return p.length?Math.round(p.filter(x=>x.done).length/p.length*100):0}

  window.MidhoAPI={URL,KEY,ADMIN,TOKEN_KEY,publicData,adminCall,login,snapshot,upsert,remove,saveOrder,upload,deleteAsset,logout,hasToken,money,publicAsset,progress};
})();