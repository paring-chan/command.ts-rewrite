import { PermissionResolvable } from 'discord.js'
import CTSArgument from './CTSArgument'

type CTSCommand = {
  name: string
  aliases: string[]
  subcommands: CTSCommand[]
  useSubCommand: boolean
  ownerOnly: boolean
  userPermissions: PermissionResolvable
  clientPermissions: PermissionResolvable
  execute: Function
  guildOnly: boolean
  args: CTSArgument[]
}

export default CTSCommand
