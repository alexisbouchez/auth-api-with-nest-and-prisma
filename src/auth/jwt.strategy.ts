import { PrismaService } from '@/prisma.service'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  async validate(payload: any) {
    const { id } = payload

    if (!id || typeof id !== 'number') {
      throw new UnauthorizedException('Invalid token')
    }

    const user = await this.prisma.user.findFirst({ where: { id } })

    if (!user) {
      throw new UnauthorizedException('Invalid token')
    }

    return user
  }
}
