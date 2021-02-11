import { Message } from 'discord.js'

type CTSArgument = {
  required?: boolean
  converter?: (msg: Message, arg: string) => any
  rest?: boolean
}

export default CTSArgument
