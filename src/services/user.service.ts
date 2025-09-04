
"use server";

import { auth } from "@/lib/firebase";

/**
 * Retorna o usuário autenticado atualmente no lado do servidor.
 * É seguro usar em Server Components e Server Actions.
 * NOTA: Esta função só funcionará de forma confiável após a inicialização do Firebase e o estado de autenticação ter sido estabelecido no cliente.
 * Para verificações iniciais de página, o estado do AuthProvider é mais confiável.
 */
export const getCurrentUser = async () => {
    // No lado do servidor com o SDK Admin, isso seria mais direto.
    // Com o SDK do cliente, o `currentUser` pode ser nulo inicialmente.
    // A abordagem com `onAuthStateChanged` no AuthProvider (cliente) é a mais robusta para UI.
    // Esta função é um auxiliar para Server Actions que são chamadas após o carregamento da página.
    return auth.currentUser;
};
