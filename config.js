/* config.js - Parâmetros de Ajuste Fino */
const CONFIG = {
    // Geometria (Planta Baixa)
    NUM_EIXOS_V: 8,
    NUM_EIXOS_H: 4,
    LARGURA_PRATELEIRA: 60,
    ALTURA_PRATELEIRA: 180,
    CORREDOR_V: 60,
    CORREDOR_H: 60,
    MARGEM: 80,

    // Física e Movimento
    VELOCIDADE_OPERADOR: 2, // Pixels por frame
    RAIO_DETECCAO: 30,         // Sensibilidade do sensor infravermelho

    // Regras de Iluminação (Para os próximos passos)
    LIGADAS_AFRENTE: 4,
    TEMPO_PARA_PARAR: 5000,
    TAXA_FADE: 0.015
};
