type CTSListener = {
  event: string
  execute: (...args: any[]) => any
  id: string
}

export default CTSListener
