/* script.js */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');
let modoPreditivo = false; // Começa como reativo

let lampadas = [];
let prateleiras = [];
let eixosX = []; 
let eixosY = []; 
let operador = { x: CONFIG.MARGEM, y: CONFIG.MARGEM, rota: [], isMoving: false };

function inicializar() {
    lampadas = []; prateleiras = []; eixosX = []; eixosY = [];
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        eixosY.push(y);
        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_W);
            if (r === 0) eixosX.push(x);
            // Cada lâmpada agora rastreia seu último acionamento e estado de detecção
            let criarLampada = (lx, ly) => ({ 
                x: lx, y: ly, brilho: 0, ultimoTrigger: 0, detectando: false 
            });
            lampadas.push(criarLampada(x, y));
            if (c < CONFIG.NUM_EIXOS_V - 1) {
                for (let i = 1; i <= CONFIG.LAMPADAS_HORIZONTAL; i++) 
                    lampadas.push(criarLampada(x + (i * CONFIG.ESPACO_LAMPADA), y));
            }
            if (r < CONFIG.NUM_EIXOS_H - 1) {
                for (let j = 1; j <= CONFIG.LAMPADAS_VERTICAL; j++) 
                    lampadas.push(criarLampada(x, y + (j * CONFIG.ESPACO_LAMPADA)));
            }
        }
    }
    // (Geração de prateleiras omitida para brevidade, manter a mesma do passo anterior)
    gerarPrateleiras();
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

    // Lógica Preditiva
    if (modoPreditivo && operador.rota.length > 0) {
        let alvo = operador.rota[0];
        let dx = alvo.x - operador.x, dy = alvo.y - operador.y;
        let dist = Math.sqrt(dx*dx + dy*dy) || 1;
        let proj = CONFIG.LIGADAS_AFRENTE * CONFIG.ESPACO_LAMPADA;
        focoX = operador.x + (dx / dist) * proj;
        focoY = operador.y + (dy / dist) * proj;
    }

    lampadas.forEach(l => {
        let dOperador = Math.sqrt((l.x - operador.x)**2 + (l.y - operador.y)**2);
        let dFoco = Math.sqrt((l.x - focoX)**2 + (l.y - focoY)**2);

        // O sinal de "detectando" só aparece se houver movimento E proximidade
        l.detectando = (operador.isMoving && dOperador < CONFIG.RAIO_DETECCAO);

        // Gatilho de acendimento
        if (l.detectando || (modoPreditivo && operador.isMoving && dFoco < CONFIG.RAIO_DETECCAO * 1.5)) {
            l.ultimoTrigger = agora;
            l.brilho = 1;
        } else {
            // Se o tempo de permanência acabou, começa o fade out
            if (agora - l.ultimoTrigger > CONFIG.TEMPO_LIGADA_MS) {
                l.brilho = Math.max(0, l.brilho - CONFIG.TAXA_FADE);
            }
        }
    });
}

function atualizarMovimento() {
    if (operador.rota.length === 0) {
        operador.isMoving = false;
        return;
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

    // Lâmpadas
    lampadas.forEach(l => {
        // Sensor base
        ctx.beginPath();
        ctx.arc(l.x, l.y, 2, 0, 7);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fill();

        if (l.brilho > 0) {
            // Luz (Glow)
            ctx.beginPath();
            ctx.arc(l.x, l.y, 15, 0, 7);
            ctx.fillStyle = `rgba(255, 255, 0, ${l.brilho * 0.2})`;
            ctx.fill();
        }

        if (l.detectando) {
            // Sinal Visual de Detecção (Apenas em movimento)
            ctx.beginPath();
            ctx.arc(l.x, l.y, 4, 0, 7);
            ctx.strokeStyle = "#FF4500";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

function loop() {
    atualizarMovimento();
    atualizarIluminacao();
    desenhar();
    requestAnimationFrame(loop);
}
// ... (mantenha calcularRota e eventos de clique)
inicializar();
