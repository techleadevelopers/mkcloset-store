Documentação do Projeto
Estrutura Geral
O projeto é uma aplicação de e-commerce que permite aos usuários navegar por produtos, gerenciar um carrinho de compras e realizar pedidos.

Componentes Principais
Shopping Cart (shopping-cart.tsx)

Descrição: Componente que exibe os itens no carrinho de compras.
Funcionalidades: Exibir itens do carrinho, calcular e mostrar o total, permitir a finalização da compra.
Estado:
isCartOpen: Controla se o carrinho está aberto.
items: Lista de itens no carrinho.
total: Total a pagar.
Funções:
handleCheckout: Redireciona para a página de checkout.
handleClose: Fecha o carrinho.
Cart Item (cart-item.tsx)

Descrição: Componente que representa um item individual no carrinho.
Funcionalidades: Mostrar detalhes do produto, permitir alteração da quantidade e remoção do item.
Estado: Utiliza propriedades passadas (item do carrinho).
Funções:
handleDecrease: Diminui a quantidade.
handleIncrease: Aumenta a quantidade.
handleRemove: Remove o item do carrinho.
Header (header.tsx)

Descrição: Barra de navegação superior da aplicação.
Funcionalidades: Exibir navegação entre páginas, busca de produtos.
Estado: Controla a busca e o estado do menu mobile.
Funções:
handleSearch: Processa a busca.
Footer (footer.tsx)

Descrição: Rodapé da aplicação.
Funcionalidades: Informações de contato e links úteis, seção de categorias e suporte.
Product Card (product-card.tsx)

Descrição: Exibe informações de um produto.
Funcionalidades: Permitir adicionar produtos ao carrinho ou à wishlist.
Estado: Controle de adição ao carrinho.
Alert Dialog (alert-dialog.tsx)

Descrição: Componente para exibir diálogos de alerta.
Funcionalidades: Permitir ao usuário confirmar ou cancelar ações.
Elementos: Inclui Dialog, DialogContent, DialogClose, entre outros.
Slider (slider.tsx)

Descrição: Componente para exibir um controle deslizante.
Funcionalidades: Permitir a seleção de valores em um intervalo.
Tabs (tabs.tsx)

Descrição: Componente para exibir conteúdo em abas.
Funcionalidades: Permitir navegação entre diferentes seções de conteúdo.
Table (table.tsx)

Descrição: Componente para exibir dados em formato de tabela.
Funcionalidades: Permitir a organização e visualização de dados tabulares.
Tooltip (tooltip.tsx)

Descrição: Componente para exibir dicas ou informações adicionais ao passar o mouse.
Funcionalidades: Exibir informações contextuais.
Badge (badge.tsx)

Descrição: Componente para exibir etiquetas de status ou contagem.
Funcionalidades: Mostrar pequenas informações ou contadores.
Checkbox (checkbox.tsx)

Descrição: Componente para opções de seleção.
Funcionalidades: Permitir que os usuários selecionem uma ou mais opções.
Radio Group (radio-group.tsx)

Descrição: Componente para seleção única entre várias opções.
Funcionalidades: Permitir que os usuários escolham uma única opção de uma lista.
Input (input.tsx)

Descrição: Componente de entrada de texto.
Funcionalidades: Permitir a entrada de dados do usuário.
Textarea (textarea.tsx)

Descrição: Componente para entrada de texto em múltiplas linhas.
Funcionalidades: Permitir a entrada de textos longos.
Skeleton (skeleton.tsx)

Descrição: Componente de carregamento.
Funcionalidades: Mostrar um estado de carregamento visual.
Checkbox Group (checkbox-group.tsx)

Descrição: Agrupamento de checkboxes.
Funcionalidades: Permitir a seleção de múltiplas opções.
Sidebar (sidebar.tsx)

Descrição: Componente para navegação lateral.
Funcionalidades: Exibir links de navegação e opções.
Carousel (carousel.tsx)

Descrição: Componente para exibir itens em um carrossel.
Funcionalidades: Permitir a rotação de itens.
Progress (progress.tsx)

Descrição: Componente para mostrar progresso.
Funcionalidades: Indicar o andamento de uma tarefa.
Context Menu (context-menu.tsx)

Descrição: Menu de contexto.
Funcionalidades: Exibir opções relacionadas ao contexto.
Dropdown Menu (dropdown-menu.tsx)

Descrição: Componente para menus suspensos.
Funcionalidades: Exibir opções em um menu dropdown.
Command (command.tsx)

Descrição: Interface para comandos.
Funcionalidades: Permitir a execução de ações.
Popover (popover.tsx)

Descrição: Componente para exibir conteúdo em um popover.
Funcionalidades: Exibir informações adicionais.
Drawer (drawer.tsx)

Descrição: Componente para menu deslizante.
Funcionalidades: Exibir opções de navegação em um painel deslizante.
Form (form.tsx)

Descrição: Componente para gerenciar formulários.
Funcionalidades: Facilitar a manipulação de entradas e validações.
Toast (toast.tsx)

Descrição: Notificações temporárias.
Funcionalidades: Exibir mensagens de feedback ao usuário.
Toaster (toaster.tsx)

Descrição: Gerencia a exibição de toasts.
Funcionalidades: Agrupar e exibir notificações.
Avatar (avatar.tsx)

Descrição: Componente para exibir imagens de perfil.
Funcionalidades: Mostrar avatares de usuários.
Aspect Ratio (aspect-ratio.tsx)

Descrição: Componente para manter proporção de elementos.
Funcionalidades: Controlar a razão de aspecto.
Resizer (resizable.tsx)

Descrição: Componente para redimensionar áreas.
Funcionalidades: Permitir ajustar o tamanho de elementos.
Slider (slider.tsx)

Descrição: Componente para seleção de valores em um intervalo.
Funcionalidades: Permitir ajustes de valores.
Conclusão
Essa documentação serve para orientar desenvolvedores que desejam manter ou expandir a aplicação. Para qualquer nova funcionalidade, siga a estrutura existente e utilize os hooks personalizados para gerenciar estados.