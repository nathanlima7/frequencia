const database = require('../database');
const bcrypt = require('bcryptjs');

class Professor {
    static async create({ nome, email, senha }) {
        const db = database.getDb();
        const senhaHash = await bcrypt.hash(senha, 10);
        
        const result = await db.run(
            'INSERT INTO professores (nome, email, senha_hash, primeiro_acesso) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, 1]
        );
        
        return { id: result.lastID, nome, email, primeiro_acesso: 1 };
    }

    static async findByEmail(email) {
        const db = database.getDb();
        return await db.get(
            'SELECT * FROM professores WHERE email = ? AND ativo = 1',
            [email]
        );
    }

    static async findById(id) {
        const db = database.getDb();
        return await db.get(
            'SELECT id, nome, email, primeiro_acesso, created_at FROM professores WHERE id = ? AND ativo = 1',
            [id]
        );
    }

    static async updateSenha(id, novaSenha) {
        const db = database.getDb();
        const senhaHash = await bcrypt.hash(novaSenha, 10);
        await db.run(
            'UPDATE professores SET senha_hash = ?, primeiro_acesso = 0 WHERE id = ?',
            [senhaHash, id]
        );
    }

    static async verificarSenha(senha, senhaHash) {
        return await bcrypt.compare(senha, senhaHash);
    }
}

module.exports = Professor;