import { CurrentUser } from '@/auth/current-user.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  getProfile(@CurrentUser() currentUser: User) {
    return { profile: currentUser }
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  update(
    @CurrentUser() currentUser: User,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(currentUser, updateUserDto)
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  delete(@CurrentUser() currentUser: User) {
    return this.usersService.delete(currentUser)
  }
}
