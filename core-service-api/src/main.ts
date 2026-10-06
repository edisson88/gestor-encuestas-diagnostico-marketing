import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, ValidationPipe } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import helmet from 'helmet';
import { AppModule } from './app.module';
@Catch()
class ErrorsFilter implements ExceptionFilter {
 catch(error:unknown,host:ArgumentsHost){
  const res=host.switchToHttp().getResponse();
  if(error instanceof HttpException)return res.status(error.getStatus()).json(error.getResponse());
  if(error instanceof Prisma.PrismaClientKnownRequestError){
   if(error.code==='P2002')return res.status(409).json({message:'Ya existe un registro con ese código, fase y versión, o ese correo.'});
   if(error.code==='P2025')return res.status(404).json({message:'Registro no encontrado.'});
  }
  console.error('Error interno de la API',error instanceof Prisma.PrismaClientKnownRequestError?error.code:error instanceof Error?error.name:'unknown');res.status(500).json({message:'Error interno. Revise la conexión y los registros del servidor.'});
 }
}
async function main(){
 if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32||process.env.JWT_SECRET.startsWith('REPLACE_'))throw new Error('Configure un JWT_SECRET aleatorio de al menos 32 caracteres.');
 if(!process.env.DATABASE_URL||!process.env.DIRECT_URL)throw new Error('Configure DATABASE_URL y DIRECT_URL.');
 const app=await NestFactory.create(AppModule);app.setGlobalPrefix('api');app.use(helmet());
 app.enableCors({origin:(process.env.FRONTEND_URL??'http://localhost:5173').split(',').map(x=>x.trim()),methods:['GET','POST','PATCH'],allowedHeaders:['Content-Type','Authorization']});
 app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));app.useGlobalFilters(new ErrorsFilter());app.enableShutdownHooks();
 await app.listen(Number(process.env.PORT??3000),'0.0.0.0');
}
main().catch(e=>{console.error(e.message);process.exit(1);});
