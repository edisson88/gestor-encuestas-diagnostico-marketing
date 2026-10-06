import { Body, CanActivate, Controller, ExecutionContext, Injectable, Post, Get, UnauthorizedException, SetMetadata, createParamDecorator, ForbiddenException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { checkPassword } from './password';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
export type Actor={id:string;email:string;name:string;role:'ADMIN'|'APPLICATOR'};
export const Public=()=>SetMetadata('public',true);
export const Admin=()=>SetMetadata('admin',true);
export const CurrentUser=createParamDecorator((_data,ctx:ExecutionContext)=>ctx.switchToHttp().getRequest().user as Actor);
export class LoginDto { @IsEmail() @MaxLength(200) email!:string; @IsString() @MinLength(1) @MaxLength(200) password!:string; }
@Injectable()
export class AuthGuard implements CanActivate {
 constructor(private reflector:Reflector,private jwt:JwtService,private db:PrismaService){}
 async canActivate(ctx:ExecutionContext){
  if(this.reflector.getAllAndOverride('public',[ctx.getHandler(),ctx.getClass()]))return true;
  const req=ctx.switchToHttp().getRequest();const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if(!token)throw new UnauthorizedException('Inicie sesión.');
  let sub:string;try{sub=(await this.jwt.verifyAsync(token)).sub;}catch{throw new UnauthorizedException('La sesión venció. Inicie sesión nuevamente.');}
  if(typeof sub!=='string')throw new UnauthorizedException();
  const user=await this.db.user.findUnique({where:{id:sub}});if(!user?.active)throw new UnauthorizedException();
  req.user={id:user.id,email:user.email,name:user.name,role:user.role};
  if(this.reflector.getAllAndOverride('admin',[ctx.getHandler(),ctx.getClass()])&&user.role!=='ADMIN')throw new ForbiddenException('Acceso del administrador requerido.');
  return true;
 }
}
@Controller('auth')
export class AuthController {
 constructor(private db:PrismaService,private jwt:JwtService){}
 @Public() @Throttle({default:{limit:10,ttl:60000}}) @Post('login') async login(@Body()dto:LoginDto){
  const u=await this.db.user.findUnique({where:{email:dto.email.toLowerCase().trim()}});
  if(!u?.active||!checkPassword(dto.password,u.passwordHash))throw new UnauthorizedException('Correo o contraseña incorrectos.');
  return {token:await this.jwt.signAsync({sub:u.id}),user:{id:u.id,name:u.name,email:u.email,role:u.role}};
 }
 @Get('me') me(@CurrentUser()u:Actor){return u;}
}
