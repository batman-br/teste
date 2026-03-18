/* script.js - Versão com Configuração Dinâmica */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

// ==========================================
// PAINEL DE CONTROLE DO PAVILHÃO
// Mude os números abaixo para alterar o mapa
// ==========================================
const numEixosV = 8;          // Quantidade de corredores verticais
const numEixosH = 4;          // Quantidade de corredores horizontais
const larguraPrateleira = 60; // Largura do bloco azul
const alturaPrateleira = 180; // Altura do bloco azul
const larguraCorredorV = 60;  // Vão vertical entre prateleiras
const larguraCorredorH = 60;  // Vão horizontal entre prateleiras
const margem = 80;            // Espaço das bordas do canvas
// ==========================================

const raioLampada = 5;
const corPrateleira = '#87CEFA';
const corLampadaApagada = 'rgba(200, 200, 200, 0.4)';

let lampadas = [];
let prateleiras = [];

function inicializarMapa() {
    lampadas = [];
    prateleiras = [];

    // 1. GERAR TODAS AS LÂMPADAS (MATRIZ DINÂMICA)
    for (let r = 0; r < numEixosH; r++) {
        let yBase = margem + r * (alturaPrateleira + larguraCorredorH);

        for (let c = 0; c < numEixosV; c++) {
            let xBase = margem + c * (larguraPrateleira + larguraCorredorV);

            // Lâmpada de Cruzamento
            lampadas.push({ x: xBase, y: yBase, radius: raioLampada });

            // Lâmpadas horizontais entre os eixos
            if (c < numEixosV - 1) {
                let passoX = (larguraPrateleira + larguraCorredorV) / 3;
                for (let i = 1; i <= 2; i++) {
                    lampadas.push({ x: xBase + (i * passoX), y: yBase, radius: raioLampada });
                }
            }

            // Lâmpadas verticais entre os eixos
            if (r < numEixosH - 1) {
                let passoY = (alturaPrateleira + larguraCorredorH) / 6;
                for (let j = 1; j <= 5; j++) {
                    lampadas.push({ x: xBase, y: yBase + (j * passoY), radius: raioLampada });
                }
            }
        }
    }

    // 2. GERAR PRATELEIRAS NOS VÃOS
    for (let r = 0; r < numEixosH - 1; r++) {
        for (let c = 0; c < numEixosV - 1; c++) {
            let xP = margem + c * (larguraPrateleira + larguraCorredorV) + (larguraCorredorV / 2);
            let yP = margem + r * (alturaPrateleira + larguraCorredorH) + (larguraCorredorH / 2);

            prateleiras.push({
                x: xP, y: yP,
                width: larguraPrateleira,
                height: alturaPrateleira,
                color: corPrateleira
            });
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
