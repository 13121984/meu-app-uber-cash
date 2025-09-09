// /src/app/api/hotmart-webhook/route.ts
// ATENÇÃO: Este é um arquivo de exemplo e esqueleto.
// Ele NÃO FUNCIONARÁ diretamente neste projeto estático.
// Ele serve como guia para ser adaptado e implantado como uma Cloud Function no Firebase.

import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '@/services/auth.service'; // Supondo que isso possa ser adaptado para o ambiente do Firebase

// Esta é a sua chave secreta do webhook da Hotmart.
// No Firebase, isso DEVE ser armazenado como uma variável de ambiente segura.
const HOTMART_WEBHOOK_SECRET = process.env.HOTMART_WEBHOOK_SECRET || 'SUA_CHAVE_SECRETA_AQUI';

/**
 * Esta função de API (route handler do Next.js) simula um endpoint de webhook.
 * Ela recebe uma notificação da Hotmart, verifica sua autenticidade e, com base
 * no status do evento (compra, cancelamento, reembolso), atualiza o status do usuário.
 */
export async function POST(req: NextRequest) {
  try {
    const hotmartSignature = req.headers.get('hotmart-signature');
    const payload = await req.json();

    // **PASSO 1: VERIFICAR A ASSINATURA (SEGURANÇA)**
    // A Hotmart envia um cabeçalho `hotmart-signature`. Você DEVE verificar
    // se ele é válido para garantir que a requisição veio da Hotmart.
    // A lógica de verificação exata (envolvendo SHA256 HMAC) está na documentação da Hotmart.
    // Por simplicidade, vamos pular a verificação complexa aqui, mas NUNCA pule em produção.
    if (!hotmartSignature) {
        return NextResponse.json({ success: false, message: 'Assinatura não encontrada.' }, { status: 401 });
    }
    // const isValid = verifySignature(payload, hotmartSignature); // Função que você precisa implementar
    // if (!isValid) {
    //     return NextResponse.json({ success: false, message: 'Assinatura inválida.' }, { status: 401 });
    // }


    // **PASSO 2: PROCESSAR O EVENTO**
    const event = payload.event;
    const data = payload.data;
    const userEmail = data?.buyer?.email;

    if (!userEmail) {
      return NextResponse.json({ success: false, message: 'E-mail do comprador não encontrado no payload.' }, { status: 400 });
    }

    let isPremiumStatus: boolean;

    switch (event) {
        case 'PURCHASE_APPROVED':
        case 'PURCHASE_COMPLETE':
            isPremiumStatus = true;
            break;

        case 'PURCHASE_REFUNDED':
        case 'PURCHASE_CANCELED':
        case 'PURCHASE_CHARGEBACK':
            isPremiumStatus = false;
            break;
        
        default:
            // Ignora outros eventos que não nos interessam (ex: boleto impresso)
            return NextResponse.json({ success: true, message: `Evento ${event} ignorado.` });
    }
    
    // **PASSO 3: ATUALIZAR O USUÁRIO**
    // No Firebase, você usaria o Admin SDK para encontrar o usuário pelo e-mail e atualizar seus dados.
    // Aqui, estamos simulando a atualização do nosso `users.json`.
    // IMPORTANTE: Acessar o sistema de arquivos diretamente de uma função serverless é complexo e
    // geralmente requer o uso de um banco de dados como Firestore ou Realtime Database.
    
    console.log(`[Webhook Simulado] Evento: ${event}. Atualizando usuário ${userEmail} para isPremium: ${isPremiumStatus}`);
    
    // O ideal é que o `id` do usuário no seu sistema seja o e-mail dele para facilitar a busca.
    // Como nosso `id` é um nome de usuário, a lógica real precisaria de um campo de e-mail no perfil do usuário.
    // Por enquanto, vamos assumir que o ID do usuário é o e-mail para fins de demonstração.
    
    const result = await updateUser(userEmail, { isPremium: isPremiumStatus });

    if (result.success) {
      console.log(`[Webhook Simulado] Usuário ${userEmail} atualizado com sucesso.`);
      return NextResponse.json({ success: true });
    } else {
      console.error(`[Webhook Simulado] Falha ao atualizar o usuário ${userEmail}: ${result.error}`);
      // Em um cenário real, você poderia enviar uma notificação para si mesmo para lidar com o caso manualmente.
      return NextResponse.json({ success: false, message: `Usuário ${userEmail} não encontrado ou falha ao atualizar.` }, { status: 404 });
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no webhook.';
    console.error(`[Webhook Erro] ${message}`);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
