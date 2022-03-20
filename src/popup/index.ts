import { defineComponent, createApp, ref, onMounted, h, reactive } from 'vue'

const port = chrome.runtime.connect()
const renderMessage = ({ timestamp, message }: SampleDB) => h('li', [
  h('time', `${Date.now() - timestamp.valueOf()} seconds ago`),
  h('span', message)
])

const Popup = defineComponent({
  name: 'Popup',
  emits: ['newMessage'],
  setup (_, ctx) {
    const messages = reactive<SampleDB[]>([])
    const input = ref<HTMLInputElement | null>(null)
    const onClick = () => {
      ctx.emit('newMessage')
      const message = input.value?.value || ''
      messages.push({ timestamp: new Date(), message })
      port.postMessage({ type: 'save', message })
    }
    onMounted(() => {
      port.onMessage.addListener((saved) => {
        console.log(saved)
        if (Array.isArray(saved)) {
          messages.splice(0)
          messages.push(...saved)
        }
      })
      port.postMessage({ type: 'load' })
    })
    return () => {
      return [
        h('ul', messages.map(renderMessage)),
        h('input', { type: 'text', placeholder: 'Type something...', ref: input }, []),
        h('button', { onClick }, 'Send')
      ]
    }
  }
})

const app = createApp(Popup)
app.mount('#app')
