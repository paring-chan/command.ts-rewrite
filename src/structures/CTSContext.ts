import {
    Message,
    User
} from "discord.js";
import {CTSClient} from "..";
import CTSCommand from "../types/CTSCommand";

class CTSContext {
    message: Message
    client: CTSClient
    author: User
    cmd: CTSCommand
    get member() {
        return this.message.member
    }

    get send() {
        return this.message.channel.send.bind(this.message.channel)
    }

    get reply() {
        return this.message.reply.bind(this.message)
    }


    constructor(msg: Message, command: CTSCommand) {
        this.message = msg
        this.client = msg.client as CTSClient
        this.cmd = command
        this.author = msg.author
    }
}

export default CTSContext
