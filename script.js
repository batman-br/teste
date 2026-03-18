/* script.js - Versão Corrigida com Espaçamento Simétrico */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

// Configurações da Planta Baixa
const colunasVerticais = 8;
const corredoresHorizontais = 3;
const margemPerimetral = 60; 
const larguraPrateleira = 80;
const alturaSegmentoPrateleira = 160; 
const larguraCorredor = 50; // Espaço padrão para corredores V e H

// Cores
const corPrateleira = '#87CEFA';
const corLampadaApagada = 'rgba(200, 200, 200, 0.5)';

let prateleiras = [];
let lampadas = [];

function inicializarMapa() {
    prateleiras = [];
    lampadas = [];

    // 1. Criar as Prateleiras e Lâmpadas dos Corredores Verticais
    for (let c = 0; c < colunasVerticais - 1; c++) {
        let xBase = margemPerimetral + (c * (larguraPrateleira + larguraCorredor)) + larguraPrateleira + (larguraCorredor / 2);
        
        for (let r = 0; r < corredoresHorizontais + 1; r++) {
            let xPrat = margemPerimetral + (c * (larguraPrateleira + larguraCorredor));
            let yPrat = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor));

            // Adiciona o bloco da prateleira
            prateleiras.push({
                x: xPrat, y: yPrat,
                width: larguraPrateleira, height: alturaSegmentoPrateleira,
                color: corPrateleira
            });

            // Adiciona 4 lâmpadas por segmento de corredor (espaços iguais)
            // Calculamos o início e fim do segmento para distribuir as 4 luzes
            let yInicio = yPrat;
            let yFim = yPrat + alturaSegmentoPrateleira;
            let passo = alturaSegmentoPrateleira / 5; // Divide em 5 espaços para ter 4 pontos internos

            for (let i = 1; i <= 4; i++) {
                // Lâmpada no corredor à esquerda da prateleira (se for a primeira coluna)
                if (c === 0) {
                    lampadas.push({ x: xPrat - (larguraCorredor/2), y: yPrat + (i * passo), radius: 5 });
                }
                // Lâmpada no corredor à direita da prateleira
                lampadas.push({ x: xPrat + larguraPrateleira + (larguraCorredor/2), y: yPrat + (i * passo), radius: 5 });
            }
        }
    }

    // 2. Adicionar Lâmpadas nos Cruzamentos (Nós da Matriz)
    // Isso garante que cada encontro de corredor tenha uma lâmpada central
    for (let c = 0; c < colunasVerticais; c++) {
        for (let r = 0; r < corredoresHorizontais; r++) {
            let x = margemPerimetral + (c * (larguraPrateleira + larguraCorredor)) - (larguraCorredor / 2);
            if (c === colunasVerticais - 1) x = margemPerimetral + (c * (larguraPrateleira + larguraCorredor)) - (larguraCorredor / 2);
            
            let y = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor)) + alturaSegmentoPrateleira + (larguraCorredor / 2);

            lampadas.push({
                x: x,
                y: y,
                radius: 7, // Destaque para o cruzamento
                isCruzamento: true
            });
        }
    }

    desenharMapa();
}

function desenharMapa() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha Prateleiras
    prateleiras.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.strokeStyle = '#6bb9e8';
        ctx.strokeRect(p.x, p.y, p.width, p.height);
    });

    // Desenha Lâmpadas
    lampadas.forEach(l => {
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
        ctx.fillStyle = corLampadaApagada;
        ctx.fill();
        ctx.closePath();
    });
}

inicializarMapa();
