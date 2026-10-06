import { Controller, Get, Query, Res, NotFoundException } from '@nestjs/common';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { StudyPhase } from '@prisma/client';
import type { Response } from 'express';
import { Answers, Instrument, responseLabel } from '@vr/instrument';
import { Admin } from '../auth/auth';
import { PrismaService } from '../prisma/prisma.service';
import { summarize, safeCsvCell } from './analytics';
export class ReportQuery { @IsEnum(StudyPhase) phase!:StudyPhase; @IsString() @MinLength(1) version!:string; }
@Admin() @Controller('reports')
export class ReportsController {
 constructor(private db:PrismaService){}
 async dataset(q:ReportQuery){const instrument=await this.db.instrumentVersion.findUnique({where:{version:q.version}});if(!instrument)throw new NotFoundException('Versión no encontrada.');const all=await this.db.diagnostic.findMany({where:{phase:q.phase,instrumentId:instrument.id},orderBy:{createdAt:'asc'}});return {schema:instrument.definition as unknown as Instrument,all};}
 @Get('summary') async summary(@Query()q:ReportQuery){const {schema,all}=await this.dataset(q);const complete=all.filter(x=>x.status==='COMPLETE');return {...summarize(schema,complete.map(x=>({answers:x.answers as unknown as Answers}))),version:q.version,phase:q.phase,registered:all.length,drafts:all.length-complete.length};}
 @Get('export.csv') async csv(@Query()q:ReportQuery,@Res()res:Response){
  const {schema,all}=await this.dataset(q);const fields=schema.questions.flatMap(x=>[x.id,x.id+'_label',...(x.otherValue||x.extraTextLabel?[x.id+'_other']:[])]);
  const header=['codigo','fase','version','estado','revision','inicio','actualizacion','finalizacion','notas',...fields];
  const rows=all.map(d=>{const a=d.answers as unknown as Answers;const values=schema.questions.flatMap(x=>{const value=a[x.id];return [value===undefined?'':typeof value==='string'?value:JSON.stringify(value),responseLabel(x,value),...(x.otherValue||x.extraTextLabel?[a[x.id+'_other']??'']:[])];});return [d.businessCode,d.phase,q.version,d.status,d.revision,d.createdAt.toISOString(),d.updatedAt.toISOString(),d.completedAt?.toISOString()??'',d.notes,...values];});
  const csv='\uFEFF'+[header,...rows].map(row=>row.map(safeCsvCell).join(';')).join('\r\n');
  res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="diagnostico.csv"');res.send(csv);
 }
}
