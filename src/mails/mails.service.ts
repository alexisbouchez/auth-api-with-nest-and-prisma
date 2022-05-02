import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as sendgrid from '@sendgrid/mail'
import { SendResetPasswordMailProps } from './send-reset-password-mail-props.type'
import { readFile } from 'fs/promises'
import { compile } from 'handlebars'

@Injectable()
export class MailsService {
  private baseUrl: string
  private from: string

  constructor(private configService: ConfigService) {
    sendgrid.setApiKey(this.configService.get('SENDGRID_API_KEY'))

    this.baseUrl = this.configService.get('FRONTEND_BASE_URL')
    this.from = this.configService.get('EMAIL_ADDRESS')
  }

  private sendMail(mail: sendgrid.MailDataRequired) {
    return sendgrid.send(mail)
  }

  private async getHtmlFromTemplate(
    templatePath: string,
    data: Record<string, any>
  ) {
    const templateFile = await readFile(
      `src/mails/templates/${templatePath}.hbs`,
      'utf8'
    )

    const template = compile(templateFile)

    return template(data)
  }

  async sendResetPasswordMail(props: SendResetPasswordMailProps) {
    props.url = `${this.baseUrl}/auth/reset-password/${props.token}`

    const html = await this.getHtmlFromTemplate('reset-password', props)

    this.sendMail({
      from: this.from,
      to: props.email,
      subject: 'Reset your password',
      html,
    })
  }
}
