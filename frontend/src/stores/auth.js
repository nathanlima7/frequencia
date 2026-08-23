import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        usuario: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isPrimeiroAcesso: (state) => state.usuario?.primeiro_acesso || false
    },

    actions: {
        async login(email, senha) {
            try {
                const response = await api.post('/auth/login', { email, senha })
                const { token, usuario } = response.data

                this.token = token
                this.usuario = usuario

                localStorage.setItem('token', token)
                localStorage.setItem('usuario', JSON.stringify(usuario))

                // Configurar token no axios
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`

                return response.data
            } catch (error) {
                console.error('Erro no login:', error)
                throw error
            }
        },

        logout() {
            this.token = null
            this.usuario = null

            localStorage.removeItem('token')
            localStorage.removeItem('usuario')

            delete api.defaults.headers.common['Authorization']
        },

        // Inicializar estado com dados salvos
        init() {
            const token = localStorage.getItem('token')
            const usuarioStr = localStorage.getItem('usuario')

            if (token && usuarioStr) {
                try {
                    this.token = token
                    this.usuario = JSON.parse(usuarioStr)
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                } catch (error) {
                    console.error('Erro ao restaurar sessão:', error)
                    this.logout()
                }
            }
        }
    }
})
