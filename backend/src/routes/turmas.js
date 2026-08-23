const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Turma = require('../models/Turma');

// Listar todas as turmas
router.get('/', auth, async (req, res) => {
    try {
        const turmas = await Turma.findAll();
        res.json(turmas);
    } catch (error) {
        console.error('Erro ao listar turmas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Obter alunos de uma turma
router.get('/:id/alunos', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const turma = await Turma.findById(id);
        
        if (!turma) {
            return res.status(404).json({ message: 'Turma não encontrada' });
        }
        
        const alunos = await Turma.getAlunos(id);
        res.json(alunos);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;