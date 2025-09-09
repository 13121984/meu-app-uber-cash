
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { runAnalysisAction, AnalysisOutput } from './actions';

export function AnalisadorDeCorrida() {
  const [image, setImage] = useState<File | null>(null);
  const [rates, setRates] = useState({ ratePerKm: 2, ratePerHour: 30 });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisOutput | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRates(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleAnalyze = async () => {
    if (!image) {
      toast({ title: 'Nenhuma imagem selecionada', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async (event) => {
        const dataUri = event.target?.result as string;
        const response = await runAnalysisAction({ image: dataUri, rates });
        if (response.success && response.output) {
          setResult(response.output);
        } else {
          toast({ title: 'Erro na análise', description: response.error, variant: 'destructive' });
        }
        setIsLoading(false);
      };
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao analisar a imagem.', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Analisador de Corridas com IA</CardTitle>
        <CardDescription>
          Faça o upload de um print da sua corrida e defina suas metas para saber se vale a pena.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="picture">Print da Corrida</Label>
          <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ratePerKm">Meta R$/KM</Label>
            <Input id="ratePerKm" name="ratePerKm" type="number" value={rates.ratePerKm} onChange={handleRateChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ratePerHour">Meta R$/Hora</Label>
            <Input id="ratePerHour" name="ratePerHour" type="number" value={rates.ratePerHour} onChange={handleRateChange} />
          </div>
        </div>
        <Button onClick={handleAnalyze} disabled={isLoading || !image} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Analisar
        </Button>
        {result && (
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="font-bold text-lg">{result.recommendation}</h3>
            <p>{result.reasoning}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Valor: R$ {result.extractedData.estimatedValue}</p>
              <p>Distância: {result.extractedData.distanceKm} km</p>
              <p>Duração: {result.extractedData.durationMinutes} min</p>
              <p>R$/km: R$ {result.calculatedRates.ratePerKm.toFixed(2)}</p>
              <p>R$/hora: R$ {result.calculatedRates.ratePerHour.toFixed(2)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
