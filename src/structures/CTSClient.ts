import {Client, ClientEvents} from 'discord.js'

export default class CTSClient extends Client {
    constructor() {
        super()
    }

    private _handle<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K][]) {
    }

    emit<K extends keyof ClientEvents>(event: K, ...args): boolean {
        this._handle(event, ...args)
        return super.emit(event, ...args);
    }
}