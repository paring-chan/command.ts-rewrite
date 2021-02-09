import {PermissionResolvable} from "discord.js";

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
}

export default CTSCommand