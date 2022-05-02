import { PrismaService } from '@/prisma.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'
import { hash } from 'bcrypt'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

describe('AuthService', () => {
  let service: AuthService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: { expiresIn: '365d' },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [AuthService, PrismaService, JwtStrategy],
    }).compile()

    prisma = module.get<PrismaService>(PrismaService)
    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  test('createAuthenticationToken returns a token', () => {
    const user = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      password: 'La blanquette est bonne.',
    }

    const result = service.createAuthenticationToken(user)

    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  describe('signIn', () => {
    it('should return an error with dummy credentials', async () => {
      let error: any

      try {
        await service.signIn({
          email: 'jean.valjean@gmail.com',
          password: 'Victor Hugo fut le premier à avoir inventé la blanquette.',
        })
      } catch (err) {
        error = err
      }

      expect(error).toBeDefined()
      expect(error).toHaveProperty('message')
      expect(error.message).toBe('Invalid credentials')
    })

    it('should return a token with correct credentials', async () => {
      prisma.user.findFirst = jest.fn().mockReturnValueOnce({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com',
        password: await hash('La blanquette est bonne.', 10),
      })

      const result = await service.signIn({
        email: 'john.doe@gmail.com',
        password: 'La blanquette est bonne.',
      })

      expect(result).toBeDefined()
      expect(result).toHaveProperty('token')
      expect(typeof result.token).toBe('string')
    })
  })
})
