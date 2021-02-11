import { PermissionResolvable } from 'discord.js'
import CTSArgument from './CTSArgument'
import {CTSContext} from "../structures";

type CTSCommand = {
  name: string
  aliases: string[]
  subcommands: CTSCommand[]
  useSubCommand: boolean
  ownerOnly: boolean
  userPermissions: PermissionResolvable
  clientPermissions: PermissionResolvable
  execute: (ctx: CTSContext, ...args: any[]) => any
  guildOnly: boolean
  args: CTSArgument[]
}

export default CTSCommand
