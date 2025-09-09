
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MinhaPagina() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Minha Página</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Esta é uma página de exemplo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
