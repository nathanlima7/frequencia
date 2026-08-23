import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Criar tema
const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: '#1976D2',
                    secondary: '#424242',
                    accent: '#82B1FF',
                    error: '#FF5252',
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FFC107'
                }
            },
            dark: {
                dark: true,
                colors: {
                    primary: '#2196F3',
                    secondary: '#424242',
                    accent: '#FF4081',
                    error: '#FF5252',
                    info: '#2196F3',
                    success: '#4CAF50',
                    warning: '#FFC107'
                }
            },
            pastel1: {
                dark: false,
                colors: {
                    primary: '#FFB3BA',
                    secondary: '#FFDFBA',
                    accent: '#FFFFBA',
                    error: '#FF6B6B',
                    info: '#BAE1FF',
                    success: '#BAFFC9',
                    warning: '#FFE5A3'
                }
            },
            pastel2: {
                dark: false,
                colors: {
                    primary: '#B5EAD7',
                    secondary: '#C7CEEA',
                    accent: '#E2F0CB',
                    error: '#FF6B6B',
                    info: '#FFDAC1',
                    success: '#FF9AA2',
                    warning: '#FFB347'
                }
            },
            pastel3: {
                dark: false,
                colors: {
                    primary: '#E8D5B7',
                    secondary: '#F2D5C4',
                    accent: '#F5E6D3',
                    error: '#E8B4B8',
                    info: '#B8D4E3',
                    success: '#B8E3C8',
                    warning: '#F5D6A8'
                }
            }
        }
    }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
