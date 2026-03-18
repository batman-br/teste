/* script.js - Malha Integrada Sem Espaços */
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

    // 1. Criar as Prateleiras
    for (let c = 0; c < colunasVerticais - 1; c++) {
        for (let r = 0; r < corredoresHorizontais + 1; r++) {
            let xPrat = margemPerimetral + (c * (larguraPrateleira + larguraCorredor)) + larguraCorredor/2;
            let yPrat = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor));

            prateleiras.push({
                x: xPrat, y: yPrat,
                width: larguraPrateleira, height: alturaSegmentoPrateleira,
                color: corPrateleira
            });

            // Lâmpadas VERTICAIS INTERNAS (apenas as 3 do meio, pois as pontas são do corredor H)
            for (let i = 1; i <= 3; i++) {
                let posY = yPrat + (i * (alturaSegmentoPrateleira / 4));
                // Corredor Esquerdo
                lampadas.push({ x: xPrat - (larguraCorredor/2), y: posY, radius: raioLampada });
                // Corredor Direito (última coluna)
                if (c === colunasVerticais - 2) {
                    lampadas.push({ x: xPrat + larguraPrateleira + (larguraCorredor/2), y: posY, radius: raioLampada });
                }
            }
        }
    }

    // 2. Criar Corredores HORIZONTAIS (Cruzamentos + Lâmpadas de Prateleira)
    for (let r = 0; r < corredoresHorizontais + 2; r++) {
        let yCorredor = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor)) - (larguraCorredor / 2);

        for (let c = 0; c < colunasVerticais; c++) {
            let xCruzamento = margemPerimetral + (c * (larguraPrateleira + larguraCorredor));
            
            // Lâmpada de CRUZAMENTO (Onde V e H se encontram)
            lampadas.push({ x: xCruzamento, y: yCorredor, radius: raioLampada });

            // 2 Lâmpadas HORIZONTAIS no vão da prateleira
            if (c < colunasVerticais - 1) {
                let xInicioPrat = xCruzamento + (larguraCorredor / 2);
                let passoX = larguraPrateleira / 3;
                for (let j = 1; j <= 2; j++) {
                    lampadas.push({ x: xInicioPrat + (j * passoX), y: yCorredor, radius: raioLampada });
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
