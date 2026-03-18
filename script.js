/* script.js - Versão Alinhamento Total (H + V) */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

const colunasVerticais = 8;
const corredoresHorizontais = 3; 
const margemPerimetral = 80; 
const larguraPrateleira = 55; 
const alturaSegmentoPrateleira = 180; 
const larguraCorredor = 65; 
const raioLampada = 5;

const corPrateleira = '#87CEFA';
const corLampadaApagada = 'rgba(200, 200, 200, 0.4)';

let prateleiras = [];
let lampadas = [];

function inicializarMapa() {
    prateleiras = [];
    lampadas = [];

    // 1. Criar Prateleiras e Lâmpadas Verticais (5 por segmento)
    for (let c = 0; c < colunasVerticais - 1; c++) {
        for (let r = 0; r < corredoresHorizontais + 1; r++) {
            let xPrat = margemPerimetral + (c * (larguraPrateleira + larguraCorredor)) + larguraCorredor/2;
            let yPrat = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor));

            prateleiras.push({
                x: xPrat, y: yPrat,
                width: larguraPrateleira, height: alturaSegmentoPrateleira,
                color: corPrateleira
            });

            // 5 Lâmpadas verticais: da extremidade superior à inferior
            for (let i = 0; i < 5; i++) {
                let posY = yPrat + (i * (alturaSegmentoPrateleira / 4));
                lampadas.push({ x: xPrat - (larguraCorredor/2), y: posY, radius: raioLampada });
                if (c === colunasVerticais - 2) {
                    lampadas.push({ x: xPrat + larguraPrateleira + (larguraCorredor/2), y: posY, radius: raioLampada });
                }
            }
        }
    }

    // 2. Lâmpadas Horizontais (Cruzamentos + 2 no vão da prateleira)
    for (let r = 0; r < corredoresHorizontais + 2; r++) {
        // Cálculo do Y do corredor horizontal
        let yCorredor;
        if (r <= corredoresHorizontais) {
            yCorredor = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor)) - (larguraCorredor / 2);
        } else {
            // Último corredor (inferior)
            yCorredor = margemPerimetral + (corredoresHorizontais * (alturaSegmentoPrateleira + larguraCorredor)) + alturaSegmentoPrateleira + (larguraCorredor / 2);
        }

        for (let c = 0; c < colunasVerticais; c++) {
            let xCruzamento = margemPerimetral + (c * (larguraPrateleira + larguraCorredor));
            
            // Lâmpada do Cruzamento (ID de Nó)
            lampadas.push({ x: xCruzamento, y: yCorredor, radius: raioLampada });

            // 2 Lâmpadas horizontais entre cruzamentos (alinhadas com a prateleira)
            if (c < colunasVerticais - 1) {
                let xInicioPrat = xCruzamento + (larguraCorredor / 2);
                // Dividimos a largura da prateleira para colocar as 2 luzes internas
                // Para ficarem simétricas: 1/3 e 2/3 da largura
                for (let j = 1; j <= 2; j++) {
                    let posX = xInicioPrat + (j * (larguraPrateleira / 3));
                    lampadas.push({ x: posX, y: yCorredor, radius: raioLampada });
                }
            }
        }
    }
    desenharMapa();
}

function desenharMapa() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    prateleiras.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.strokeStyle = '#6bb9e8';
        ctx.strokeRect(p.x, p.y, p.width, p.height);
    });
    lampadas.forEach(l => {
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
        ctx.fillStyle = corLampadaApagada;
        ctx.fill();
        ctx.closePath();
    });
}

inicializarMapa();
