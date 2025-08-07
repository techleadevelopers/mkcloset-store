Documentação Detalhada do Projeto E-commerce
Este documento detalha a estrutura, propósito e interconexões de cada arquivo TypeScript/React que compõe a aplicação de e-commerce.

I. Estrutura Central da Aplicação
Esta seção descreve os arquivos fundamentais que iniciam e configuram a aplicação.

App.tsx
Propósito: Componente raiz da aplicação React. Ele configura os provedores de contexto globais e define as rotas da aplicação usando wouter.
Dependências:
wouter (para roteamento)
@tanstack/react-query (para gerenciamento de estado assíncrono)
./lib/queryClient (configuração do cliente React Query)
./components/ui/toaster (componente para exibir toasts)
./components/ui/tooltip (provedor de tooltip)
./hooks/use-cart (provedor de contexto para o carrinho)
./hooks/use-wishlist (provedor de contexto para a lista de desejos)
Páginas (./pages/*): Home, Products, ProductDetail, Checkout, Login, Register, OrderSuccess, Wishlist, NotFound.
Componentes/Funções Exportadas:
App: Componente React principal.
Lógica Interna/Estado:
Router função: Define o mapeamento de URLs para componentes de página. Utiliza Switch para renderizar apenas a primeira rota correspondente.
App componente:
Envolve toda a aplicação com QueryClientProvider para habilitar o React Query.
Envolve com TooltipProvider para funcionalidades de tooltip.
Envolve com CartProvider e WishlistProvider para disponibilizar o estado e as funções do carrinho e da lista de desejos para todos os componentes filhos.
Inclui Toaster para exibir notificações de toast.
Interconexões: É o ponto de entrada da aplicação, orquestrando o carregamento de provedores de estado e o roteamento para as diferentes páginas. Todas as páginas e muitos componentes UI dependem dos contextos fornecidos aqui.
main.tsx
Propósito: O ponto de entrada principal do JavaScript para a aplicação, responsável por renderizar o componente App no DOM.
Dependências:
react-dom/client (para renderização React)
./App (o componente raiz da aplicação)
./index.css (estilos globais da aplicação)
Componentes/Funções Exportadas: Nenhuma, apenas executa a renderização.
Lógica Interna/Estado:
Obtém o elemento HTML com o ID "root".
Cria uma raiz React e renderiza o componente App dentro dela.
Interconexões: É o bootstrap da aplicação, conectando o código React ao HTML.
index.css
Propósito: Define os estilos globais da aplicação, importa fontes do Google Fonts, inclui as diretivas do Tailwind CSS e define variáveis CSS para temas (claro/escuro) e classes de utilidade personalizadas.
Dependências:
https://fonts.googleapis.com/css2?family=...&display=swap (importa várias fontes do Google Fonts)
Tailwind CSS (diretivas @tailwind base;, @tailwind components;, @tailwind utilities;)
Componentes/Funções Exportadas: Nenhuma, apenas define estilos.
Lógica Interna/Estado:
Importação de Fontes: Carrega fontes como Poppins, Abel, Chakra Petch, Gruppo, Luxurious Script, Monsieur La Doulaise.
Tailwind Directives: Integra o Tailwind CSS.
Variáveis CSS (:root, .dark): Define um sistema de design baseado em variáveis CSS (cores, tamanhos, etc.) para temas claro e escuro. Isso permite fácil personalização e alternância de temas.
Camadas Base (@layer base):
Define border-border para todos os elementos.
Aplica bg-background e text-foreground ao body e define a fonte padrão como 'Poppins'.
Cria classes específicas para as fontes importadas (ex: .monsieur-la-doulaise-regular).
Camadas de Utilidade (@layer utilities):
text-gradient-black: Efeito de gradiente de texto.
line-clamp-2: Utilitário para truncar texto em 2 linhas.
Classes Personalizadas:
card-hover, btn-primary, btn-secondary, gradient-bg, gradient-black, product-image, card-depth, card-floating: Estilos reutilizáveis para cartões, botões e fundos.
Responsividade (@media (max-width: 640px), @media (max-width: 768px)): Ajustes de layout e tipografia para telas menores.
Animações: Define keyframes para animações (pulse-soft, float, glow-pulse, sparkle) e classes para aplicá-las (ex: animate-float). Usadas principalmente no botão do WhatsApp.
Interconexões: Fornece a base visual e tipográfica para toda a aplicação. As classes Tailwind e as variáveis CSS são usadas extensivamente em todos os componentes React.
II. Componentes UI (Shadcn/UI e Customizados)
Esta seção detalha os componentes de interface do usuário, muitos dos quais são wrappers Shadcn/UI ou componentes customizados construídos com Tailwind CSS.

accordion.tsx
Propósito: Implementa um componente de acordeão (sanfona) que permite expandir e recolher seções de conteúdo.
Dependências: @radix-ui/react-accordion, lucide-react (ChevronDown), ./lib/utils (cn).
Componentes/Funções Exportadas: Accordion, AccordionItem, AccordionTrigger, AccordionContent.
Lógica Interna/Estado: Utiliza as primitivas do Radix UI para acessibilidade e funcionalidade. O AccordionTrigger inclui um ícone de seta que gira quando o conteúdo é expandido.
Interconexões: Componente UI genérico, pode ser usado em qualquer lugar que precise de seções de conteúdo colapsáveis, como FAQs ou detalhes de produtos.
alert-dialog.tsx
Propósito: Cria uma caixa de diálogo de alerta modal, geralmente usada para confirmações importantes ou avisos.
Dependências: @radix-ui/react-alert-dialog, ./lib/utils (cn), ./components/ui/button (buttonVariants).
Componentes/Funções Exportadas: AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel.
Lógica Interna/Estado: Baseado nas primitivas do Radix UI para acessibilidade. Gerencia o estado de abertura/fechamento e aplica estilos de transição.
Interconexões: Componente UI genérico para interações modais.
alert.tsx
Propósito: Exibe uma mensagem de alerta, que pode ser informativa ou destrutiva.
Dependências: class-variance-authority (cva), ./lib/utils (cn).
Componentes/Funções Exportadas: Alert, AlertTitle, AlertDescription.
Lógica Interna/Estado: Define variantes de estilo (default, destructive) usando cva.
Interconexões: Componente UI genérico para feedback ao usuário.
aspect-ratio.tsx
Propósito: Mantém a proporção de um elemento, útil para imagens ou vídeos responsivos.
Dependências: @radix-ui/react-aspect-ratio.
Componentes/Funções Exportadas: AspectRatio.
Lógica Interna/Estado: Wrapper simples para a primitiva Radix UI.
Interconexões: Componente UI genérico.
avatar.tsx
Propósito: Exibe um avatar (imagem do usuário ou fallback).
Dependências: @radix-ui/react-avatar, ./lib/utils (cn).
Componentes/Funções Exportadas: Avatar, AvatarImage, AvatarFallback.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
badge.tsx
Propósito: Exibe um pequeno rótulo ou tag, geralmente para indicar status, categorias ou contagens.
Dependências: class-variance-authority (cva), ./lib/utils (cn).
Componentes/Funções Exportadas: Badge, badgeVariants.
Lógica Interna/Estado: Define variantes de estilo (default, secondary, destructive, outline) usando cva.
Interconexões: Usado em Header (para contagem de itens no carrinho/wishlist), ProductCard (para "Novo", "Desconto"), Wishlist (para "Novo", "Desconto").
breadcrumb.tsx
Propósito: Componente de navegação tipo "trilha de pão" (breadcrumb) para mostrar a hierarquia da página atual.
Dependências: @radix-ui/react-slot, lucide-react (ChevronRight, MoreHorizontal), ./lib/utils (cn).
Componentes/Funções Exportadas: Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis.
Lógica Interna/Estado: Utiliza primitivas Radix UI para acessibilidade e flexibilidade na estrutura.
Interconexões: Usado em ProductDetail para navegação.
button.tsx
Propósito: Componente de botão reutilizável com diversas variantes de estilo e tamanhos.
Dependências: @radix-ui/react-slot, class-variance-authority (cva), ./lib/utils (cn).
Componentes/Funções Exportadas: Button, buttonVariants.
Lógica Interna/Estado: Define variantes (default, destructive, outline, secondary, ghost, link) e tamanhos (default, sm, lg, icon) usando cva. Suporta a propriedade asChild para renderizar como um elemento filho.
Interconexões: Componente fundamental, amplamente utilizado em toda a aplicação (cabeçalho, rodapé, páginas de produto, carrinho, checkout, etc.).
calendar.tsx
Propósito: Um seletor de data (calendário).
Dependências: react-day-picker, lucide-react (ChevronLeft, ChevronRight), ./lib/utils (cn), ./components/ui/button (buttonVariants).
Componentes/Funções Exportadas: Calendar.
Lógica Interna/Estado: Wrapper para a biblioteca react-day-picker, aplicando estilos Shadcn/UI.
Interconexões: Componente UI genérico, não diretamente usado nas páginas fornecidas, mas disponível para futuras funcionalidades (ex: seleção de data de entrega).
card.tsx
Propósito: Um componente de cartão genérico para agrupar conteúdo, com seções para cabeçalho, título, descrição, conteúdo e rodapé.
Dependências: Nenhuma, apenas react e ./lib/utils (cn).
Componentes/Funções Exportadas: Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent.
Lógica Interna/Estado: Componente de layout simples para estruturar informações.
Interconexões: Amplamente utilizado em Checkout, Login, Register, Wishlist, ProductCard, OrderSuccess para apresentar blocos de conteúdo de forma organizada.
carousel.tsx
Propósito: Implementa um carrossel de imagens ou conteúdo usando a biblioteca embla-carousel-react.
Dependências: embla-carousel-react, lucide-react (ArrowLeft, ArrowRight), ./lib/utils (cn), ./components/ui/button (Button).
Componentes/Funções Exportadas: Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselApi.
Lógica Interna/Estado: Gerencia o estado do carrossel (qual slide está ativo, se pode rolar para frente/trás) e fornece funções para navegação.
Interconexões: Não diretamente usado nas páginas fornecidas, mas o Home.tsx tem uma seção de carrossel de imagens implementada manualmente, que poderia ser substituída por este componente.
cart-notification.tsx
Propósito: Exibe uma notificação pop-up quando um produto é adicionado ao carrinho, mostrando o item adicionado e opções de ação.
Dependências: lucide-react (Check, ShoppingBag, X), ./components/ui/button (Button), ./lib/store (useUIStore), ./lib/mock-data (MockProduct).
Componentes/Funções Exportadas: CartNotification.
Lógica Interna/Estado:
Gerencia a visibilidade e animação da notificação.
Possui um temporizador para fechar automaticamente após 4 segundos.
Permite ao usuário fechar manualmente ou ver o carrinho.
A barra de progresso no rodapé indica o tempo restante para o fechamento automático.
Interconexões: Utilizado em ProductCard e ProductDetail para dar feedback visual após adicionar um item ao carrinho. Interage com useUIStore para abrir o ShoppingCart.
checkbox.tsx
Propósito: Um componente de checkbox.
Dependências: @radix-ui/react-checkbox, lucide-react (Check), ./lib/utils (cn).
Componentes/Funções Exportadas: Checkbox.
Lógica Interna/Estado: Wrapper para a primitiva Radix UI.
Interconexões: Usado em Register para aceitar termos de uso.
chart.tsx
Propósito: Componentes para renderização de gráficos, baseados na biblioteca Recharts.
Dependências: recharts, ./lib/utils (cn).
Componentes/Funções Exportadas: ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle, useChart.
Lógica Interna/Estado: Fornece um contexto (ChartContext) para compartilhar a configuração do gráfico. Permite customização de cores e labels.
Interconexões: Componente UI genérico para visualização de dados, não utilizado nas páginas fornecidas, mas disponível para dashboards ou relatórios.
collapsible.tsx
Propósito: Um componente que permite expandir e recolher conteúdo.
Dependências: @radix-ui/react-collapsible.
Componentes/Funções Exportadas: Collapsible, CollapsibleTrigger, CollapsibleContent.
Lógica Interna/Estado: Wrapper para a primitiva Radix UI.
Interconexões: Componente UI genérico.
command.tsx
Propósito: Implementa uma paleta de comandos ou um campo de busca com sugestões, usando a biblioteca cmdk.
Dependências: @radix-ui/react-dialog, cmdk, lucide-react (Search), ./lib/utils (cn), ./components/ui/dialog (Dialog, DialogContent).
Componentes/Funções Exportadas: Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator.
Lógica Interna/Estado: Facilita a criação de interfaces de busca rápidas e acessíveis.
Interconexões: Componente UI genérico, não utilizado nas páginas fornecidas, mas útil para implementar uma busca global avançada.
context-menu.tsx
Propósito: Cria um menu de contexto (botão direito do mouse) personalizável.
Dependências: @radix-ui/react-context-menu, lucide-react (Check, ChevronRight, Circle), ./lib/utils (cn).
Componentes/Funções Exportadas: ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
dialog.tsx
Propósito: Um componente de caixa de diálogo modal.
Dependências: @radix-ui/react-dialog, lucide-react (X), ./lib/utils (cn).
Componentes/Funções Exportadas: Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI, com estilos de transição e animação.
Interconexões: Componente UI genérico, usado por CommandDialog.
drawer.tsx
Propósito: Um componente de gaveta (drawer) que desliza de uma borda da tela, geralmente para navegação ou formulários em dispositivos móveis.
Dependências: vaul (biblioteca para drawers), ./lib/utils (cn).
Componentes/Funções Exportadas: Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription.
Lógica Interna/Estado: Wrapper para a biblioteca vaul, com estilos Shadcn/UI.
Interconexões: Componente UI genérico, não utilizado nas páginas fornecidas, mas é uma alternativa ao Sheet para layouts móveis.
dropdown-menu.tsx
Propósito: Cria um menu suspenso (dropdown menu) para ações ou navegação.
Dependências: @radix-ui/react-dropdown-menu, lucide-react (Check, ChevronRight, Circle), ./lib/utils (cn).
Componentes/Funções Exportadas: DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
form.tsx
Propósito: Fornece um conjunto de componentes e hooks para construir formulários React com validação usando react-hook-form.
Dependências: react-hook-form, @radix-ui/react-label, @radix-ui/react-slot, ./lib/utils (cn), ./components/ui/label (Label).
Componentes/Funções Exportadas: useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField.
Lógica Interna/Estado: Integra react-hook-form para gerenciar o estado do formulário, validação e exibição de erros.
Interconexões: Componente UI genérico para formulários.
hover-card.tsx
Propósito: Exibe um cartão de conteúdo ao passar o mouse sobre um elemento.
Dependências: @radix-ui/react-hover-card, ./lib/utils (cn).
Componentes/Funções Exportadas: HoverCard, HoverCardTrigger, HoverCardContent.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
input-otp.tsx
Propósito: Um componente de entrada para códigos OTP (One-Time Password).
Dependências: input-otp (biblioteca), lucide-react (Dot), ./lib/utils (cn).
Componentes/Funções Exportadas: InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator.
Lógica Interna/Estado: Wrapper para a biblioteca input-otp, com estilos Shadcn/UI.
Interconexões: Componente UI genérico, não utilizado nas páginas fornecidas, mas útil para autenticação de dois fatores.
input.tsx
Propósito: Um componente de campo de entrada de texto.
Dependências: Nenhuma, apenas react e ./lib/utils (cn).
Componentes/Funções Exportadas: Input.
Lógica Interna/Estado: Wrapper simples para o elemento <input> HTML, aplicando estilos padrão.
Interconexões: Componente fundamental, amplamente utilizado em toda a aplicação (formulários de login, registro, checkout, busca).
label.tsx
Propósito: Um componente de rótulo para campos de formulário.
Dependências: @radix-ui/react-label, class-variance-authority (cva), ./lib/utils (cn).
Componentes/Funções Exportadas: Label.
Lógica Interna/Estado: Wrapper para a primitiva Radix UI, aplicando estilos.
Interconexões: Usado em formulários em conjunto com Input e outros campos.
menubar.tsx
Propósito: Um componente de barra de menu, tipicamente usado em aplicações desktop.
Dependências: @radix-ui/react-menubar, lucide-react (Check, ChevronRight, Circle), ./lib/utils (cn).
Componentes/Funções Exportadas: Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarPortal, MenubarSubContent, MenubarSubTrigger, MenubarGroup, MenubarSub, MenubarShortcut.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
navigation-menu.tsx
Propósito: Um componente de menu de navegação complexo, com suporte a submenus e indicadores.
Dependências: @radix-ui/react-navigation-menu, class-variance-authority (cva), lucide-react (ChevronDown), ./lib/utils (cn).
Componentes/Funções Exportadas: navigationMenuTriggerStyle, NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico, não usado diretamente no Header atual, que usa links simples.
pagination.tsx
Propósito: Componentes para navegação de paginação.
Dependências: lucide-react (ChevronLeft, ChevronRight, MoreHorizontal), ./lib/utils (cn), ./components/ui/button (buttonVariants).
Componentes/Funções Exportadas: Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious.
Lógica Interna/Estado: Define a estrutura para controles de paginação.
Interconexões: Componente UI genérico, não usado nas páginas fornecidas, mas útil para listagens de produtos paginadas.
popover.tsx
Propósito: Um componente que exibe um popover (conteúdo flutuante) quando um elemento é clicado ou focado.
Dependências: @radix-ui/react-popover, ./lib/utils (cn).
Componentes/Funções Exportadas: Popover, PopoverTrigger, PopoverContent.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
progress.tsx
Propósito: Um componente de barra de progresso.
Dependências: @radix-ui/react-progress, ./lib/utils (cn).
Componentes/Funções Exportadas: Progress.
Lógica Interna/Estado: Wrapper para a primitiva Radix UI.
Interconexões: Componente UI genérico.
radio-group.tsx
Propósito: Um componente de grupo de botões de rádio para seleção única.
Dependências: @radix-ui/react-radio-group, lucide-react (Circle), ./lib/utils (cn).
Componentes/Funções Exportadas: RadioGroup, RadioGroupItem.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
resizable.tsx
Propósito: Componentes para criar layouts redimensionáveis.
Dependências: lucide-react (GripVertical), react-resizable-panels, ./lib/utils (cn).
Componentes/Funções Exportadas: ResizablePanelGroup, ResizablePanel, ResizableHandle.
Lógica Interna/Estado: Wrapper para a biblioteca react-resizable-panels.
Interconexões: Componente UI genérico.
scroll-area.tsx
Propósito: Um componente de área de rolagem customizada com barras de rolagem estilizadas.
Dependências: @radix-ui/react-scroll-area, ./lib/utils (cn).
Componentes/Funções Exportadas: ScrollArea, ScrollBar.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
select.tsx
Propósito: Um componente de menu de seleção (dropdown).
Dependências: @radix-ui/react-select, lucide-react (Check, ChevronDown, ChevronUp), ./lib/utils (cn).
Componentes/Funções Exportadas: Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Usado em Products para ordenação e em ProductDetail para seleção de tamanho/cor.
separator.tsx
Propósito: Um componente de separador horizontal ou vertical.
Dependências: @radix-ui/react-separator, ./lib/utils (cn).
Componentes/Funções Exportadas: Separator.
Lógica Interna/Estado: Wrapper para a primitiva Radix UI.
Interconexões: Usado em ShoppingCart, Checkout, Login, Register para dividir seções de conteúdo.
sheet.tsx
Propósito: Um componente de "folha" (sheet) que desliza de uma borda da tela, similar a um drawer, mas geralmente para conteúdo mais denso.
Dependências: @radix-ui/react-dialog, class-variance-authority (cva), lucide-react (X), ./lib/utils (cn).
Componentes/Funções Exportadas: Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI, com variantes para diferentes lados (top, bottom, left, right).
Interconexões: Crucial para o ShoppingCart que desliza da direita da tela.
sidebar.tsx
Propósito: Componentes para construir barras laterais (sidebars) complexas e responsivas.
Dependências: react, @radix-ui/react-slot, class-variance-authority (cva), lucide-react (PanelLeft), ./hooks/use-mobile (useIsMobile), ./lib/utils (cn), ./components/ui/button (Button), ./components/ui/input (Input), ./components/ui/separator (Separator), ./components/ui/sheet (Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle), ./components/ui/skeleton (Skeleton), ./components/ui/tooltip (Tooltip, TooltipContent, TooltipProvider, TooltipTrigger).
Componentes/Funções Exportadas: Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar.
Lógica Interna/Estado: Gerencia o estado de expansão/colapso da sidebar, responsividade (mobile/desktop), e fornece diversos subcomponentes para estruturar o conteúdo da sidebar.
Interconexões: Componente UI genérico, não usado nas páginas fornecidas, mas é uma solução robusta para navegação lateral ou dashboards.
skeleton.tsx
Propósito: Exibe um placeholder animado para indicar que o conteúdo está carregando.
Dependências: ./lib/utils (cn).
Componentes/Funções Exportadas: Skeleton.
Lógica Interna/Estado: Aplica estilos de animação de pulso a um div.
Interconexões: Usado extensivamente em Home, Products, ShoppingCart, ProductDetail para melhorar a experiência do usuário durante o carregamento de dados.
slider.tsx
Propósito: Um componente de slider (controle deslizante) para selecionar um valor dentro de um intervalo.
Dependências: @radix-ui/react-slider, ./lib/utils (cn).
Componentes/Funções Exportadas: Slider.
Lógica Interna/Estado: Wrapper para a primitiva Radix UI.
Interconexões: Componente UI genérico.
switch.tsx
Propósito: Um componente de switch (alternador).
Dependências: @radix-ui/react-switch, ./lib/utils (cn).
Componentes/Funções Exportadas: Switch.
Lógica Interna/Estado: Wrapper para a primitiva Radix UI.
Interconexões: Componente UI genérico.
table.tsx
Propósito: Componentes para renderização de tabelas HTML.
Dependências: Nenhuma, apenas react e ./lib/utils (cn).
Componentes/Funções Exportadas: Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption.
Lógica Interna/Estado: Define a estrutura para tabelas estilizadas.
Interconexões: Componente UI genérico.
tabs.tsx
Propósito: Um componente de abas para organizar conteúdo em seções.
Dependências: @radix-ui/react-tabs, ./lib/utils (cn).
Componentes/Funções Exportadas: Tabs, TabsList, TabsTrigger, TabsContent.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
textarea.tsx
Propósito: Um componente de área de texto.
Dependências: Nenhuma, apenas react e ./lib/utils (cn).
Componentes/Funções Exportadas: Textarea.
Lógica Interna/Estado: Wrapper simples para o elemento <textarea> HTML.
Interconexões: Componente UI genérico.
toast.tsx
Propósito: Define a estrutura e o estilo para as notificações de toast.
Dependências: @radix-ui/react-toast, class-variance-authority (cva), lucide-react (X), ./lib/utils (cn).
Componentes/Funções Exportadas: ToastProvider, ToastViewport, Toast, ToastAction, ToastClose, ToastTitle, ToastDescription, ToastProps, ToastActionElement.
Lógica Interna/Estado: Define as variantes de estilo para toasts (default, destructive) e a funcionalidade de fechar.
Interconexões: Parte do sistema de toasts, usado por toaster.tsx e use-toast.ts.
toaster.tsx
Propósito: O componente que renderiza todas as notificações de toast ativas na tela.
Dependências: ./hooks/use-toast (useToast), ./components/ui/toast (Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport).
Componentes/Funções Exportadas: Toaster.
Lógica Interna/Estado: Obtém a lista de toasts do hook useToast e os mapeia para componentes Toast individuais.
Interconexões: Deve ser renderizado uma vez no App.tsx para que as notificações de toast funcionem em toda a aplicação.
toggle-group.tsx
Propósito: Um componente de grupo de botões de alternância para seleção múltipla ou única.
Dependências: @radix-ui/react-toggle-group, class-variance-authority (VariantProps), ./lib/utils (cn), ./components/ui/toggle (toggleVariants).
Componentes/Funções Exportadas: ToggleGroup, ToggleGroupItem.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI.
Interconexões: Componente UI genérico.
toggle.tsx
Propósito: Um componente de botão de alternância (toggle button).
Dependências: @radix-ui/react-toggle, class-variance-authority (cva), ./lib/utils (cn).
Componentes/Funções Exportadas: Toggle, toggleVariants.
Lógica Interna/Estado: Wrapper para a primitiva Radix UI, com variantes de estilo.
Interconexões: Componente UI genérico, usado por toggle-group.tsx.
tooltip.tsx
Propósito: Exibe uma dica de ferramenta (tooltip) ao passar o mouse sobre um elemento.
Dependências: @radix-ui/react-tooltip, ./lib/utils (cn).
Componentes/Funções Exportadas: TooltipProvider, Tooltip, TooltipTrigger, TooltipContent.
Lógica Interna/Estado: Wrapper para as primitivas Radix UI. O TooltipProvider deve envolver a aplicação (em App.tsx).
Interconexões: Usado em whatsapp-button.tsx para a dica de ferramenta do botão.
whatsapp-button.tsx
Propósito: Um botão flutuante de WhatsApp que aparece na tela, com animações e um tooltip.
Dependências: react (useState, useEffect), lucide-react (MessageCircle, Phone - observação: estas não são usadas no código final).
Componentes/Funções Exportadas: WhatsAppButton.
Lógica Interna/Estado:
Gerencia a visibilidade do botão após um atraso (isVisible).
Controla o estado de hover (isHovered) para aplicar animações.
Controla o estado de pulso (isPulsing) para a animação inicial.
A função handleClick constrói a URL do WhatsApp com o número de telefone e mensagem codificados.
Inclui efeitos visuais como brilho de fundo, ondulações e brilhos ao passar o mouse.
Possui um "Mobile Notification Bubble" que aparece em telas pequenas.
Interconexões: Renderizado em Home, Products, ProductDetail e Checkout para oferecer um canal de comunicação direto com o cliente.
III. Componentes de Layout
Esta seção descreve os componentes que definem a estrutura geral das páginas.

footer.tsx
Propósito: Componente de rodapé da aplicação, contendo informações da marca, categorias, atendimento, newsletter e dados de copyright/pagamento.
Dependências: wouter (Link), ./components/ui/input (Input), ./components/ui/button (Button), lucide-react (ArrowRight), react (useState), ./hooks/use-toast (useToast).
Componentes/Funções Exportadas: Footer.
Lógica Interna/Estado:
Gerencia o estado do input de e-mail para a newsletter.
A função handleNewsletterSubmit simula a inscrição e exibe um toast de sucesso.
Inclui links de navegação para categorias e seções de suporte.
Exibe ícones de redes sociais e uma imagem do Nubank para métodos de pagamento.
Interconexões: Renderizado em todas as páginas principais (Home, Products, ProductDetail, Checkout, Login, Register, OrderSuccess, Wishlist) para fornecer uma experiência de usuário consistente e acesso a informações importantes.
header.tsx
Propósito: Componente de cabeçalho da aplicação, contendo o logo, navegação principal, barra de busca e ícones de ações (carrinho, wishlist, login).
Dependências: react (useState), wouter (Link, useLocation), lucide-react (Search, Heart, ShoppingBag, Menu, X), ./components/ui/button (Button), ./components/ui/input (Input), ./components/ui/badge (Badge), ./hooks/use-cart (useCart), ./hooks/use-wishlist (useWishlist), ./lib/store (useUIStore), ./lib/utils (cn).
Componentes/Funções Exportadas: Header.
Lógica Interna/Estado:
Gerencia o estado da barra de busca (searchQuery).
handleSearch: Redireciona para a página de produtos com o termo de busca.
Obtém a contagem de itens do carrinho (itemCount) e da wishlist (wishlistCount) usando os hooks useCart e useWishlist.
Utiliza useUIStore para controlar a abertura/fechamento do carrinho e do menu mobile.
Implementa um menu de navegação responsivo (desktop e mobile).
Interconexões: Renderizado em todas as páginas principais, fornecendo navegação global e acesso rápido a funcionalidades chave do e-commerce. Interage diretamente com os provedores de carrinho, wishlist e UI.
IV. Componentes Relacionados a Produtos
Esta seção detalha os componentes específicos para exibir informações de produtos.

product-card.tsx
Propósito: Componente para exibir um único produto em listagens (grid ou lista), com imagem, nome, preço, badges e botões de ação rápida.
Dependências: react (useState, useEffect), lucide-react (Heart, Plus, Check, Loader2, Eye, Star), wouter (Link), ./components/ui/button (Button), ./components/ui/badge (Badge), ./components/ui/cart-notification (CartNotification), ./hooks/use-cart (useCart), ./hooks/use-wishlist (useWishlist), ./lib/mock-data (MockProduct).
Componentes/Funções Exportadas: ProductCard.
Lógica Interna/Estado:
Gerencia o estado de carregamento da imagem (imageLoaded).
handleAddToCart: Adiciona o produto ao carrinho, exibe um estado de carregamento e um toast/notificação. Previne navegação padrão do link.
handleWishlistToggle: Adiciona/remove o produto da wishlist. Previne navegação padrão do link.
Verifica se o produto já está no carrinho (isInCart) ou na wishlist (inWishlist) para ajustar o texto e o estilo dos botões.
Exibe badges de "Novo" e "Desconto" com base nas propriedades do produto.
O card inteiro e a imagem são links para a página de detalhes do produto.
Interconexões: Usado em Products para listar todos os produtos, em Home para produtos em destaque e em ProductDetail para produtos relacionados. Interage diretamente com useCart e useWishlist.
V. Componentes Relacionados ao Carrinho
Esta seção detalha os componentes que gerenciam a visualização e interação com o carrinho de compras.

cart-item.tsx
Propósito: Componente para exibir um único item dentro do carrinho de compras, com imagem, nome, preço, opções (tamanho/cor) e controles de quantidade.
Dependências: lucide-react (Minus, Plus, Trash2), ./components/ui/button (Button), ./hooks/use-cart (useCart), ./lib/mock-data (MockProduct).
Componentes/Funções Exportadas: CartItemComponent.
Lógica Interna/Estado:
handleDecrease, handleIncrease: Atualizam a quantidade do item no carrinho.
handleRemove: Remove o item do carrinho.
Calcula o total do item.
Interconexões: Renderizado dentro de ShoppingCart para cada item no carrinho. Interage diretamente com useCart para modificações.
shopping-cart.tsx
Propósito: O componente principal do carrinho de compras, exibido como uma folha (sheet) que desliza da direita da tela. Mostra a lista de itens, o total e um botão para finalizar a compra.
Dependências: lucide-react (X, CreditCard, ArrowRight, ShoppingBag, Lock), ./components/ui/button (Button), ./components/ui/sheet (Sheet, SheetContent, SheetHeader, SheetTitle), ./components/ui/separator (Separator), ./hooks/use-cart (useCart), ./lib/store (useUIStore), wouter (useLocation), ./components/cart/cart-item (CartItemComponent), ./components/ui/skeleton (Skeleton).
Componentes/Funções Exportadas: ShoppingCart.
Lógica Interna/Estado:
Obtém os itens do carrinho, o total e o estado de carregamento do hook useCart.
Obtém e define o estado de abertura/fechamento do carrinho de useUIStore.
handleCheckout: Fecha o carrinho e redireciona para a página de checkout.
Exibe esqueletos (Skeleton) durante o carregamento.
Mostra uma mensagem de "carrinho vazio" se não houver itens.
Calcula e exibe a mensagem de frete grátis com base no total.
Interconexões: Ativado pelo Header e CartNotification via useUIStore. Utiliza CartItemComponent para renderizar cada item. Redireciona para Checkout.
VI. Componentes de Frete
Esta seção detalha os componentes relacionados ao cálculo e seleção de frete.

frontend-shipping-calculator.tsx
Propósito: Um componente de UI para calcular e exibir as opções de frete com base em um CEP e nos itens do carrinho.
Dependências: react (useState, useEffect), ./components/ui/button (Button), ./components/ui/input (Input), ./components/ui/label (Label), lucide-react (Loader2, Truck, Clock, MapPin, CheckCircle), ./hooks/use-shipping-fronted (useShippingFrontend), ./hooks/use-toast (useToast).
Componentes/Funções Exportadas: FrontendShippingCalculator.
Lógica Interna/Estado:
Gerencia o CEP de entrada e as informações de localização (cidade/estado).
getTotalPackageInfo: Calcula o peso total, valor e dimensões dos itens do carrinho para o cálculo do frete.
handleCalculateShipping: Valida o CEP, chama calculateShippingRates do hook useShippingFrontend e exibe toasts para erros.
Integração com ViaCEP para obter cidade/estado automaticamente.
Auto-calcula o frete quando o CEP é completo.
Exibe as opções de frete (SEDEX, PAC) com preço e tempo de entrega.
Interconexões: Usado na página Checkout para permitir que o usuário calcule e selecione a opção de frete. Depende do hook useShippingFrontend para a lógica de cálculo.
VII. Hooks Personalizados
Esta seção descreve os hooks React personalizados que encapsulam lógica de negócios e estado reutilizável.

use-cart.tsx
Propósito: Hook personalizado e provedor de contexto para gerenciar o estado do carrinho de compras (adicionar, remover, atualizar quantidade, calcular total).
Dependências: react (createContext, useContext, useState, useEffect, ReactNode), ./hooks/use-toast (useToast), ./lib/mock-data (MockProduct, mockProducts).
Componentes/Funções Exportadas: CartProvider, useCart.
Lógica Interna/Estado:
items: Array de itens no carrinho.
itemCount: Número total de produtos no carrinho.
total: Valor total dos produtos no carrinho.
isLoading: Indica se uma operação do carrinho está em andamento.
Persistência: Salva e carrega o estado do carrinho no localStorage.
addToCart: Adiciona um produto ao carrinho. Se o produto já existe (com mesmo tamanho/cor), atualiza a quantidade. Simula um delay de rede.
updateQuantity: Altera a quantidade de um item específico.
removeFromCart: Remove um item do carrinho e exibe um toast.
clearCart: Esvazia o carrinho e exibe um toast.
Interconexões: CartProvider envolve toda a aplicação em App.tsx. useCart é consumido por Header, ShoppingCart, CartItemComponent, ProductCard, ProductDetail, Checkout e Wishlist.
use-mobile.tsx
Propósito: Hook para determinar se o dispositivo atual é móvel com base na largura da tela.
Dependências: react (useState, useEffect).
Componentes/Funções Exportadas: useIsMobile.
Lógica Interna/Estado:
Define um breakpoint móvel.
Usa window.matchMedia e um listener de redimensionamento para atualizar o estado isMobile.
Interconexões: Usado em sidebar.tsx para adaptar o comportamento da barra lateral à responsividade.
use-shipping-fronted.tsx
Propósito: Hook personalizado para calcular taxas de frete no frontend, utilizando a lógica de shipping-calculator.ts.
Dependências: react (useState, useCallback), ./lib/shipping-calculator (calculateShipping, validateZipCode, formatZipCode, ShippingResult).
Componentes/Funções Exportadas: useShippingFrontend.
Lógica Interna/Estado:
shippingData: Armazena os resultados do cálculo do frete.
isLoading: Indica se o cálculo está em andamento.
error: Armazena mensagens de erro.
calculateShippingRates: Função assíncrona que valida o CEP e chama calculateShipping do arquivo de utilidade.
resetShipping: Reinicia o estado do frete.
formatZip: Formata o CEP.
Interconexões: Consumido por FrontendShippingCalculator para realizar os cálculos de frete.
use-shipping.tsx
Propósito: OBSOLETO. Este arquivo é mantido apenas para compatibilidade e não deve ser usado. A funcionalidade foi substituída por use-shipping-fronted.tsx.
Dependências: Nenhuma.
Componentes/Funções Exportadas: useShipping.
Lógica Interna/Estado: As funções calculateShipping e validateZipCode lançam um erro informando que o hook foi descontinuado.
Interconexões: Nenhuma funcionalidade ativa.
use-toast.ts
Propósito: Hook personalizado e sistema de gerenciamento de estado para exibir notificações de toast em toda a aplicação.
Dependências: react, ./components/ui/toast (ToastActionElement, ToastProps).
Componentes/Funções Exportadas: useToast, toast (função utilitária para disparar toasts).
Lógica Interna/Estado:
Usa um padrão de reducer e listeners para gerenciar uma fila de toasts globalmente.
ADD_TOAST, UPDATE_TOAST, DISMISS_TOAST, REMOVE_TOAST: Tipos de ações para modificar o estado dos toasts.
addToRemoveQueue: Adiciona um toast a uma fila para ser removido após um atraso.
toast (função): Facilita a criação e o disparo de novas notificações.
Interconexões: useToast é consumido por Toaster para renderizar os toasts. A função toast é utilizada por diversos componentes (useCart, useWishlist, Login, Register, Checkout, ProductCard, ProductDetail, footer) para exibir mensagens de feedback ao usuário.
use-wishlist.tsx
Propósito: Hook personalizado e provedor de contexto para gerenciar o estado da lista de desejos (adicionar, remover, verificar existência).
Dependências: react (createContext, useContext, useState, useEffect, ReactNode), ./hooks/use-toast (useToast), ./lib/mock-data (MockProduct, mockProducts).
Componentes/Funções Exportadas: WishlistProvider, useWishlist.
Lógica Interna/Estado:
items: Array de itens na wishlist.
count: Número total de itens na wishlist.
isLoading: Indica se uma operação da wishlist está em andamento.
Persistência: Salva e carrega o estado da wishlist no localStorage.
isInWishlist: Verifica se um produto está na wishlist.
addToWishlist: Adiciona um produto à wishlist, simula delay e exibe toast.
removeFromWishlist: Remove um produto da wishlist e exibe toast.
toggleWishlist: Alterna a presença de um produto na wishlist.
Interconexões: WishlistProvider envolve toda a aplicação em App.tsx. useWishlist é consumido por Header, ProductCard, ProductDetail e Wishlist (página).
VIII. Arquivos de Utilidade/Biblioteca
Esta seção descreve arquivos que fornecem dados, lógica de negócios ou funções auxiliares.

mock-data.ts
Propósito: Armazena dados simulados (mock data) para produtos e categorias, e fornece funções para filtrar e buscar esses dados.
Dependências: Nenhuma, apenas define tipos e dados.
Componentes/Funções Exportadas: MockProduct, MockCategory, mockCategories, mockProducts, getFilteredProducts, getProductById, getCategoryBySlug, getRelatedProducts.
Lógica Interna/Estado:
Define interfaces MockProduct e MockCategory com detalhes como preço, peso, dimensões, etc.
mockCategories: Array de categorias pré-definidas.
mockProducts: Array de produtos pré-definidos, incluindo detalhes para cálculo de frete.
getFilteredProducts: Filtra produtos por categoria, termo de busca, destaque (isFeatured) e novidade (isNew).
getProductById: Busca um produto por ID.
getCategoryBySlug: Busca uma categoria por slug.
getRelatedProducts: Retorna produtos relacionados (da mesma categoria).
Interconexões: É a "fonte de dados" para a aplicação no frontend. Usado por Products, ProductDetail, Home, useCart, useWishlist e FrontendShippingCalculator.
queryClient.ts
Propósito: Configura o cliente do React Query para gerenciamento de estado assíncrono e requisições de API.
Dependências: @tanstack/react-query, react.
Componentes/Funções Exportadas: queryClient, apiRequest, getQueryFn.
Lógica Interna/Estado:
throwIfResNotOk: Função auxiliar para verificar o status da resposta HTTP e lançar um erro se não for ok.
apiRequest: Função para fazer requisições HTTP genéricas.
getQueryFn: Função que retorna uma QueryFunction para o React Query, com tratamento de erro e inclusão de credenciais. Permite configurar o comportamento em caso de 401 (não autorizado).
queryClient: Instância do QueryClient configurada com opções padrão (sem refetch, sem retry, staleTime infinito para queries).
Interconexões: queryClient é passado para o QueryClientProvider em App.tsx, tornando o React Query disponível globalmente. Embora apiRequest e getQueryFn sejam exportados, as páginas e hooks atuais não utilizam diretamente o React Query para buscar dados (usam mock-data e useShippingFrontend que faz fetch direto), mas a infraestrutura está pronta.
shipping-calculator.ts
Propósito: Contém a lógica de cálculo de frete no frontend, incluindo validação de CEP e estimativa de custos e prazos com base na região e nas características do pacote.
Dependências: Nenhuma (faz fetch direto para ViaCEP).
Componentes/Funções Exportadas: ShippingOption, ShippingResult, validateZipCode, formatZipCode, checkZipCodeExists, calculateShipping.
Lógica Interna/Estado:
validateZipCode: Valida o formato de um CEP.
formatZipCode: Formata um CEP (ex: "12345-678").
checkZipCodeExists: Faz uma requisição fetch para a API do ViaCEP para verificar a validade do CEP e obter informações de cidade/estado.
calculateShipping: A função principal de cálculo.
Primeiro, valida o CEP usando checkZipCodeExists.
Determina preços e prazos de SEDEX e PAC com base nos dois primeiros dígitos do CEP (região). As faixas de preço e tempo são estimativas regionais.
Ajusta os preços com base no peso (acima de 1kg) e no valor declarado (seguro).
Retorna um ShippingResult com as opções de frete.
Interconexões: Utilizado pelo hook useShippingFrontend para realizar os cálculos de frete. É a inteligência por trás da funcionalidade de frete no checkout.
store.ts
Propósito: Define stores globais usando a biblioteca zustand para gerenciar estados de UI que precisam ser acessíveis em vários componentes, como o estado da barra de busca e a visibilidade do carrinho/menu mobile.
Dependências: zustand, @shared/schema (tipos Product, CartItem, WishlistItem - observação: estes tipos não são definidos nos arquivos fornecidos, mas implicam uma dependência externa ou futura).
Componentes/Funções Exportadas: useSearchStore, useUIStore.
Lógica Interna/Estado:
useSearchStore: Gerencia o termo de busca e o estado de abertura da busca.
useUIStore: Gerencia o estado de abertura do carrinho (isCartOpen) e do menu mobile (isMobileMenuOpen), e fornece funções para alternar esses estados (toggleCart, toggleMobileMenu).
Interconexões: useUIStore é consumido por Header para controlar o menu mobile e o carrinho, e por ShoppingCart e CartNotification para reagir e modificar o estado do carrinho.
utils.ts
Propósito: Contém funções utilitárias genéricas, principalmente para manipulação de classes CSS.
Dependências: clsx, tailwind-merge.
Componentes/Funções Exportadas: cn.
Lógica Interna/Estado:
cn: Combina condicionalmente classes CSS e resolve conflitos do Tailwind CSS usando tailwind-merge.
Interconexões: Amplamente importado e utilizado em quase todos os componentes UI e de layout para construir strings de classes CSS dinamicamente.
IX. Páginas da Aplicação
Esta seção descreve as páginas principais da aplicação.

checkout.tsx
Propósito: A página de checkout, onde o usuário insere seus dados pessoais, endereço, seleciona o frete e finaliza a compra.
Dependências: react (useState), ./components/ui/button (Button), ./components/ui/card (Card, CardContent, CardHeader, CardTitle), ./components/ui/input (Input), ./components/ui/label (Label), ./components/ui/separator (Separator), lucide-react (MapPin, CreditCard, Truck, ShoppingBag, Check), ./hooks/use-toast (useToast), ./hooks/use-cart (useCart), ./components/layout/header (Header), ./components/layout/footer (Footer), ./components/ui/whatsapp-button (WhatsAppButton), ./components/shipping/frontend-shipping-calculator (FrontendShippingCalculator), wouter (useLocation).
Componentes/Funções Exportadas: Checkout.
Lógica Interna/Estado:
Gerencia o estado dos campos do formulário (formData).
Gerencia o preço do frete, serviço selecionado e tempo de entrega (shippingPrice, selectedShippingService, shippingDeliveryTime).
currentStep: Controla o fluxo do checkout em etapas (Dados Pessoais, Endereço, Pagamento, Revisão).
handleSubmit: Simula o processamento do pedido, limpa o carrinho e redireciona para a página de sucesso. Exibe toasts para sucesso ou erro.
nextStep, prevStep: Funções para navegar entre as etapas.
Exibe um resumo do pedido com os itens do carrinho e o total.
Integra FrontendShippingCalculator para o cálculo do frete.
Redireciona se o carrinho estiver vazio.
Interconexões: Recebe dados do useCart. Utiliza FrontendShippingCalculator. Redireciona para OrderSuccess.
home.tsx
Propósito: A página inicial da aplicação, apresentando uma hero section, categorias, produtos em destaque e benefícios da loja.
Dependências: react (useState, useEffect), wouter (Link), ./components/ui/button (Button), ./components/ui/skeleton (Skeleton), lucide-react (Truck, Shield, RotateCcw, ArrowRight, Plus), ./components/layout/header (Header), ./components/layout/footer (Footer), ./components/product/product-card (ProductCard), ./components/cart/shopping-cart (ShoppingCart), ./components/ui/whatsapp-button (WhatsAppButton), ./lib/mock-data (mockProducts, mockCategories, getFilteredProducts, MockProduct, MockCategory), ./components/InstagramFeedSection (InstagramFeedSection - componente importado, mas não fornecido no contexto).
Componentes/Funções Exportadas: Home.
Lógica Interna/Estado:
featuredProducts: Produtos marcados como destaque.
categories: Lista de categorias.
isLoading: Estado de carregamento para exibir esqueletos.
currentImageIndex: Controla o carrossel de imagens na hero section.
Carrossel de Imagens: Um carrossel manual na hero section que alterna imagens a cada 3 segundos.
Categorias: Exibe as primeiras 6 categorias com imagens e links.
Produtos em Destaque: Lista os produtos em destaque usando ProductCard.
Trust Badges: Seção com ícones e descrições de benefícios (frete grátis, compra segura, troca fácil).
Interconexões: Utiliza mock-data para obter produtos e categorias. Renderiza Header, Footer, ShoppingCart e WhatsAppButton. Links para Products e ProductDetail.
login.tsx
Propósito: A página de login para usuários existentes.
Dependências: react (useState), ./components/ui/button (Button), ./components/ui/card (Card, CardContent, CardHeader, CardTitle), ./components/ui/input (Input), ./components/ui/label (Label), ./components/ui/separator (Separator), lucide-react (Eye, EyeOff, Mail, Lock, Facebook, Chrome), ./hooks/use-toast (useToast), ./components/layout/header (Header), ./components/layout/footer (Footer), wouter (useLocation).
Componentes/Funções Exportadas: Login.
Lógica Interna/Estado:
Gerencia o estado dos campos de e-mail e senha (formData).
showPassword: Alterna a visibilidade da senha.
handleSubmit: Simula o processo de login, exibe toasts e redireciona para a página inicial.
handleSocialLogin: Função placeholder para login social.
Interconexões: Redireciona para Register e para a página inicial após o login.
not-found.tsx
Propósito: Uma página genérica de "404 Não Encontrado".
Dependências: ./components/ui/card (Card, CardContent), lucide-react (AlertCircle).
Componentes/Funções Exportadas: NotFound.
Lógica Interna/Estado: Exibe uma mensagem de erro simples.
Interconexões: É a rota fallback no App.tsx para qualquer URL não mapeada.
order-success.tsx
Propósito: A página exibida após a conclusão bem-sucedida de um pedido.
Dependências: react (useEffect, useState), ./components/ui/button (Button), ./components/ui/card (Card, CardContent, CardHeader, CardTitle), lucide-react (CheckCircle, Package, Truck, CreditCard, Download, ArrowRight), ./components/layout/header (Header), ./components/layout/footer (Footer), wouter (useLocation).
Componentes/Funções Exportadas: OrderSuccess.
Lógica Interna/Estado:
Gera um número de pedido aleatório e uma data de entrega estimada.
Exibe o status do pedido em etapas.
Fornece opções para baixar o comprovante, continuar comprando ou voltar ao início.
Inclui informações de contato para suporte.
Interconexões: Redirecionado de Checkout após a finalização do pedido.
product-detail.tsx
Propósito: A página de detalhes de um produto individual, exibindo informações completas, opções de seleção (tamanho, cor), quantidade e produtos relacionados.
Dependências: react (useState, useEffect), wouter (useRoute, useLocation), lucide-react (Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, ArrowLeft, Plus, Minus, Check, Loader2), ./components/ui/button (Button), ./components/ui/badge (Badge), ./components/ui/separator (Separator), ./components/ui/select (Select, SelectContent, SelectItem, SelectTrigger, SelectValue), ./components/ui/skeleton (Skeleton), ./components/layout/header (Header), ./components/layout/footer (Footer), ./components/product/product-card (ProductCard), ./components/ui/whatsapp-button (WhatsAppButton), ./components/cart/shopping-cart (ShoppingCart), ./components/ui/cart-notification (CartNotification), ./hooks/use-cart (useCart), ./hooks/use-wishlist (useWishlist), ./hooks/use-toast (useToast), ./lib/mock-data (MockProduct, mockProducts, getRelatedProducts), ./lib/utils (cn).
Componentes/Funções Exportadas: ProductDetail.
Lógica Interna/Estado:
Obtém o productId da URL.
product: Armazena os dados do produto atual.
relatedProducts: Produtos relacionados.
selectedSize, selectedColor, quantity: Estados para as opções de compra.
isLoading: Estado de carregamento.
isAddingToCart, justAdded, showNotification: Estados para o feedback de adição ao carrinho.
loadProductData: Busca os dados do produto e produtos relacionados de mock-data.
handleAddToCart: Adiciona o produto ao carrinho com as opções selecionadas, exibe toasts e CartNotification.
handleWishlistToggle: Alterna o produto na wishlist.
Exibe informações detalhadas, rating, badges de desconto/novo.
Permite selecionar tamanho, cor e quantidade.
Exibe esqueletos durante o carregamento.
Redireciona para a página de produtos se o produto não for encontrado.
Interconexões: Utiliza mock-data para obter dados do produto e relacionados. Interage com useCart e useWishlist. Renderiza Header, Footer, ShoppingCart, WhatsAppButton e ProductCard (para produtos relacionados).
products.tsx
Propósito: A página de listagem de produtos, permitindo filtrar por categoria, buscar e ordenar.
Dependências: react (useState, useEffect), wouter (useLocation), lucide-react (Filter, Grid, List), ./components/ui/button (Button), ./components/ui/select (Select, SelectContent, SelectItem, SelectTrigger, SelectValue), ./components/ui/skeleton (Skeleton), ./components/layout/header (Header), ./components/layout/footer (Footer), ./components/product/product-card (ProductCard), ./components/cart/shopping-cart (ShoppingCart), ./components/ui/whatsapp-button (WhatsAppButton), ./lib/mock-data (mockProducts, mockCategories, getFilteredProducts, getCategoryBySlug, MockProduct, MockCategory).
Componentes/Funções Exportadas: Products.
Lógica Interna/Estado:
sortBy: Controla a ordenação dos produtos.
viewMode: Alterna entre visualização em grade (grid) e lista (list).
products: Lista de produtos filtrados/ordenados.
categories: Lista de categorias.
isLoading: Estado de carregamento.
Obtém parâmetros da URL (categoria, busca, destaque).
loadProducts: Filtra produtos usando getFilteredProducts de mock-data. Simula um delay de carregamento.
sortedProducts: Aplica a lógica de ordenação (preço, nome, padrão).
getPageTitle: Define o título da página com base nos filtros.
Exibe esqueletos durante o carregamento.
Mostra uma mensagem se nenhum produto for encontrado.
Interconexões: Obtém dados de mock-data. Renderiza Header, Footer, ShoppingCart e WhatsAppButton. Utiliza ProductCard para exibir cada produto.
register.tsx
Propósito: A página de registro para novos usuários.
Dependências: react (useState), ./components/ui/button (Button), ./components/ui/card (Card, CardContent, CardHeader, CardTitle), ./components/ui/input (Input), ./components/ui/label (Label), ./components/ui/separator (Separator), lucide-react (Eye, EyeOff, Mail, Lock, User, Phone, Facebook, Chrome), ./hooks/use-toast (useToast), ./components/layout/header (Header), ./components/layout/footer (Footer), wouter (useLocation).
Componentes/Funções Exportadas: Register.
Lógica Interna/Estado:
Gerencia o estado dos campos do formulário (nome, e-mail, telefone, senhas, termos).
showPassword, showConfirmPassword: Alternam a visibilidade das senhas.
handleSubmit: Valida senhas e termos, simula o processo de registro, exibe toasts e redireciona para a página de login.
handleSocialLogin: Função placeholder para cadastro social.
Interconexões: Redireciona para Login após o cadastro.
wishlist.tsx
Propósito: A página que exibe os produtos adicionados à lista de desejos do usuário.
Dependências: lucide-react (Heart, ShoppingBag, Trash2), ./components/ui/button (Button), ./components/ui/card (Card, CardContent), ./components/ui/badge (Badge), ./components/layout/header (Header), ./components/layout/footer (Footer), ./hooks/use-wishlist (useWishlist), ./hooks/use-cart (useCart), ./hooks/use-toast (useToast), wouter (useLocation).
Componentes/Funções Exportadas: Wishlist.
Lógica Interna/Estado:
Obtém os itens da wishlist de useWishlist.
handleAddToCart: Adiciona um produto da wishlist ao carrinho.
handleRemoveFromWishlist: Remove um produto da wishlist.
Exibe uma mensagem de "wishlist vazia" se não houver itens.
Para cada item, exibe um card com imagem, nome, categoria, preço e botões para adicionar ao carrinho ou remover da wishlist.
Interconexões: Consome useWishlist e useCart. Redireciona para Products.