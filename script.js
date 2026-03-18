/* script.js - Versão 5 Lâmpadas + Corredores Horizontais */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

// Configurações da Planta Baixa
const colunasVerticais = 8;
const corredoresHorizontais = 3;
const margemPerimetral = 60; 
const larguraPrateleira = 80;
const alturaSegmentoPrateleira = 160; 
const larguraCorredor = 50; // Espaço padrão para corredores V e H
const raioLampada = 5; // Raio único para todas as lâmpadas

// Cores
const corPrateleira = '#87CEFA';
const corLampadaApagada = 'rgba(200, 200, 200, 0.5)';

let prateleiras = [];
let lampadas = [];

function inicializarMapa() {
    prateleiras = [];
    lampadas = [];

    // 1. Criar Prateleiras e Lâmpadas dos Corredores Verticais
    for (let c = 0; c < colunasVerticais - 1; c++) {
        for (let r = 0; r < corredoresHorizontais + 1; r++) {
            let xPrat = margemPerimetral + (c * (larguraPrateleira + larguraCorredor));
            let yPrat = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor));

            // Adiciona o bloco da prateleira
            prateleiras.push({
                x: xPrat, y: yPrat,
                width: larguraPrateleira, height: alturaSegmentoPrateleira,
                color: corPrateleira
            });

            // Adiciona 5 lâmpadas por segmento de corredor VERTICAL (espaços iguais)
            // Calculamos o início e fim do segmento para distribuir as 5 luzes
            let yInicio = yPrat;
            let yFim = yPrat + alturaSegmentoPrateleira;
            let passoY = alturaSegmentoPrateleira / 6; // Divide em 6 espaços para ter 5 pontos internos

            for (let i = 1; i <= 5; i++) {
                // Lâmpada no corredor à esquerda da prateleira (se for a primeira coluna)
                if (c === 0) {
                    lampadas.push({ x: xPrat - (larguraCorredor/2), y: yPrat + (i * passoY), radius: raioLampada });
                }
                // Lâmpada no corredor à direita da prateleira
                lampadas.push({ x: xPrat + larguraPrateleira + (larguraCorredor/2), y: yPrat + (i * passoY), radius: raioLampada });
            }
        }
    }

    // 2. Adicionar Lâmpadas nos Corredores Horizontais e Cruzamentos
    for (let r = 0; r < corredoresHorizontais + 1; r++) {
        let yCorredorH = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor)) - (larguraCorredor / 2);
        
        // Ajuste para o corredor perimetral inferior
        if (r === corredoresHorizontais) yCorredorH = canvas.height - margemPerimetral + (larguraCorredor / 2);

        // Distribui lâmpadas ao longo do corredor horizontal
        let numLampadasH = (colunasVerticais * larguraPrateleira) + ((colunasVerticais - 1) * larguraCorredor);
        // let numLampadasH = colunasVerticais; // Simplificação: uma lâmpada por coluna/cruzamento
        // let espacamentoH = canvas.width / (colunasVerticais + 1);

        for (let c = 0; c < colunasVerticais; c++) {
             let x = margemPerimetral + (c * (larguraPrateleira + larguraCorredor)) - (larguraCorredor / 2);
            
            // Adiciona lâmpada de cruzamento (com o mesmo tamanho)
            lampadas.push({
                x: x,
                y: yCorredorH,
                radius: raioLampada, 
                isCruzamento: true
            });
            
            // Adicionar lâmpadas intermediárias nos corredores horizontais (opcional para maior precisão)
            // let espacamentoIntermediario = larguraPrateleira / 6;
            // for(let i=1; i<=5; i++){
            //     lampadas.push({x: x + (larguraCorredor/2) + (i*espacamentoIntermediario), y: yCorredorH, radius: raioLampada});
            // }
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
