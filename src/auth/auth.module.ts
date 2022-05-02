import { MailsModule } from '@/mails/mails.module'
import { MailsService } from '@/mails/mails.service'
import { PrismaService } from '@/prisma.service'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '365d' },
      }),
      inject: [ConfigService],
    }),
    MailsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, MailsService],
  exports: [AuthService],
})
export class AuthModule {}
