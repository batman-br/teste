/* script.js - Foco em Movimentação por Corredores e Camadas */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

// 1. Configurações de Movimento (Mais lento e preciso)
const VELOCIDADE = 2; 

let lampadas = [];
let prateleiras = [];
let operador = { 
    x: CONFIG.MARGEM, 
    y: CONFIG.MARGEM, 
    destinoX: CONFIG.MARGEM, 
    destinoY: CONFIG.MARGEM, 
    emTransito: false,
    fase: 'parado' // 'horizontal', 'vertical' ou 'parado'
};

function inicializar() {
    lampadas = [];
    prateleiras = [];

    // Gerar Matriz de Lâmpadas (Mesmo cálculo de grade perfeito)
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V);
            lampadas.push({ x, y, brilho: 0, detectado: false });

            if (c < CONFIG.NUM_EIXOS_V - 1) {
                let passo = (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V) / 3;
                for (let i = 1; i <= 2; i++) lampadas.push({ x: x + (i * passo), y, brilho: 0 });
            }
            if (r < CONFIG.NUM_EIXOS_H - 1) {
                let passo = (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H) / 6;
                for (let j = 1; j <= 5; j++) lampadas.push({ x, y: y + (j * passo), brilho: 0 });
            }
        }
    }

    // Gerar Prateleiras
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

// Lógica de Destino Inteligente (Sempre trava no corredor mais próximo)
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    // Achar o corredor mais próximo (alinhamento automático)
    let eixosX = [...new Set(lampadas.map(l => l.x))];
    let eixosY = [...new Set(lampadas.map(l => l.y))];

    operador.destinoX = eixosX.reduce((prev, curr) => Math.abs(curr - mouseX) < Math.abs(prev - mouseX) ? curr : prev);
    operador.destinoY = eixosY.reduce((prev, curr) => Math.abs(curr - mouseY) < Math.abs(prev - mouseY) ? curr : prev);
    
    operador.emTransito = true;
});

function atualizarMovimento() {
    if (!operador.emTransito) return;

    // MOVIMENTO EM "L": Primeiro resolve o X, depois o Y (ou vice-versa)
    // Isso garante que ele só ande por onde existem lâmpadas (corredores)
    if (Math.abs(operador.x - operador.destinoX) > 1) {
        operador.x += (operador.destinoX > operador.x ? 1 : -1) * VELOCIDADE;
    } else if (Math.abs(operador.y - operador.destinoY) > 1) {
        operador.y += (operador.destinoY > operador.y ? 1 : -1) * VELOCIDADE;
    } else {
        operador.emTransito = false;
    }
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. DESENHAR PRATELEIRAS (Fundo)
    ctx.fillStyle = "#87CEFA";
    prateleiras.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = "#5ba8d4";
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    });

    // 2. DESENHAR OPERADOR (Meio - agora fica atrás das lâmpadas)
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 12, operador.y - 12, 24, 24);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(operador.x - 12, operador.y - 12, 24, 24);

    // 3. DESENHAR LÂMPADAS/SENSORES (Topo)
    lampadas.forEach(l => {
        // Sensor Físico
        ctx.beginPath();
        ctx.arc(l.x, l.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();
        ctx.closePath();
    });
}

function loop() {
    atualizarMovimento();
    desenhar();
    requestAnimationFrame(loop);
}

inicializar();
