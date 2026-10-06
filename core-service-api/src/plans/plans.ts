import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsBoolean, IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { StudyPhase } from '@prisma/client';
import { Admin } from '../auth/auth';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQuery } from '../reports/reports';
class PlanDto {
 @IsString() @Matches(/^G(?:[1-9]|1[0-3])$/) topicCode!:string;
 @IsEnum(StudyPhase) phase!:StudyPhase;
 @IsString() @MinLength(1) instrumentVersion!:string;
 @IsString() @MaxLength(4000) finding!:string;
 @IsString() @MaxLength(2000) objective!:string;
 @IsString() @MaxLength(2000) activity!:string;
 @IsString() @MaxLength(2000) expectedProduct!:string;
 @IsString() @MaxLength(500) responsible!:string;
 @IsString() @MaxLength(2000) resources!:string;
 @IsString() @MaxLength(40) scheduledDate!:string;
 @IsString() @MaxLength(2000) indicator!:string;
 @IsString() @MaxLength(1000) baseline!:string;
 @IsString() @MaxLength(1000) target!:string;
 @IsString() @MaxLength(2000) verification!:string;
 @IsBoolean() agreed!:boolean;
}
@Admin() @Controller('plans')
export class PlansController{
 constructor(private db:PrismaService){}
 @Get() list(@Query()q:ReportQuery){return this.db.intervention.findMany({where:{phase:q.phase,instrumentVersion:q.version},orderBy:{createdAt:'asc'}});}
 @Post() create(@Body()dto:PlanDto){return this.db.intervention.create({data:dto});}
 @Patch(':id') update(@Param('id')id:string,@Body()dto:PlanDto){return this.db.intervention.update({where:{id},data:dto});}
}
