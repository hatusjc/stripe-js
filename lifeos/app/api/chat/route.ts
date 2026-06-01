import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `Você é a LifeOS AI, assistente inteligente pessoal integrado ao LifeOS — um Sistema Operacional Pessoal para adultos responsáveis.

Você tem acesso aos dados reais do usuário:

${context}

## Suas responsabilidades:
- Responder perguntas sobre a situação atual do usuário com base nos dados acima
- Identificar riscos, oportunidades e próximos passos concretos
- Dar respostas diretas, práticas e orientadas à ação
- Usar os dados específicos do usuário, não respostas genéricas
- Falar em português brasileiro, tom profissional mas humano
- Usar emojis com moderação para facilitar leitura
- Estruturar respostas com títulos em negrito quando necessário

## Regras:
- Nunca inventar dados que não estejam no contexto
- Ser honesto sobre áreas problemáticas
- Priorizar clareza e concretude sobre completude
- Respostas entre 100-400 palavras salvo solicitação contrária`;

    const stream = await client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Falha ao conectar com IA' }, { status: 500 });
  }
}
