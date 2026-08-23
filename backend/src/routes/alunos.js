const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Aluno = require('../models/Aluno');
const { body, validationResult } = require('express-validator');

// Criar aluno
router.post('/', auth, [
    body('turma_id').isInt(),
    body('nome').notEmpty().trim(),
    body('matricula').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const aluno = await Aluno.create(req.body);
        res.status(201).json(aluno);
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Atualizar aluno
router.put('/:id', auth, [
    body('nome').optional().trim(),
    body('matricula').optional().trim()
], async (req, res) => {
    try {
        const { id } = req.params;
        await Aluno.update(id, req.body);
        res.json({ message: 'Aluno atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Remover aluno (soft delete)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await Aluno.delete(id);
        res.json({ message: 'Aluno removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;