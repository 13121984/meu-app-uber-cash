
"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, Video, VideoOff, AlertTriangle, Shield, Loader2, Gem, Lock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

function PremiumUpgradeScreen() {
    return (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-6">
             <div className="relative w-48 h-48">
                 <Camera className="absolute w-24 h-24 text-muted-foreground/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                 <Gem className="absolute w-16 h-16 text-yellow-500 bottom-0 right-0 animate-pulse" />
             </div>
            <h1 className="text-3xl font-bold font-headline text-primary">Mais Segurança para Suas Viagens</h1>
            <p className="text-muted-foreground max-w-lg">
                Use a Câmera de Segurança para gravar suas corridas diretamente pelo aplicativo. Um recurso Premium para sua tranquilidade e proteção.
            </p>
            <Card className="bg-secondary">
                 <CardContent className="p-4">
                     <ul className="text-left space-y-2">
                         <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Gravação de vídeo e áudio com um toque.</li>
                         <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Salve as gravações diretamente no seu dispositivo.</li>
                         <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Tenha provas em caso de incidentes.</li>
                     </ul>
                 </CardContent>
            </Card>
            <Link href="/premium" passHref>
                <Button size="lg">
                    <Lock className="mr-2 h-4 w-4" />
                    Desbloquear com Premium
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
    )
}

function CameraFeature() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Câmera não suportada',
          description: 'Seu navegador não suporta o acesso à câmera.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acesso à Câmera Negado',
          description: 'Por favor, habilite o acesso à câmera nas configurações do seu navegador para usar este recurso.',
        });
      }
    };
    getCameraPermission();
  }, []);

  const handleStartRecording = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const options = { 
        mimeType: 'video/webm; codecs=vp9,opus',
        videoBitsPerSecond : 1000000 // 1 Mbps, bom equilíbrio para qualidade e tamanho
      };
      
      try {
          // Tenta usar o codec VP9, se não for suportado, o navegador usará o padrão.
          mediaRecorderRef.current = MediaRecorder.isTypeSupported(options.mimeType) 
            ? new MediaRecorder(stream, options)
            : new MediaRecorder(stream);
      } catch (e) {
          console.warn("Could not create MediaRecorder with preferred options, falling back.", e);
          mediaRecorderRef.current = new MediaRecorder(stream);
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gravacao_seguranca_${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        recordedChunksRef.current = [];
      };
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: 'Gravação iniciada', description: 'Sua câmera de segurança está ativa.' });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: 'Gravação parada', description: 'O vídeo foi salvo no seu dispositivo.' });
    }
  };

  const renderContent = () => {
    if (hasCameraPermission === null) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Verificando permissões da câmera...</p>
        </div>
      );
    }
    if (!hasCameraPermission) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Câmera Indisponível</AlertTitle>
          <AlertDescription>
            Não foi possível acessar sua câmera. Verifique se o navegador tem permissão e recarregue a página.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <>
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              GRAVANDO
            </div>
          )}
        </div>
        {!isRecording ? (
          <Button size="lg" className="w-full h-16 text-lg" onClick={handleStartRecording}>
            <Video className="mr-2 h-6 w-6" /> Iniciar Gravação
          </Button>
        ) : (
          <Button size="lg" className="w-full h-16 text-lg" variant="destructive" onClick={handleStopRecording}>
            <VideoOff className="mr-2 h-6 w-6" /> Parar e Salvar
          </Button>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <Camera className="w-8 h-8 text-primary" />
          Câmera de Segurança
        </h1>
        <p className="text-muted-foreground">Grave suas viagens para ter mais segurança no dia a dia.</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          {renderContent()}
        </CardContent>
      </Card>
      <Card className="bg-amber-500/10 border-amber-500/20">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600"/>
                Aviso de Privacidade e Uso
            </CardTitle>
         </CardHeader>
         <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>As gravações são salvas **diretamente no seu dispositivo** e não são enviadas para nossos servidores. Sua privacidade é nossa prioridade.</li>
                <li>Este recurso está em fase inicial. Lembre-se de verificar a legislação local sobre gravação de áudio e vídeo em veículos de transporte.</li>
                <li>Para usar a câmera em segundo plano, o aplicativo precisará ser instalado nativamente no dispositivo (Android/iOS) com permissões adicionais.</li>
            </ul>
         </CardContent>
      </Card>
    </div>
  );
}

export default function CameraPage() {
    const { user, loading } = useAuth();
  
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
  
    if (!user?.isPremium) {
        return <PremiumUpgradeScreen />
    }

    return <CameraFeature />;
}
