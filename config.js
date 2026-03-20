/* config.js - V4 */
const CONFIG = {
    LAMPADAS_VERTICAL: 4,    
    LAMPADAS_HORIZONTAL: 2,  
    ESPACO_LAMPADA: 60,      
    NUM_EIXOS_V: 9,          
    NUM_EIXOS_H: 4,         
    MARGEM: 30,

    VELOCIDADE_OPERADOR: 3,  
    
    // Configurações Físicas
    RAIO_DETECCAO: 10,        

    // Modo Reativo
    TEMPO_REATIVO_MS: 6000,   
    
    // Modo Preditivo (Máquina de Estados)
    X_PREDITIVO: 6,           // Lâmpadas projetadas à frente
    Y_TIMEOUT_PARADA: 3000,   // Tempo (ms) para ativar modo de trabalho
    Z_BOLHA_LADOS: 1,         // Lâmpadas vizinhas na parada
    W_ESQUINA_LADOS: 1,       // Lâmpadas transversais na esquina
    DISTANCIA_FADE: 1,        // Lâmpadas que continuam acesas atrás do operador
    FADE_SPEED: 0.05          // Velocidade da transição de luz (0.01 a 1.0)
};

// Geometria
CONFIG.CORREDOR_W = CONFIG.ESPACO_LAMPADA; 
CONFIG.CORREDOR_H = CONFIG.ESPACO_LAMPADA;
CONFIG.LARGURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_HORIZONTAL + 1) - CONFIG.CORREDOR_W;
CONFIG.ALTURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_VERTICAL + 1) - CONFIG.CORREDOR_H;
