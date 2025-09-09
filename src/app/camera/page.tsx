
"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, Video, VideoOff, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function CameraPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const getCameraPermission = async () => {
      // Check for mediaDevices support
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

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
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
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
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
