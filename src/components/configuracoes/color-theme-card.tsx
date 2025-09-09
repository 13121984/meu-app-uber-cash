
"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Palette, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

const colorOptions = [
  { name: 'orange', label: 'Laranja Vibrante', className: 'bg-[hsl(34.9,99.3%,49.4%)]' },
  { name: 'blue', label: 'Azul Confiante', className: 'bg-[hsl(217.2,91.2%,59.8%)]' },
  { name: 'green', label: 'Verde Lucro', className: 'bg-[hsl(142.1,76.2%,36.3%)]' },
  { name: 'purple', label: 'Roxo Premium', className: 'bg-[hsl(262.1,83.3%,57.8%)]' },
]

export function ColorThemeCard() {
    const { user, setColorTheme, loading } = useAuth()
    const [isSaving, setIsSaving] = useState(false)
    const [selectedTheme, setSelectedTheme] = useState(user?.preferences?.colorTheme || 'orange')

    const handleSelectTheme = (themeName: string) => {
        setSelectedTheme(themeName)
    }

    const handleSaveTheme = async () => {
        setIsSaving(true)
        try {
            await setColorTheme(selectedTheme)
            toast({ title: "Tema Salvo!", description: "A nova cor foi aplicada em todo o aplicativo." })
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível salvar a cor do tema.", variant: "destructive" })
        }
        setIsSaving(false)
    }

    if (loading) {
        return null // ou um skeleton
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Palette className="h-6 w-6 text-primary" />
                    Cor do Tema
                </CardTitle>
                <CardDescription>
                    Escolha a cor principal que será usada nos detalhes, botões e gráficos do aplicativo.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {colorOptions.map((option) => (
                        <div key={option.name} className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => handleSelectTheme(option.name)}
                                className={cn(
                                    "w-16 h-16 rounded-full border-4 transition-all",
                                    selectedTheme === option.name ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50',
                                    option.className
                                )}
                                aria-label={`Selecionar tema ${option.label}`}
                            >
                                {selectedTheme === option.name && <Check className="w-8 h-8 text-white mx-auto" />}
                            </button>
                            <span className="text-sm text-center">{option.label}</span>
                        </div>
                    ))}
                </div>
                <Button onClick={handleSaveTheme} disabled={isSaving} className="w-full">
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Aplicar Cor"
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
