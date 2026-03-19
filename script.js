/* script.js - Sistema Completo Reativo/Preditivo */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

let modoPreditivo = false; 
let lampadas = [];
let prateleiras = [];
let eixosX = []; 
let eixosY = []; 
let operador = { x: CONFIG.MARGEM, y: CONFIG.MARGEM, rota: [], isMoving: false };

function inicializar() {
    lampadas = []; prateleiras = []; eixosX = []; eixosY = [];

    // 1. Geração da Malha de Sensores
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        eixosY.push(y);

        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_W);
            if (r === 0) eixosX.push(x);

            const criarL = (lx, ly) => ({ x: lx, y: ly, brilho: 0, ultimoTrigger: 0, detectando: false });

            lampadas.push(criarL(x, y)); // Nó principal

            if (c < CONFIG.NUM_EIXOS_V - 1) {
                for (let i = 1; i <= CONFIG.LAMPADAS_HORIZONTAL; i++) 
                    lampadas.push(criarL(x + (i * CONFIG.ESPACO_LAMPADA), y));
            }
            if (r < CONFIG.NUM_EIXOS_H - 1) {
                for (let j = 1; j <= CONFIG.LAMPADAS_VERTICAL; j++) 
                    lampadas.push(criarL(x, y + (j * CONFIG.ESPACO_LAMPADA)));
            }
        }
    }

    // 2. Geração das Prateleiras
    for (let r = 0; r < CONFIG.NUM_EIXOS_H - 1; r++) {
        for (let c = 0; c < CONFIG.NUM_EIXOS_V - 1; c++) {
            prateleiras.push({
                x: eixosX[c] + (CONFIG.CORREDOR_W / 2),
                y: eixosY[r] + (CONFIG.CORREDOR_H / 2),
                w: CONFIG.LARGURA_PRATELEIRA, h: CONFIG.ALTURA_PRATELEIRA
            });
        }
    }
    loop();
}

function alternarModo() {
    modoPreditivo = !modoPreditivo;
    const btn = document.getElementById('btnModo');
    btn.innerText = `Modo Atual: ${modoPreditivo ? 'PREDITIVO' : 'REATIVO'}`;
    btn.style.background = modoPreditivo ? '#00BFFF' : '#32CD32';
}

function atualizarIluminacao() {
    const agora = Date.now();
    let focoX = operador.x, focoY = operador.y;

    if (modoPreditivo && operador.isMoving && operador.rota.length > 0) {
        let alvo = operador.rota[0];
        let dx = alvo.x - operador.x, dy = alvo.y - operador.y;
        let dist = Math.sqrt(dx*dx + dy*dy) || 1;
        let proj = CONFIG.LIGADAS_AFRENTE * CONFIG.ESPACO_LAMPADA;
        focoX = operador.x + (dx / dist) * proj;
        focoY = operador.y + (dy / dist) * proj;
    }

    lampadas.forEach(l => {
        let dOp = Math.sqrt((l.x - operador.x)**2 + (l.y - operador.y)**2);
        let dFoco = Math.sqrt((l.x - focoX)**2 + (l.y - focoY)**2);

        // Detecção física (Sinal laranja)
        l.detectando = (operador.isMoving && dOp < CONFIG.RAIO_DETECCAO);

        // Lógica de acendimento
        if (l.detectando || (modoPreditivo && operador.isMoving && dFoco < CONFIG.RAIO_DETECCAO * 1.2)) {
            l.brilho = 1;
            l.ultimoTrigger = agora;
        } else if (agora - l.ultimoTrigger > CONFIG.TEMPO_LIGADA_MS) {
            l.brilho = Math.max(0, l.brilho - CONFIG.TAXA_FADE);
        }
    });
}

function atualizarMovimento() {
    if (operador.rota.length === 0) {
        operador.isMoving = false; return;
    }
    operador.isMoving = true;
    let alvo = operador.rota[0];
    let dx = alvo.x - operador.x, dy = alvo.y - operador.y;
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
    
    // Prateleiras
    ctx.fillStyle = "#2c3e50";
    prateleiras.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    // Operador
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 10, operador.y - 10, 20, 20);
    ctx.strokeStyle = "#fff"; ctx.strokeRect(operador.x - 10, operador.y - 10, 20, 20);

    // Lâmpadas
    lampadas.forEach(l => {
        // Ponto do sensor (sempre visível mas discreto)
        ctx.beginPath(); ctx.arc(l.x, l.y, 2, 0, 7);
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fill();

        if (l.brilho > 0) {
            // Luz amarela
            ctx.beginPath(); ctx.arc(l.x, l.y, 18, 0, 7);
            ctx.fillStyle = `rgba(255, 255, 0, ${l.brilho * 0.25})`; ctx.fill();
            
            ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, 7);
            ctx.fillStyle = `rgba(255, 215, 0, ${l.brilho})`; ctx.fill();
        }

        if (l.detectando) {
            // Círculo de detecção ativa (Laranja)
            ctx.beginPath(); ctx.arc(l.x, l.y, 6, 0, 7);
            ctx.strokeStyle = "#FF4500"; ctx.lineWidth = 2; ctx.stroke();
        }
    });
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;
    let cX = eixosX.reduce((p, c) => Math.abs(c - mx) < Math.abs(p - mx) ? c : p);
    let cY = eixosY.reduce((p, c) => Math.abs(c - my) < Math.abs(p - my) ? c : p);
    let aX, aY;
    if (Math.abs(mx - cX) < Math.abs(my - cY)) { aX = cX; aY = my; } 
    else { aY = cY; aX = mx; }
    operador.rota = calcularRota(operador.x, operador.y, aX, aY);
});

function calcularRota(sX, sY, eX, eY) {
    let r = [];
    let isX = eixosX.some(ex => Math.abs(sX - ex) < 1);
    if (Math.abs(sX - eX) < 1 || Math.abs(sY - eY) < 1) { r.push({ x: eX, y: eY }); } 
    else {
        if (isX) {
            let cY = eixosY.reduce((p, c) => Math.abs(c - eY) < Math.abs(p - eY) ? c : p);
            r.push({ x: sX, y: cY }, { x: eX, y: cY });
        } else {
            let cX = eixosX.reduce((p, c) => Math.abs(c - eX) < Math.abs(p - eX) ? c : p);
            r.push({ x: cX, y: sY }, { x: cX, y: eY });
        }
        r.push({ x: eX, y: eY });
    }
    return r;
}

function loop() {
    atualizarMovimento();
    atualizarIluminacao();
    desenhar();
    requestAnimationFrame(loop);
}

inicializar();
