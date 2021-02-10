import {Client, ClientEvents, ClientOptions, Message} from 'discord.js'
import CTSOptions from "../types/CTSOptions";
import Module from "./Module";
import CTSRegistry from "../utils/CTSRegistry";
import CTSCommand from "../types/CTSCommand";
import CTSArgument from "../types/CTSArgument";
import {CTSContext} from "./index";

export default class CTSClient extends Client {
    opts: CTSOptions
    registry: CTSRegistry
    owners: string[] = []

    constructor(ctsOpts: CTSOptions, clientOptions?: ClientOptions) {
        super(clientOptions)
        this.opts = ctsOpts
        this.registry = new CTSRegistry()
    }

    private _handle<K extends keyof ClientEvents>(event: K, ...args: any[]) {
        if (event === 'message') return this._handleMsg(args[0])
    }

    private async _parseArgs(args: string[], types: CTSArgument[], msg: Message): Promise<any[] | false> {
        let res: any[] = []
        for (const i in types) {
            const type = types[i]
            if (type.required) {
                if (!args[i]) {
                    this.emit('argRequired')
                    return false
                }
            }
            let t
            if (type.converter) {
                try {
                    t = await type.converter(msg, args[i])
                } catch (e) {
                    this.emit('argParseError', e)
                    return false
                }
            } else {
                t = args[i]
            }
            res.push(t)
        }
        return res
    }

    private async _executeCommand(cmd: CTSCommand, args: string[], msg: Message, module: Module): Promise<any> {
        if (cmd.guildOnly && !msg.guild) return this.emit('guildOnly', msg, cmd)
        if (cmd.ownerOnly) return this.emit('guildOnly', msg, cmd)
        if (args.length) {
            if (cmd.useSubCommand) {
                const arg = args.shift()
                if (!arg) {
                    const ctx = new CTSContext(msg, cmd)
                    return cmd.execute.apply(module, [ctx])
                }
                const sub = cmd.subcommands.find(r => r.name === arg)
                if (!sub) {
                    args.unshift(arg)
                    const a = await this._parseArgs(args, cmd.args, msg)
                    const ctx = new CTSContext(msg, cmd)
                    if (a === false) {
                        return
                    }
                    return cmd.execute.apply(module, [ctx, ...a])
                }
                return this._executeCommand(sub, args, msg, module)
            }
        }
        const a = await this._parseArgs(args, cmd.args, msg)
        const ctx = new CTSContext(msg, cmd)
        if (a === false) {
            return
        }
        return cmd.execute.apply(module, [ctx, ...a])
    }

    private async _handleMsg(msg: Message) {
        if (msg.author.bot) return
        const prefix = this.opts.prefix
        if (!msg.content.startsWith(prefix)) return
        const args = msg.content.slice(prefix.length).split(/ +/)
        const command = args.shift()
        if (!command) return
        const modules = this.registry.modules.map(r => r)
        const commandFilter = (r: CTSCommand) => r.name.toLowerCase() === command.toLowerCase() || r.aliases.map(r => r.toLowerCase()).includes(command)
        const module = modules.find(r => (r.constructor as typeof Module).commands.find(commandFilter))
        if (!module) return this.emit('commandNotFound', msg, command)
        const cmd = (module.constructor as typeof Module).commands.find(commandFilter)
        if (!cmd) return this.emit('commandNotFound', msg, command)
        await this._executeCommand(cmd, args, msg, module)
    }

    loadExtension(path: string) {
        let mod
        try {
            mod = require(path)
        } catch {
            throw new Error('Module not found.')
        }
        if (!mod.default) {
            throw new Error('Default export not found.')
        }
        if (!(mod.default.prototype instanceof Module)) {
            throw new Error('Default export must extend `Module` class.')
        }
        const ext = new mod.default()
    }

    registerModule(extension: Module) {
        extension.client = this
        this.registry.modules.push(extension)
    }

    emit(event: string, ...args: any[]): boolean {
        this._handle(event as keyof ClientEvents, ...args)
        return super.emit(event, ...args);
    }
}