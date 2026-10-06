const base=(import.meta.env.VITE_API_URL??'http://localhost:3000/api').replace(/\/$/,'');
let token='';
export function setToken(value:string){token=value;}
export async function request<T=any>(path:string,options:RequestInit={}):Promise<T>{
 let response:Response;
 try{response=await fetch(base+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers}});}catch{throw new Error('No se pudo conectar con la API. Revise internet y VITE_API_URL. Los cambios pendientes no se han guardado.');}
 if(!response.ok){let message='Error '+response.status;try{const data=await response.json();message=Array.isArray(data.message)?data.message.join(' '):data.message??message;}catch{}
  if(response.status===401&&path!=='/auth/login')window.dispatchEvent(new Event('session-expired'));
  throw new Error(message);
 }
 return response.json();
}
export async function exportCsv(query:string){const response=await fetch(base+'/reports/export.csv?'+query,{headers:{Authorization:'Bearer '+token}});if(!response.ok)throw new Error('No fue posible exportar. Compruebe su sesión.');const blob=await response.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='diagnostico-villa-restrepo.csv';a.click();URL.revokeObjectURL(url);}
