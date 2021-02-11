import CTSCommand from '../types/CTSCommand'
import { PermissionResolvable, Util } from 'discord.js'
import Module from '../structures/Module'
import CTSArgument from '../types/CTSArgument'
import _ from 'lodash'

export type CommandOptions = {
  name: string
  aliases?: string[]
  subcommands?: SubCommandOptions[]
  useSubCommand?: boolean
  ownerOnly?: boolean
  userPermissions?: PermissionResolvable
  clientPermissions?: PermissionResolvable
  guildOnly?: boolean
  args?: CTSArgument[]
  execute?: Function
}

export type SubCommandOptions = {
  execute: Function
} & CommandOptions

function getSubCommands(commands: CommandOptions[]): CTSCommand[] {
  const result: CTSCommand[] = []
  commands = commands.map(
    (r) =>
      Util.mergeDefault(
        {
          aliases: [],
          subcommands: [],
          useSubCommand: false,
          ownerOnly: false,
          userPermissions: [],
          clientPermissions: [],
          guildOnly: false,
          args: [],
        },
        r,
      ) as any,
  )
  for (const command of commands) {
    if (command.subcommands?.length) {
      command.subcommands = command.subcommands.map(
        (r) =>
          Util.mergeDefault(
            {
              aliases: [],
              subcommands: [],
              useSubCommand: false,
              ownerOnly: false,
              userPermissions: [],
              clientPermissions: [],
              guildOnly: false,
              args: [],
            },
            r,
          ) as any,
      )
    }
    result.push(command as CTSCommand)
  }
  return result
}

export function Command(opts: CommandOptions): any {
  return async (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!(target instanceof Module))
      throw new Error('Command decorator must be used in `Module` class.')
    const c = target.constructor as typeof Module
    if (!opts) opts = { name: key }
    const {
      name,
      userPermissions,
      ownerOnly,
      clientPermissions,
      subcommands,
      useSubCommand,
      aliases,
      guildOnly,
    } = opts
    const sub = getSubCommands(subcommands || [])
    const cmd: CTSCommand = {
      name,
      aliases: aliases || [],
      subcommands: sub || [],
      useSubCommand: !!useSubCommand,
      ownerOnly: !!ownerOnly,
      userPermissions: userPermissions || [],
      clientPermissions: clientPermissions || [],
      execute: descriptor.value,
      guildOnly: !!guildOnly,
      args: opts.args || [],
    }
    if (c.commands.find((r) => r.name === opts.name)) {
      _.remove(c.commands, (r) => r.name === opts.name)
    }
    c.commands.push(cmd)
  }
}
