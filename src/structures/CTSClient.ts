import {
  Client,
  ClientEvents,
  ClientOptions,
  Collection,
  Message,
} from 'discord.js'
import CTSOptions from '../types/CTSOptions'
import Module from './Module'
import CTSRegistry from '../utils/CTSRegistry'
import CTSCommand from '../types/CTSCommand'
import CTSArgument from '../types/CTSArgument'
import { CTSContext } from './index'
import _ from 'lodash'
import chokidar from 'chokidar'

export default class CTSClient extends Client {
  opts: CTSOptions
  registry: CTSRegistry
  owners: string[] = []
  watchers: Collection<string, chokidar.FSWatcher> = new Collection()

  constructor(ctsOpts: CTSOptions, clientOptions?: ClientOptions) {
    super(clientOptions!)
    this.opts = ctsOpts
    this.registry = new CTSRegistry()
  }

  private _handle<K extends keyof ClientEvents>(event: K, ...args: any[]) {
    if (event === 'message') this._handleMsg(args[0])
    const modules = this.registry.modules
    for (const module of modules) {
      const cl = module.constructor as typeof Module
      const listeners = cl.listeners.filter((r) => r.event === event)
      for (const listener of listeners) {
        listener.execute.apply(module, args)
      }
    }
  }

  private async _parseArgs(
    args: string[],
    types: CTSArgument[],
    msg: Message,
  ): Promise<any[] | false> {
    const res: any[] = []
    for (const i in types) {
      const type = types[i]
      const current =
        type.rest && ((i as unknown) as number) === types.length - 1
          ? args.join(' ')
          : args.shift() || ''
      if (type.required) {
        if (!current) {
          this.emit('argRequired')
          return false
        }
      }
      let t
      if (type.converter) {
        try {
          t = await type.converter(msg, current)
        } catch (e) {
          this.emit('argParseError', e)
          return false
        }
      } else {
        t = current
      }
      res.push(t)
    }
    return res
  }

  private async _executeCommand(
    cmd: CTSCommand,
    args: string[],
    msg: Message,
    module: Module,
  ): Promise<any> {
    if (cmd.guildOnly && !msg.guild) return this.emit('guildOnly', msg, cmd)
    if (cmd.ownerOnly && !this.owners.includes(msg.author.id))
      return this.emit('guildOnly', msg, cmd)
    if (args.length) {
      if (cmd.useSubCommand) {
        const arg = args.shift()
        if (!arg) {
          const ctx = new CTSContext(msg, cmd)
          return cmd.execute.apply(module, [ctx])
        }
        const sub = cmd.subcommands.find((r) => r.name === arg)
        if (!sub) {
          args.unshift(arg)
          const a = await this._parseArgs(args, cmd.args, msg)
          const ctx = new CTSContext(msg, cmd)
          if (a === false) {
            return
          }
          return cmd.execute.apply(module, [ctx, ...a])
        }
        return this._executeCommand(sub, args, msg, module)
      }
    }
    const a = await this._parseArgs(args, cmd.args, msg)
    const ctx = new CTSContext(msg, cmd)
    if (a === false) {
      return
    }
    return cmd.execute.apply(module, [ctx, ...a])
  }

  private async _handleMsg(msg: Message) {
    if (msg.author.bot) return
    const prefix = this.opts.prefix
    if (!msg.content.startsWith(prefix)) return
    const args = msg.content.slice(prefix.length).split(/ +/)
    const command = args.shift()
    if (!command) return
    const modules = this.registry.modules.map((r) => r)
    const commandFilter = (r: CTSCommand) =>
      r.name.toLowerCase() === command.toLowerCase() ||
      r.aliases.map((r) => r.toLowerCase()).includes(command)
    const module = modules.find((r) =>
      (r.constructor as typeof Module).commands.find(commandFilter),
    )
    if (!module) return this.emit('commandNotFound', msg, command)
    const cmd = (module.constructor as typeof Module).commands.find(
      commandFilter,
    )
    if (!cmd) return this.emit('commandNotFound', msg, command)
    await this._executeCommand(cmd, args, msg, module)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  loadExtension(path: string, watch = false) {
    let mod
    try {
      delete require.cache[require.resolve(path)]
      mod = require(path)
    } catch {
      throw new Error('Module not found.')
    }
    if (!mod.default) {
      throw new Error('Default export not found.')
    }
    if (!(mod.default.prototype instanceof Module)) {
      throw new Error('Default export must extend `Module` class.')
    }
    const ext = new mod.default() as Module

    ext.__path = require.resolve(path)
    this.registerModule(ext)
    if (watch) {
      if (this.watchers.get(ext.__path)) return
      this.watchers.set(
        ext.__path,
        chokidar.watch(ext.__path).on('change', () => {
          const extension = this.registry.modules.find(
            (r) => r.__path === ext.__path,
          )
          if (extension) {
            this.unregisterModule(extension)
            this.loadExtension(extension.__path!, true)
            console.info(
              `[COMMAND.TS] Reloaded extension ${extension.constructor.name}.`,
            )
          } else {
            this.watchers.get(ext.__path!)?.unwatch(ext.__path!)
            this.watchers.delete(ext.__path!)
          }
        }),
      )
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  unregisterModule(extension: Module) {
    if (extension.__path) {
      try {
        delete require.cache[require.resolve(extension.__path)]
      } catch (e) {
        console.error(e)
      }
    }
    _.remove(this.registry.modules, (r) => r === extension)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  registerModule(extension: Module) {
    extension.client = this
    this.registry.modules.push(extension)
  }

  emit(event: string, ...args: any[]): boolean {
    this._handle(event as keyof ClientEvents, ...args)
    return super.emit(event, ...args)
  }
}
