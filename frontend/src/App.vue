<template>
  <v-app>
    <!-- Menu Lateral -->
    <v-navigation-drawer v-model="drawer" temporary location="left">
      <v-list>
        <v-list-item>
          <v-list-item-title class="text-h6">Menu</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>

        <v-list-item v-if="usuarioLogado" @click="logout" prepend-icon="mdi-logout">
          <v-list-item-title>Sair</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item>
          <v-list-item-title class="text-subtitle-2">Temas</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-for="tema in temas"
          :key="tema.value"
          @click="mudarTema(tema.value)"
          :prepend-icon="tema.icone"
        >
          <v-list-item-title>{{ tema.nome }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Barra Superior -->
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon @click="drawer = !drawer" color="white"></v-app-bar-nav-icon>

      <v-app-bar-title class="text-white">
        <span class="text-h6">{{ nomeEscola }}</span>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn v-if="usuarioLogado" color="white" variant="text">
        <v-icon>mdi-account-circle</v-icon>
        <span class="ml-2">{{ usuarioLogado.nome }}</span>
      </v-btn>
    </v-app-bar>

    <!-- Conteúdo Principal -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const drawer = ref(false)
    const authStore = useAuthStore()
    const theme = useTheme()
    const router = useRouter()

    const nomeEscola = 'Pinheiro Machado'

    const usuarioLogado = computed(() => authStore.usuario)

    const temas = [
      { nome: '☀️ Claro', value: 'light', icone: 'mdi-white-balance-sunny' },
      { nome: '🌙 Escuro', value: 'dark', icone: 'mdi-weather-night' },
      { nome: '🌸 Pastel Rosa', value: 'pastel1', icone: 'mdi-palette' },
      { nome: '🌿 Pastel Verde', value: 'pastel2', icone: 'mdi-palette' },
      { nome: '🏖️ Pastel Areia', value: 'pastel3', icone: 'mdi-palette' }
    ]

    function mudarTema(tema) {
      theme.global.name.value = tema
      localStorage.setItem('tema', tema)
      drawer.value = false
    }

    function logout() {
      authStore.logout()
      router.push('/login')
      drawer.value = false
    }

    // Carregar tema salvo
    onMounted(() => {
      const temaSalvo = localStorage.getItem('tema')
      if (temaSalvo) {
        theme.global.name.value = temaSalvo
      }
    })

    return {
      drawer,
      nomeEscola,
      usuarioLogado,
      temas,
      mudarTema,
      logout
    }
  }
}
</script>

<style>
/* Estilos globais */
.v-application {
  font-family: 'Roboto', sans-serif;
}
</style>
