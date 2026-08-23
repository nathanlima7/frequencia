<template>
  <v-container>
    <!-- Loading -->
    <v-row v-if="carregandoDados">
      <v-col cols="12" class="text-center py-16">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <p class="mt-4 text-h6">Carregando dados...</p>
      </v-col>
    </v-row>

    <template v-else>
      <!-- Card Total de Presentes -->
      <v-card class="mb-6" color="success" variant="tonal" rounded="lg">
        <v-card-text>
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h6 font-weight-medium">Alunos Presentes Hoje</div>
              <div class="text-h2 font-weight-bold">{{ totalPresentes }}</div>
              <div class="text-caption text-grey">
                Última atualização: {{ new Date().toLocaleTimeString('pt-BR') }}
              </div>
            </div>
            <div class="text-center">
              <v-progress-circular
                :model-value="percentualPresenca"
                :size="80"
                :width="8"
                color="primary"
              >
                <span class="text-h6">{{ percentualPresenca }}%</span>
              </v-progress-circular>
              <div class="text-caption">Presença</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Grid de Turmas -->
      <v-row>
        <v-col
          v-for="turma in resumoPorTurma"
          :key="turma.turma_id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            @click="selecionarTurma(turma.turma_id)"
            hover
            rounded="lg"
            class="cursor-pointer"
            :loading="carregandoFrequencia && turmaSelecionada?.turma_id === turma.turma_id"
          >
            <v-card-title class="text-h6">{{ turma.turma_nome }}</v-card-title>
            <v-card-text>
              <div class="d-flex justify-space-between mb-2">
                <span>Total: <strong>{{ turma.total_alunos }}</strong></span>
                <span>Presentes: <strong>{{ turma.presentes || 0 }}</strong></span>
              </div>
              <v-progress-linear
                :model-value="calcularPercentual(turma.presentes, turma.total_alunos)"
                color="primary"
                height="12"
                rounded
                striped
              >
                <template v-slot:default="{ value }">
                  <span class="text-caption font-weight-bold">{{ Math.round(value) }}%</span>
                </template>
              </v-progress-linear>
              <div class="mt-2 text-caption text-grey text-center">
                Clique para registrar frequência
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Dialog de Frequência da Turma -->
    <v-dialog v-model="dialogTurma" max-width="1200" fullscreen>
      <v-card>
        <v-card-title class="pa-4">
          <div class="d-flex align-center">
            <v-btn icon @click="dialogTurma = false" variant="text">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <span class="text-h5 ml-4">{{ turmaSelecionada?.turma_nome }}</span>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="exportarPDF"
              prepend-icon="mdi-file-pdf-box"
              variant="outlined"
            >
              EXP.
            </v-btn>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-data-table
            :headers="headers"
            :items="frequenciasAlunos"
            item-value="aluno_id"
            :loading="carregandoFrequencia"
            :items-per-page="20"
            density="compact"
            hover
          >
            <template v-slot:item.nome="{ item }">
              <span class="font-weight-medium">{{ item.nome }}</span>
            </template>

            <template v-slot:item.matricula="{ item }">
              <span class="text-grey">{{ item.matricula || '-' }}</span>
            </template>

            <template v-slot:item.presente="{ item }">
              <v-switch
                v-model="item.presente"
                @change="mudarFrequencia(item)"
                color="success"
                hide-details
                :loading="item.salvando"
              >
                <template v-slot:label>
                  <span :class="item.presente ? 'text-success' : 'text-grey'">
                    {{ item.presente ? '✅' : '❌' }}
                  </span>
                </template>
              </v-switch>
            </template>

            <template v-slot:item.horario_registro="{ item }">
              <span class="text-caption text-grey">
                {{ item.horario_registro ? new Date(item.horario_registro).toLocaleTimeString('pt-BR') : '-' }}
              </span>
            </template>
          </v-data-table>

          <div class="mt-4 text-center text-grey">
            <v-chip color="success" variant="tonal" class="mr-2">
              Presentes: {{ alunosPresentes }}
            </v-chip>
            <v-chip color="error" variant="tonal">
              Ausentes: {{ alunosAusentes }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog de Primeiro Acesso -->
    <v-dialog v-model="dialogPrimeiroAcesso" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Primeiro Acesso
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <p class="mb-4">Olá <strong>{{ authStore.usuario?.nome }}</strong>! Para sua segurança, você precisa alterar sua senha antes de continuar.</p>

          <v-text-field
            v-model="novaSenha"
            label="Nova Senha"
            type="password"
            variant="outlined"
            :rules="[v => v.length >= 6 || 'Mínimo 6 caracteres']"
            prepend-inner-icon="mdi-lock"
          ></v-text-field>

          <v-text-field
            v-model="confirmarSenha"
            label="Confirmar Senha"
            type="password"
            variant="outlined"
            :rules="[v => v === novaSenha || 'Senhas não coincidem']"
            prepend-inner-icon="mdi-lock-check"
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="alterarSenha"
            :loading="alterandoSenha"
            size="large"
          >
            Alterar Senha
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

export default {
  name: 'Home',
  setup() {
    const authStore = useAuthStore()

    // Dados
    const totalPresentes = ref(0)
    const totalAlunosEscola = ref(0)
    const resumoPorTurma = ref([])
    const carregandoDados = ref(true)

    // Frequência da turma
    const dialogTurma = ref(false)
    const turmaSelecionada = ref(null)
    const frequenciasAlunos = ref([])
    const carregandoFrequencia = ref(false)

    // Primeiro acesso
    const dialogPrimeiroAcesso = ref(false)
    const novaSenha = ref('')
    const confirmarSenha = ref('')
    const alterandoSenha = ref(false)

    // Headers da tabela
    const headers = [
      { title: 'Nome', key: 'nome', sortable: true },
      { title: 'Matrícula', key: 'matricula', sortable: true },
      { title: 'Status', key: 'presente', sortable: true },
      { title: 'Horário', key: 'horario_registro', sortable: true }
    ]

    // Computed
    const percentualPresenca = computed(() => {
      if (totalAlunosEscola.value === 0) return 0
      return Math.round((totalPresentes.value / totalAlunosEscola.value) * 100)
    })

    const alunosPresentes = computed(() => {
      return frequenciasAlunos.value.filter(a => a.presente).length
    })

    const alunosAusentes = computed(() => {
      return frequenciasAlunos.value.filter(a => !a.presente).length
    })

    // Métodos
    function calcularPercentual(presentes, total) {
      if (!total || total === 0) return 0
      return Math.round((presentes || 0) / total * 100)
    }

    async function carregarDados() {
      carregandoDados.value = true
      try {
        // Buscar resumo geral
        const response = await api.get('/frequencias/total-presentes')
        totalPresentes.value = response.data.total_presentes
        resumoPorTurma.value = response.data.por_turma

        // Calcular total de alunos
        totalAlunosEscola.value = resumoPorTurma.value.reduce(
          (acc, t) => acc + t.total_alunos, 0
        )
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        carregandoDados.value = false
      }
    }

    async function selecionarTurma(turmaId) {
      try {
        carregandoFrequencia.value = true
        turmaSelecionada.value = resumoPorTurma.value.find(t => t.turma_id === turmaId)

        const response = await api.get(`/frequencias/turma/${turmaId}`)
        frequenciasAlunos.value = response.data.alunos.map(a => ({
          ...a,
          presente: a.presente === 1,
          salvando: false
        }))

        dialogTurma.value = true
      } catch (error) {
        console.error('Erro ao carregar frequência:', error)
      } finally {
        carregandoFrequencia.value = false
      }
    }

    async function mudarFrequencia(aluno) {
      // Evitar múltiplas requisições simultâneas
      if (aluno.salvando) return

      aluno.salvando = true
      const estadoAnterior = aluno.presente

      try {
        await api.post('/frequencias/registrar', {
          frequencias: [
            {
              aluno_id: aluno.aluno_id,
              presente: aluno.presente
            }
          ]
        })

        // Atualizar dados
        await carregarDados()
      } catch (error) {
        console.error('Erro ao registrar frequência:', error)
        aluno.presente = estadoAnterior // Reverter
      } finally {
        aluno.salvando = false
      }
    }

    async function exportarPDF() {
      if (!turmaSelecionada.value) return

      try {
        const response = await api.get(`/relatorios/frequencia/${turmaSelecionada.value.turma_id}`, {
          responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `relatorio_frequencia_${turmaSelecionada.value.turma_nome}_${new Date().toISOString().split('T')[0]}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Erro ao exportar PDF:', error)
      }
    }

    async function alterarSenha() {
      if (novaSenha.value.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres')
        return
      }

      if (novaSenha.value !== confirmarSenha.value) {
        alert('As senhas não coincidem')
        return
      }

      alterandoSenha.value = true
      try {
        await api.post('/auth/primeiro-acesso', {
          email: authStore.usuario.email,
          novaSenha: novaSenha.value
        })

        dialogPrimeiroAcesso.value = false
        alert('Senha alterada com sucesso!')

        // Atualizar usuário e token
        await authStore.login(authStore.usuario.email, novaSenha.value)
      } catch (error) {
        console.error('Erro ao alterar senha:', error)
        alert(error.response?.data?.message || 'Erro ao alterar senha')
      } finally {
        alterandoSenha.value = false
      }
    }

    // Watch para verificar primeiro acesso
    watch(() => authStore.usuario, (usuario) => {
      if (usuario?.primeiro_acesso) {
        dialogPrimeiroAcesso.value = true
      }
    }, { immediate: true })

    // Lifecycle
    onMounted(() => {
      carregarDados()

      // Atualizar a cada 30 segundos
      const interval = setInterval(() => {
        if (!dialogTurma.value) {
          carregarDados()
        }
      }, 30000)

      return () => clearInterval(interval)
    })

    return {
      authStore,
      totalPresentes,
      totalAlunosEscola,
      resumoPorTurma,
      carregandoDados,
      dialogTurma,
      turmaSelecionada,
      frequenciasAlunos,
      carregandoFrequencia,
      dialogPrimeiroAcesso,
      novaSenha,
      confirmarSenha,
      alterandoSenha,
      headers,
      percentualPresenca,
      alunosPresentes,
      alunosAusentes,
      calcularPercentual,
      carregarDados,
      selecionarTurma,
      mudarFrequencia,
      exportarPDF,
      alterarSenha
    }
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
