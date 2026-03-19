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
    // ... (Mantenha a mesma lógica de geração de lampadas e prateleiras de antes)
    gerarMalha(); 
    loop();
}

function alternarModo() {
    modoPreditivo = !modoPreditivo;
    const btn = document.getElementById('btnModo');
    btn.innerText = `Modo Atual: ${modoPreditivo ? 'PREDITIVO' : 'REATIVO'}`;
    btn.style.background = modoPreditivo ? '#00BFFF' : '#32CD32';
    // Limpa todas as lâmpadas ao trocar de modo para evitar lixo visual
    lampadas.forEach(l => { l.brilho = 0; l.ultimoTrigger = 0; });
}

function atualizarIluminacao() {
    const agora = Date.now();
    
    // 1. Determinar ponto de foco (apenas para o Preditivo)
    let focoX = operador.x, focoY = operador.y;
    if (modoPreditivo && operador.isMoving && operador.rota.length > 0) {
        let alvo = operador.rota[0];
        let dx = alvo.x - operador.x, dy = alvo.y - operador.y;
        let dist = Math.sqrt(dx*dx + dy*dy) || 1;
        focoX = operador.x + (dx / dist) * (CONFIG.DISTANCIA_PREDITIVA * CONFIG.ESPACO_LAMPADA);
        focoY = operador.y + (dy / dist) * (CONFIG.DISTANCIA_PREDITIVA * CONFIG.ESPACO_LAMPADA);
    }

    lampadas.forEach(l => {
        let dOp = Math.sqrt((l.x - operador.x)**2 + (l.y - operador.y)**2);
        l.detectando = (operador.isMoving && dOp < CONFIG.RAIO_DETECCAO);

        if (modoPreditivo) {
            // REGRA PREDITIVA: Digital (0 ou 1) e Sem Memória
            // Acende APENAS se estiver perto do operador OU no caminho à frente
            let dFoco = Math.sqrt((l.x - focoX)**2 + (l.y - focoY)**2);
            let noCaminho = (operador.isMoving && dFoco < CONFIG.RAIO_DETECCAO * 1.2);
            
            l.brilho = (l.detectando || noCaminho) ? 1 : 0;
        } else {
            // REGRA REATIVA: Digital (0 ou 1) COM Memória de 8s
            if (l.detectando) {
                l.brilho = 1;
                l.ultimoTrigger = agora;
            } else {
                // Se o tempo passou, apaga na hora (sem fade)
                if (agora - l.ultimoTrigger > CONFIG.TEMPO_LIGADA_MS) {
                    l.brilho = 0;
                }
            }
        }
    });
}

// ... (Mantenha as funções desenhar(), atualizarMovimento() e calcularRota() como estavam)

// Funções de Movimento e Desenho (Mesmo anterior, apenas integrando as novas regras de brilho)
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
    ctx.fillStyle = "#2c3e50";
    prateleiras.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 10, operador.y - 10, 20, 20);
    lampadas.forEach(l => {
        ctx.beginPath(); ctx.arc(l.x, l.y, 2, 0, 7);
        ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fill();
        if (l.brilho === 1) { // Só desenha o brilho se estiver no estado 1
            ctx.beginPath(); ctx.arc(l.x, l.y, 18, 0, 7);
            ctx.fillStyle = "rgba(255, 255, 0, 0.25)"; ctx.fill();
            ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, 7);
            ctx.fillStyle = "rgba(255, 215, 0, 1)"; ctx.fill();
        }
        if (l.detectando) {
            ctx.beginPath(); ctx.arc(l.x, l.y, 7, 0, 7);
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

// Inicia após garantir que o DOM e os scripts carregaram
window.onload = inicializar;
