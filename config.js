/* config.js - Galpão Largo (12x3) */
const CONFIG = {
    LAMPADAS_VERTICAL: 7,    
    LAMPADAS_HORIZONTAL: 3,  
    
    ESPACO_LAMPADA: 36,      

    // 12 eixos verticais (muitas colunas)
    // 3 eixos horizontais (poucas linhas)
    NUM_EIXOS_V: 10,          
    NUM_EIXOS_H: 4,         
    MARGEM: 60,

    VELOCIDADE_OPERADOR: 2,  
    RAIO_DETECCAO: 30,

    // Iluminação
    LIGADAS_AFRENTE: 4,
    TAXA_FADE: 0.015
};

// O cálculo automático garante que as prateleiras se ajustem
CONFIG.CORREDOR_W = CONFIG.ESPACO_LAMPADA; 
CONFIG.CORREDOR_H = CONFIG.ESPACO_LAMPADA;
CONFIG.LARGURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_HORIZONTAL + 1) - CONFIG.CORREDOR_W;
CONFIG.ALTURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_VERTICAL + 1) - CONFIG.CORREDOR_H;
