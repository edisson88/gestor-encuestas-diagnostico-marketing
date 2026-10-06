import { Answers, Instrument, skipDigital } from '@vr/instrument';
export interface Observation{answers:Answers}
export function summarize(schema:Instrument,rows:Observation[]){
 const total=rows.length;
 const items=schema.questions.map(q=>{
  let missing=0,unknown=0,notApplicable=0,skipped=0,valid=0;
  const counts=new Map<string,number>();const texts:string[]=[];
  for(const row of rows){
   if(/^D[2-9]$/.test(q.id)&&skipDigital(row.answers)){skipped++;continue;}
   const answer=row.answers[q.id];
   if(answer===undefined||answer===''||Array.isArray(answer)&&!answer.length||typeof answer==='object'&&!Array.isArray(answer)&&!Object.keys(answer).length){missing++;continue;}
   if(q.kind==='text'){valid++;texts.push(String(answer));continue;}
   const values=Array.isArray(answer)?answer:typeof answer==='object'?Object.values(answer):[answer];
   if(q.kind==='matrix'){
    valid++;for(const [k,v]of Object.entries(answer)){const key=k+':'+v;counts.set(key,(counts.get(key)??0)+1);}continue;
   }
   const labels=values.map(v=>q.options?.find(o=>o.value===v)?.label);
   if(labels.includes('No sé')||labels.includes('No sé valorar mi habilidad')){unknown++;continue;}
   if(labels.includes('No aplica')){notApplicable++;continue;}
   valid++;for(const v of values)counts.set(v,(counts.get(v)??0)+1);
  }
  const distribution=q.kind==='ranking'?schema.questions.filter(x=>/^G(?:[1-9]|1[0-3])$/.test(x.id)).map(x=>({value:x.id,label:x.label,count:counts.get(x.id)??0})):q.kind==='matrix'?(q.rows??[]).flatMap((r,k)=>(q.options??[]).map(o=>({value:k+':'+o.value,label:r+' — '+o.label,count:counts.get(k+':'+o.value)??0}))):(q.options??[]).filter(o=>!['No sé','No sé valorar mi habilidad','No aplica'].includes(o.label)).map(o=>({value:o.value,label:o.label,count:counts.get(o.value)??0}));
  return {id:q.id,label:q.label,kind:q.kind,total,valid,missing,unknown,notApplicable,skipped,distribution:distribution.map(x=>({...x,percentage:valid?Math.round(x.count/valid*1000)/10:0})),texts};
 });
 const priorities=items.find(x=>x.id==='G14')?.distribution.map(x=>({...x,firstCount:rows.filter(r=>Array.isArray(r.answers.G14)&&r.answers.G14[0]===x.value).length})).sort((a,b)=>b.count-a.count||b.firstCount-a.firstCount)||[];
 return {total,items,priorities};
}
export function safeCsvCell(value:unknown):string {
 let text=value==null?'':String(value);if(/^[\s]*[=+\-@\t\r]/.test(text))text="'"+text;
 return '"'+text.replace(/"/g,'""')+'"';
}
