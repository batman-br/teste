/* config.js - Arquitetura de Grade Equidistante */
const CONFIG = {
    // Parâmetros de Densidade (Suas novas definições)
    LAMPADAS_VERTICAL: 8,    // 8 lâmpadas ao longo da prateleira
    LAMPADAS_HORIZONTAL: 3,  // 3 lâmpadas na largura do corredor
    
    // O "Módulo" (Distância exata entre cada lâmpada em pixels)
    ESPACO_LAMPADA: 40,      

    // Malha do Armazém
    NUM_EIXOS_V: 8,          // Quantidade de colunas de corredores
    NUM_EIXOS_H: 12,         // Quantidade de linhas de corredores
    MARGEM: 60,

    // Física e Movimento
    VELOCIDADE_OPERADOR: 2,  
    RAIO_DETECCAO: 30,

    // Iluminação (Preparações para o próximo passo)
    TEMPO_PARA_PARAR: 5000,
    TAXA_FADE: 0.015
};

// Cálculos derivados para manter a proporção automática
CONFIG.CORREDOR_W = CONFIG.ESPACO_LAMPADA; 
CONFIG.CORREDOR_H = CONFIG.ESPACO_LAMPADA;
CONFIG.LARGURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_HORIZONTAL + 1) - CONFIG.CORREDOR_W;
CONFIG.ALTURA_PRATELEIRA = CONFIG.ESPACO_LAMPADA * (CONFIG.LAMPADAS_VERTICAL + 1) - CONFIG.CORREDOR_H;
