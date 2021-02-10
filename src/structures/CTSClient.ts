import {Client, ClientEvents, ClientOptions, Message} from 'discord.js'
import CTSOptions from "../types/CTSOptions";
import Module from "./Module";
import CTSRegistry from "../utils/CTSRegistry";
import CTSCommand from "../types/CTSCommand";

export default class CTSClient extends Client {
    opts: CTSOptions
    registry: CTSRegistry

    constructor(ctsOpts: CTSOptions, clientOptions?: ClientOptions) {
        super(clientOptions)
        this.opts = ctsOpts
        this.registry = new CTSRegistry()
    }

    private _handle<K extends keyof ClientEvents>(event: K, ...args: any[]) {
        if (event === 'message') return this._handleMsg(args[0])
    }

    private _handleMsg(msg: Message) {
        if (msg.author.bot) return
        const prefix = this.opts.prefix
        if (!msg.content.startsWith(prefix)) return
        const args = msg.content.slice(prefix.length).split(/ +/)
        const command = args.shift()
        if (!command) return
        const modules = this.registry.modules.map(r => (r.constructor as typeof Module))
        const commandFilter = (r: CTSCommand) => r.name.toLowerCase() === command.toLowerCase() || r.aliases.map(r=>r.toLowerCase()).includes(command)
        const module = modules.find(r=>r.commands.find(commandFilter))
        if (!module) return this.emit('commandNotFound', msg, command)
        const cmd = module.commands.find(commandFilter)
        if (!cmd) return this.emit('commandNotFound', msg, command)
    }

    loadExtension() {
    }

    registerModule(extension: Module) {
        this.registry.modules.push(extension)
    }

    emit(event: string, ...args: any[]): boolean {
        this._handle(event as keyof ClientEvents, ...args)
        return super.emit(event, ...args);
    }
}