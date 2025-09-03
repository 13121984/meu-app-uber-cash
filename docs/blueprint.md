# **App Name**: Rota Certa

## Core Features:

- Dia de Trabalho: Wizard de 4 etapas para registrar o dia de trabalho (data, km, horas, ganhos por categoria, abastecimentos e despesas extras), validando os dados e integrando diretamente com o Supabase.
- Registro Contínuo com Visualização Dinâmica: Acompanhamento visual automático e dinâmico dos cálculos de ganhos, gastos com combustível, lucro líquido, total de viagens, total de litros, eficiência do veículo, ganho por hora (bruto e líquido) e ganho por KM (bruto e líquido) durante o processo de preenchimento.
- Painel de Controle Dinâmico: Painel de controle com visualização dinâmica de valores, gráficos e estatísticas de acordo com o período selecionado (hoje, semana, mês), exibindo total ganho, total lucro, total de combustível, dias trabalhados, total KM, total horas, total viagens, média de eficiência, média de ganho por hora (bruto e líquido) e média de ganho por KM (bruto e líquido).
- Meta Financeira Animada: Visualização animada da meta financeira com um carro percorrendo uma estrada proporcional ao lucro líquido acumulado no período, celebrando a chegada ao objetivo com confetes e mensagens motivacionais.
- Queries para Supabase: Integração direta com o Supabase, utilizando queries pré-definidas (upsert_work_day, insert_earnings_bulk, insert_fuels_bulk, agg_period, earnings_by_category, daily_series, goal_current_for_period, delete_period) para inserção, atualização e deleção de dados.
- Gerenciamento de Ganhos e Gastos: Interface intuitiva para editar, excluir e visualizar registros de ganhos, gastos e metas, permitindo ajustes finos nas finanças do motorista.
- Categorização Inteligente de Ganhos: O app permite registrar ganhos por categorias de trabalho (99 Pop, Uber X, Particular, Ganhos Extras) com validação e inserção automatizada de registros no Supabase, incluindo a possibilidade de cadastrar outras categorias livremente e registrar abastecimentos múltiplos (GNV, Etanol, etc.)

## Style Guidelines:

- Primary color: A vibrant orange (#FF8C00) evokes energy, forward motion, and optimism, relevant to driving and achieving goals.
- Background color: A light orange (#FFEBCD) offers a soft, neutral backdrop, ensuring readability and a sense of calm focus.
- Accent color: A deep orange (#CC6600) creates emphasis and highlights important interactive elements without overwhelming the primary palette.
- Headline font: 'Poppins', a geometric sans-serif font, for titles, subtitles, and call-to-action buttons.
- Body font: 'PT Sans', a versatile sans-serif font, to make the display and use of the interface even easier for end-users.
- Use a consistent set of line icons to represent different categories and actions, enhancing the user interface's visual appeal without clutter.
- Subtle animations to enhance user experience (progress bar animation, smooth transitions).