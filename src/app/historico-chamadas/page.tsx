
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Lock } from "lucide-react";
import Image from 'next/image';

// Placeholder data - in the future this would come from a service
const callHistoryItem = {
    imageUrl: "/images/call-history-placeholder.png", // We'll need to add this image
    altText: "Exemplo de uma corrida capturada da Uber"
};

export default function HistoricoChamadasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-primary" />
          Histórico de Chamadas
        </h1>
        <p className="text-muted-foreground">
          Visualize as corridas capturadas automaticamente. (Funcionalidade em desenvolvimento)
        </p>
      </div>

      <div className="flex gap-2">
        <Button>
            <Lock className="w-4 h-4 mr-2" />
            Todos
        </Button>
         <Button variant="secondary">
            <Lock className="w-4 h-4 mr-2" />
            Uber Driver
        </Button>
         <Button variant="secondary">
            <Lock className="w-4 h-4 mr-2" />
            99 Motorista
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
            <div className="text-center text-muted-foreground py-10">
                <p className="font-semibold mb-4">Exemplo de como uma chamada capturada será exibida:</p>
                <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-lg overflow-hidden border-4 border-card shadow-lg">
                   <Image
                        src="https://storage.googleapis.com/static.aiforge.co/templates/uber-cash/call-history-placeholder.png"
                        alt={callHistoryItem.altText}
                        width={400}
                        height={711}
                        className="object-contain"
                    />
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
