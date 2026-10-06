import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { Admin } from '../auth/auth';
import { hashPassword } from '../auth/password';
import { PrismaService } from '../prisma/prisma.service';
class CreateUserDto { @IsEmail() @MaxLength(200) email!:string; @IsString() @MinLength(2) @MaxLength(100) name!:string; @IsString() @MinLength(12) @MaxLength(200) password!:string; @IsEnum(Role) role!:Role; }
@Admin() @Controller('users')
export class UsersController {
 constructor(private db:PrismaService){}
 @Get() list(){return this.db.user.findMany({select:{id:true,email:true,name:true,role:true,active:true},orderBy:{name:'asc'}});}
 @Post() create(@Body()dto:CreateUserDto){return this.db.user.create({data:{email:dto.email.toLowerCase().trim(),name:dto.name,role:dto.role,passwordHash:hashPassword(dto.password)},select:{id:true,email:true,name:true,role:true,active:true}});}
}
