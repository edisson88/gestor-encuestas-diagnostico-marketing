import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController, AuthGuard, Public } from './auth/auth';
import { InstrumentsController, InstrumentsService } from './instruments/instruments';
import { DiagnosticsController } from './diagnostics/diagnostics.controller';
import { DiagnosticsService } from './diagnostics/diagnostics.service';
import { ReportsController } from './reports/reports';
import { PlansController } from './plans/plans';
import { UsersController } from './users/users';
@Controller('health')
class HealthController { @Public() @Get() health(){return {status:'ok'};} }
@Module({imports:[PrismaModule,JwtModule.register({global:true,secret:process.env.JWT_SECRET,signOptions:{expiresIn:Number(process.env.JWT_TTL_SECONDS??14400)}}),ThrottlerModule.forRoot([{ttl:60000,limit:120}])],controllers:[HealthController,AuthController,InstrumentsController,DiagnosticsController,ReportsController,PlansController,UsersController],providers:[InstrumentsService,DiagnosticsService,{provide:APP_GUARD,useClass:ThrottlerGuard},{provide:APP_GUARD,useClass:AuthGuard}]})
export class AppModule {}
