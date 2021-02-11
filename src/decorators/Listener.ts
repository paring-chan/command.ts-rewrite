import Module from '../structures/Module'
import _ from 'lodash'

export function Listener(id: string, event: string): any {
  return async (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!(target instanceof Module))
      throw new Error('Command decorator must be used in `Module` class.')
    const c = target.constructor as typeof Module
    if (c.listeners.find((r) => r.id === id)) {
      _.remove(c.listeners, (r) => r.id === id)
    }
    c.listeners.push({
      event,
      execute: descriptor.value,
      id,
    })
  }
}
