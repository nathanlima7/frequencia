const database = require('../database');

class Frequencia {
    static async registrar({ aluno_id, professor_id, presente }) {
        const db = database.getDb();
        const hoje = new Date().toISOString().split('T')[0];
        
        // Verificar se já existe registro para hoje
        const existente = await db.get(
            'SELECT id FROM frequencias WHERE aluno_id = ? AND data = ?',
            [aluno_id, hoje]
        );
        
        if (existente) {
            // Atualizar
            await db.run(
                'UPDATE frequencias SET presente = ?, professor_id = ?, horario_registro = CURRENT_TIMESTAMP WHERE id = ?',
                [presente ? 1 : 0, professor_id, existente.id]
            );
            return { id: existente.id, atualizado: true };
        } else {
            // Inserir
            const result = await db.run(
                'INSERT INTO frequencias (aluno_id, professor_id, data, presente) VALUES (?, ?, ?, ?)',
                [aluno_id, professor_id, hoje, presente ? 1 : 0]
            );
            return { id: result.lastID, atualizado: false };
        }
    }

    static async getByTurmaAndDate(turmaId, data) {
        const db = database.getDb();
        return await db.all(
            `SELECT a.id as aluno_id, a.nome, a.matricula, f.presente, f.horario_registro
             FROM alunos a
             LEFT JOIN frequencias f ON f.aluno_id = a.id AND f.data = ?
             WHERE a.turma_id = ? AND a.ativo = 1
             ORDER BY a.nome`,
            [data, turmaId]
        );
    }

    static async getTotalPresentesEscola(data) {
        const db = database.getDb();
        const result = await db.get(
            'SELECT COUNT(DISTINCT aluno_id) as total FROM frequencias WHERE data = ? AND presente = 1',
            [data]
        );
        return result.total || 0;
    }

    static async getResumoPorTurma(data) {
        const db = database.getDb();
        return await db.all(
            `SELECT 
                t.id as turma_id,
                t.nome as turma_nome,
                COUNT(DISTINCT a.id) as total_alunos,
                COUNT(DISTINCT f.aluno_id) as presentes
             FROM turmas t
             LEFT JOIN alunos a ON a.turma_id = t.id AND a.ativo = 1
             LEFT JOIN frequencias f ON f.aluno_id = a.id AND f.data = ? AND f.presente = 1
             WHERE t.ativo = 1
             GROUP BY t.id
             ORDER BY t.nome`,
            [data]
        );
    }
}

module.exports = Frequencia;