import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length } from 'class-validator'

export class ResetPasswordDto {
  @IsString()
  @Length(8, 255)
  @ApiProperty({ example: 'La blanquette est bonne.' })
  password: string
}
