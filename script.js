/* script.js - Versão Estável 10x4 com Iluminação */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

let lampadas = [];
let prateleiras = [];
let eixosX = []; 
let eixosY = []; 

let operador = { x: CONFIG.MARGEM, y: CONFIG.MARGEM, rota: [], emTransito: false };

function inicializar() {
    lampadas = []; prateleiras = []; eixosX = []; eixosY = [];

    // 1. Geração da Malha (10x4)
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        eixosY.push(y);

        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_W);
            if (r === 0) eixosX.push(x);

            // Sensor de Cruzamento (Nó)
            lampadas.push({ x, y, isNo: true, brilho: 0 });

            // Sensores Horizontais (3 lâmpadas entre colunas)
            if (c < CONFIG.NUM_EIXOS_V - 1) {
                for (let i = 1; i <= CONFIG.LAMPADAS_HORIZONTAL; i++) {
                    lampadas.push({ x: x + (i * CONFIG.ESPACO_LAMPADA), y, isNo: false, brilho: 0 });
                }
            }

            // Sensores Verticais (7 lâmpadas ao longo da prateleira)
            if (r < CONFIG.NUM_EIXOS_H - 1) {
                for (let j = 1; j <= CONFIG.LAMPADAS_VERTICAL; j++) {
                    lampadas.push({ x, y: y + (j * CONFIG.ESPACO_LAMPADA), isNo: false, brilho: 0 });
                }
            }
        }
    }

    // 2. Prateleiras
    for (let r = 0; r < CONFIG.NUM_EIXOS_H - 1; r++) {
        for (let c = 0; c < CONFIG.NUM_EIXOS_V - 1; c++) {
            prateleiras.push({
                x: eixosX[c] + (CONFIG.CORREDOR_W / 2),
                y: eixosY[r] + (CONFIG.CORREDOR_H / 2),
                w: CONFIG.LARGURA_PRATELEIRA, 
                h: CONFIG.ALTURA_PRATELEIRA
            });
        }
    }
    loop();
}

function atualizarIluminacao() {
    if (lampadas.length === 0) return;

    let focoX = operador.x;
    let focoY = operador.y;

    // Lógica Preditiva: projeta o foco à frente do movimento
    if (operador.rota.length > 0) {
        let alvo = operador.rota[0];
        let dx = alvo.x - operador.x;
        let dy = alvo.y - operador.y;
        let dist = Math.sqrt(dx*dx + dy*dy) || 1;
        
        let projecao = CONFIG.LIGADAS_AFRENTE * CONFIG.ESPACO_LAMPADA;
        focoX = operador.x + (dx / dist) * projecao;
        focoY = operador.y + (dy / dist) * projecao;
    }

    lampadas.forEach(l => {
        let dOperador = Math.sqrt((l.x - operador.x)**2 + (l.y - operador.y)**2);
        let dFoco = Math.sqrt((l.x - focoX)**2 + (l.y - focoY)**2);

        // Se o operador ou o foco de movimento estiverem perto, acende
        if (dOperador < CONFIG.RAIO_DETECCAO || dFoco < CONFIG.RAIO_DETECCAO * 1.5) {
            l.brilho = 1;
        } else {
            // Efeito Fade Out gradual
            l.brilho = Math.max(0, l.brilho - CONFIG.TAXA_FADE);
        }
    });
}

function atualizarMovimento() {
    if (operador.rota.length === 0) { operador.emTransito = false; return; }
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
    
    // 1. Prateleiras
    ctx.fillStyle = "#daeaf5";
    prateleiras.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // 2. Operador
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 10, operador.y - 10, 20, 20);
    ctx.strokeStyle = "#000"; ctx.strokeRect(operador.x - 10, operador.y - 10, 20, 20);

    // 3. Lâmpadas
    lampadas.forEach(l => {
        // Desenha sempre um fundo cinza para o sensor não "sumir"
        ctx.beginPath();
        ctx.arc(l.x, l.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.fill();

        if (l.brilho > 0) {
            // Glow Amarelo
            ctx.beginPath();
            ctx.arc(l.x, l.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 0, ${l.brilho * 0.3})`;
            ctx.fill();

            // Centro Brilhante
            ctx.beginPath();
            ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${l.brilho})`;
            ctx.fill();
        }
    });
}

// Funções de Rota (Idênticas à versão anterior que funcionou)
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;
    let closestX = eixosX.reduce((p, c) => Math.abs(c - mx) < Math.abs(p - mx) ? c : p);
    let closestY = eixosY.reduce((p, c) => Math.abs(c - my) < Math.abs(p - my) ? c : p);
    let alvoX, alvoY;
    if (Math.abs(mx - closestX) < Math.abs(my - closestY)) { alvoX = closestX; alvoY = my; } 
    else { alvoY = closestY; alvoX = mx; }
    operador.rota = calcularRota(operador.x, operador.y, alvoX, alvoY);
    operador.emTransito = true;
});

function calcularRota(startX, startY, endX, endY) {
    let rota = [];
    let noEixoX = eixosX.some(ex => Math.abs(startX - ex) < 1);
    if (Math.abs(startX - endX) < 1 || Math.abs(startY - endY) < 1) {
        rota.push({ x: endX, y: endY });
    } else {
        if (noEixoX) {
            let cornerY = eixosY.reduce((p, c) => Math.abs(c - endY) < Math.abs(p - endY) ? c : p);
            rota.push({ x: startX, y: cornerY }, { x: endX, y: cornerY });
        } else {
            let cornerX = eixosX.reduce((p, c) => Math.abs(c - endX) < Math.abs(p - endX) ? c : p);
            rota.push({ x: cornerX, y: startY }, { x: cornerX, y: endY });
        }
        rota.push({ x: endX, y: endY });
    }
    return rota;
}

function loop() {
    atualizarMovimento();
    atualizarIluminacao();
    desenhar();
    requestAnimationFrame(loop);
}

inicializar();
