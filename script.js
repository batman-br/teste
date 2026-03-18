/* script.js - Versão Matriz de Alta Densidade (V2) */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

const colunasVerticais = 8;
const corredoresHorizontais = 3; // 3 internos + 2 perimetrais
const margemPerimetral = 60; 
const larguraPrateleira = 60; // Mais estreita
const alturaSegmentoPrateleira = 180; // Mais alta
const larguraCorredor = 60; 
const raioLampada = 5;

const corPrateleira = '#87CEFA';
const corLampadaApagada = 'rgba(200, 200, 200, 0.5)';

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

            // 5 Lâmpadas nos corredores verticais ao lado da prateleira
            let passoY = alturaSegmentoPrateleira / 6;
            for (let i = 1; i <= 5; i++) {
                // Lado Esquerdo do corredor
                lampadas.push({ x: xPrat - (larguraCorredor/2), y: yPrat + (i * passoY), radius: raioLampada });
                // Lado Direito (última coluna precisa disso)
                if (c === colunasVerticais - 2) {
                    lampadas.push({ x: xPrat + larguraPrateleira + (larguraCorredor/2), y: yPrat + (i * passoY), radius: raioLampada });
                }
            }
        }
    }

    // 2. Lâmpadas dos Corredores Horizontais (Cruzamentos + 2 entre eles)
    for (let r = 0; r < corredoresHorizontais + 2; r++) {
        let yCorredor = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor)) - (larguraCorredor / 2);
        
        for (let c = 0; c < colunasVerticais; c++) {
            // Lâmpada do Cruzamento (O "Nó")
            let xCruzamento = margemPerimetral + (c * (larguraPrateleira + larguraCorredor));
            lampadas.push({ x: xCruzamento, y: yCorredor, radius: raioLampada, isNo: true });

            // 2 Lâmpadas horizontais entre os cruzamentos (no vão da prateleira)
            if (c < colunasVerticais - 1) {
                let xInicioPrat = xCruzamento + (larguraCorredor / 2);
                let passoX = larguraPrateleira / 3; 
                for (let j = 1; j <= 2; j++) {
                    lampadas.push({ x: xCruzamento + (larguraCorredor/2) + (j * passoX), y: yCorredor, radius: raioLampada });
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
