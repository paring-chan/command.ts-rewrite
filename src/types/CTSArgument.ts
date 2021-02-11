import { Message } from 'discord.js'

type CTSArgument = {
  required?: boolean
  converter?: (msg: Message, arg: string) => any
}

export default CTSArgument
