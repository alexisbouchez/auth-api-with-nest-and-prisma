import { createParamDecorator } from '@nestjs/common'

export const CurrentUser = createParamDecorator((_, req) => {
  const user = req.args[0].user
  user.password = undefined
  return user
})
