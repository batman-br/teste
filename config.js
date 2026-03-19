/* config.js - V4 */
const CONFIG = {
    LAMPADAS_VERTICAL: 7,    
    LAMPADAS_HORIZONTAL: 3,  
    ESPACO_LAMPADA: 36,      
    NUM_EIXOS_V: 10,          
    NUM_EIXOS_H: 4,         
    MARGEM: 60,

    VELOCIDADE_OPERADOR: 2.5,  
    
    // Configurações Físicas
    RAIO_DETECCAO: 10,        

    // Modo Reativo
    TEMPO_REATIVO_MS: 8000,   
    
    // Modo Preditivo (Máquina de Estados)
    X_PREDITIVO: 8,           // Lâmpadas projetadas à frente
    Y_TIMEOUT_PARADA: 3000,   // Tempo (ms) para ativar modo de trabalho
    Z_BOLHA_LADOS: 1,         // Lâmpadas vizinhas na parada
    W_ESQUINA_LADOS: 1,       // Lâmpadas transversais na esquina
    DISTANCIA_FADE: 2,        // Lâmpadas que continuam acesas atrás do operador
    FADE_SPEED: 0.08          // Velocidade da transição de luz (0.01 a 1.0)
};

// Geometria
CONFIG.CORREDOR_W = CONFIG.ESPACO_LAMPADA; 
CONFIG.CORREDOR_H = CONFIG.ESPACO_LAMPADA;
CONFIG.LARGURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_HORIZONTAL + 1) - CONFIG.CORREDOR_W;
CONFIG.ALTURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_VERTICAL + 1) - CONFIG.CORREDOR_H;
