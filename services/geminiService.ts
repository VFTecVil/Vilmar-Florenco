import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedScript, ScriptRequest } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 opções de títulos criativos e otimizados para SEO para o vídeo.'
    },
    hook: { 
      type: Type.STRING,
      description: 'Um gancho de 30 a 60 segundos, dependendo do tamanho do vídeo, para prender a atenção do espectador imediatamente.'
    },
    introduction: { 
      type: Type.STRING,
      description: 'Uma introdução de 150 a 250 palavras, dependendo do tamanho do vídeo, que apresenta o tema e termina com um CTA para inscrição e like.'
    },
    mainContent: {
      type: Type.ARRAY,
      description: 'O conteúdo principal do vídeo, dividido em 4 a 8 partes, dependendo do tamanho do vídeo, com um CTA de inscrição e like a cada 2 partes.',
      items: {
        type: Type.OBJECT,
        properties: {
          part: { type: Type.INTEGER, description: 'O número sequencial da parte do conteúdo.' },
          content: { type: Type.STRING, description: 'O texto detalhado para esta parte do roteiro.' },
        },
        required: ['part', 'content']
      },
    },
    conclusion: { 
      type: Type.STRING,
      description: 'Uma conclusão de até 250 palavras que resume os pontos principais e inclui um forte CTA para inscrição, like, comentário e compartilhamento.'
    },
    videoDescription: { 
      type: Type.STRING,
      description: 'Uma descrição de vídeo otimizada para SEO com até 250 palavras.'
    },
    keywords: { 
      type: Type.STRING,
      description: 'Uma linha única com 20 palavras-chave relevantes separadas por vírgula.'
    },
    thumbnailTexts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 opções de texto curtas e impactantes para a thumbnail do vídeo (para teste A/B).'
    },
    thumbnailPrompts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 prompts detalhados para uma IA de geração de imagem criar as 3 thumbnails correspondentes.'
    },
  },
  required: ['titles', 'hook', 'introduction', 'mainContent', 'conclusion', 'videoDescription', 'keywords', 'thumbnailTexts', 'thumbnailPrompts']
};


const buildPrompt = (request: ScriptRequest): string => {
  const wordCountMatch = request.videoLength.match(/(\d[\d.]*)/);
  const targetWords = wordCountMatch ? parseInt(wordCountMatch[1].replace('.', ''), 10) : 4500;

  let wordDistribution: string;
  let mainContentParts: string;

  switch (targetWords) {
    case 3000:
      wordDistribution = "Hook: ~75 palavras. Introdução: ~150 palavras. Conteúdo Principal: ~2500 palavras. Conclusão: ~150 palavras.";
      mainContentParts = "4-5 partes";
      break;
    case 6000:
      wordDistribution = "Hook: ~125 palavras. Introdução: ~250 palavras. Conteúdo Principal: ~5400 palavras. Conclusão: ~250 palavras.";
      mainContentParts = "6-7 partes";
      break;
    case 8000:
      wordDistribution = "Hook: ~150 palavras. Introdução: ~250 palavras. Conteúdo Principal: ~7350 palavras. Conclusão: ~250 palavras.";
      mainContentParts = "7-8 partes";
      break;
    case 4500:
    default:
      wordDistribution = "Hook: ~100 palavras. Introdução: ~200 palavras. Conteúdo Principal: ~4000 palavras. Conclusão: ~200 palavras.";
      mainContentParts = "5-6 partes";
      break;
  }

  return `
    Você é um especialista em roteirização de vídeos para o YouTube e estrategista de conteúdo. Sua tarefa é gerar um pacote completo de roteiro de vídeo com base nas especificações do usuário.

    Siga estas instruções precisamente e entregue a saída APENAS no formato JSON especificado pelo schema.

    **REQUISITO CRÍTICO: CONTROLE DE PALAVRAS**
    - O comprimento total do roteiro gerado (Hook + Introdução + Conteúdo Principal + Conclusão) DEVE ser aproximadamente ${targetWords} palavras.
    - Distribuição sugerida: ${wordDistribution}
    - É absolutamente crucial que você respeite esta restrição de tamanho para se adequar à duração do vídeo solicitada. A falha em seguir a contagem de palavras tornará a saída inútil.

    **Especificações do Usuário:**
    - Tema/Ideia do Título do Vídeo: ${request.title}
    - Nome do Canal no YouTube: ${request.channelName || 'Não fornecido'}
    - Descrição do Canal: ${request.channelDescription || 'Não fornecida'}
    - Playlist Selecionada para este vídeo: ${request.playlist || 'Não fornecida'}
    - Duração Alvo do Vídeo: ${request.videoLength} (Total de ${targetWords} palavras)
    - Idioma: ${request.language}

    **Estrutura do Roteiro a Ser Entregue:**
    1.  **Títulos:** Crie 3 opções de títulos para o vídeo.
    2.  **Hook:** Um gancho para prender a atenção do espectador (respeitando a contagem de palavras acima).
    3.  **Introdução:** Uma introdução que apresenta o tema (respeitando a contagem de palavras acima e incluindo um CTA para Inscrição e like ao final).
    4.  **Conteúdo Principal:** Divida o conteúdo em ${mainContentParts} (respeitando a contagem de palavras acima e incluindo um CTA de inscrição e like a cada 2 partes).
    5.  **Conclusão e CTA:** Uma conclusão que resume os pontos principais (respeitando a contagem de palavras acima e incluindo um forte CTA para inscrição, like, comentário e compartilhamento).
    6.  **Descrição do Vídeo:** Uma descrição otimizada para SEO com até 250 palavras.
    7.  **Palavras-chave:** 20 palavras-chave separadas por vírgulas em uma única linha.
    8.  **Textos para Thumbnails:** 3 opções de textos para 3 opções de thumbnails (para Teste A/B).
    9.  **Prompts para Thumbnails:** 3 prompts para criar as 3 imagens das thumbnails em uma IA de geração de imagem.

    O tom deve ser envolvente e adequado para um público do YouTube. O idioma do conteúdo gerado deve ser estritamente ${request.language}.
  `;
};

export const generateScript = async (request: ScriptRequest): Promise<GeneratedScript> => {
  const model = 'gemini-2.5-pro';
  const prompt = buildPrompt(request);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as GeneratedScript;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
};