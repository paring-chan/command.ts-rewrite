import Module from "../structures/Module";

export function Listener(event: string): any {
    return async (target: any, key: string, descriptor: PropertyDescriptor) => {
        if (!(target instanceof Module)) throw new Error('Command decorator must be used in `Module` class.')
        const c = target.constructor as typeof Module
        c.listeners.push({
            event,
            execute: descriptor.value
        })
    }
}

