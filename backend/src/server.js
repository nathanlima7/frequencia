require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./database');
const cron = require('node-cron');

// Rotas
const authRoutes = require('./routes/auth');
const turmaRoutes = require('./routes/turmas');
const alunoRoutes = require('./routes/alunos');
const frequenciaRoutes = require('./routes/frequencias');
const relatorioRoutes = require('./routes/relatorios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requisições por IP
    message: 'Muitas requisições, tente novamente mais tarde.'
});
app.use(limiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/frequencias', frequenciaRoutes);
app.use('/api/relatorios', relatorioRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        db: database.getDb() ? 'conectado' : 'desconectado'
    });
});

// Iniciar servidor
async function startServer() {
    try {
        await database.connect();
        
        // Agendar reset diário à meia-noite
        cron.schedule('0 0 * * *', async () => {
            console.log('🔄 Executando reset diário...');
            await resetDiario();
        });
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
            console.log('📅 Reset diário agendado para meia-noite');
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Função de reset diário
async function resetDiario() {
    try {
        const db = database.getDb();
        const hoje = new Date().toISOString().split('T')[0];
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 60);
        const dataLimiteStr = dataLimite.toISOString().split('T')[0];
        
        // 1. Arquiva dados com mais de 60 dias (exclui permanentemente)
        const result = await db.run(
            'DELETE FROM frequencias WHERE data < ?',
            [dataLimiteStr]
        );
        console.log(`🗑️ ${result.changes} registros antigos removidos`);
        
        // 2. Os registros de hoje permanecem para consulta
        console.log('✅ Reset diário concluído');
    } catch (error) {
        console.error('❌ Erro no reset diário:', error);
    }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Erro não tratado:', error);
});

startServer();