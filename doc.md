Documentação Completa do Frontend (Atualizada)
Este documento descreve a arquitetura, os componentes, a lógica e os fluxos de dados do frontend do sistema de e-commerce. Construído com React, Wouter para roteamento, Zustand para gerenciamento de estado global e React Query para gestão de dados assíncronos, o frontend visa proporcionar uma experiência de usuário fluida e responsiva. A interface é estilizada com Tailwind CSS e componentes Shadcn/ui.

1. Visão Geral da Arquitetura Frontend
O frontend é uma Single Page Application (SPA) desenvolvida com:

React: Biblioteca para construção da interface de usuário.
Wouter: Uma pequena e rápida biblioteca de roteamento para React, ideal para SPAs.
Zustand: Uma solução de gerenciamento de estado leve e flexível, utilizada para estados globais da UI (carrinho, menu mobile).
React Query (TanStack Query): Gerencia o estado do servidor, caching, sincronização e mutações de dados, simplificando a interação com a API de backend.
Shadcn/ui: Uma coleção de componentes UI reutilizáveis, construídos com Radix UI e estilizados com Tailwind CSS, que aceleram o desenvolvimento da interface.
Tailwind CSS: Um framework CSS utilitário que permite construir designs rapidamente.
Axios (implícito via apiRequest): Biblioteca para fazer requisições HTTP (embora o apiRequest utilize fetch nativo, a abstração é similar).
A estrutura do projeto é modular, com páginas (pages/), componentes reutilizáveis (components/), hooks personalizados (hooks/), utilitários (lib/) e definições de tipos (types/).

2. Configuração Central
main.tsx:
Propósito: Ponto de entrada da aplicação React.
Lógica: Renderiza o componente App no elemento DOM com id="root".
App.tsx:
Propósito: Componente raiz que configura os provedores globais e o roteamento.
Lógica:
QueryClientProvider: Fornece o queryClient (configurado em lib/queryClient.ts) para toda a árvore de componentes, habilitando o uso de React Query.
TooltipProvider: Provedor para os tooltips do Shadcn/ui.
CartProvider e WishlistProvider: Provedores para os contextos de carrinho e lista de desejos, tornando suas funcionalidades disponíveis globalmente.
Toaster: Componente que renderiza as notificações (toasts) em toda a aplicação.
Router: Componente que define as rotas da aplicação usando wouter.
index.css:
Propósito: Folha de estilos global.
Lógica: Importa fontes (Montserrat, Poppins), inclui as diretivas do Tailwind CSS (@tailwind base, @tailwind components, @tailwind utilities), define variáveis CSS para o tema (cores, raio de borda) e inclui classes utilitárias customizadas para gradientes, sombras, etc. Também contém animações e estilos responsivos específicos.
3. Utilitários e Hooks Globais
3.1. lib/queryClient.ts
Propósito: Centraliza a configuração do React Query e a lógica para fazer requisições HTTP ao backend.
Componentes/Funções Chave:
API_BASE_URL: Define a URL base do backend, lendo de variáveis de ambiente (VITE_BACKEND_API_URL) com fallback para desenvolvimento local.
getOrCreateGuestId(): Gera e persiste um guestId (UUID v4) no localStorage se não existir. Essencial para rastrear carrinhos e pedidos de usuários não autenticados.
throwIfResNotOk(res: Response): Função auxiliar que verifica se a resposta HTTP é ok (status 2xx). Se não for, tenta parsear a mensagem de erro do corpo da resposta e lança um Error. Clona a resposta para evitar consumo prematuro do stream.
getAuthToken(): Recupera o access_token do localStorage.
apiRequest(method, url, data):
Lógica: Função principal para interagir com o backend.
Adiciona o Authorization header com o token JWT se o usuário estiver autenticado.
Para requisições relacionadas ao carrinho (/cart), se o usuário não estiver autenticado, adiciona o guestId como query parameter (exceto para POST /cart/items onde o guestId já vai no corpo).
Serializa o data para JSON no corpo da requisição.
Chama fetch e throwIfResNotOk para tratamento de erros.
getQueryFn: Uma função utilitária que retorna uma QueryFunction compatível com React Query. Permite configurar o comportamento para respostas 401 (lançar erro ou retornar null).
queryClient: Instância do QueryClient com configurações padrão para queries e mutations (ex: staleTime, retry com lógica para 401).
3.2. lib/store.ts
Propósito: Gerenciamento de estado global da UI usando Zustand.
Componentes/Funções Chave:
useSearchStore: Gerencia o estado da barra de pesquisa (query e visibilidade).
useUIStore: Gerencia estados da interface como a visibilidade do carrinho (isCartOpen) e do menu mobile (isMobileMenuOpen).
toggleCart(): Alterna a visibilidade do carrinho.
toggleMobileMenu(): Alterna a visibilidade do menu mobile.
3.3. hooks/use-toast.ts, components/ui/toaster.tsx, components/ui/toast.tsx
Propósito: Sistema de notificações (toasts) para feedback ao usuário.
Lógica:
useToast: Hook que expõe funções para adicionar, atualizar e remover toasts.
ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction: Componentes Shadcn/ui que renderizam os toasts.
Fluxo: Quando toast() é chamado, ele adiciona uma notificação ao estado global gerenciado por useToast, que é então renderizada pelo Toaster.
3.4. lib/utils.ts
Propósito: Utilitários gerais.
Componentes/Funções Chave:
cn(...inputs: ClassValue[]): Função auxiliar que combina classes Tailwind CSS de forma condicional e resolve conflitos usando clsx e tailwind-merge. Amplamente utilizada em todos os componentes.
3.5. hooks/use-mobile.tsx
Propósito: Hook para detectar se o dispositivo é mobile com base em um breakpoint.
Lógica: Utiliza window.matchMedia para verificar a largura da tela e atualiza o estado isMobile em tempo real. Usado para renderização condicional ou ajustes de UI em dispositivos móveis.
4. Hooks de Gerenciamento de Dados
4.1. hooks/use-cart.tsx
Propósito: Gerenciar a lógica do carrinho de compras (adicionar, atualizar, remover itens, calcular total).
Contexto: CartContext para disponibilizar as funcionalidades do carrinho para toda a aplicação.
Lógica:
CartProvider:
Determina se o usuário está autenticado (isAuthenticated) ou é um convidado (guestId).
cartQueryKey: Chave de query dinâmica para o carrinho, dependendo do status de autenticação.
useQuery: Busca o carrinho do backend (/cart para usuários, /cart/guest para convidados). Os dados recebidos são "desembrulhados" da propriedade data da resposta do backend.
useMutation (para addToCart, updateQuantity, removeFromCart, clearCart):
addToCart: Envia productId, quantity, size, color e guestId (se não autenticado) para POST /cart/items.
updateQuantity: Envia quantity para PATCH /cart/items/:itemId.
removeFromCart: Envia DELETE para /cart/items/:itemId.
clearCart: Envia DELETE para /cart/clear.
Em caso de sucesso, onSuccess atualiza o cache do React Query (queryClient.setQueryData) com os novos dados do carrinho e exibe um toast.
Em caso de erro, exibe um toast destrutivo.
onSettled invalida a query do carrinho para garantir a revalidação.
useCart(): Hook customizado que consome o CartContext, fornecendo acesso aos items, itemCount, total, isLoading e às funções de manipulação do carrinho.
Fluxo: Interage diretamente com o apiRequest para comunicação com o backend e gerencia o estado do carrinho no frontend via React Query.
4.2. hooks/use-wishlist.tsx
Propósito: Gerenciar a lógica da lista de desejos.
Contexto: WishlistContext.
Lógica:
WishlistProvider:
useQuery: Busca a lista de desejos do backend (/wishlist). Habilitado apenas se o usuário estiver autenticado.
isInWishlist(productId): Verifica se um produto já está na lista de desejos.
useMutation (para addToWishlist, removeFromWishlist):
addToWishlist: Envia productId para POST /wishlist/items.
removeFromWishlist: Envia DELETE para /wishlist/items/:productId.
onSuccess e onError atualizam o cache e exibem toasts, similar ao useCart.
toggleWishlist(productId): Função que adiciona ou remove um produto da lista de desejos com base em seu status atual.
useWishlist(): Hook que consome o WishlistContext.
Permissões: A funcionalidade da lista de desejos é exclusiva para usuários autenticados, controlada pela propriedade enabled do useQuery e pela lógica de backend.
4.3. hooks/use-shipping-frontend.tsx
Propósito: Integrar o cálculo de frete do backend.
Lógica:
calculateShippingRates(params):
Recebe zipCode e items (no formato CartItemForShipping do backend).
Chama apiRequest('POST', '/shipping/calculate', payload) para obter as opções de frete do backend.
Atualiza os estados shippingData, isLoading e error.
resetShipping(): Reseta os dados de frete.
formatZip(zipCode): Formata o CEP (ex: 00000-000).
Observação: Este hook substitui o antigo use-shipping.tsx (que realizava o cálculo no próprio frontend), garantindo que o cálculo seja feito pelo backend.
5. Componentes UI (Shadcn/ui e Customizados)
5.1. Componentes Shadcn/ui (Exemplos)
A maioria dos componentes em components/ui/ são wrappers para componentes Radix UI, estilizados com Tailwind CSS, fornecidos pelo Shadcn/ui. Eles oferecem acessibilidade, personalização e reusabilidade.

button.tsx: Botões com variantes e tamanhos.
input.tsx: Campos de entrada de texto.
card.tsx: Contêineres com estilo de cartão.
label.tsx: Rótulos para campos de formulário.
radio-group.tsx: Grupos de botões de rádio.
select.tsx: Menus de seleção (dropdowns).
skeleton.tsx: Componentes de placeholder para estados de carregamento.
separator.tsx: Linhas divisórias.
badge.tsx: Etiquetas informativas.
sheet.tsx: Painéis laterais (sidebars) que deslizam para dentro/fora.
dialog.tsx: Modais (pop-ups).
dropdown-menu.tsx: Menus suspensos.
tooltip.tsx: Dicas de ferramentas.
progress.tsx: Barras de progresso.
table.tsx: Componentes para tabelas.
textarea.tsx: Áreas de texto.
switch.tsx: Toggles (ligar/desligar).
slider.tsx: Controles deslizantes.
scroll-area.tsx: Áreas com scroll customizado.
resizable.tsx: Painéis redimensionáveis.
pagination.tsx: Componentes de paginação.
popover.tsx: Popovers.
navigation-menu.tsx: Menus de navegação complexos.
menubar.tsx: Barras de menu.
input-otp.tsx: Campos de entrada para OTP.
hover-card.tsx: Cartões que aparecem ao passar o mouse.
form.tsx: Componentes para construção de formulários com react-hook-form.
drawer.tsx: Gavetas (drawers) para mobile.
context-menu.tsx: Menus de contexto.
command.tsx: Paletas de comando.
collapsible.tsx: Componentes colapsáveis.
checkbox.tsx: Caixas de seleção.
chart.tsx: Componentes para gráficos.
carousel.tsx: Carrosséis.
calendar.tsx: Calendários.
accordion.tsx: Acordeões.
alert.tsx: Alertas.
alert-dialog.tsx: Diálogos de alerta.
aspect-ratio.tsx: Mantém a proporção de aspecto.
avatar.tsx: Avatares.
breadcrumb.tsx: Navegação em breadcrumb.
toggle.tsx, toggle-group.tsx: Toggles e grupos de toggles.
5.2. Componentes Customizados/Layout
components/layout/header.tsx:
Propósito: Cabeçalho de navegação.
Lógica: Contém logo, links de navegação (desktop e mobile), barra de pesquisa, botões de login/registro/logout, ícones de wishlist e carrinho (com contadores de itens).
Integrações: useCart, useWishlist, useUIStore, useToast.
Permissões: Exibe botões de login/registro ou logout com base em localStorage.getItem('access_token').
Fluxo: A pesquisa redireciona para a página de produtos com o termo de busca. O logout limpa o token e dados do usuário no localStorage.
components/layout/footer.tsx:
Propósito: Rodapé da página.
Lógica: Contém logo, links de categorias, links de suporte, e um formulário de newsletter.
Integrações: useToast para feedback da newsletter.
components/ui/whatsapp-button.tsx:
Propósito: Botão flutuante para contato via WhatsApp.
Lógica: Exibe um botão com animações, que ao ser clicado, abre uma conversa no WhatsApp com uma mensagem pré-definida. Inclui um "bubble" de notificação para mobile.
components/InstagramFeedSection.tsx:
Propósito: Exibir um feed do Instagram.
Lógica: Injeta dinamicamente um script de terceiros (EmbedSocial) e um placeholder div para renderizar o feed.
5.3. Componentes de Funcionalidade
components/product/product-card.tsx:
Propósito: Exibir um produto em listagens (home, produtos relacionados).
Lógica: Mostra imagem, nome, preço, descrição, badges (novo, desconto). Inclui botões para adicionar ao carrinho e à wishlist, com feedback visual de carregamento/sucesso.
Integrações: useCart, useWishlist, CartNotification.
Fluxo: Clicar no card navega para a página de detalhes do produto. Os botões de ação utilizam e.preventDefault() e e.stopPropagation() para evitar a navegação ao clicar neles.
components/cart/cart-item.tsx:
Propósito: Exibir um item individual dentro do carrinho de compras.
Lógica: Mostra imagem, nome, tamanho, cor, preço e quantidade. Permite ajustar a quantidade e remover o item.
Integrações: useCart.
components/cart/shopping-cart.tsx:
Propósito: Painel lateral (sidebar) que exibe o carrinho de compras.
Lógica: Lista todos os CartItemComponents, calcula e exibe o total do carrinho. Inclui um botão para finalizar a compra que redireciona para a página de checkout. Exibe esqueletos durante o carregamento e uma mensagem se o carrinho estiver vazio.
Integrações: useCart, useUIStore.
components/ui/cart-notification.tsx:
Propósito: Notificação pop-up que aparece quando um produto é adicionado ao carrinho.
Lógica: Exibe uma pequena prévia do produto adicionado e botões para continuar comprando ou ver o carrinho. Auto-fecha após 4 segundos.
Integrações: useUIStore.
components/shipping/frontend-shipping-calculator.tsx:
Propósito: Componente para calcular e exibir opções de frete na tela de checkout.
Lógica: Permite ao usuário digitar um CEP, chama o useShippingFrontend para obter as opções de frete do backend, exibe os resultados (serviço, preço, tempo de entrega) e permite selecionar uma opção.
Integrações: useShippingFrontend, useToast.
Fluxo: Ao digitar o CEP, um debounce é aplicado para evitar chamadas excessivas à API. Também busca informações de cidade/estado do CEP via ViaCEP para exibição.
5.4. Componentes Shadcn/ui (Outros - breve descrição)
accordion.tsx: Componente para exibir conteúdo colapsável.
alert-dialog.tsx: Caixa de diálogo de alerta com ações.
alert.tsx: Componente para exibir mensagens de alerta.
aspect-ratio.tsx: Mantém a proporção de aspecto de um elemento.
avatar.tsx: Componente para exibir avatares.
breadcrumb.tsx: Componentes para construir trilhas de navegação.
calendar.tsx: Componente de calendário para seleção de datas.
carousel.tsx: Componente de carrossel de imagens.
chart.tsx: Componentes para construção de gráficos (Recharts).
checkbox.tsx: Caixa de seleção.
collapsible.tsx: Componente para conteúdo colapsável.
command.tsx: Paleta de comandos (para busca rápida, por exemplo).
context-menu.tsx: Menu de contexto (botão direito do mouse).
dialog.tsx: Caixa de diálogo modal.
drawer.tsx: Gaveta lateral (para mobile).
dropdown-menu.tsx: Menu suspenso.
form.tsx: Componentes para construir formulários com react-hook-form.
hover-card.tsx: Cartão que aparece ao passar o mouse.
input-otp.tsx: Campo de entrada para códigos OTP.
menubar.tsx: Barra de menu.
navigation-menu.tsx: Menu de navegação.
pagination.tsx: Componentes para paginação.
popover.tsx: Popover.
progress.tsx: Barra de progresso.
radio-group.tsx: Grupo de botões de rádio.
resizable.tsx: Painéis redimensionáveis.
scroll-area.tsx: Área de rolagem customizada.
select.tsx: Componente de seleção (dropdown).
separator.tsx: Separador visual.
sheet.tsx: Painel lateral.
sidebar.tsx: Componentes para construir sidebars complexas.
slider.tsx: Slider.
switch.tsx: Switch (alternar).
table.tsx: Tabela.
tabs.tsx: Abas.
textarea.tsx: Área de texto.
toggle.tsx, toggle-group.tsx: Toggles.
tooltip.tsx: Tooltip.
6. Páginas (Fluxos Principais)
6.1. pages/home.tsx
Propósito: Página inicial da loja.
Lógica:
Exibe uma seção Hero com carrossel de imagens.
Seção de categorias com links para listagens filtradas.
Seção de produtos em destaque.
Seção de "Trust Badges" (Frete Grátis, Compra Segura, Troca Fácil).
Integra o InstagramFeedSection.
Integrações: useQuery para featuredProducts e categories, ProductCard, WhatsAppButton, ShoppingCart.
Fluxo: Busca produtos em destaque e categorias do backend para exibição dinâmica.
6.2. pages/products.tsx
Propósito: Página de listagem de produtos.
Lógica: (O arquivo products.tsx fornecido é idêntico ao product-detail.tsx, o que indica um erro ou placeholder. Assumindo que deveria ser uma página de listagem de produtos, a lógica comum seria:)
Exibir uma lista de ProductCards.
Implementar filtros por categoria, preço, tamanho, cor, busca.
Implementar paginação.
Integrações: useQuery para buscar produtos com filtros, ProductCard.
6.3. pages/product-detail.tsx
Propósito: Exibir os detalhes de um produto específico.
Lógica:
Obtém o productId da URL.
Exibe imagens do produto (principal e miniaturas), nome, descrição, preço, opções de tamanho e cor, e controle de quantidade.
Botões para adicionar ao carrinho e à wishlist, com feedback visual.
Seção de produtos relacionados (da mesma categoria).
Integrações: useQuery para o produto principal e produtos relacionados, useCart, useWishlist, useToast, CartNotification.
Fluxo:
A query do produto principal é habilitada apenas se productId existir.
A query de produtos relacionados é habilitada apenas se o produto principal e sua categoryId existirem.
Validações para seleção de tamanho/cor antes de adicionar ao carrinho.
A URL da imagem do produto é corrigida para usar o primeiro item do array images.
6.4. pages/login.tsx
Propósito: Página de login de usuários.
Lógica:
Formulário de login com campos de email e senha.
Opção para "Lembrar-me" e "Esqueci minha senha" (não implementadas).
Botões para login social (Google, Facebook - funcionalidade em desenvolvimento).
Link para a página de registro.
Integrações: useMutation para POST /auth/login, useToast.
Fluxo: Ao submeter o formulário, envia as credenciais para o backend. Em caso de sucesso, armazena o access_token e user_data no localStorage e redireciona para a home. Em caso de erro, exibe um toast.
6.5. pages/register.tsx
Propósito: Página de registro de novos usuários.
Lógica:
Formulário de registro com nome, email, telefone (opcional), senha e confirmação de senha.
Validação de senhas e aceite de termos de uso.
Botões para registro social (funcionalidade em desenvolvimento).
Link para a página de login.
Integrações: useMutation para POST /auth/register, useToast.
Fluxo: Ao submeter o formulário, envia os dados para o backend. Em caso de sucesso, exibe um toast e redireciona para a página de login. Em caso de erro, exibe um toast.
6.6. pages/checkout.tsx
Propósito: Página de finalização de compra (multi-passos).
Lógica:
Passo 1 (Endereço & Frete):
Para usuários autenticados: Busca e permite selecionar endereços cadastrados.
Para convidados: Formulário para preencher dados de contato e endereço.
Integra o FrontendShippingCalculator para cálculo de frete com base no CEP selecionado/informado.
Opção para convidados criarem uma conta durante o checkout.
Passo 2 (Pagamento):
Permite selecionar o método de pagamento (Cartão de Crédito, PIX, Boleto).
Para PIX, solicita o CPF do pagador.
Exibe uma imagem do PagSeguro.
Passo 3 (Revisão): Exibe um resumo de todas as informações inseridas.
Botões "Voltar" e "Continuar" para navegar entre os passos.
Botão "Finalizar Pedido" no último passo.
Integrações: useCart, useToast, useQuery (para endereços do usuário), useMutation (para createOrderMutation, createPagSeguroCheckout, processPaymentMutation), FrontendShippingCalculator.
Fluxo:
createOrderMutation: Envia todos os dados do pedido (incluindo dados de convidado ou ID de endereço) para POST /orders.
Fluxo de Pagamento PIX/Boleto (PagSeguro): Se o método de pagamento for PIX ou Boleto, a mutação createPagSeguroCheckout é chamada. Em caso de sucesso, o frontend redireciona o usuário para a página /order-success, passando o orderId e a paymentUrl (URL do QR Code ou Boleto) como parâmetros de consulta. Isso garante que o usuário sempre retorne para o seu site, onde o QR Code/Boleto pode ser exibido e o status do pedido monitorado.
Outros Métodos de Pagamento (Simulados): Para métodos como Cartão de Crédito (simulado), a mutação processPaymentMutation é chamada. Após o sucesso do pagamento, o carrinho é limpo, queries são invalidadas e o usuário é redirecionado para /order-success.
Permissões: Adapta o fluxo com base na autenticação do usuário.
6.7. pages/order-success.tsx
Propósito: Página de confirmação de pedido e acompanhamento de status.
Lógica:
Obtém o orderId, paymentUrl e paymentMethod da URL (passados pelo checkout.tsx).
Busca os detalhes do pedido do backend usando useQuery.
Implementa polling: O useQuery é configurado com refetchInterval para buscar o status do pedido no backend a cada 5 segundos se o status atual for PENDING. O polling para quando o status muda.
Exibe um resumo do pedido, endereço de entrega e método de pagamento.
Exibição de QR Code/Boleto: Se o método de pagamento for PIX ou Boleto e o status do pedido for PENDING, a paymentUrl recebida é usada para exibir o QR Code PIX (como imagem) ou um link para o Boleto, instruindo o usuário a finalizar o pagamento.
Mostra o status do pedido em um fluxo de etapas, que se atualiza automaticamente com o polling.
Exibe próximos passos e informações de contato.
Botões para baixar comprovante (imprimir), continuar comprando e voltar ao início.
Integrações: useQuery para detalhes do pedido.
Permissões: A query para buscar o pedido é habilitada apenas se orderId existir e o usuário estiver autenticado.
6.8. pages/wishlist.tsx
Propósito: Página para exibir a lista de desejos do usuário.
Lógica:
Lista todos os produtos na wishlist.
Para cada produto, exibe imagem, nome, categoria, preço e botões para adicionar ao carrinho ou remover da wishlist.
Exibe uma mensagem amigável se a wishlist estiver vazia.
Integrações: useWishlist, useCart, useToast.
Permissões: A funcionalidade é para usuários autenticados.
6.9. pages/not-found.tsx
Propósito: Página 404 genérica.
Lógica: Exibe uma mensagem de "Página não encontrada".
7. Fluxo de Dados e Integrações
O fluxo de dados no frontend é orquestrado principalmente pelo React Query, que atua como uma camada de gerenciamento de estado do servidor.

Requisições (Queries):
Componentes/hooks chamam useQuery com uma queryKey e uma queryFn (geralmente apiRequest).
React Query lida com o fetching, caching, revalidação em segundo plano, retries e tratamento de erros.
Os dados são armazenados no cache do React Query, e os componentes que usam a mesma queryKey recebem os dados cacheados instantaneamente.
Atualizações (Mutations):
Componentes/hooks chamam useMutation para operações de escrita (POST, PUT, PATCH, DELETE).
mutationFn chama apiRequest.
onSuccess: Após uma mutação bem-sucedida, o cache do React Query é atualizado manualmente (queryClient.setQueryData) ou invalidado (queryClient.invalidateQueries) para garantir que os dados exibidos estejam sempre atualizados.
onError: Erros são capturados e exibidos via useToast.
apiRequest: Atua como o intermediário entre o React Query e a API de backend, adicionando lógica de autenticação (JWT) e identificação de convidado (guestId).
Zustand (useUIStore): Usado para estados da UI que não precisam de persistência no servidor ou caching complexo (ex: visibilidade de sidebars, menus).
localStorage: Utilizado para persistir o access_token (JWT) e o guestId entre as sessões do navegador.
8. Autenticação e Fluxo de Convidado
Autenticação (JWT):
No login, o access_token retornado pelo backend é salvo no localStorage.
apiRequest inclui esse token no cabeçalho Authorization para todas as requisições subsequentes.
A maioria das funcionalidades de usuário (wishlist, pedidos, perfil) só é habilitada (enabled: !!localStorage.getItem('access_token')) se o token estiver presente.
Fluxo de Convidado (guestId):
getOrCreateGuestId() garante que todo usuário (mesmo não logado) tenha um guestId único.
Este guestId é enviado para o backend em operações de carrinho (/cart/guest) para identificar o carrinho do convidado.
No checkout, o guestId é associado ao pedido do convidado.
Há uma opção para o convidado criar uma conta durante o checkout, convertendo o guestId em um userId no backend.
9. Estilização
Tailwind CSS: A maior parte da estilização é feita diretamente no JSX usando classes utilitárias do Tailwind.
Shadcn/ui: Os componentes do Shadcn/ui já vêm pré-estilizados com Tailwind e são facilmente personalizáveis.
index.css: Contém algumas classes CSS globais e utilitárias customizadas (.text-gradient-black, .card-hover, .btn-primary, .gradient-bg, etc.) para manter a consistência visual e adicionar efeitos específicos (animações do botão WhatsApp).
Responsividade: O Tailwind CSS é usado para garantir que a interface seja responsiva, com breakpoints definidos para mobile (sm, md, lg). Componentes como Header e WhatsAppButton também implementam lógica de responsividade específica.
10. Conclusão
O frontend é uma aplicação React moderna, robusta e modular, projetada para ser escalável e de fácil manutenção. A combinação de React Query para gerenciamento de dados, Zustand para estados globais da UI, e Shadcn/ui para componentes, juntamente com o roteamento eficiente do Wouter, proporciona uma base sólida para um e-commerce de alta performance. A clara separação de responsabilidades entre componentes, hooks e utilitários, aliada à forte tipagem do TypeScript, facilita o desenvolvimento e a depuração.





















Documentação da Arquitetura e Lógica de Backend
Este documento descreve a arquitetura e a lógica de negócio de um sistema de e-commerce construído com NestJS, utilizando Prisma ORM para interação com o banco de dados. A aplicação é modular, com cada módulo encapsulando funcionalidades específicas e interagindo através de serviços e controladores.

1. Visão Geral da Arquitetura
A aplicação segue o padrão de arquitetura de módulos do NestJS, onde cada funcionalidade principal (usuários, produtos, pedidos, pagamentos, etc.) é organizada em seu próprio módulo.

main.ts: Ponto de entrada da aplicação, configura CORS, pipes de validação globais e inicia o servidor.
app.module.ts: Módulo raiz que agrega todos os outros módulos da aplicação.
Módulos de Negócio: Cada módulo (AuthModule, UsersModule, ProductsModule, OrdersModule, PaymentsModule, etc.) contém sua própria lógica de negócio, incluindo:
Controladores (.controller.ts): Responsáveis por lidar com as requisições HTTP, rotear para os serviços apropriados e retornar as respostas.
Serviços (.service.ts): Contêm a lógica de negócio principal, interagem com o banco de dados (via PrismaService) e com outros serviços.
DTOs (.dto.ts): Objetos de Transferência de Dados, usados para validação de entrada de dados e tipagem.
Entidades (.entity.ts): Representações tipadas dos modelos de dados, muitas vezes espelhando os modelos do Prisma.
Módulos de Infraestrutura/Compartilhados:
PrismaModule: Encapsula o PrismaService para acesso ao banco de dados.
ConfigModule: Gerencia as configurações da aplicação (variáveis de ambiente).
CommonModule: Contém componentes compartilhados como guards, interceptors, filters e constantes globais.
2. Módulos e Suas Funcionalidades
2.1. AppModule (app.module.ts, app.controller.ts, app.service.ts)
Propósito: Módulo raiz que orquestra todos os outros módulos da aplicação.
Componentes:
AppController: Define rotas básicas como / (mensagem de boas-vindas) e /health (verificação de saúde da API).
AppService: Contém a lógica para as rotas básicas do AppController.
Dependências: Importa e agrega todos os módulos de funcionalidade do e-commerce.
Funcionalidades Chave: Inicialização da aplicação e rotas de saúde/informação.
2.2. PrismaModule (prisma.module.ts, prisma.service.ts)
Propósito: Gerenciar a conexão com o banco de dados via Prisma ORM.
Componentes:
PrismaService: Estende PrismaClient e gerencia a conexão e desconexão do banco de dados (hooks de ciclo de vida onModuleInit).
Dependências: Nenhum módulo importa o PrismaModule diretamente, mas o PrismaService é exportado para ser injetado em outros serviços.
Funcionalidades Chave:
onModuleInit(): Conecta ao banco de dados quando o módulo é inicializado.
enableShutdownHooks(): Garante que a conexão com o banco de dados seja encerrada graciosamente ao desligar a aplicação.
2.3. ConfigModule (config.module.ts, config.service.ts)
Propósito: Gerenciar e fornecer acesso às variáveis de ambiente e configurações da aplicação de forma tipada.
Componentes:
ConfigService: Um serviço personalizado que envolve o NestConfigService para fornecer acesso a variáveis de ambiente específicas (ex: DATABASE_URL, JWT_SECRET, PAGSEGURO_API_TOKEN).
Dependências: Usa o NestConfigModule do NestJS. É importado globalmente no AppModule e exporta o ConfigService para que outros módulos possam usá-lo.
Funcionalidades Chave: Centraliza o acesso às configurações, garantindo que credenciais sensíveis sejam carregadas corretamente e lançando erros se configurações críticas estiverem ausentes.
2.4. CommonModule (common.module.ts, jwt-auth.guard.ts, current-user.decorator.ts, http-exception.filter.ts, transform.interceptor.ts, app.constants.ts)
Propósito: Agrupar componentes reutilizáveis e globais que afetam a infraestrutura da aplicação (autenticação, tratamento de erros, formatação de resposta).
Componentes:
JwtAuthGuard: Um guard de autenticação que utiliza a estratégia JWT do Passport para proteger rotas.
CurrentUser: Um decorator personalizado para extrair o objeto de usuário autenticado da requisição.
HttpExceptionFilter: Um filtro de exceções global que padroniza as respostas de erro HTTP.
TransformInterceptor: Um interceptor global que envolve as respostas de sucesso em um objeto { data: ... }.
AppConstants: Uma classe que define constantes globais para a aplicação (ex: valores mínimos para cálculo de frete, limite para frete grátis).
Dependências: Importa AuthModule (para JwtAuthGuard). Exporta JwtAuthGuard e AppConstants.
Funcionalidades Chave:
Gerenciamento de autenticação JWT em rotas protegidas.
Injeção do usuário autenticado em parâmetros de controlador.
Tratamento consistente de erros HTTP.
Padronização da estrutura de resposta da API.
Centralização de valores constantes.
2.5. AuthModule (auth.module.ts, auth.controller.ts, auth.service.ts, register-user.dto.ts, login-user.dto.ts, optional-jwt-auth.guard.ts, local-auth.guard.ts, jwt-payload.interface.ts, local.strategy.ts, jwt.strategy.ts)
Propósito: Lidar com a autenticação de usuários (registro, login, validação de token).
Componentes:
AuthController: Define endpoints para registro (/auth/register), login (/auth/login) e obtenção do perfil (/auth/profile).
AuthService: Contém a lógica de negócio para autenticação: hashing de senhas (bcrypt), validação de credenciais, geração de tokens JWT.
RegisterUserDto: DTO para validação de dados de registro de usuário.
LoginUserDto: DTO para validação de dados de login de usuário.
LocalAuthGuard: Guard para autenticação baseada em nome de usuário/senha (estratégia local).
JwtAuthGuard (do CommonModule): Guard para autenticação baseada em token JWT.
OptionalJwtAuthGuard: Uma variação do JwtAuthGuard que não lança erro se o token estiver ausente ou inválido, permitindo rotas que podem ser acessadas por usuários logados ou não.
LocalStrategy: Estratégia do Passport para autenticação local, valida email e senha.
JwtStrategy: Estratégia do Passport para autenticação JWT, valida o token e busca o usuário.
Dependências: Importa UsersModule (para UsersService), PassportModule, JwtModule, ConfigModule. Exporta AuthService e JwtModule.
Funcionalidades Chave:
Registro: Cria um novo usuário com senha hashed.
Login: Valida credenciais e retorna um token JWT.
Proteção de Rotas: Garante que apenas usuários autenticados (ou opcionalmente autenticados) possam acessar certas rotas.
JwtPayload: Interface para a estrutura do payload do token JWT.
2.6. UsersModule (users.module.ts, users.controller.ts, users.service.ts, create-user.dto.ts, update-user.dto.ts, create-address.dto.ts, user.entity.ts)
Propósito: Gerenciar as operações relacionadas a usuários (CRUD, endereços).
Componentes:
UsersController: Define endpoints para criação de usuário (/users), obtenção e atualização do perfil do usuário logado (/users/me), e gerenciamento de endereços (/users/me/addresses).
UsersService: Contém a lógica de negócio para usuários: criação, busca por email/ID, atualização, remoção (comentada), adição e busca de endereços. Remove a senha do objeto de usuário antes de retornar.
CreateUserDto: DTO para criação de usuário.
UpdateUserDto: DTO para atualização parcial de usuário.
CreateAddressDto: DTO para criação de endereço.
UserEntity: Entidade que representa um usuário.
Dependências: Importa PrismaModule. Exporta UsersService para ser usado em outros módulos (ex: AuthModule, OrdersModule).
Funcionalidades Chave:
Criação de novos usuários.
Gestão de perfis de usuário (visualização e edição).
Gerenciamento de múltiplos endereços por usuário.
2.7. CategoriesModule (categories.module.ts, categories.controller.ts, categories.service.ts, create-category.dto.ts, update-category.dto.ts, category.entity.ts)
Propósito: Gerenciar as operações relacionadas a categorias de produtos.
Componentes:
CategoriesController: Define endpoints para CRUD de categorias (/categories).
CategoriesService: Lógica de negócio para categorias: criação, busca (todos/por ID), atualização, remoção.
CreateCategoryDto: DTO para criação de categoria.
UpdateCategoryDto: DTO para atualização parcial de categoria.
CategoryEntity: Entidade que representa uma categoria.
Dependências: Importa PrismaModule. Exporta CategoriesService para ProductsModule.
Funcionalidades Chave:
Criação, listagem, busca por ID, atualização e remoção de categorias.
2.8. ProductsModule (products.module.ts, products.controller.ts, products.service.ts, create-product.dto.ts, update-product.dto.ts, product-query.dto.ts, product.entity.ts)
Propósito: Gerenciar as operações relacionadas a produtos.
Componentes:
ProductsController: Define endpoints para CRUD de produtos (/products), busca de produtos em destaque (/products/featured) e busca com filtros (/products).
ProductsService: Lógica de negócio para produtos: busca (todos com filtros, em destaque, por ID), atualização e remoção. A criação e atualização estão marcadas como "ainda não implementadas" no código fornecido.
CreateProductDto: DTO para criação de produto, incluindo informações como nome, preço, imagem, categoria, estoque, peso e dimensões.
UpdateProductDto: DTO para atualização parcial de produto.
ProductQueryDto: DTO para filtros e paginação em listagens de produtos.
ProductEntity: Entidade que representa um produto, com conversão de tipos Prisma.Decimal para number.
Dependências: Importa PrismaModule e CategoriesModule. Exporta ProductsService para CartModule, OrdersModule, WishlistModule, InventoryModule.
Funcionalidades Chave:
Listagem de produtos com filtros de pesquisa, categoria, cor, tamanho, ordenação e paginação.
Busca de produtos em destaque.
Busca de um produto específico por ID.
Gestão de estoque (embora a atualização seja feita pelo InventoryService).
2.9. CartModule (cart.module.ts, cart.controller.ts, cart.service.ts, add-to-cart.dto.ts, update-cart-item.dto.ts, cart.entity.ts)
Propósito: Gerenciar o carrinho de compras de usuários logados e convidados.
Componentes:
CartController: Define endpoints para obter o carrinho (/cart), adicionar itens (/cart/items), atualizar quantidade de itens (/cart/items/:productId) e remover itens (/cart/items/:productId).
CartService: Lógica de negócio para o carrinho: obter/criar carrinho para usuário/convidado, adicionar/atualizar/remover itens, calcular total e quantidade de itens.
AddToCartDto: DTO para adicionar um produto ao carrinho.
UpdateCartItemDto: DTO para atualizar a quantidade de um item no carrinho.
CartEntity, CartItemEntity: Entidades que representam o carrinho e seus itens.
Dependências: Importa PrismaModule e ProductsModule (para ProductsService). Exporta CartService para OrdersModule.
Funcionalidades Chave:
Criação e recuperação de carrinhos para usuários autenticados e convidados.
Adição de produtos ao carrinho, com validação de estoque e preço.
Atualização da quantidade de itens no carrinho.
Remoção de itens do carrinho.
Cálculo dinâmico do total e contagem de itens no carrinho.
2.10. WishlistModule (wishlist.module.ts, wishlist.controller.ts, wishlist.service.ts, add-to-wishlist.dto.ts, wishlist.entity.ts)
Propósito: Gerenciar a lista de desejos dos usuários.
Componentes:
WishlistController: Define endpoints para obter a lista de desejos (/wishlist), adicionar itens (/wishlist/items) e remover itens (/wishlist/items/:productId).
WishlistService: Lógica de negócio para a lista de desejos: obter/criar lista, adicionar/remover itens, com validação para evitar duplicatas.
AddToWishlistDto: DTO para adicionar um produto à lista de desejos.
WishlistEntity, WishlistItemEntity: Entidades que representam a lista de desejos e seus itens.
Dependências: Importa PrismaModule e ProductsModule (para ProductsService).
Funcionalidades Chave:
Criação e recuperação da lista de desejos para usuários autenticados.
Adição de produtos à lista de desejos, prevenindo duplicação.
Remoção de produtos da lista de desejos.
2.11. OrdersModule (orders.module.ts, orders.controller.ts, orders.service.ts, create-order.dto.ts, order.entity.ts)
Propósito: Gerenciar a criação e visualização de pedidos.
Componentes:
OrdersController: Define endpoints para criar um pedido (/orders), listar todos os pedidos do usuário (/orders) e obter um pedido específico por ID (/orders/:id). Utiliza OptionalJwtAuthGuard para permitir criação de pedidos por convidados e JwtAuthGuard para listagem/visualização de pedidos de usuários logados.
OrdersService: Lógica de negócio para pedidos:
create(): O método mais complexo. Lida com a criação de pedidos para usuários logados e convidados, valida o carrinho, verifica estoque, calcula o valor total, define o endereço de entrega (usando endereço salvo para usuários ou dados do DTO para convidados), e opcionalmente cria uma conta para convidados. Tudo isso é feito dentro de uma transação Prisma para garantir atomicidade.
findAllByUserId(): Lista todos os pedidos de um usuário.
findOneByUserId(): Busca um pedido específico para um usuário.
findOneByGuestId(): Busca um pedido específico para um convidado.
CreateOrderDto: DTO para criação de pedido, incluindo informações de pagamento, frete, e dados de contato/endereço para convidados.
OrderEntity, OrderItemEntity: Entidades que representam o pedido e seus itens.
Dependências: Importa PrismaModule, CartModule, UsersModule, ProductsModule. Exporta OrdersService para PaymentsModule.
Funcionalidades Chave:
Processo de checkout unificado para usuários logados e convidados.
Validação de carrinho e estoque antes da criação do pedido.
Integração com UsersService para endereços e criação de conta.
Atualização do estoque dos produtos após a criação do pedido.
Limpeza do carrinho após a criação bem-sucedida do pedido.
Transações de banco de dados para garantir a integridade dos dados.
2.12. PaymentsModule (payments.module.ts, payments.controller.ts, payments.service.ts, process-payment.dto.ts, create-pix-charge.dto.ts, pagseguro.service.ts)
Propósito: Gerenciar o processamento de pagamentos e a integração com gateways de pagamento (PagSeguro, Stripe - webhook).
Componentes:
PaymentsController: Define endpoints para processar pagamentos (/payments/process/:orderId), iniciar checkout PagSeguro (/payments/pagseguro/:orderId/checkout) e lidar com webhooks do Stripe (/payments/webhook/stripe).
PaymentsService: Lógica de negócio para pagamentos:
processPayment(): Orquestra o processamento de pagamentos para um pedido. Valida o status do pedido, coleta dados do cliente (usuário logado ou convidado), e chama o serviço de gateway de pagamento apropriado (PagSeguro para PIX/Boleto). Cria uma transação no banco de dados e atualiza o status do pedido.
createPagSeguroCheckout(): Prepara e inicia o processo de checkout com PagSeguro (PIX ou Boleto), retornando a URL do QR Code ou Boleto.
handlePagSeguroNotification(): Processa notificações de webhook do PagSeguro, buscando detalhes da transação e atualizando o status do pedido e da transação no banco de dados.
mapPagSeguroStatusToOrderStatus(): Mapeia os status de pagamento do PagSeguro para os status de pedido internos.
PagSeguroService: Serviço dedicado à integração com a API do PagSeguro:
processCreditCardPayment(): Simulação de pagamento com cartão de crédito (foco no PIX).
generatePixPayment(): Gera uma cobrança PIX via API de Pedidos do PagSeguro, retornando o BR Code, imagem do QR Code e ID da transação.
generateBoletoPayment(): Simulação de geração de boleto.
getNotificationDetails(): Busca detalhes de um pedido no PagSeguro para processar webhooks.
ProcessPaymentDto: DTO para processar um pagamento, especificando o método e dados adicionais (CPF, telefone para PIX).
CreatePixChargeDto, PixChargeResponseDto: DTOs relacionados à criação e resposta de cobranças PIX (embora CreatePixChargeDto não seja usado diretamente no PaymentsController ou PaymentsService no código fornecido, ele define a estrutura esperada para uma cobrança PIX).
Dependências: Importa PrismaModule, OrdersModule, ConfigModule.
Funcionalidades Chave:
Integração com PagSeguro para pagamentos PIX e Boleto.
Atualização do status do pedido e criação de transações no banco de dados.
Tratamento de webhooks para atualização assíncrona do status de pagamento.
2.13. ShippingModule (shipping.module.ts, shipping.controller.ts, shipping.service.ts, calculate-shipping.dto.ts, correios.interface.ts)
Propósito: Calcular opções de frete com base no CEP de destino e nos itens do carrinho.
Componentes:
ShippingController: Define um endpoint para calcular o frete (/shipping/calculate).
ShippingService: Lógica de negócio para cálculo de frete:
calculateShipping(): Valida o CEP, simula uma chamada a uma API de CEP (ViaCEP), calcula informações totais do pacote (peso, dimensões, valor) e aplica uma lógica de cálculo de frete regionalizada (simulando Correios) com base no CEP e peso/valor dos itens.
getTotalPackageInfo(): Função auxiliar para agregar peso, valor e dimensões dos itens do carrinho.
CalculateShippingDto: DTO para a requisição de cálculo de frete, incluindo CEP e itens do carrinho com detalhes do produto.
CorreiosResponse, ShippingOption: Interfaces para tipar a resposta do cálculo de frete.
Dependências: Importa ConfigModule e ProductsModule.
Funcionalidades Chave:
Validação de CEP.
Cálculo de frete simulado com base em regras regionais e características do pacote.
Determinação de frete grátis com base em um limite de valor.
2.14. InventoryModule (inventory.module.ts, inventory.controller.ts, inventory.service.ts, update-stock.dto.ts, stock.entity.ts)
Propósito: Gerenciar o estoque de produtos.
Componentes:
InventoryController: Define endpoints para obter o estoque de um produto (/inventory/:productId) e atualizar o estoque (/inventory/:productId/stock). Protegido por JwtAuthGuard.
InventoryService: Lógica de negócio para estoque:
getStock(): Retorna o estoque atual de um produto.
updateStock(): Atualiza o estoque de um produto para uma quantidade específica.
decrementStock(): Decrementa o estoque de um produto (usado pelo OrdersService). Inclui validação de estoque insuficiente.
incrementStock(): Incrementa o estoque de um produto.
UpdateStockDto: DTO para atualizar a quantidade de estoque.
StockEntity: Entidade que representa o estoque de um produto.
Dependências: Importa PrismaModule e ProductsModule (para ProductsService). Exporta InventoryService para ser usado por outros módulos (ex: OrdersModule).
Funcionalidades Chave:
Consulta e atualização do estoque de produtos.
Funções para decrementar e incrementar o estoque de forma segura, com validação de disponibilidade.
3. Fluxos de Negócio Chave
3.1. Autenticação e Autorização
Registro: AuthController.register -> AuthService.register -> UsersService.create. A senha é hashed antes de ser salva.
Login: AuthController.login (via LocalAuthGuard) -> AuthService.validateUser (valida email e senha) -> AuthService.login (gera JWT).
Acesso Protegido: Rotas com @UseGuards(JwtAuthGuard) exigem um token JWT válido no cabeçalho Authorization. O JwtAuthGuard usa o JwtStrategy para validar o token e injetar o objeto de usuário (req.user) na requisição, que pode ser acessado via @CurrentUser decorator.
Acesso Opcional: Rotas com @UseGuards(OptionalJwtAuthGuard) tentam autenticar o usuário, mas permitem que a requisição prossiga mesmo se o token for inválido ou ausente, injetando null no lugar do usuário.
3.2. Gestão de Produtos e Categorias
Criação de Categoria: CategoriesController.create -> CategoriesService.create.
Listagem de Produtos: ProductsController.findAll -> ProductsService.findAll. Permite filtros complexos (busca, categoria, cores, tamanhos) e paginação.
Detalhes do Produto: ProductsController.findOne -> ProductsService.findOne.
Produtos em Destaque: ProductsController.findFeatured -> ProductsService.findFeatured.
3.3. Carrinho de Compras
Adicionar ao Carrinho: CartController.addItem -> CartService.addItemToCart. Lida com usuários logados (userId) ou convidados (guestId). Verifica a existência do produto e o estoque. Se o item já existe, atualiza a quantidade.
Atualizar Quantidade: CartController.updateItemQuantity -> CartService.updateItemQuantity. Permite alterar a quantidade de um item existente ou removê-lo se a quantidade for zero.
Remover do Carrinho: CartController.removeItem -> CartService.removeItemFromCart.
Obter Carrinho: CartController.getCart -> CartService.getCartForUser (para logados) ou CartService.getCartForGuest (para convidados).
3.4. Criação de Pedidos (Checkout)
Início do Pedido: OrdersController.create -> OrdersService.create.
Lógica de OrdersService.create:
Obtenção do Carrinho: Identifica se é um usuário logado ou convidado e recupera o carrinho correspondente.
Validação de Estoque e Preço: Itera sobre os itens do carrinho, verifica a disponibilidade de estoque para cada produto e calcula o totalAmount com base nos preços atuais. Lança exceções se o estoque for insuficiente ou o produto não for encontrado.
Endereço de Entrega:
Para usuários logados: Requer shippingAddressId e busca o endereço salvo.
Para convidados: Requer guestShippingAddress e guestContactInfo no DTO.
Criação de Conta para Convidado (Opcional): Se shouldCreateAccount for true, cria um novo usuário usando UsersService.create e associa o pedido a este novo usuário.
Transação Prisma: Todas as operações (criação do pedido, adição de itens, decremento de estoque, limpeza do carrinho) são encapsuladas em uma transação para garantir que, se qualquer passo falhar, todas as alterações sejam revertidas.
Criação do Pedido e Itens: Persiste o Order e OrderItem no banco de dados.
Decremento de Estoque: Atualiza o estoque de cada produto no banco de dados.
Limpeza do Carrinho: Remove todos os itens do carrinho que deu origem ao pedido.
3.5. Processamento de Pagamentos
Processar Pagamento: PaymentsController.processPayment -> PaymentsService.processPayment.
Lógica de PaymentsService.processPayment:
Obter Pedido: Busca o pedido pelo ID e verifica seu status (PENDING).
Validação de Dados: Para PIX, exige CPF e telefone do cliente.
Dados do Cliente: Extrai email e nome completo do usuário logado (order.user) ou do convidado (order.guestEmail, order.guestName).
Chamar Gateway: Dependendo do paymentMethod (PIX, BOLETO), chama o método correspondente no PagSeguroService.
Criação de Transação e Atualização de Pedido: Em uma transação Prisma, cria um registro de Transaction e atualiza o status do Order para PROCESSING.
Início de Checkout PagSeguro: PaymentsController.createPagSeguroCheckout -> PaymentsService.createPagSeguroCheckout. Prepara os dados do pedido e cliente para o PagSeguro e chama generatePixPayment ou generateBoletoPayment, retornando a URL do QR Code ou Boleto.
Webhook PagSeguro: PaymentsService.handlePagSeguroNotification (chamado por um endpoint de webhook externo, não diretamente no controller fornecido). Busca detalhes da transação no PagSeguro, mapeia o status e atualiza o status da transação e do pedido no banco de dados.
3.6. Cálculo de Frete
Calcular Frete: ShippingController.calculateShipping -> ShippingService.calculateShipping.
Lógica de ShippingService.calculateShipping:
Validação de CEP: Garante que o CEP seja válido (formato e existência via ViaCEP simulado).
Informações do Pacote: Agrega peso, valor e dimensões de todos os itens no carrinho.
Simulação Correios: Aplica regras de preço e prazo de entrega baseadas na região do CEP e nas características do pacote.
Frete Grátis: Verifica se o valor total do pedido atinge o limite para frete grátis (AppConstants.FREE_SHIPPING_THRESHOLD).
3.7. Gestão de Estoque
Obter Estoque: InventoryController.getStock -> InventoryService.getStock.
Atualizar Estoque: InventoryController.updateStock -> InventoryService.updateStock.
Decremento/Incremento (Interno): InventoryService.decrementStock e InventoryService.incrementStock são usados por outros serviços (principalmente OrdersService) para gerenciar o estoque de forma transacional e segura.
4. Interações e Dependências Chave
PrismaService: É a base de dados, injetado em quase todos os serviços para operações de persistência.
ConfigService: Usado por serviços como PagSeguroService e ShippingService para acessar variáveis de ambiente (tokens de API, URLs).
UsersService: Usado por AuthService (registro, validação de usuário) e OrdersService (criação de conta para convidado, busca de endereços).
ProductsService: Fundamental para CartService, WishlistService, OrdersService e InventoryService para obter detalhes de produtos, validar estoque e preços.
CartService: Crucial para OrdersService, que consome o carrinho para criar um pedido.
OrdersService: Consumido por PaymentsService para obter detalhes do pedido antes de processar o pagamento e para atualizar o status do pedido.
PagSeguroService: Injetado em PaymentsService para lidar com a comunicação com o gateway de pagamento.
Transações de Banco de Dados: O uso de this.prisma.$transaction em OrdersService.create e PaymentsService.processPayment é vital para garantir a consistência dos dados em operações que envolvem múltiplas etapas de banco de dados (ex: criar pedido, criar itens, decrementar estoque, limpar carrinho).
5. Considerações para Manutenção
Modularidade: A separação em módulos facilita a compreensão e o isolamento de funcionalidades. Alterações em um módulo tendem a ter impacto limitado em outros, desde que as interfaces (DTOs, retornos de serviço) sejam mantidas.
Validação de Dados (DTOs): O uso extensivo de class-validator e class-transformer em DTOs garante que os dados de entrada da API sejam sempre válidos e tipados, reduzindo erros e facilitando a depuração.
Tratamento de Erros Global (HttpExceptionFilter): Centraliza a forma como os erros são apresentados ao cliente, proporcionando uma experiência de API consistente.
Interceptors (TransformInterceptor): Padroniza a estrutura de resposta da API, facilitando o consumo pelo frontend.
Tipagem Forte: O uso de TypeScript em todo o projeto, incluindo entidades e interfaces, melhora a legibilidade, o autocompletar e a detecção de erros em tempo de desenvolvimento.
Constantes Globais (AppConstants): Centraliza valores mágicos, tornando-os fáceis de encontrar e modificar.
Simulações de Gateway: As simulações para PagSeguro (cartão/boleto) e Correios indicam pontos onde integrações reais com APIs externas seriam implementadas. Para manutenção, estas seriam as primeiras áreas a serem substituídas por implementações reais.
Comentários e Logs: O código contém comentários explicativos e logs (Logger) em pontos estratégicos, o que é crucial para entender o fluxo e depurar problemas em produção.
Esta documentação serve como um guia abrangente para entender a estrutura, o fluxo e a lógica de cada componente do sistema de e-commerce, facilitando a manutenção, a depuração e o desenvolvimento de novas funcionalidades.


Análise Detalhada do Schema Prisma
1. Configuração Geral (generator, datasource)

generator client: Padrão e correto.
datasource db: Padrão e correto para PostgreSQL.
2. Enums (OrderStatus, TransactionType)

OrderStatus: Abrangente e adequado para o ciclo de vida de um pedido.
TransactionType: PAYMENT e REFUND são bons tipos iniciais para transações.
3. Modelos Principais

User

id, email (@unique), password, name?, phone?: Campos essenciais e bem definidos.
createdAt, updatedAt: Essenciais para auditoria e ordenação.
Relações: Address[], Order[], Cart?, Wishlist?, Transaction[] - todas lógicas e bem conectadas.
Address

userId, user: Relação clara com o usuário.
Campos de endereço (street, number, complement?, neighborhood, city, state, zipCode): Completos para um endereço de entrega.
isDefault: Ótimo para gerenciar o endereço principal do usuário.
Category

name (@unique), slug (@unique): Fundamental para URLs amigáveis e garantir unicidade.
description?, imageUrl?: Flexibilidade para detalhes da categoria.
products: Relação com Product é correta.
createdAt, updatedAt: Boas adições para rastreamento.
Product

name, description?: Padrão.
price (Decimal), originalPrice (Decimal?): Correto usar Decimal para valores monetários para evitar problemas de precisão com Float.
images (String[]): Flexível para múltiplas imagens.
categoryId, category: Relação com Category é correta.
sizes (String[]), colors (String[]): Ótimo para produtos com variações.
isNew, isFeatured: Flags úteis para marketing/destaque.
discount (Int?): Para percentual de desconto.
stock (Int @default(0)): Essencial para controle de inventário.
weight (Float?), dimensions (Json?): Excelente para cálculo de frete, permitindo armazenar dados estruturados de dimensões.
Relações: CartItem[], WishlistItem[], OrderItem[] - todas lógicas.
Cart

userId (String? @unique), user (User?): Correto para permitir carrinhos de convidados. unique em userId garante que um usuário logado tenha apenas um carrinho ativo.
guestId (String? @unique): Essencial para carrinhos de convidados. unique garante que um guestId esteja associado a um único carrinho ativo.
items: Relação com CartItem é correta.
@@index([userId]), @@index([guestId]): Muito importante para performance ao buscar carrinhos por usuário ou convidado.
CartItem

cartId, cart, productId, product, quantity: Padrão.
price (Decimal @default(0.00)): Crucial armazenar o preço no momento da adição ao carrinho para evitar que mudanças de preço no produto afetem itens já no carrinho. O default(0.00) é uma boa prática.
size?, color?: Para variações do produto.
Wishlist

userId (String @unique), user: Relação 1:1 correta.
items: Relação com WishlistItem é correta.
WishlistItem

wishlistId, wishlist, productId, product: Padrão.
Order

userId (String?), user (User?): Correto para suportar pedidos de convidados.
guestId (String?), guestName?, guestEmail?, guestPhone?: Excelente para checkout de convidados, permitindo capturar os dados necessários sem exigir login. Note que guestId aqui não é @unique, o que é correto, pois um convidado pode fazer múltiplos pedidos.
status (OrderStatus @default(PENDING)): Uso correto do enum.
totalAmount (Decimal), shippingPrice (Decimal): Correto para valores monetários.
shippingService (String): Boa adição para identificar o serviço de frete usado.
Campos de endereço de entrega (shippingAddressStreet, etc.): Armazenar um snapshot do endereço no pedido é uma ótima prática, pois o endereço do usuário pode mudar no futuro, mas o pedido deve refletir o endereço original da entrega.
paymentMethod (String), paymentDetails (Json?): Flexível para diferentes métodos de pagamento e seus detalhes específicos.
transaction (Transaction?), orderId (String? @unique): A relação 1:1 com Transaction é bem pensada, garantindo que um pedido tenha uma transação principal de pagamento.
couponId (String?), coupon (Coupon?): Boa integração com cupons.
@@index([userId]), @@index([guestId]): Essencial para otimizar buscas de pedidos por usuário logado ou convidado.
OrderItem

orderId, order, productId, product, quantity: Padrão.
price (Decimal): Também crucial armazenar o preço no momento do pedido.
size?, color?: Para variações.
Transaction

userId, user: Relação com o usuário que fez a transação.
amount (Decimal), type (TransactionType): Padrão.
status (String): Ponto de consideração: Embora String seja flexível para status de gateway, para consistência interna e tipagem, você poderia considerar criar um enum TransactionStatus (ex: INITIATED, SUCCESS, FAILED, PENDING_GATEWAY, REFUNDED). No entanto, se você já tem uma lógica de mapeamento de status de gateway para status internos (como visto no payments.service.ts), String aqui é aceitável para o status "bruto" do gateway.
orderId (String? @unique): Correto e crucial para a relação 1:1 com Order, garantindo que uma transação de pagamento principal esteja ligada a um único pedido.
gatewayTransactionId (String?): ID da transação no sistema do gateway.
qrCodeUrl (String?): Ótimo para PIX.
transactionRef (String?): Campo genérico útil para referências internas.
couponId (String?), coupon (Coupon?): Boa adição para rastrear cupons em transações.
Coupon

code (@unique): Essencial para identificar cupons.
discountAmount (Decimal?), discountPercentage (Int?): Boa prática ter ambos, mas a lógica da aplicação deve garantir que apenas um seja aplicado por cupom.
expirationDate?, usageLimit?, usedCount: Ótimos para controle de validade e uso.
isActive: Para ativar/desativar cupons.
Relações: orders[], transactions[] - permitem rastrear onde os cupons foram utilizados.
Conclusão
Seu schema Prisma está extremamente bem estruturado e alinhado com as necessidades de um e-commerce moderno. Você abordou pontos importantes como:

Precisão monetária (Decimal).
Controle de estoque (stock).
Gestão de variações de produto (sizes, colors).
Cálculo de frete (weight, dimensions).
Flexibilidade para checkout de convidados (guestId em Cart e Order).
Rastreamento de transações de pagamento (Transaction com 1:1 com Order).
Uso de snapshots para endereços e preços em pedidos/itens de carrinho.
Otimização de performance com índices (@@index).
Continue com este nível de detalhe e clareza. As poucas "considerações" são mais sugestões de aprimoramento futuro ou pontos para garantir a lógica na camada de serviço, e não falhas no design do schema em si.