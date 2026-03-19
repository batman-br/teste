/* script.js */
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
    gerarMalha();
    requestAnimationFrame(loop);
}

function gerarMalha() {
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        eixosY.push(y);
        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_W);
            if (r === 0) eixosX.push(x);
            const addL = (lx, ly) => ({ x: lx, y: ly, acesa: false, ultimoTrigger: 0, detectando: false });
            
            lampadas.push(addL(x, y)); 
            if (c < CONFIG.NUM_EIXOS_V - 1) {
                for (let i = 1; i <= CONFIG.LAMPADAS_HORIZONTAL; i++) 
                    lampadas.push(addL(x + (i * CONFIG.ESPACO_LAMPADA), y));
            }
            if (r < CONFIG.NUM_EIXOS_H - 1) {
                for (let j = 1; j <= CONFIG.LAMPADAS_VERTICAL; j++) 
                    lampadas.push(addL(x, y + (j * CONFIG.ESPACO_LAMPADA)));
            }
        }
    }
    for (let r = 0; r < CONFIG.NUM_EIXOS_H - 1; r++) {
        for (let c = 0; c < CONFIG.NUM_EIXOS_V - 1; c++) {
            prateleiras.push({
                x: eixosX[c] + (CONFIG.CORREDOR_W / 2),
                y: eixosY[r] + (CONFIG.CORREDOR_H / 2),
                w: CONFIG.LARGURA_PRATELEIRA, h: CONFIG.ALTURA_PRATELEIRA
            });
        }
    }
}

function atualizarIluminacao() {
    const agora = Date.now();
    
    // Identificar direção do movimento
    let dx = 0, dy = 0;
    if (operador.isMoving && operador.rota.length > 0) {
        dx = operador.rota[0].x - operador.x;
        dy = operador.rota[0].y - operador.y;
    }

    lampadas.forEach(l => {
        let dOp = Math.sqrt((l.x - operador.x)**2 + (l.y - operador.y)**2);
        l.detectando = (operador.isMoving && dOp < CONFIG.RAIO_DETECCAO);

        if (modoPreditivo) {
            if (l.detectando) {
                l.acesa = true;
            } else if (operador.isMoving) {
                // Lógica de Vetor: Lâmpada está na frente do operador?
                let relX = l.x - operador.x;
                let relY = l.y - operador.y;
                
                // Produto escalar para saber se a lâmpada está na direção do movimento
                let dot = (relX * dx + relY * dy);
                let distSq = relX * relX + relY * relY;
                
                // Acende se estiver alinhada ao eixo de movimento e dentro do alcance à frente
                let alinhada = (Math.abs(relX) < 5 || Math.abs(relY) < 5);
                let noAlcance = distSq < (CONFIG.DISTANCIA_PREDITIVA * CONFIG.ESPACO_LAMPADA)**2;
                
                l.acesa = (dot > 0 && alinhada && noAlcance);
            } else {
                l.acesa = false;
            }
        } else {
            // Reativo (Físico 100%)
            if (l.detectando) {
                l.acesa = true;
                l.ultimoTrigger = agora;
            } else if (agora - l.ultimoTrigger > CONFIG.TEMPO_REATIVO_MS) {
                l.acesa = false;
            }
        }
    });
}

function alternarModo() {
    modoPreditivo = !modoPreditivo;
    const btn = document.getElementById('btnModo');
    btn.innerText = `MODO: ${modoPreditivo ? 'PREDITIVO' : 'REATIVO (8s)'}`;
    btn.style.background = modoPreditivo ? '#00BFFF' : '#32CD32';
    lampadas.forEach(l => { l.acesa = false; l.ultimoTrigger = 0; });
}

// Funções de Desenho e Movimento (mantenha as mesmas do arquivo anterior)
function atualizarMovimento() {
    if (operador.rota.length === 0) { operador.isMoving = false; return; }
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
    ctx.fillStyle = "#1e272e";
    prateleiras.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 8, operador.y - 8, 16, 16); // Operador um pouco menor para o raio 10
    lampadas.forEach(l => {
        ctx.beginPath(); ctx.arc(l.x, l.y, 1.5, 0, 7);
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fill();
        if (l.acesa) {
            ctx.beginPath(); ctx.arc(l.x, l.y, 15, 0, 7);
            ctx.fillStyle = "rgba(255, 255, 0, 0.2)"; ctx.fill();
            ctx.beginPath(); ctx.arc(l.x, l.y, 3, 0, 7);
            ctx.fillStyle = "#FFD700"; ctx.fill();
        }
        if (l.detectando) {
            ctx.beginPath(); ctx.arc(l.x, l.y, 5, 0, 7);
            ctx.strokeStyle = "#FF4500"; ctx.lineWidth = 1.5; ctx.stroke();
        }
    });
}

canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    let mx = e.clientX - r.left, my = e.clientY - r.top;
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

window.onload = inicializar;
