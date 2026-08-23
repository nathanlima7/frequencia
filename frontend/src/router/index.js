import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { public: true }
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Guard de navegação
router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('token')
    const isAuthenticated = !!token

    // Se a rota requer autenticação e não está autenticado
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
        return
    }

    // Se está autenticado e tenta acessar login
    if (to.path === '/login' && isAuthenticated) {
        next('/')
        return
    }

    next()
})

export default router
