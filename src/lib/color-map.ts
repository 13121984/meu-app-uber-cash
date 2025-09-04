import type { AppTheme } from '@/types/settings';

// Esta função não é mais necessária com temas fixos no CSS,
// mas pode ser mantida para referência futura ou removida.
// Por enquanto, vamos deixá-la aqui, mas ela não será utilizada.

// Mapeia a seleção de cor do texto para valores HSL específicos
export const getTextColorValue = (theme: AppTheme) => {
    if (theme === 'light') {
        return {
            foreground: '224 25% 10%',
            cardForeground: '224 25% 10%',
            popoverForeground: '224 25% 10%',
            secondaryForeground: '224 25% 20%',
            mutedForeground: '224 25% 45%',
            primaryForeground: '210 20% 98%',
            accentForeground: '210 20% 98%',
        };
    } 
    // Tema Escuro
    return { 
        foreground: '220 15% 95%',
        cardForeground: '220 15% 95%',
        popoverForeground: '220 15% 95%',
        secondaryForeground: '220 15% 95%',
        mutedForeground: '220 15% 65%',
        primaryForeground: '220 15% 95%',
        accentForeground: '220 15% 95%',
    };
}
