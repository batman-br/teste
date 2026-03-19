/* config.js - Configuração Proporcional */
const CONFIG = {
    // Agora com 7 lâmpadas no longo e 3 no largo
    LAMPADAS_VERTICAL: 7,    
    LAMPADAS_HORIZONTAL: 3,  
    
    // Mantendo o passo de 40px para um visual limpo
    ESPACO_LAMPADA: 40,      

    // 8 eixos verticais = 7 colunas de prateleiras
    // 12 eixos horizontais = 11 linhas de prateleiras
    NUM_EIXOS_V: 8,          
    NUM_EIXOS_H: 12,         
    MARGEM: 60,

    VELOCIDADE_OPERADOR: 2,  
    RAIO_DETECCAO: 30,

    // Parâmetros para o próximo passo (Iluminação)
    LIGADAS_AFRENTE: 4,
    TAXA_FADE: 0.015
};

// Cálculos automáticos de tamanho
CONFIG.CORREDOR_W = CONFIG.ESPACO_LAMPADA; 
CONFIG.CORREDOR_H = CONFIG.ESPACO_LAMPADA;
CONFIG.LARGURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_HORIZONTAL + 1) - CONFIG.CORREDOR_W;
CONFIG.ALTURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_VERTICAL + 1) - CONFIG.CORREDOR_H;
