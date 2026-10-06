import definition from './definition.json';
export type Answer = string | string[] | Record<string, string>;
export type Answers = Record<string, Answer>;
export interface Question { id: string; section: string; label: string; kind: 'single'|'multi'|'text'|'matrix'|'ranking'; options?: {value:string;label:string}[]; rows?: string[]; max?:number; exclusive?:string[]; otherValue?:string; otherLabel?:string; extraTextLabel?:string; help?:string }
export interface Instrument { version:string; title:string; status:string; sections:{id:string;title:string}[]; questions:Question[] }
export const instrument = definition as Instrument;
export function skipDigital(answers: Answers): boolean {
 const c=answers.D1;return typeof c==='object' && !Array.isArray(c) && c!==null && Object.keys(c).length===7 && Object.values(c).every(v=>v==='0'||v==='1') && !(typeof answers.D1_other==='string' && answers.D1_other.trim());
}
export function visibleQuestions(schema:Instrument,answers:Answers):Question[]{return schema.questions.filter(q=>!(/^D[2-9]$/.test(q.id)&&skipDigital(answers)));}
export function normalizeAnswers(schema:Instrument,input:Answers):Answers {
 const out={...input};if(skipDigital(out))for(let n=2;n<=9;n++){delete out['D'+n];delete out['D'+n+'_other'];}
 for(const q of schema.questions){const a=out[q.id];if(q.otherValue && !(a===q.otherValue || Array.isArray(a)&&a.includes(q.otherValue)))delete out[q.id+'_other'];}return out;
}
export function validateAnswers(schema:Instrument,input:unknown):string[] {
 if(!input||typeof input!=='object'||Array.isArray(input))return ['Las respuestas deben ser un objeto.'];
 const answers=input as Answers;const errors:string[]=[];const allowed=new Set(schema.questions.flatMap(q=>[q.id,...(q.otherValue||q.extraTextLabel?[q.id+'_other']:[])]));
 for(const [key,value] of Object.entries(answers)){
  if(!allowed.has(key)){errors.push('Código desconocido: '+key);continue;}
  if(key.endsWith('_other')){if(typeof value!=='string'||value.length>2000)errors.push(key+': texto inválido.');continue;}
  const q=schema.questions.find(x=>x.id===key)!;const valid=new Set(q.options?.map(x=>x.value));
  if(q.kind==='text'&&(typeof value!=='string'||value.length>2000))errors.push(key+': texto inválido.');
  if(q.kind==='single'&&(typeof value!=='string'||!valid.has(value)))errors.push(key+': opción inválida.');
  if(q.kind==='multi'&&(!Array.isArray(value)||value.some(x=>!valid.has(x))||new Set(value).size!==value.length||(q.max&&value.length>q.max)||((q.exclusive??[]).some(x=>value.includes(x))&&value.length>1)))errors.push(key+': selección inválida o supera el límite.');
  if(q.kind==='matrix'&&(!value||typeof value!=='object'||Array.isArray(value)||Object.entries(value).some(([row,v])=>!/^\d+$/.test(row)||String(Number(row))!==row||Number(row)>=(q.rows?.length??0)||!valid.has(v))))errors.push(key+': matriz inválida.');
  if(q.kind==='ranking'){
   const choices=new Set(schema.questions.filter(x=>/^G(?:[1-9]|1[0-3])$/.test(x.id)).map(x=>x.id));
   if(!Array.isArray(value)||value.length>3||value.some(x=>!choices.has(x))||new Set(value).size!==value.length)errors.push(key+': prioridades inválidas o repetidas.');
  }
 }return errors;
}
export function responseLabel(q:Question,value:Answer|undefined):string {
 if(value===undefined)return '';
 if(q.kind==='matrix'&&typeof value==='object'&&!Array.isArray(value))return Object.entries(value).map(([k,v])=>`${q.rows?.[Number(k)]}: ${q.options?.find(o=>o.value===v)?.label??v}`).join(' | ');
 const label=(v:string)=>q.options?.find(o=>o.value===v)?.label??v;
 return Array.isArray(value)?value.map(label).join(' | '):typeof value==='string'?label(value):'';
}
