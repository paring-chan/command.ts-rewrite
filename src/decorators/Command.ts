import CTSCommand from "../types/CTSCommand";
import {PermissionResolvable} from "discord.js";
import Module from "../structures/Module";

export type CommandOptions = {
    name: string
    aliases?: string[]
    subcommands?: CTSCommand[]
    useSubCommand?: boolean
    ownerOnly?: boolean
    userPermissions?: PermissionResolvable
    clientPermissions?: PermissionResolvable
}

export function Command(opts: CommandOptions): any {
    return async (target: any, key: string, descriptor: PropertyDescriptor) => {
        console.log(target)
        if (!(target instanceof Module)) throw new Error('Command decorator must be used in `Module` class.')
        if (!opts) opts = {name: key}
        const {name, userPermissions, ownerOnly, clientPermissions, subcommands, useSubCommand, aliases} = opts
        const cmd: CTSCommand = {
            name,
            aliases: aliases || [],
            subcommands: subcommands || [],
            useSubCommand: useSubCommand || false,
            ownerOnly: ownerOnly || false,
            userPermissions: userPermissions || [],
            clientPermissions: clientPermissions || [],
            execute: descriptor.value
        }
    }
}

