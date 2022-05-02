import { MailsService } from '@/mails/mails.service'
import { PrismaService } from '@/prisma.service'
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { compare, hash } from 'bcrypt'
import { AuthCredentialsDto } from './dto/auth-credentials.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailsService: MailsService
  ) {}

  createAuthenticationToken(user: User) {
    const payload = { id: user.id }
    const token = this.jwtService.sign(payload)
    return token
  }

  private createResetPasswordToken(user: User) {
    const payload = { email: user.email }
    const token = this.jwtService.sign(payload)
    return token
  }

  private decodeResetPasswordToken(token: string) {
    const payload = this.jwtService.decode(token)
    return payload
  }

  async signIn(authCredentialsDto: AuthCredentialsDto) {
    const { email, password } = authCredentialsDto

    const user = await this.prisma.user.findFirst({ where: { email } })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordMatching = await compare(password, user.password)

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const token = this.createAuthenticationToken(user)

    return { message: 'Successfully signed in', token }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: forgotPasswordDto.email },
    })

    if (!user) {
      return
    }

    const token = this.createResetPasswordToken(user)

    await this.mailsService.sendResetPasswordMail({
      email: user.email,
      token,
      name: `${user.firstName} ${user.lastName}`,
    })

    return { message: 'Successfully sent reset password email' }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const payload = this.decodeResetPasswordToken(token)

    if (!payload || typeof payload === 'string' || !payload.email) {
      throw new BadRequestException('Invalid token')
    }

    await this.prisma.user.update({
      where: { email: payload.email },
      data: { password: await hash(resetPasswordDto.password, 10) },
    })

    return { message: 'Successfully reset password' }
  }
}
