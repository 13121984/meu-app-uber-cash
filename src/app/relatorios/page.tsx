
import { redirect } from 'next/navigation';

// Esta página agora decide se mostra o conteúdo completo ou a tela de upgrade
export default async function RelatoriosPage() {
  // Redireciona para a nova página de personalização de layout
  redirect('/configuracoes/layout-personalizado');
}
