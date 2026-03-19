/* script.js - Sistema de Waypoints (Curvas Perfeitas) */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

let lampadas = [];
let prateleiras = [];
let eixosX = []; 
let eixosY = []; 

let operador = { 
    x: CONFIG.MARGEM, 
    y: CONFIG.MARGEM, 
    rota: [], // Lista de pontos para onde ele deve ir
    emTransito: false
};

function inicializar() {
    lampadas = [];
    prateleiras = [];
    eixosX = [];
    eixosY = [];

    // Mapeamento
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

    // Prateleiras
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
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    // Acha o trilho mais próximo para o destino final
    let finalX = eixosX.reduce((prev, curr) => Math.abs(curr - mouseX) < Math.abs(prev - mouseX) ? curr : prev);
    let finalY = eixosY.reduce((prev, curr) => Math.abs(curr - mouseY) < Math.abs(prev - mouseY) ? curr : prev);

    // 1. Limpa a rota antiga (caso o usuário clique no meio do caminho)
    operador.rota = [];

    // 2. Descobre em qual eixo o operador está alinhado agora
    let noEixoY = eixosY.some(ey => Math.abs(operador.y - ey) < 1);

    // 3. Monta o Plano de Voo (Cria o "cotovelo" se necessário)
    if (operador.x !== finalX && operador.y !== finalY) {
        if (noEixoY) {
            // Se está num corredor horizontal, vai até a esquina X primeiro
            operador.rota.push({ x: finalX, y: operador.y });
        } else {
            // Se está num corredor vertical, vai até a esquina Y primeiro
            operador.rota.push({ x: operador.x, y: finalY });
        }
    }
    
    // Adiciona o destino final à lista
    operador.rota.push({ x: finalX, y: finalY });
    operador.emTransito = true;
});

function atualizarMovimento() {
    if (operador.rota.length === 0) {
        operador.emTransito = false;
        return;
    }

    // Olha para o próximo ponto na lista de tarefas
    let alvo = operador.rota[0];
    let dx = alvo.x - operador.x;
    let dy = alvo.y - operador.y;
    let distancia = Math.sqrt(dx*dx + dy*dy);

    if (distancia <= CONFIG.VELOCIDADE_OPERADOR) {
        // Chegou exatamente no ponto (Snap cravado para evitar overshoot)
        operador.x = alvo.x;
        operador.y = alvo.y;
        // Remove esta tarefa da lista (ele passa para a próxima perna da viagem)
        operador.rota.shift(); 
    } else {
        // Continua caminhando na direção do alvo
        operador.x += (dx / distancia) * CONFIG.VELOCIDADE_OPERADOR;
        operador.y += (dy / distancia) * CONFIG.VELOCIDADE_OPERADOR;
    }
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#87CEFA";
    prateleiras.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 12, operador.y - 12, 24, 24);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(operador.x - 12, operador.y - 12, 24, 24);

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
