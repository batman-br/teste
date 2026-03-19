/* config.js - Parâmetros da Lógica Preditiva */
const CONFIG = {
    // Geometria do Pavilhão
    NUM_EIXOS_V: 8,
    NUM_EIXOS_H: 4,
    LARGURA_PRATELEIRA: 60,
    ALTURA_PRATELEIRA: 180,
    CORREDOR_V: 60,
    CORREDOR_H: 60,
    MARGEM: 80,

    // Regras de Iluminação
    LIGADAS_AFRENTE: 4,      // Quantas lâmpadas acendem no vetor de movimento
    ADJACENTES_PARADO: 1,    // Lâmpadas de cada lado quando parado (total 3)
    DISTANCIA_ESQUINA: 100,  // Distância para ativar o corredor transversal
    VELOCIDADE_OPERADOR: 3,  // Velocidade do quadrado (px/frame)
    TAXA_FADE: 0.02,         // Velocidade do fade out (0 a 1)
    RAIO_DETECCAO: 30        // Sensibilidade do sensor físico
};
