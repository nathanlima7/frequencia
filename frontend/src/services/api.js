import axios from 'axios'

// Configuração da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Interceptor para adicionar token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error('Erro na requisição:', error)
        return Promise.reject(error)
    }
)

// Interceptor para tratar erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Token expirado ou inválido
        if (error.response?.status === 401) {
            console.warn('Token inválido ou expirado')
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
            // Redirecionar para login se não estiver na página de login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login'
            }
        }

        // Erro de conexão
        if (error.code === 'ECONNABORTED' || !error.response) {
            console.error('Erro de conexão com o servidor')
            return Promise.reject({
                message: 'Erro de conexão. Verifique sua internet.',
                ...error
            })
        }

        return Promise.reject(error)
    }
)

export default api
