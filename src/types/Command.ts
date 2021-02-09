type Command = {
    name: string
    aliases: string
    execute: Function
    subcommands?: Command[]
    enableSubcommand?: boolean
}

export default Command