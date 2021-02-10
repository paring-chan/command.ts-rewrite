import CTSCommand from "../types/CTSCommand";
import {CTSClient} from "./index";

interface Module {
    client: CTSClient
}

class Module {
    static commands: CTSCommand[] = []
}

export default Module
