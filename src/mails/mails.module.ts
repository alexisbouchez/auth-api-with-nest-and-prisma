import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailsService } from './mails.service'

@Module({
  providers: [ConfigService, MailsService],
})
export class MailsModule {}
