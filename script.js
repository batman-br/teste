/* script.js - Navegação de Fluxo Logístico */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

let lampadas = [];
let prateleiras = [];
let eixosX = []; 
let eixosY = []; 

let operador = { 
    x: CONFIG.MARGEM, 
    y: CONFIG.MARGEM, 
    rota: [], 
    emTransito: false 
};

function inicializar() {
    lampadas = []; prateleiras = []; eixosX = []; eixosY = [];

    // 1. Mapeamento de Eixos
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        if (!eixosY.includes(y)) eixosY.push(y);
        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V);
            if (!eixosX.includes(x)) eixosX.push(x);
            lampadas.push({ x, y, isNo: true });
            if (c < CONFIG.NUM_EIXOS_V - 1) {
                let passo = (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V) / 3;
                for (let i = 1; i <= 2; i++) lampadas.push({ x: x + (i * passo), y, isNo: false });
            }
            if (r < CONFIG.NUM_EIXOS_H - 1) {
                let passo = (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H) / 6;
                for (let j = 1; j <= 5; j++) lampadas.push({ x, y: y + (j * passo), isNo: false });
            }
        }
    }
    // 2. Prateleiras
    for (let r = 0; r < CONFIG.NUM_EIXOS_H - 1; r++) {
        for (let c = 0; c < CONFIG.NUM_EIXOS_V - 1; c++) {
            prateleiras.push({
                x: CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V) + (CONFIG.CORREDOR_V / 2),
                y: CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H) + (CONFIG.CORREDOR_H / 2),
                w: CONFIG.LARGURA_PRATELEIRA, h: CONFIG.ALTURA_PRATELEIRA
            });
        }
    }
    loop();
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    // Acha qual o corredor (X ou Y) está mais próximo do clique
    let closestX = eixosX.reduce((prev, curr) => Math.abs(curr - mx) < Math.abs(prev - mx) ? curr : prev);
    let closestY = eixosY.reduce((prev, curr) => Math.abs(curr - my) < Math.abs(prev - my) ? curr : prev);

    let alvoX, alvoY;
    if (Math.abs(mx - closestX) < Math.abs(my - closestY)) {
        alvoX = closestX; alvoY = my; // Travou num corredor Vertical
    } else {
        alvoY = closestY; alvoX = mx; // Travou num corredor Horizontal
    }

    // Limites do mapa (para não sair do pavilhão)
    alvoX = Math.max(eixosX[0], Math.min(eixosX[eixosX.length-1], alvoX));
    alvoY = Math.max(eixosY[0], Math.min(eixosY[eixosY.length-1], alvoY));

    operador.rota = calcularRota(operador.x, operador.y, alvoX, alvoY);
    operador.emTransito = true;
});

function calcularRota(startX, startY, endX, endY) {
    let rota = [];
    
    // Onde estou agora?
    let noEixoX = eixosX.some(ex => Math.abs(startX - ex) < 1);
    let noEixoY = eixosY.some(ey => Math.abs(startY - ey) < 1);

    // Onde quero ir está em qual eixo?
    let targetNoEixoX = eixosX.some(ex => Math.abs(endX - ex) < 1);
    let targetNoEixoY = eixosY.some(ey => Math.abs(endY - ey) < 1);

    // Se já estamos no mesmo corredor, vai direto
    if ((noEixoX && targetNoEixoX && startX === endX) || (noEixoY && targetNoEixoY && startY === endY)) {
        rota.push({ x: endX, y: endY });
    } else {
        // Se precisamos trocar de corredor, vamos até o cruzamento (nó)
        if (noEixoX) {
            // Se estou na vertical, vou até a altura (Y) do destino usando um corredor H
            let cruzamentoY = eixosY.reduce((prev, curr) => Math.abs(curr - endY) < Math.abs(prev - endY) ? curr : prev);
            rota.push({ x: startX, y: cruzamentoY });
            rota.push({ x: endX, y: cruzamentoY });
        } else {
            // Se estou na horizontal, vou até a coluna (X) do destino
            let cruzamentoX = eixosX.reduce((prev, curr) => Math.abs(curr - endX) < Math.abs(prev - endX) ? curr : prev);
            rota.push({ x: cruzamentoX, y: startY });
            rota.push({ x: cruzamentoX, y: endY });
        }
        rota.push({ x: endX, y: endY });
    }
    return rota;
}

function atualizarMovimento() {
    if (operador.rota.length === 0) {
        operador.emTransito = false; return;
    }

    let alvo = operador.rota[0];
    let dx = alvo.x - operador.x;
    let dy = alvo.y - operador.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    if (dist <= CONFIG.VELOCIDADE_OPERADOR) {
        operador.x = alvo.x; operador.y = alvo.y;
        operador.rota.shift();
    } else {
        operador.x += (dx / dist) * CONFIG.VELOCIDADE_OPERADOR;
        operador.y += (dy / dist) * CONFIG.VELOCIDADE_OPERADOR;
    }
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#87CEFA";
    prateleiras.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // Operador (Abaixo dos sensores)
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 12, operador.y - 12, 24, 24);
    ctx.strokeStyle = "#000"; ctx.strokeRect(operador.x - 12, operador.y - 12, 24, 24);

    // Sensores
    lampadas.forEach(l => {
        ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, 7);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"; ctx.fill();
    });
}

function loop() { atualizarMovimento(); desenhar(); requestAnimationFrame(loop); }
inicializar();
