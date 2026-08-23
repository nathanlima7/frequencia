const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const PDFDocument = require('pdfkit');
const Frequencia = require('../models/Frequencia');
const Turma = require('../models/Turma');

router.get('/frequencia/:turmaId', auth, async (req, res) => {
    try {
        const { turmaId } = req.params;
        const { data } = req.query;
        
        const dataConsulta = data || new Date().toISOString().split('T')[0];
        
        const turma = await Turma.findById(turmaId);
        if (!turma) {
            return res.status(404).json({ message: 'Turma não encontrada' });
        }

        const frequencias = await Frequencia.getByTurmaAndDate(turmaId, dataConsulta);
        
        // Gerar PDF
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_frequencia_${turma.nome}_${dataConsulta}.pdf`);
        
        doc.pipe(res);
        
        // Cabeçalho
        doc.fontSize(18).text('Relatório de Frequência', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Turma: ${turma.nome}`);
        doc.text(`Data: ${new Date(dataConsulta).toLocaleDateString('pt-BR')}`);
        doc.moveDown();
        
        // Tabela
        const tableTop = 200;
        const itemHeight = 30;
        
        // Cabeçalho da tabela
        doc.fontSize(12);
        doc.text('Nome', 50, tableTop, { width: 200 });
        doc.text('Matrícula', 250, tableTop, { width: 100 });
        doc.text('Status', 350, tableTop, { width: 100 });
        
        // Linha separadora
        doc.moveTo(50, tableTop + 20)
           .lineTo(550, tableTop + 20)
           .stroke();
        
        // Dados
        let y = tableTop + 30;
        let presentes = 0;
        
        for (const aluno of frequencias) {
            const status = aluno.presente === 1 ? '✅ Presente' : '❌ Ausente';
            if (aluno.presente === 1) presentes++;
            
            doc.text(aluno.nome, 50, y, { width: 200 });
            doc.text(aluno.matricula || '-', 250, y, { width: 100 });
            doc.text(status, 350, y, { width: 100 });
            
            y += itemHeight;
        }
        
        // Total
        doc.moveDown(2);
        doc.fontSize(14);
        doc.text(`Total de Alunos: ${frequencias.length}`);
        doc.text(`Presentes: ${presentes}`);
        doc.text(`Ausentes: ${frequencias.length - presentes}`);
        doc.text(`Porcentagem de Presença: ${(presentes/frequencias.length * 100).toFixed(1)}%`);
        
        // Rodapé
        doc.moveDown();
        doc.fontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
        
        doc.end();
        
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;