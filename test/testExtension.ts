/* eslint-disable */
import { Command, CTSContext, Listener } from '../dist'
import Module from '../dist/structures/Module'

export default class TestExtension extends Module {
  @Command({ name: 'cmd1' })
  test(ctx: CTSContext) {
    ctx.send('CMD1')
  }

  @Command({
    name: 'cmd2',
    aliases: ['test'],
    args: [
      {
        required: true,
      },
    ],
  })
  test2(ctx: CTSContext, arg1: string) {
    ctx.reply('test')
  }

  @Listener('ready1', 'ready')
  ready() {
    console.log('ready!')
  }
}
