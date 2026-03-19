/* script.js - V4 */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

let modoPreditivo = false; 
let lampadas = [];
let prateleiras = [];
let eixosX = []; 
let eixosY = []; 

let operador = { 
    x: CONFIG.MARGEM, 
    y: CONFIG.MARGEM, 
    rota: [], 
    isMoving: false,
    tempoUltimoMovimento: Date.now()
};

// Memória Preditiva
let ultimoSensor = null;
let vetorAtual = { x: 0, y: 0 };

function inicializar() {
    lampadas = []; prateleiras = []; eixosX = []; eixosY = [];

    // Gerar Malha
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        eixosY.push(y);
        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_W);
            if (r === 0) eixosX.push(x);

            // brilho (0 a 1) para fade, estadoReativo para binário
            const addL = (lx, ly) => ({ x: lx, y: ly, brilho: 0, estadoReativo: false, alvoPreditivo: false, ultimoTrigger: 0, detectando: false });
            
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

    // Gerar Prateleiras
    for (let r = 0; r < CONFIG.NUM_EIXOS_H - 1; r++) {
        for (let c = 0; c < CONFIG.NUM_EIXOS_V - 1; c++) {
            prateleiras.push({
                x: eixosX[c] + (CONFIG.CORREDOR_W / 2),
                y: eixosY[r] + (CONFIG.CORREDOR_H / 2),
                w: CONFIG.LARGURA_PRATELEIRA, h: CONFIG.ALTURA_PRATELEIRA
            });
        }
    }
    requestAnimationFrame(loop);
}

function alternarModo() {
    modoPreditivo = !modoPreditivo;
    const btn = document.getElementById('btnModo');
    btn.innerText = `MODO: ${modoPreditivo ? 'PREDITIVO' : 'REATIVO'}`;
    btn.style.background = modoPreditivo ? '#00BFFF' : '#32CD32';
    
    // Reset Total
    lampadas.forEach(l => { 
        l.brilho = 0; l.estadoReativo = false; l.alvoPreditivo = false; l.ultimoTrigger = 0; 
    });
    ultimoSensor = null;
    vetorAtual = { x: 0, y: 0 };
}

// Busca uma lâmpada específica na malha pela coordenada
function buscarLampada(x, y) {
    return lampadas.find(l => Math.abs(l.x - x) < 2 && Math.abs(l.y - y) < 2);
}

function atualizarIluminacao() {
    const agora = Date.now();
    
    // 1. Identificar o Sensor Atual Físico (Raio 10)
    let sensorAtivo = null;
    lampadas.forEach(l => {
        let dOp = Math.sqrt((l.x - operador.x)**2 + (l.y - operador.y)**2);
        l.detectando = (dOp < CONFIG.RAIO_DETECCAO);
        if (l.detectando) sensorAtivo = l;
    });

    if (modoPreditivo) {
        // --- MOTOR PREDITIVO (Estado, Vetor e Fade) ---
        
        // Atualiza vetor se mudou de sensor
        if (sensorAtivo && sensorAtivo !== ultimoSensor) {
            if (ultimoSensor) {
                // Descobre a direção (Normalizada para -1, 0 ou 1)
                let dx = Math.sign(sensorAtivo.x - ultimoSensor.x);
                let dy = Math.sign(sensorAtivo.y - ultimoSensor.y);
                if (dx !== 0 || dy !== 0) vetorAtual = { x: dx, y: dy };
            }
            ultimoSensor = sensorAtivo;
        }

        // Resetar alvos para recalcular este frame
        lampadas.forEach(l => l.alvoPreditivo = false);

        if (ultimoSensor) {
            ultimoSensor.alvoPreditivo = true; // Sempre acende onde o operador está

            let tempoParado = agora - operador.tempoUltimoMovimento;
            let isParado = (!operador.isMoving && tempoParado > CONFIG.Y_TIMEOUT_PARADA);

            if (isParado) {
                // ESTADO: PARADA (Bolha Z)
                // Acende Z para frente e Z para trás no eixo atual
                for (let i = 1; i <= CONFIG.Z_BOLHA_LADOS; i++) {
                    let lFrente = buscarLampada(ultimoSensor.x + (vetorAtual.x * i * CONFIG.ESPACO_LAMPADA), ultimoSensor.y + (vetorAtual.y * i * CONFIG.ESPACO_LAMPADA));
                    let lTras = buscarLampada(ultimoSensor.x - (vetorAtual.x * i * CONFIG.ESPACO_LAMPADA), ultimoSensor.y - (vetorAtual.y * i * CONFIG.ESPACO_LAMPADA));
                    if (lFrente) lFrente.alvoPreditivo = true;
                    if (lTras) lTras.alvoPreditivo = true;
                }
            } else {
                // ESTADO: MOVIMENTO (Projeção X e Rastro)
                // Rastro (Distância Fade)
                for (let i = 1; i <= CONFIG.DISTANCIA_FADE; i++) {
                    let lTras = buscarLampada(ultimoSensor.x - (vetorAtual.x * i * CONFIG.ESPACO_LAMPADA), ultimoSensor.y - (vetorAtual.y * i * CONFIG.ESPACO_LAMPADA));
                    if (lTras) lTras.alvoPreditivo = true;
                }
                
                // Projeção Preditiva (X)
                if (vetorAtual.x !== 0 || vetorAtual.y !== 0) {
                    for (let i = 1; i <= CONFIG.X_PREDITIVO; i++) {
                        let lFrente = buscarLampada(ultimoSensor.x + (vetorAtual.x * i * CONFIG.ESPACO_LAMPADA), ultimoSensor.y + (vetorAtual.y * i * CONFIG.ESPACO_LAMPADA));
                        if (lFrente) lFrente.alvoPreditivo = true;
                        else break; // Bateu na parede
                    }
                }

                // ESTADO: ESQUINA (Nó Transversal W)
                let isNodeX = eixosX.some(ex => Math.abs(ex - ultimoSensor.x) < 2);
                let isNodeY = eixosY.some(ey => Math.abs(ey - ultimoSensor.y) < 2);
                
                if (isNodeX && isNodeY) {
                    // Descobre o eixo transversal
                    let transX = Math.abs(vetorAtual.y); 
                    let transY = Math.abs(vetorAtual.x);
                    
                    for (let i = 1; i <= CONFIG.W_ESQUINA_LADOS; i++) {
                        let lEsq1 = buscarLampada(ultimoSensor.x + (transX * i * CONFIG.ESPACO_LAMPADA), ultimoSensor.y + (transY * i * CONFIG.ESPACO_LAMPADA));
                        let lEsq2 = buscarLampada(ultimoSensor.x - (transX * i * CONFIG.ESPACO_LAMPADA), ultimoSensor.y - (transY * i * CONFIG.ESPACO_LAMPADA));
                        if (lEsq1) lEsq1.alvoPreditivo = true;
                        if (lEsq2) lEsq2.alvoPreditivo = true;
                    }
                }
            }
        }

        // Aplica o Fade Suave (Transição Analógica)
        lampadas.forEach(l => {
            if (l.alvoPreditivo) l.brilho = Math.min(1, l.brilho + CONFIG.FADE_SPEED);
            else l.brilho = Math.max(0, l.brilho - CONFIG.FADE_SPEED);
        });

    } else {
        // --- MOTOR REATIVO (Isolado e Intacto) ---
        lampadas.forEach(l => {
            if (l.detectando) {
                l.estadoReativo = true;
                l.ultimoTrigger = agora;
            } else if (agora - l.ultimoTrigger > CONFIG.TEMPO_REATIVO_MS) {
                l.estadoReativo = false; // Binário, sem fade
            }
            // Força o brilho a ser 1 ou 0 para desenhar corretamente
            l.brilho = l.estadoReativo ? 1 : 0; 
        });
    }
}

function atualizarMovimento() {
    if (operador.rota.length === 0) { 
        operador.isMoving = false; 
        return; 
    }
    
    operador.isMoving = true;
    operador.tempoUltimoMovimento = Date.now(); // Reseta o timer da parada enquanto move
    
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
    ctx.fillRect(operador.x - 8, operador.y - 8, 16, 16);

    lampadas.forEach(l => {
        // Base invisível do sensor
        ctx.beginPath(); ctx.arc(l.x, l.y, 1.5, 0, 7);
        ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fill();

        // Só desenha a luz se o brilho for maior que 0 (Economiza processamento)
        if (l.brilho > 0.01) {
            ctx.beginPath(); ctx.arc(l.x, l.y, 15, 0, 7);
            ctx.fillStyle = `rgba(255, 255, 0, ${l.brilho * 0.25})`; ctx.fill();
            
            ctx.beginPath(); ctx.arc(l.x, l.y, 3, 0, 7);
            ctx.fillStyle = `rgba(255, 215, 0, ${l.brilho})`; ctx.fill();
        }

        // Sensor laranja (Feedback físico)
        if (l.detectando) {
            ctx.beginPath(); ctx.arc(l.x, l.y, 5, 0, 7);
            ctx.strokeStyle = "#FF4500"; ctx.lineWidth = 1.5; ctx.stroke();
        }
    });
}

// Interação e Navegação
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
