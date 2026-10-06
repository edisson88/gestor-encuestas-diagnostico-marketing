import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StudyPhase } from '@prisma/client';
import { Answers, Instrument, normalizeAnswers, validateAnswers } from '@vr/instrument';
import { PrismaService } from '../prisma/prisma.service';
import { Actor } from '../auth/auth';
import { CreateDiagnosticDto, UpdateDiagnosticDto } from './dto';
import { fullConsent, requireStudy } from '../instruments/instruments';
@Injectable()
export class DiagnosticsService{
 constructor(private db:PrismaService){}
 async get(id:string,u:Actor){const row=await this.db.diagnostic.findUnique({where:{id},include:{instrument:true,applicator:{select:{name:true,email:true}}}});if(!row)throw new NotFoundException('Aplicación no encontrada.');if(u.role!=='ADMIN'&&row.applicatorId!==u.id)throw new ForbiddenException();return row;}
 list(u:Actor){return this.db.diagnostic.findMany({where:u.role==='ADMIN'?{}:{applicatorId:u.id},include:{instrument:{select:{version:true}},applicator:{select:{name:true}}},orderBy:{updatedAt:'desc'},take:1000});}
 async create(dto:CreateDiagnosticDto,u:Actor){
  requireStudy();const v=await this.db.instrumentVersion.findUnique({where:{id:dto.instrumentId}});if(!v?.active)throw new BadRequestException('Versión no disponible para nuevas aplicaciones.');
  return this.db.$transaction(async tx=>{const d=await tx.diagnostic.create({data:{...dto,businessCode:dto.businessCode.toUpperCase(),consentText:fullConsent(),answers:{},applicatorId:u.id}});await tx.auditLog.create({data:{actorId:u.id,diagnosticId:d.id,action:'CREATE',after:JSON.parse(JSON.stringify(d)) as Prisma.InputJsonValue}});return d;});
 }
 async update(id:string,dto:UpdateDiagnosticDto,u:Actor){
  const old=await this.get(id,u);const schema=old.instrument.definition as unknown as Instrument;
  const errors=validateAnswers(schema,dto.answers);if(errors.length)throw new BadRequestException(errors);
  if(old.status==='COMPLETE'&&(u.role!=='ADMIN'||!dto.reason?.trim()))throw new ForbiddenException('La corrección de una aplicación finalizada requiere administrador y motivo.');
  const normalized=normalizeAnswers(schema,dto.answers as Answers);
  return this.db.$transaction(async tx=>{
   const changed=await tx.diagnostic.updateMany({where:{id,revision:dto.revision,status:old.status},data:{answers:normalized as Prisma.InputJsonValue,notes:dto.notes??old.notes,revision:{increment:1}}});
   if(!changed.count)throw new ConflictException('Otra sesión modificó esta aplicación. Recargue antes de guardar.');
   const result=await tx.diagnostic.findUniqueOrThrow({where:{id}});
   await tx.auditLog.create({data:{actorId:u.id,diagnosticId:id,action:old.status==='COMPLETE'?'CORRECT':'SAVE_DRAFT',before:{answers:old.answers,notes:old.notes,revision:old.revision},after:{answers:result.answers,notes:result.notes,revision:result.revision},reason:dto.reason}});return result;
  });
 }
 async complete(id:string,revision:number,u:Actor){
  const old=await this.get(id,u);if(old.status!=='DRAFT')throw new BadRequestException('La aplicación ya está finalizada.');
  if(!old.consent)throw new BadRequestException('Se requiere participación voluntaria.');
  const answers=old.answers as unknown as Answers;
  if(!Object.entries(answers).some(([k,v])=>!k.endsWith('_other')&&(typeof v==='string'?v.trim():Object.keys(v).length)))throw new BadRequestException('Registre alguna respuesta antes de finalizar.');
  return this.db.$transaction(async tx=>{const changed=await tx.diagnostic.updateMany({where:{id,revision,status:'DRAFT'},data:{status:'COMPLETE',completedAt:new Date(),revision:{increment:1}}});if(!changed.count)throw new ConflictException('La aplicación cambió. Recargue.');const result=await tx.diagnostic.findUniqueOrThrow({where:{id}});await tx.auditLog.create({data:{actorId:u.id,diagnosticId:id,action:'COMPLETE',after:{status:'COMPLETE',revision:result.revision}}});return result;});
 }
 async audits(id:string,u:Actor){await this.get(id,u);return this.db.auditLog.findMany({where:{diagnosticId:id},include:{actor:{select:{name:true}}},orderBy:{createdAt:'desc'}});}
}
