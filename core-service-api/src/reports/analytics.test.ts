import {test} from 'node:test';
import assert from 'node:assert/strict';
import {instrument} from '@vr/instrument';
import {summarize,safeCsvCell} from './analytics';
test('separación de omitidas, desconocidas, no aplica y habilidades',()=>{const r=summarize(instrument,[{answers:{G5:'2',E1:'0'}},{answers:{G5:'4'}},{answers:{}}]);const g=r.items.find(x=>x.id==='G5')!;assert.equal(g.valid,1);assert.equal(g.unknown,1);assert.equal(g.missing,1);assert.equal(g.distribution.find(d=>d.value==='2')?.percentage,100);assert.equal(r.items.find(x=>x.id==='E1')?.valid,1);});
test('prioridades sin sumar dos veces un participante',()=>{const r=summarize(instrument,[{answers:{G14:['G5','G6']}},{answers:{G14:['G6']}},{answers:{}}]);assert.equal(r.priorities[0].value,'G6');assert.equal(r.priorities[0].count,2);assert.equal(r.priorities[0].firstCount,1);assert.equal(r.priorities[0].percentage,100);});
test('salto de D no se cuenta como respuesta omitida',()=>{const D1=Object.fromEntries(Array.from({length:7},(_,i)=>[String(i),'0']));const r=summarize(instrument,[{answers:{D1}}]);const d=r.items.find(x=>x.id==='D2')!;assert.equal(d.skipped,1);assert.equal(d.missing,0);});
test('CSV neutraliza fórmulas y escapa comillas',()=>{assert.equal(safeCsvCell('=1+1'), '"\'=1+1"');assert.equal(safeCsvCell('Texto "prueba"'), '"Texto ""prueba"""');});
