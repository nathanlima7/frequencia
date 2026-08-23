const database = require('../database');

class Turma {
    static async findAll() {
        const db = database.getDb();
        return await db.all(
            'SELECT * FROM turmas WHERE ativo = 1 ORDER BY nome'
        );
    }

    static async findById(id) {
        const db = database.getDb();
        return await db.get(
            'SELECT * FROM turmas WHERE id = ? AND ativo = 1',
            [id]
        );
    }

    static async getAlunos(turmaId) {
        const db = database.getDb();
        return await db.all(
            'SELECT id, nome, matricula FROM alunos WHERE turma_id = ? AND ativo = 1 ORDER BY nome',
            [turmaId]
        );
    }

    static async getTotalPresentes(turmaId) {
        const db = database.getDb();
        const hoje = new Date().toISOString().split('T')[0];
        
        const result = await db.get(
            `SELECT COUNT(DISTINCT a.id) as total 
             FROM alunos a
             JOIN frequencias f ON f.aluno_id = a.id
             WHERE a.turma_id = ? 
             AND f.data = ?
             AND f.presente = 1
             AND a.ativo = 1`,
            [turmaId, hoje]
        );
        
        return result.total || 0;
    }

    static async getTotalAlunos(turmaId) {
        const db = database.getDb();
        const result = await db.get(
            'SELECT COUNT(*) as total FROM alunos WHERE turma_id = ? AND ativo = 1',
            [turmaId]
        );
        return result.total || 0;
    }
}

module.exports = Turma;