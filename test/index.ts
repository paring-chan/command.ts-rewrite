import {Command} from "../dist";
import Module from "../dist/structures/Module";

class TestExtension extends Module {
    @Command({name: 'cmd1'})
    test() {
    }
    @Command({name: 'cmd2', aliases: ['test']})
    test2() {
    }
}

console.log(TestExtension.commands)
