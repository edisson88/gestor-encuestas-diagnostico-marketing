import 'reflect-metadata';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {instrument} from '@vr/instrument';
import {DiagnosticsService} from './diagnostics.service';
const owner={id:'u1',name:'Aplicador',email:'a@example.test',role:'APPLICATOR' as const};
const admin={...owner,id:'u2',role:'ADMIN' as const};
function setup(status='DRAFT',changed=1){
 const row={id:'d1',applicatorId:'u1',status,consent:true,notes:'',answers:{A1:'0'},revision:1,instrument:{definition:instrument}};
 const logs:any[]=[];
 const tx:any={diagnostic:{updateMany:async()=>({count:changed}),findUniqueOrThrow:async()=>({...row,revision:2})},auditLog:{create:async(x:any)=>{logs.push(x);return x}}};
 const db:any={diagnostic:{findUnique:async()=>row},$transaction:async(f:any)=>f(tx)};
 return {service:new DiagnosticsService(db),logs};
}
test('aplicador no puede leer diagnóstico ajeno',async()=>{const {service}=setup();await assert.rejects(service.get('d1',{...owner,id:'other'}),/Forbidden/);});
test('corrección finalizada requiere administrador y motivo',async()=>{const {service}=setup('COMPLETE');await assert.rejects(service.update('d1',{revision:1,answers:{}},owner));await assert.rejects(service.update('d1',{revision:1,answers:{}},admin));});
test('revision obsoleta bloquea sobrescritura y no crea auditoría',async()=>{const {service,logs}=setup('DRAFT',0);await assert.rejects(service.update('d1',{revision:1,answers:{A1:'0'}},owner),/Otra sesión/);assert.equal(logs.length,0);});
test('corrección con motivo registra antes y después',async()=>{const {service,logs}=setup('COMPLETE');await service.update('d1',{revision:1,answers:{A1:'0'},reason:'Corrección de digitación'},admin);assert.equal(logs[0].data.action,'CORRECT');assert.equal(logs[0].data.reason,'Corrección de digitación');});
