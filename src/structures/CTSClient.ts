import {Client, ClientEvents, ClientOptions, Message} from 'discord.js'
import CTSOptions from "../types/CTSOptions";

export default class CTSClient extends Client {
    opts: CTSOptions

    constructor(ctsOpts: CTSOptions, clientOptions?: ClientOptions) {
        super(clientOptions)
        this.opts = ctsOpts
    }

    private _handle<K extends keyof ClientEvents>(event: K, ...args: any[]) {
        if (event === 'message') return this._handleMsg(args[0])
    }

    private _handleMsg(msg: Message) {
        if (msg.author.bot) return
        const prefix = this.opts.prefix

    }

    emit(event: string, ...args: any[]): boolean {
        this._handle(event as keyof ClientEvents, ...args)
        return super.emit(event, ...args);
    }
}