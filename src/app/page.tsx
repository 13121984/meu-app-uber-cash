
import { HomeClient } from '@/components/inicio/home-client';

export default async function InicioPage() {
  // A página carrega instantaneamente, e o HomeClient buscará os dados no cliente.
  return <HomeClient />;
}
