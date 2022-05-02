import { AuthCredentialsDto } from '@/auth/dto/auth-credentials.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length } from 'class-validator'

export class CreateUserDto extends AuthCredentialsDto {
  @IsString()
  @Length(1, 255)
  @ApiProperty({ example: 'John' })
  firstName: string

  @IsString()
  @Length(1, 255)
  @ApiProperty({ example: 'Doe' })
  lastName: string
}
