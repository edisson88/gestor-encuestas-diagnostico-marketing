import {test} from 'node:test';
import assert from 'node:assert/strict';
import {instrument,normalizeAnswers,validateAnswers,visibleQuestions} from './index';
test('64 preguntas únicas y ocho dimensiones completas',()=>{assert.equal(instrument.questions.length,64);assert.equal(new Set(instrument.questions.map(q=>q.id)).size,64);assert.deepEqual(instrument.sections.map(x=>x.id),['A','B','C','D','E','F','G','H']);});
test('restricciones de prioridades y selecciones múltiples',()=>{assert.ok(validateAnswers(instrument,{G14:['G1','G1']}).length);assert.ok(validateAnswers(instrument,{F1:['0','1','2','3']}).length);assert.ok(validateAnswers(instrument,{C2:['0','3']}).length);assert.deepEqual(validateAnswers(instrument,{G14:['G5','G6','G7'],F1:['0','1','2']}),[]);});
test('salto digital elimina respuestas que dejaron de aplicar',()=>{const D1=Object.fromEntries(Array.from({length:7},(_,i)=>[String(i),'0']));const normalized=normalizeAnswers(instrument,{D1,D2:'0',D3:['7'],D3_other:'Prueba'});assert.equal(normalized.D2,undefined);assert.equal(normalized.D3_other,undefined);assert.equal(visibleQuestions(instrument,normalized).length,56);D1['0']='2';assert.equal(visibleQuestions(instrument,{D1}).length,64);});
test('D1 incompleta o desconocida conserva control de omisiones',()=>{assert.equal(visibleQuestions(instrument,{D1:{'0':'0'}}).length,64);assert.ok(validateAnswers(instrument,{D1:{'7':'0'}}).length);assert.ok(validateAnswers(instrument,{A1:'999'}).length);assert.ok(validateAnswers(instrument,{DESCONOCIDO:'x'}).length);});
test('no convierte omisión ni No sé en cero',()=>{assert.equal(normalizeAnswers(instrument,{G5:'4'}).G5,'4');assert.equal(normalizeAnswers(instrument,{}).G5,undefined);});

test('canales desconocidos no prueban inactividad',()=>{const D1=Object.fromEntries(Array.from({length:7},(_,i)=>[String(i),'3']));assert.equal(visibleQuestions(instrument,{D1}).length,64);assert.ok(validateAnswers(instrument,{D1:{'00':'0'}}).length);});

test('otro canal utilizado impide inferir inactividad digital',()=>{const D1=Object.fromEntries(Array.from({length:7},(_,i)=>[String(i),'0']));const a={D1,D1_other:'Telegram'};assert.equal(visibleQuestions(instrument,a).length,64);assert.deepEqual(validateAnswers(instrument,a),[]);assert.equal(normalizeAnswers(instrument,a).D1_other,'Telegram');});
