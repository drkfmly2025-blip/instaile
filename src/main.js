import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

// PWA'yı başlat (production'da çalıştır)
if (import.meta.env.PROD) {
  import('./utils/pwa.js').then(({ registerServiceWorker, installPWA, checkOnlineStatus }) => {
    registerServiceWorker()
    installPWA()
    checkOnlineStatus()
  }).catch(error => {
    console.log('PWA utilities not loaded:', error)
  })
}
