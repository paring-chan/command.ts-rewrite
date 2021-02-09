import {Command} from "../dist";
import Module from "../dist/structures/Module";

class TestExtension extends Module {
    @Command({name: 'test'})
    test() {
    }
}
