/* script.js - Versão com Física e Inércia */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

let lampadas = [];
let prateleiras = [];
let operador = { x: CONFIG.MARGEM, y: CONFIG.MARGEM, destinoX: CONFIG.MARGEM, destinoY: CONFIG.MARGEM, movendo: false, tempoParado: 0 };
let trilhaSensores = [];

function inicializar() {
    lampadas = [];
    prateleiras = [];
    
    // Gerar Matriz (Mesma lógica robusta anterior)
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V);
            lampadas.push({ x, y, brilho: 0, detectado: false, isNo: true, eixoX: c, eixoY: r });

            if (c < CONFIG.NUM_EIXOS_V - 1) {
                let passo = (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V) / 3;
                for (let i = 1; i <= 2; i++) lampadas.push({ x: x + (i * passo), y, brilho: 0, detectado: false, eixoY: r });
            }
            if (r < CONFIG.NUM_EIXOS_H - 1) {
                let passo = (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H) / 6;
                for (let j = 1; j <= 5; j++) lampadas.push({ x, y: y + (j * passo), brilho: 0, detectado: false, eixoX: c });
            }
        }
    }
    
    // Gerar Prateleiras para colisão visual
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
    let clickX = e.clientX - rect.left;
    let clickY = e.clientY - rect.top;

    // Lógica de "Caminhar apenas por corredores"
    // Encontra o corredor (X ou Y) mais próximo do clique
    let distH = Math.min(...lampadas.map(l => Math.abs(l.y - clickY)));
    let distV = Math.min(...lampadas.map(l => Math.abs(l.x - clickX)));

    if (distH < distV) {
        operador.destinoY = lampadas.find(l => Math.abs(l.y - clickY) === distH).y;
        operador.destinoX = clickX;
    } else {
        operador.destinoX = lampadas.find(l => Math.abs(l.x - clickX) === distV).x;
        operador.destinoY = clickY;
    }
    operador.movendo = true;
    operador.tempoParado = 0;
});

function processarLogica() {
    let agora = Date.now();

    if (operador.movendo) {
        let dx = operador.destinoX - operador.x;
        let dy = operador.destinoY - operador.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 2) {
            operador.x += (dx/dist) * CONFIG.VELOCIDADE_OPERADOR;
            operador.y += (dy/dist) * CONFIG.VELOCIDADE_OPERADOR;
        } else {
            operador.movendo = false;
            operador.tempoParado = agora;
        }
    }

    lampadas.forEach(l => {
        let d = Math.sqrt(Math.pow(l.x - operador.x, 2) + Math.pow(l.y - operador.y, 2));
        
        // Sensor Físico
        if (d < CONFIG.RAIO_DETECCAO) {
            if (!l.detectado) {
                l.detectado = true;
                registrarPassagem(l);
            }
            l.brilho = 1; // Luz sobre a cabeça sempre 100%
        } else {
            l.detectado = false;
        }

        // LÓGICA DE ESTADOS
        let tempoDesdeParada = operador.movendo ? 0 : (agora - operador.tempoParado);

        if (!operador.movendo && tempoDesdeParada > CONFIG.TEMPO_PARA_PARAR) {
            // MODO ESTÁTICO (1 de cada lado)
            if (d < 100) l.brilho = 1; 
            else if (!l.detectado) l.brilho = Math.max(0, l.brilho - CONFIG.TAXA_FADE);
        } else {
            // MODO DINÂMICO (Vetor Preditivo)
            if (trilhaSensores.length >= 2) {
                let s1 = trilhaSensores[trilhaSensores.length - 2];
                let s2 = trilhaSensores[trilhaSensores.length - 1];
                let vx = s2.x - s1.x;
                let vy = s2.y - s1.y;
                let dot = (l.x - s2.x) * vx + (l.y - s2.y) * vy;
                let distL = Math.sqrt(Math.pow(l.x-s2.x,2)+Math.pow(l.y-s2.y,2));

                if (dot > 0 && distL < (CONFIG.LIGADAS_AFRENTE * 60)) l.brilho = 1;

                // REGRA DA ESQUINA
                if (l.isNo && distL < CONFIG.DISTANCIA_ESQUINA) {
                    lampadas.filter(aux => (Math.abs(aux.x - l.x) < 5 || Math.abs(aux.y - l.y) < 5) && 
                        Math.sqrt(Math.pow(aux.x-l.x,2)+Math.pow(aux.y-l.y,2)) < 70)
                        .forEach(t => t.brilho = 1);
                }
            }
        }

        // Fade out genérico para rastro antigo
        if (!l.detectado && l.brilho > 0) {
            // Se estiver longe do operador, apaga
            if (d > 150) l.brilho = Math.max(0, l.brilho - CONFIG.TAXA_FADE);
        }
    });
}

function registrarPassagem(sensor) {
    if (trilhaSensores[trilhaSensores.length - 1] !== sensor) {
        trilhaSensores.push(sensor);
        if (trilhaSensores.length > 3) trilhaSensores.shift();
    }
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Prateleiras
    ctx.fillStyle = "#87CEFA";
    prateleiras.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
    
    // Lâmpadas
    lampadas.forEach(l => {
        if (l.brilho > 0.1) {
            let g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 30);
            g.addColorStop(0, `rgba(255, 215, 0, ${l.brilho * 0.5})`);
            g.addColorStop(1, "rgba(255, 215, 0, 0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(l.x, l.y, 30, 0, 7); ctx.fill();
        }
        ctx.fillStyle = l.detectado ? "#FF4500" : "rgba(180, 180, 180, 0.3)";
        ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, 7); ctx.fill();
    });

    // Operador
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 10, operador.y - 10, 20, 20);
    ctx.strokeStyle = "#000"; ctx.strokeRect(operador.x - 10, operador.y - 10, 20, 20);
}

function loop() { processarLogica(); desenhar(); requestAnimationFrame(loop); }
inicializar();
