import { CTSClient } from '../src'

const client = new CTSClient({
  prefix: '!',
})

client.loadExtension(require.resolve('./testExtension'), true)

client.login(process.env.TOKEN)
