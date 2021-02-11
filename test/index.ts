import { CTSClient } from '../dist'
import Dokdo from 'dokdo'
import { Message } from 'discord.js'

const client = new CTSClient({
  prefix: '!',
})

client.loadExtension(require.resolve('./testExtension'), true)

client.login(process.env.TOKEN).then(() => {
  const dokdo = new Dokdo(client, {
    noPerm(message: Message): any {
      message.reply('missing permissions')
    },
    prefix: '!',
  })
  client.on('message', dokdo.run.bind(dokdo))
})
