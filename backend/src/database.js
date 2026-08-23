const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// Garantir que o diretório existe
const dbDir = path.resolve(__dirname, '..');
const dbPath = path.resolve(dbDir, process.env.DATABASE_PATH || 'frequencia.db');

class Database {
    constructor() {
        this.db = null;
    }

    async connect() {
        try {
            // Criar diretório se não existir
            const dir = path.dirname(dbPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            this.db = await open({
                filename: dbPath,
                driver: sqlite3.Database
            });

            await this.initTables();
            console.log('📦 Banco de dados conectado com sucesso');
            return this.db;
        } catch (error) {
            console.error('❌ Erro ao conectar ao banco:', error);
            throw error;
        }
    }

    async initTables() {
        // Tabela Turmas
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS turmas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome VARCHAR(50) NOT NULL,
                ano_letivo INTEGER NOT NULL,
                ativo BOOLEAN DEFAULT 1
            )
        `);

        // Tabela Alunos
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS alunos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                turma_id INTEGER NOT NULL,
                nome VARCHAR(100) NOT NULL,
                matricula VARCHAR(20) UNIQUE,
                ativo BOOLEAN DEFAULT 1,
                FOREIGN KEY (turma_id) REFERENCES turmas(id)
            )
        `);

        // Tabela Professores
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS professores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                senha_hash VARCHAR(255) NOT NULL,
                primeiro_acesso BOOLEAN DEFAULT 1,
                ativo BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela Frequências
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS frequencias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                aluno_id INTEGER NOT NULL,
                professor_id INTEGER NOT NULL,
                data DATE NOT NULL,
                presente BOOLEAN NOT NULL,
                horario_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (aluno_id) REFERENCES alunos(id),
                FOREIGN KEY (professor_id) REFERENCES professores(id)
            )
        `);

        // Índices
        await this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_frequencias_data ON frequencias(data);
            CREATE INDEX IF NOT EXISTS idx_frequencias_aluno ON frequencias(aluno_id);
            CREATE INDEX IF NOT EXISTS idx_alunos_turma ON alunos(turma_id);
        `);

        // Inserir turmas padrão (12 turmas)
        const turmasExistentes = await this.db.get('SELECT COUNT(*) as total FROM turmas');
        if (turmasExistentes.total === 0) {
            const turmas = [
                '1º A - SIS', '1º A - MKT', '1º C',
                '1º D', '2º A - SIS', '2º A - MKT',
                '2º B - SIS', '2º B - MKT', '3º A',
                '3º A', '3º B', '3º C'
            ];

            const anoLetivo = new Date().getFullYear();
            for (const nome of turmas) {
                await this.db.run(
                    'INSERT INTO turmas (nome, ano_letivo) VALUES (?, ?)',
                    [nome, anoLetivo]
                );
            }
            console.log('📚 12 turmas criadas com sucesso');
        }

        // Inserir professor admin padrão
        const adminExistente = await this.db.get('SELECT COUNT(*) as total FROM professores WHERE email = "admin@escola.com"');
        if (adminExistente.total === 0) {
            const bcrypt = require('bcryptjs');
            const senhaHash = await bcrypt.hash('admin123', 10);
            await this.db.run(
                'INSERT INTO professores (nome, email, senha_hash, primeiro_acesso) VALUES (?, ?, ?, ?)',
                ['Administrador', 'admin@escola.com', senhaHash, 1]
            );
            console.log('👤 Admin criado: admin@escola.com / admin123');
        }
    }

    getDb() {
        if (!this.db) {
            throw new Error('Banco de dados não conectado');
        }
        return this.db;
    }

    async close() {
        if (this.db) {
            await this.db.close();
            console.log('🔒 Banco de dados desconectado');
        }
    }
}

module.exports = new Database();
