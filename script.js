/* script.js - Versão Alinhamento de Extremidades */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

const colunasVerticais = 8;
const corredoresHorizontais = 3; 
const margemPerimetral = 80; 
const larguraPrateleira = 55; // Ajuste fino na largura
const alturaSegmentoPrateleira = 180; 
const larguraCorredor = 65; // Corredor um pouco mais largo para respiro
const raioLampada = 5;

const corPrateleira = '#87CEFA';
const corLampadaApagada = 'rgba(200, 200, 200, 0.4)';

let prateleiras = [];
let lampadas = [];

function inicializarMapa() {
    prateleiras = [];
    lampadas = [];

    // 1. Criar Prateleiras e Lâmpadas Verticais (Alinhadas às extremidades)
    for (let c = 0; c < colunasVerticais - 1; c++) {
        for (let r = 0; r < corredoresHorizontais + 1; r++) {
            let xPrat = margemPerimetral + (c * (larguraPrateleira + larguraCorredor)) + larguraCorredor/2;
            let yPrat = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor));

            prateleiras.push({
                x: xPrat, y: yPrat,
                width: larguraPrateleira, height: alturaSegmentoPrateleira,
                color: corPrateleira
            });

            // Lâmpadas Verticais: 5 lâmpadas do topo à base da prateleira
            for (let i = 0; i < 5; i++) {
                let posY = yPrat + (i * (alturaSegmentoPrateleira / 4));
                
                // Corredor Esquerdo
                lampadas.push({ x: xPrat - (larguraCorredor/2), y: posY, radius: raioLampada });
                // Corredor Direito (apenas na última coluna de prateleiras)
                if (c === colunasVerticais - 2) {
                    lampadas.push({ x: xPrat + larguraPrateleira + (larguraCorredor/2), y: posY, radius: raioLampada });
                }
            }
        }
    }

    // 2. Lâmpadas Horizontais (Cruzamentos + 2 Internas)
    for (let r = 0; r < corredoresHorizontais + 2; r++) {
        let yCorredor = margemPerimetral + (r * (alturaSegmentoPrateleira + larguraCorredor)) - (larguraCorredor / 2);
        
        // Ajuste para a última linha horizontal (corredor inferior)
        if (r === corredoresHorizontais + 1) {
             yCorredor = margemPerimetral + ((r-1) * (alturaSegmentoPrateleira + larguraCorredor)) + alturaSegmentoPrateleira + (larguraCorredor / 2);
        }

        for (let c = 0; c < colunasVerticais; c++) {
            let xCruzamento = margemPerimetral + (c * (larguraPrateleira + larguraCorredor));
            
            // Lâmpada do Cruzamento
            lampadas.push({ x: xCruzamento, y: yCorredor, radius: raioLampada });

            // 2 Lâmpadas entre os cruzamentos (espaço da prateleira)
            if (c < colunasVerticais - 1) {
                let xInicioEspaco = xCruzamento + (larguraCorredor/2);
                for (let j = 1; j <= 2; j++) {
                    let posX = xCruzamento + (larguraCorredor/2) + (j * (larguraPrateleira / 3));
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
