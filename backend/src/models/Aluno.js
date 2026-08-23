const database = require('../database');

class Aluno {
    static async create({ turma_id, nome, matricula }) {
        const db = database.getDb();
        const result = await db.run(
            'INSERT INTO alunos (turma_id, nome, matricula) VALUES (?, ?, ?)',
            [turma_id, nome, matricula]
        );
        return { id: result.lastID, turma_id, nome, matricula };
    }

    static async findByTurma(turmaId) {
        const db = database.getDb();
        return await db.all(
            'SELECT * FROM alunos WHERE turma_id = ? AND ativo = 1 ORDER BY nome',
            [turmaId]
        );
    }

    static async findById(id) {
        const db = database.getDb();
        return await db.get(
            'SELECT * FROM alunos WHERE id = ? AND ativo = 1',
            [id]
        );
    }

    static async update(id, dados) {
        const db = database.getDb();
        const { nome, matricula } = dados;
        await db.run(
            'UPDATE alunos SET nome = ?, matricula = ? WHERE id = ?',
            [nome, matricula, id]
        );
    }

    static async delete(id) {
        const db = database.getDb();
        await db.run(
            'UPDATE alunos SET ativo = 0 WHERE id = ?',
            [id]
        );
    }
}

module.exports = Aluno;