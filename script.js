/* script.js */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

// Definições da Grade (Ajuste para tamanho do canvas)
const colunasVerticais = 8;
const corredoresHorizontais = 3;
const margemPerimetral = 50; // Corredor ao redor
const larguraPrateleira = 80; // Largura do bloco de prateleiras
const alturaSegmentoPrateleira = 150; // Altura entre corredores H
const larguraCorredorVertical = 40; // Espaço entre blocos de prateleiras

// Cores Suaves
const corPrateleira = '#87CEFA'; // LightSkyBlue
const corLampadaApagada = 'rgba(200, 200, 200, 0.5)'; // Cinza translúcido

// Arrays para guardar os objetos
let prateleiras = [];
let lampadas = [];

function inicializarMapa() {
    // 1. Criar as Prateleiras (Blocos)
    for (let c = 0; c < colunasVerticais - 1; c++) {
        for (let r = 0; r < corredoresHorizontais + 1; r++) {
            // Calcula posição X e Y do bloco
            let x = margemPerimetral + (c * (larguraPrateleira + larguraCorredorVertical));
            let y = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredorVertical)); // Usando larguraCorredorVertical como altura do H tbm

            // Define o retângulo da prateleira
            let prateleira = {
                x: x, y: y,
                width: larguraPrateleira,
                height: alturaSegmentoPrateleira,
                color: corPrateleira
            };
            prateleiras.push(prateleira);

            // 2. Adicionar Lâmpadas nas Prateleiras (4 por segmento)
            let espacamentoLampadas = alturaSegmentoPrateleira / 5;
            for (let l = 1; l <= 4; l++) {
                // Lâmpada no corredor vertical esquerdo da prateleira
                let lampadaEsquerda = {
                    x: x - (larguraCorredorVertical / 2),
                    y: y + (l * espacamentoLampadas),
                    radius: 5, color: corLampadaApagada
                };
                lampadas.push(lampadaEsquerda);

                // Lâmpada no corredor vertical direito da prateleira
                let lampadaDireita = {
                    x: x + larguraPrateleira + (larguraCorredorVertical / 2),
                    y: y + (l * espacamentoLampadas),
                    radius: 5, color: corLampadaApagada
                };
                lampadas.push(lampadaDireita);
            }
        }
    }

    // 3. Adicionar Lâmpadas nos Cruzamentos (8x3)
    for (let c = 0; c < colunasVerticais; c++) {
        for (let r = 0; r < corredoresHorizontais; r++) {
            let x = margemPerimetral + (c * (larguraPrateleira + larguraCorredorVertical));
            let y = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredorVertical)) - (larguraCorredorVertical / 2); // Centralizado no H

            let lampadaCruzamento = {
                x: x - (larguraCorredorVertical / 2),
                y: y + alturaSegmentoPrateleira + (larguraCorredorVertical / 2),
                radius: 7, color: corLampadaApagada // Lâmpada maior no cruzamento
            };
            lampadas.push(lampadaCruzamento);
        }
    }

    // 4. Desenhar tudo
    desenharMapa();
}

function desenharMapa() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

    // Desenha Prateleiras
    prateleiras.forEach(prateleira => {
        ctx.fillStyle = prateleira.color;
        ctx.fillRect(prateleira.x, prateleira.y, prateleira.width, prateleira.height);
        // Borda suave
        ctx.strokeStyle = '#6bb9e8';
        ctx.strokeRect(prateleira.x, prateleira.y, prateleira.width, prateleira.height);
    });

    // Desenha Lâmpadas
    lampadas.forEach(lampada => {
        ctx.beginPath();
        ctx.arc(lampada.x, lampada.y, lampada.radius, 0, Math.PI * 2);
        ctx.fillStyle = lampada.color;
        ctx.fill();
        ctx.closePath();
    });
}

// Inicia o processo
inicializarMapa();
