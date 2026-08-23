<template>
  <v-container fluid fill-height class="login-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 pa-4" rounded="lg">
          <v-card-title class="text-h5 text-center py-4">
            <div>
              <div class="text-h4 mb-2">🎓</div>
              <div>Sistema de Frequência</div>
            </div>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="form">
              <v-text-field
                v-model="email"
                label="E-mail"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                :rules="[v => !!v || 'E-mail é obrigatório', v => /.+@.+\..+/.test(v) || 'E-mail inválido']"
                required
              ></v-text-field>

              <v-text-field
                v-model="senha"
                label="Senha"
                type="password"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                :rules="[v => !!v || 'Senha é obrigatória']"
                required
                @keyup.enter="handleLogin"
              ></v-text-field>

              <v-alert
                v-if="erro"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="erro = ''"
              >
                {{ erro }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="carregando"
                class="mt-2"
              >
                Entrar
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-text class="text-center text-caption text-grey">
            <p class="mb-1">Primeiro acesso? Use a senha gerada pelo sistema.</p>
            <v-divider class="my-3"></v-divider>
            <p class="text-grey-darken-1">
              <strong>Admin:</strong> admin@escola.com / admin123
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const form = ref(null)
    const email = ref('')
    const senha = ref('')
    const erro = ref('')
    const carregando = ref(false)

    async function handleLogin() {
      // Validar formulário
      const valid = await form.value?.validate()
      if (!valid?.valid) return

      carregando.value = true
      erro.value = ''

      try {
        await authStore.login(email.value, senha.value)
        router.push('/')
      } catch (error) {
        console.error('Erro no login:', error)
        erro.value = error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.'
      } finally {
        carregando.value = false
      }
    }

    return {
      form,
      email,
      senha,
      erro,
      carregando,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh !important;
}
</style>
