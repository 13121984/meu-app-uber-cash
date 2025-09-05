
import { redirect } from 'next/navigation';

export default function RegistrarPage() {
  // Redireciona para o registro do dia atual por padrão
  redirect('/registrar/today');
}
