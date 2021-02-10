import {Command, CTSClient} from "../dist";
import Module from "../dist/structures/Module";

class TestExtension extends Module {
    @Command({name: 'cmd1'})
    test() {
    }
    @Command({name: 'cmd2', aliases: ['test']})
    test2() {
    }
}

const client = new CTSClient({
    prefix: '!'
})

client.login(process.env.TOKEN)
