import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { instrument } from '@vr/instrument';
import { hashPassword } from '../src/auth/password';
const db=new PrismaClient();
async function seed(){
 const email=process.env.ADMIN_EMAIL?.toLowerCase().trim();const password=process.env.ADMIN_PASSWORD;
 if(!email||!password||password.length<12)throw new Error('Configure ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 12 caracteres).');
 const existing=await db.instrumentVersion.findUnique({where:{version:instrument.version}});
 if(existing && JSON.stringify(existing.definition)!==JSON.stringify(instrument)){
  // Compare object structure independent of PostgreSQL JSONB key order.
  const stable=(v:any):string=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map((x:any)=>JSON.parse(stable(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(stable(v[k]))])):v);
  if(stable(existing.definition)!==stable(instrument))throw new Error('La versión ya existe con otra definición. Incremente version en definition.json.');
 }
 await db.$transaction(async tx=>{
  await tx.instrumentVersion.updateMany({where:{version:{not:instrument.version}},data:{active:false}});
  await tx.instrumentVersion.upsert({where:{version:instrument.version},update:{active:true},create:{version:instrument.version,definition:instrument as unknown as Prisma.InputJsonValue}});
  await tx.user.upsert({where:{email},update:{},create:{email,name:process.env.ADMIN_NAME??'Administrador',passwordHash:hashPassword(password),role:'ADMIN'}});
 });
 console.log('Instrumento cargado y administrador disponible. El seed no modifica contraseñas existentes.');
}
seed().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>db.$disconnect());
