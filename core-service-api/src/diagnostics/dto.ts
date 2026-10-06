import { Equals, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { StudyPhase } from '@prisma/client';
export class CreateDiagnosticDto {
 @IsString() @Matches(/^[A-Za-z0-9_-]{2,40}$/) businessCode!:string;
 @IsString() @MinLength(1) @MaxLength(100) instrumentId!:string;
 @IsEnum(StudyPhase) phase!:StudyPhase;
 @IsBoolean() @Equals(true) consent!:boolean;
}
export class UpdateDiagnosticDto {
 @IsInt() @Min(1) revision!:number;
 @IsObject() answers!:Record<string,unknown>;
 @IsOptional() @IsString() @MaxLength(4000) notes?:string;
 @IsOptional() @IsString() @MaxLength(1000) reason?:string;
}
export class CompleteDiagnosticDto { @IsInt() @Min(1) revision!:number; }
