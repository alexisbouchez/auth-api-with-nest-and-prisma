import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Length } from 'class-validator'

export class AuthCredentialsDto {
  @IsString()
  @IsEmail()
  @ApiProperty({ example: 'john.doe@gmail.com' })
  email: string

  @IsString()
  @Length(8, 255)
  @ApiProperty({ example: 'La blanquette est bonne.' })
  password: string
}
