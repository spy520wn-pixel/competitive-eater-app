import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Vue Error]', err, info)
  }
  return { app }
}
