
import type { TextColor, AppTheme } from '@/types/settings';

// Mapeia a seleção de cor do texto para valores HSL específicos
export const getTextColorValue = (textColor: TextColor, theme: AppTheme) => {
    if (theme === 'light') {
        switch (textColor) {
            case 'white': // Branco não é ideal para tema claro, mas damos uma opção escura
                return {
                    foreground: '224 25% 20%', // Cinza Escuro
                    cardForeground: '224 25% 20%',
                    mutedForeground: '224 25% 45%',
                    primaryForeground: '220 15% 95%', // Branco no botão primário
                };
            case 'gray':
                 return {
                    foreground: '224 25% 30%',
                    cardForeground: '224 25% 30%',
                    mutedForeground: '224 25% 55%',
                    primaryForeground: '220 15% 95%',
                };
            case 'purple':
                return {
                    foreground: '250 30% 50%',
                    cardForeground: '250 30% 50%',
                    mutedForeground: '250 20% 65%',
                    primaryForeground: '220 15% 95%',
                };
            default:
                return { // Padrão Claro
                    foreground: '224 25% 10%',
                    cardForeground: '224 25% 10%',
                    mutedForeground: '224 25% 45%',
                    primaryForeground: '220 15% 95%',
                };
        }
    } else { // Tema Escuro
        switch (textColor) {
            case 'white':
                return {
                    foreground: '220 15% 95%', // Quase Branco
                    cardForeground: '220 15% 95%',
                    mutedForeground: '220 15% 65%',
                    primaryForeground: '220 15% 95%',
                };
            case 'gray':
                 return {
                    foreground: '220 15% 80%', // Cinza Claro
                    cardForeground: '220 15% 80%',
                    mutedForeground: '220 10% 55%',
                    primaryForeground: '220 15% 95%',
                };
            case 'purple':
                return {
                    foreground: '250 80% 85%', // Roxo Claro
                    cardForeground: '250 80% 85%',
                    mutedForeground: '250 50% 70%',
                    primaryForeground: '220 15% 95%',
                };
            default:
                 return { // Padrão Escuro
                    foreground: '220 15% 95%',
                    cardForeground: '220 15% 95%',
                    mutedForeground: '220 15% 65%',
                    primaryForeground: '220 15% 95%',
                };
        }
    }
}
