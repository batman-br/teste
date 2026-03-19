/* script.js - Lógica de Iluminação Preditiva */

// ... (Mantenha o inicializar e calcularRota como estão) ...

function atualizarIluminacao() {
    // 1. Determinar a direção (Vetor) do operador
    let focoX = operador.x;
    let focoY = operador.y;

    if (operador.rota.length > 0) {
        let alvo = operador.rota[0];
        let dx = alvo.x - operador.x;
        let dy = alvo.y - operador.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        
        // Projeta o foco de luz à frente (LIGADAS_AFRENTE * ESPAÇO)
        let multiplicador = CONFIG.LIGADAS_AFRENTE * CONFIG.ESPACO_LAMPADA;
        focoX = operador.x + (dx / dist) * multiplicador;
        focoY = operador.y + (dy / dist) * multiplicador;
    }

    // 2. Atualizar cada lâmpada
    lampadas.forEach(l => {
        // Distância até o operador (Luz local)
        let dOperador = Math.sqrt((l.x - operador.x)**2 + (l.y - operador.y)**2);
        // Distância até o foco (Luz preditiva)
        let dFoco = Math.sqrt((l.x - focoX)**2 + (l.y - focoY)**2);

        // Se estiver perto do operador ou do foco, o brilho sobe para 1
        if (dOperador < CONFIG.RAIO_DETECCAO || dFoco < CONFIG.RAIO_DETECCAO * 1.5) {
            l.brilho = 1;
        } else {
            // Caso contrário, aplica o Fade Out gradual definido no config
            l.brilho = Math.max(0, l.brilho - CONFIG.TAXA_FADE);
        }
    });
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

    // 3. Lâmpadas com Brilho Dinâmico
    lampadas.forEach(l => {
        if (l.brilho > 0) {
            // Auréola de luz (Glow)
            ctx.beginPath();
            ctx.arc(l.x, l.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 0, ${l.brilho * 0.3})`; // Amarelo suave
            ctx.fill();

            // O Sensor propriamente dito
            ctx.beginPath();
            ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${l.brilho})`; // Dourado intenso
            ctx.fill();
        } else {
            // Sensor apagado (Estado de espera)
            ctx.beginPath();
            ctx.arc(l.x, l.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            ctx.fill();
        }
    });
}

function loop() {
    atualizarMovimento();
    atualizarIluminacao(); // Nova função no loop
    desenhar();
    requestAnimationFrame(loop);
}

inicializar();
