const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Frequencia = require('../models/Frequencia');
const Turma = require('../models/Turma');
const { body, validationResult } = require('express-validator');

// Registrar frequência de vários alunos
router.post('/registrar', auth, [
    body('frequencias').isArray(),
    body('frequencias.*.aluno_id').isInt(),
    body('frequencias.*.presente').isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { frequencias } = req.body;
        const professorId = req.usuario.id;

        const resultados = [];
        for (const freq of frequencias) {
            const resultado = await Frequencia.registrar({
                aluno_id: freq.aluno_id,
                professor_id: professorId,
                presente: freq.presente
            });
            resultados.push(resultado);
        }

        res.json({ 
            message: 'Frequência registrada com sucesso',
            resultados
        });
    } catch (error) {
        console.error('Erro ao registrar frequência:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Obter frequência de uma turma
router.get('/turma/:turmaId', auth, async (req, res) => {
    try {
        const { turmaId } = req.params;
        const { data } = req.query;
        
        const dataConsulta = data || new Date().toISOString().split('T')[0];
        
        const turma = await Turma.findById(turmaId);
        if (!turma) {
            return res.status(404).json({ message: 'Turma não encontrada' });
        }

        const frequencias = await Frequencia.getByTurmaAndDate(turmaId, dataConsulta);
        res.json({
            turma,
            data: dataConsulta,
            alunos: frequencias
        });
    } catch (error) {
        console.error('Erro ao buscar frequência:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Obter total de presentes na escola
router.get('/total-presentes', auth, async (req, res) => {
    try {
        const { data } = req.query;
        const dataConsulta = data || new Date().toISOString().split('T')[0];
        
        const total = await Frequencia.getTotalPresentesEscola(dataConsulta);
        const porTurma = await Frequencia.getResumoPorTurma(dataConsulta);
        
        res.json({
            data: dataConsulta,
            total_presentes: total,
            por_turma: porTurma
        });
    } catch (error) {
        console.error('Erro ao buscar total de presentes:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;