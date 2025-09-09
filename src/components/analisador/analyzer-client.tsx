
"use client";

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { BotMessageSquare, Check, DollarSign, ImageUp, Loader2, RefreshCw, Sparkles, ThumbsDown, ThumbsUp, X, Edit } from 'lucide-react';
import Image from 'next/image';
import { runAnalysisAction, AnalysisOutput } from './actions';
import { updateUserPreferences } from '@/services/auth.service';
import Link from 'next/link';

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function ResultDisplay({ result, onReset }: { result: AnalysisOutput, onReset: () => void }) {
    const isGoodDeal = result.recommendation === 'Bora';

    return (
        <Card className={`border-2 ${isGoodDeal ? 'border-green-500' : 'border-destructive'}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-4">
                     {isGoodDeal 
                        ? <ThumbsUp className="h-10 w-10 text-green-500" /> 
                        : <ThumbsDown className="h-10 w-10 text-destructive" />
                     }
                    <span className={`text-4xl font-bold ${isGoodDeal ? 'text-green-500' : 'text-destructive'}`}>
                       "{result.recommendation}"
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">{result.reasoning}</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Valor Estimado</p>
                        <p className="font-bold">{formatCurrency(result.extractedData.estimatedValue)}</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Distância</p>
                        <p className="font-bold">{result.extractedData.distanceKm} km</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Duração</p>
                        <p className="font-bold">{result.extractedData.durationMinutes} min</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Ganho/KM</p>
                        <p className="font-bold">{formatCurrency(result.calculatedRates.ratePerKm)}</p>
                    </div>
                     <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">Ganho/Hora</p>
                        <p className="font-bold">{formatCurrency(result.calculatedRates.ratePerHour)}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={onReset} className="w-full" variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Analisar Outra
                    </Button>
                    <Link href="/registrar/today" className="w-full">
                        <Button className="w-full">
                           <Edit className="mr-2 h-4 w-4" />
                            Registrar esta Corrida
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export function AnalyzerClient() {
    const { user, refreshUser } = useAuth();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisOutput | null>(null);
    
    const initialRates = user?.preferences.analyzerRates || { ratePerKm: 2, ratePerHour: 30 };
    const [rates, setRates] = useState(initialRates);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                 toast({ title: "Erro", description: "O arquivo de imagem é muito grande. O limite é de 4MB.", variant: "destructive" });
                 return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleRateChange = (field: keyof typeof rates, value: string) => {
        const numValue = parseFloat(value) || 0;
        setRates(prev => ({...prev, [field]: numValue}));
    }

    const handleSaveRates = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await updateUserPreferences(user.id, { analyzerRates: rates });
            await refreshUser();
            toast({ title: "Sucesso", description: "Suas metas de ganho foram salvas." });
        } catch (e) {
            toast({ title: "Erro", description: "Não foi possível salvar suas metas.", variant: "destructive" });
        }
        setIsLoading(false);
    }
    
    const handleAnalyze = async () => {
        if (!imageFile || !user) {
            toast({ title: "Erro", description: "Selecione uma imagem para analisar.", variant: "destructive" });
            return;
        }
        
        setIsLoading(true);
        setResult(null);

        try {
             const reader = new FileReader();
             reader.readAsDataURL(imageFile);
             reader.onload = async (e) => {
                const dataUri = e.target?.result as string;
                if (!dataUri) {
                    throw new Error("Não foi possível ler a imagem.");
                }

                const analysisResult = await runAnalysisAction({
                    image: dataUri,
                    rates,
                });
                
                if (analysisResult.success && analysisResult.output) {
                    setResult(analysisResult.output);
                } else {
                    throw new Error(analysisResult.error || "A análise falhou.");
                }

                setIsLoading(false);
             };
             reader.onerror = () => {
                 throw new Error("Erro ao carregar a imagem.");
             }

        } catch (e) {
            const error = e as Error;
            toast({ title: "Erro na Análise", description: error.message, variant: "destructive" });
            setIsLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><Sparkles className="h-5 w-5 text-primary"/> Suas Metas de Ganho</CardTitle>
                        <CardDescription>Defina seus valores mínimos para a IA analisar se a corrida vale a pena.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <Label htmlFor="ratePerKm">Mínimo por KM (R$)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                                    <Input id="ratePerKm" type="number" placeholder="Ex: 2.00" value={rates.ratePerKm} onChange={e => handleRateChange('ratePerKm', e.target.value)} className="pl-10"/>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="ratePerHour">Mínimo por Hora (R$)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                                    <Input id="ratePerHour" type="number" placeholder="Ex: 30.00" value={rates.ratePerHour} onChange={e => handleRateChange('ratePerHour', e.target.value)} className="pl-10"/>
                                </div>
                            </div>
                        </div>
                        <Button onClick={handleSaveRates} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                            Salvar Metas
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><ImageUp className="h-5 w-5 text-primary"/> Envie o Print da Corrida</CardTitle>
                        <CardDescription>Faça o upload da imagem da oferta da corrida (Uber, 99, etc).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input id="picture" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef}/>
                        
                        {imagePreview && (
                            <div className="relative group">
                                <Image src={imagePreview} alt="Pré-visualização da corrida" width={500} height={500} className="rounded-lg object-contain" />
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={handleReset}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                        <Button onClick={handleAnalyze} disabled={isLoading || !imagePreview} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BotMessageSquare className="mr-2 h-4 w-4"/>}
                            Analisar Corrida
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-headline text-center">Resultado da Análise</h2>
                {isLoading && (
                     <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed min-h-[300px]">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                        <h3 className="text-xl font-semibold">Analisando...</h3>
                        <p className="text-muted-foreground">A IA está calculando se essa corrida é boa para você.</p>
                    </Card>
                )}
                 {result && !isLoading && <ResultDisplay result={result} onReset={handleReset} />}
                 {!result && !isLoading && (
                     <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed min-h-[300px]">
                        <BotMessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">Aguardando Análise</h3>
                        <p className="text-muted-foreground">Faça o upload do print de uma corrida para começar.</p>
                    </Card>
                 )}
            </div>
        </div>
    );
}
