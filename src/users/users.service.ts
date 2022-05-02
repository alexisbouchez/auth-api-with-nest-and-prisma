import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from '@prisma/client'
import { AuthService } from '@/auth/auth.service'
import { hash } from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await hash(createUserDto.password, 10)

      const user = await this.prisma.user.create({ data: createUserDto })

      const token = this.authService.createAuthenticationToken(user)

      return { message: 'Successfully created user', token }
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already in use')
      }

      throw new InternalServerErrorException('Error creating user')
    }
  }

  async update(currentUser: User, updateUserDto: UpdateUserDto) {
    try {
      await this.prisma.user.update({
        where: { id: currentUser.id },
        data: updateUserDto,
      })

      return { message: 'Successfully updated user' }
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already in use')
      }

      throw new InternalServerErrorException('Error updating user')
    }
  }

  async delete(currentUser: User) {
    try {
      await this.prisma.user.delete({ where: { id: currentUser.id } })

      return { message: 'Successfully deleted user' }
    } catch (error) {
      throw new InternalServerErrorException('Error deleting user')
    }
  }
}
