import {Command, CTSClient, CTSContext} from "../dist";
import Module from "../dist/structures/Module";

class TestExtension extends Module {
    @Command({name: 'cmd1'})
    test(ctx: CTSContext) {
        ctx.send('CMD1')
    }

    @Command({
        name: 'cmd2', aliases: ['test'], args: [
            {
                required: true
            }
        ],
        subcommands: [{
            name: 'test',
            execute: (ctx: CTSContext) => ctx.reply('asdf'),
        }],
        useSubCommand: true
    })
    test2(ctx: CTSContext, arg1: string) {
        ctx.reply(arg1)
    }
}

const client = new CTSClient({
    prefix: '!'
})

client.registerModule(new TestExtension())

client.login(process.env.TOKEN)
