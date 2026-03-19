/* script.js - Navegação por Trilhos e Camadas */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

let lampadas = [];
let prateleiras = [];
let eixosX = []; 
let eixosY = []; 

let operador = { 
    x: CONFIG.MARGEM, 
    y: CONFIG.MARGEM, 
    destinoX: CONFIG.MARGEM, 
    destinoY: CONFIG.MARGEM, 
    emTransito: false
};

function inicializar() {
    lampadas = [];
    prateleiras = [];
    eixosX = [];
    eixosY = [];

    // 1. Mapeamento de Corredores e Sensores
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        if (!eixosY.includes(y)) eixosY.push(y);

        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V);
            if (!eixosX.includes(x)) eixosX.push(x);

            lampadas.push({ x, y, isNo: true }); // Nós de Cruzamento

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

    // 2. Construção Visual das Prateleiras
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

// Interação de clique com "Snap" no corredor
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    // Trava o destino final nos eixos reais de sensores
    operador.destinoX = eixosX.reduce((prev, curr) => Math.abs(curr - mouseX) < Math.abs(prev - mouseX) ? curr : prev);
    operador.destinoY = eixosY.reduce((prev, curr) => Math.abs(curr - mouseY) < Math.abs(prev - mouseY) ? curr : prev);
    
    operador.emTransito = true;
});

function atualizarMovimento() {
    if (!operador.emTransito) return;

    // Verifica se o operador está exatamente sobre um trilho vertical ou horizontal
    const sobreEixoX = eixosX.some(ex => Math.abs(operador.x - ex) < 1);
    const sobreEixoY = eixosY.some(ey => Math.abs(operador.y - ey) < 1);

    // Lógica de Navegação Segura:
    // Se precisar mudar de X, mas não estiver em um corredor horizontal (Eixo Y), 
    // ele deve primeiro se mover em Y até encontrar um cruzamento.
    
    let distDX = Math.abs(operador.x - operador.destinoX);
    let distDY = Math.abs(operador.y - operador.destinoY);

    if (distDX > 1 && sobreEixoY) {
        // Movimento Horizontal Seguro
        operador.x += (operador.destinoX > operador.x ? 1 : -1) * CONFIG.VELOCIDADE_OPERADOR;
    } else if (distDY > 1 && sobreEixoX) {
        // Movimento Vertical Seguro
        operador.y += (operador.destinoY > operador.y ? 1 : -1) * CONFIG.VELOCIDADE_OPERADOR;
    } else {
        // Chegou ou está em um estado inválido, para o trânsito
        if (distDX <= 1 && distDY <= 1) operador.emTransito = false;
    }
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Camada de Prateleiras (Fundo)
    ctx.fillStyle = "#87CEFA";
    prateleiras.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // 2. Camada do Operador (Abaixo dos Sensores)
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 12, operador.y - 12, 24, 24);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(operador.x - 12, operador.y - 12, 24, 24);

    // 3. Camada de Sensores (Topo)
    lampadas.forEach(l => {
        ctx.beginPath();
        ctx.arc(l.x, l.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
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
