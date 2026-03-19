/* script.js - Motor de Eventos e Lógica Preditiva */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');

let lampadas = [];
let prateleiras = [];
let operador = { x: CONFIG.MARGEM, y: CONFIG.MARGEM, destinoX: CONFIG.MARGEM, destinoY: CONFIG.MARGEM, movendo: false };
let trilhaSensores = []; // Histórico de ativação

function inicializar() {
    lampadas = [];
    // Gerar Matriz de Lâmpadas
    for (let r = 0; r < CONFIG.NUM_EIXOS_H; r++) {
        let y = CONFIG.MARGEM + r * (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H);
        for (let c = 0; c < CONFIG.NUM_EIXOS_V; c++) {
            let x = CONFIG.MARGEM + c * (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V);
            
            // Lâmpada de Cruzamento (Nó)
            lampadas.push({ x, y, brilho: 0, detectado: false, isNo: true });

            // Horizontais
            if (c < CONFIG.NUM_EIXOS_V - 1) {
                let passo = (CONFIG.LARGURA_PRATELEIRA + CONFIG.CORREDOR_V) / 3;
                for (let i = 1; i <= 2; i++) lampadas.push({ x: x + (i * passo), y, brilho: 0, detectado: false });
            }
            // Verticais
            if (r < CONFIG.NUM_EIXOS_H - 1) {
                let passo = (CONFIG.ALTURA_PRATELEIRA + CONFIG.CORREDOR_H) / 6;
                for (let j = 1; j <= 5; j++) lampadas.push({ x, y: y + (j * passo), brilho: 0, detectado: false });
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

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    operador.destinoX = e.clientX - rect.left;
    operador.destinoY = e.clientY - rect.top;
    operador.movendo = true;
});

function processarLogica() {
    // Movimento do Operador
    if (operador.movendo) {
        let dx = operador.destinoX - operador.x;
        let dy = operador.destinoY - operador.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 5) {
            operador.x += (dx/dist) * CONFIG.VELOCIDADE_OPERADOR;
            operador.y += (dy/dist) * CONFIG.VELOCIDADE_OPERADOR;
        } else {
            operador.movendo = false;
        }
    }

    // Detecção de Sensores
    lampadas.forEach(l => {
        let d = Math.sqrt(Math.pow(l.x - operador.x, 2) + Math.pow(l.y - operador.y, 2));
        
        if (d < CONFIG.RAIO_DETECCAO) {
            if (!l.detectado) {
                l.detectado = true;
                registrarPassagem(l);
            }
        } else {
            l.detectado = false;
        }

        // Fade out natural
        if (!l.detectado && l.brilho > 0) l.brilho = Math.max(0, l.brilho - CONFIG.TAXA_FADE);
    });

    // APLICAR REGRAS
    if (!operador.movendo) {
        // REGRA: Parada Estática (Luz atual + 1 de cada lado)
        if (trilhaSensores.length > 0) {
            let atual = trilhaSensores[trilhaSensores.length - 1];
            lampadas.forEach(l => {
                let d = Math.sqrt(Math.pow(l.x - atual.x, 2) + Math.pow(l.y - atual.y, 2));
                if (d < 100) l.brilho = 1; // Ajuste simples de adjacência
            });
        }
    } else if (trilhaSensores.length >= 2) {
        // REGRA: Vetor Preditivo (2 sensores detectados)
        let s1 = trilhaSensores[trilhaSensores.length - 2];
        let s2 = trilhaSensores[trilhaSensores.length - 1];
        let vx = s2.x - s1.x;
        let vy = s2.y - s1.y;

        lampadas.forEach(l => {
            let px = l.x - s2.x;
            let py = l.y - s2.y;
            let dot = px * vx + py * vy;
            let dist = Math.sqrt(px*px + py*py);

            // Acender à frente
            if (dot > 0 && dist < (CONFIG.LIGADAS_AFRENTE * 50)) l.brilho = 1;

            // REGRA: Esquina (Cruzamento próximo)
            if (l.isNo && dist < CONFIG.DISTANCIA_ESQUINA) {
                // Acende transversais do nó
                lampadas.filter(aux => (aux.x === l.x || aux.y === l.y) && 
                    Math.sqrt(Math.pow(aux.x-l.x,2)+Math.pow(aux.y-l.y,2)) < 80)
                    .forEach(trans => trans.brilho = 1);
            }
        });
    }
}

function registrarPassagem(sensor) {
    if (trilhaSensores[trilhaSensores.length - 1] !== sensor) {
        trilhaSensores.push(sensor);
        sensor.brilho = 1;
        if (trilhaSensores.length > 3) {
            // REGRA: Apagar o primeiro ao atingir o terceiro
            trilhaSensores[0].brilho = 0.2; 
            trilhaSensores.shift();
        }
    }
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Prateleiras
    ctx.fillStyle = "#87CEFA";
    prateleiras.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
    
    // Lâmpadas
    lampadas.forEach(l => {
        if (l.brilho > 0) {
            let g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 25);
            g.addColorStop(0, `rgba(255, 215, 0, ${l.brilho * 0.6})`);
            g.addColorStop(1, "rgba(255, 215, 0, 0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(l.x, l.y, 25, 0, 7); ctx.fill();
        }
        ctx.fillStyle = l.detectado ? "#FF4500" : "rgba(200, 200, 200, 0.5)";
        ctx.beginPath(); ctx.arc(l.x, l.y, 5, 0, 7); ctx.fill();
    });

    // Operador
    ctx.fillStyle = "#32CD32";
    ctx.fillRect(operador.x - 10, operador.y - 10, 20, 20);
    
    // Debug
    document.getElementById('debug').innerText = `Status: ${operador.movendo ? 'Movendo' : 'Parado'} | Sensores Ativos: ${lampadas.filter(l=>l.detectado).length}`;
}

function loop() {
    processarLogica();
    desenhar();
    requestAnimationFrame(loop);
}
inicializar();
