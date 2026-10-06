import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Actor, CurrentUser } from '../auth/auth';
import { DiagnosticsService } from './diagnostics.service';
import { CompleteDiagnosticDto, CreateDiagnosticDto, UpdateDiagnosticDto } from './dto';
@Controller('diagnostics')
export class DiagnosticsController{
 constructor(private service:DiagnosticsService){}
 @Get() list(@CurrentUser()u:Actor){return this.service.list(u);}
 @Post() create(@Body()d:CreateDiagnosticDto,@CurrentUser()u:Actor){return this.service.create(d,u);}
 @Get(':id') get(@Param('id')id:string,@CurrentUser()u:Actor){return this.service.get(id,u);}
 @Patch(':id') update(@Param('id')id:string,@Body()d:UpdateDiagnosticDto,@CurrentUser()u:Actor){return this.service.update(id,d,u);}
 @Post(':id/complete') complete(@Param('id')id:string,@Body()d:CompleteDiagnosticDto,@CurrentUser()u:Actor){return this.service.complete(id,d.revision,u);}
 @Get(':id/audit') audit(@Param('id')id:string,@CurrentUser()u:Actor){return this.service.audits(id,u);}
}
