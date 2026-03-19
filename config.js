/* config.js */
const CONFIG = {
    // Geometria da Planta
    NUM_EIXOS_V: 8,
    NUM_EIXOS_H: 12,          // 12 corredores horizontais
    LARGURA_PRATELEIRA: 80,   // Ajustei levemente para caber as 8 lâmpadas
    ALTURA_PRATELEIRA: 120,   
    CORREDOR_V: 80,
    CORREDOR_H: 60,
    MARGEM: 60,

    // Densidade de Lâmpadas
    LAMPADAS_POR_TRECHO_H: 8, // 8 lâmpadas entre colunas
    LAMPADAS_POR_TRECHO_V: 3, // 3 lâmpadas entre corredores

    // Física e Movimento
    VELOCIDADE_OPERADOR: 2,   // Conforme sua escolha
    RAIO_DETECCAO: 30,

    // Iluminação
    LIGADAS_AFRENTE: 4,
    TEMPO_PARA_PARAR: 5000,
    TAXA_FADE: 0.015
};
