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