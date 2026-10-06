import { Controller, Get, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export const CONSENT='Queremos conocer cómo promociona su emprendimiento, qué herramientas utiliza y en qué necesita apoyo. Las respuestas ayudarán a construir un plan de intervención. No es un examen. La participación es voluntaria: puede omitir preguntas o finalizar cuando lo desee sin afectar su relación con la asociación ni el acceso a actividades de apoyo. Los resultados podrán utilizarse en informes y productos académicos de manera agrupada, sin identificar personas ni negocios. No se publicarán respuestas individuales identificables.';
export function studyInfo(){const fields={institution:process.env.STUDY_INSTITUTION,responsible:process.env.STUDY_RESPONSIBLE,contact:process.env.STUDY_CONTACT,dataAccess:process.env.STUDY_DATA_ACCESS,custody:process.env.STUDY_CUSTODY,retention:process.env.STUDY_RETENTION};return {...fields,ready:Object.values(fields).every(x=>x?.trim()),consent:CONSENT};}
export function requireStudy(){if(!studyInfo().ready)throw new ServiceUnavailableException('Complete las variables STUDY_* antes de recoger respuestas.');}
export function fullConsent(){const s=studyInfo();return `${CONSENT}\nInstitución: ${s.institution}\nResponsable: ${s.responsible}\nContacto: ${s.contact}\nAcceso: ${s.dataAccess}\nCustodia: ${s.custody}\nConservación: ${s.retention}`;}
@Injectable()
export class InstrumentsService{
 constructor(private db:PrismaService){}
 async active(){const row=await this.db.instrumentVersion.findFirst({where:{active:true},orderBy:{createdAt:'desc'}});if(!row)throw new ServiceUnavailableException('Ejecute db:seed para cargar el instrumento.');return row;}
}
@Controller('instruments')
export class InstrumentsController {
 constructor(private service:InstrumentsService,private db:PrismaService){}
 @Get('active') active(){return this.service.active();}
 @Get() list(){return this.db.instrumentVersion.findMany({orderBy:{createdAt:'desc'}});}
 @Get('study') study(){return studyInfo();}
}
