const express = require('express');
const router = express.Router();
const Professor = require('../models/Professor');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Login
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('senha').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, senha } = req.body;
        const professor = await Professor.findByEmail(email);
        
        if (!professor) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const senhaValida = await Professor.verificarSenha(senha, professor.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { id: professor.id, email: professor.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                id: professor.id,
                nome: professor.nome,
                email: professor.email,
                primeiro_acesso: professor.primeiro_acesso === 1
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Primeiro acesso - alterar senha
router.post('/primeiro-acesso', [
    body('email').isEmail().normalizeEmail(),
    body('novaSenha').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, novaSenha } = req.body;
        const professor = await Professor.findByEmail(email);
        
        if (!professor) {
            return res.status(404).json({ message: 'Professor não encontrado' });
        }

        if (professor.primeiro_acesso !== 1) {
            return res.status(400).json({ message: 'Senha já foi alterada anteriormente' });
        }

        await Professor.updateSenha(professor.id, novaSenha);
        res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        console.error('Erro no primeiro acesso:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;