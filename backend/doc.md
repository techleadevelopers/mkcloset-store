Documentação Detalhada do Backend MKcloset E-commerce
Este documento descreve a arquitetura, propósito e interconexões de cada módulo e arquivo TypeScript que compõe o backend da aplicação de e-commerce MKcloset, construído com NestJS e Prisma.

I. Estrutura Central da Aplicação
Esta seção descreve os arquivos fundamentais que iniciam e configuram a aplicação NestJS.

src/main.ts
Propósito: O ponto de entrada da aplicação NestJS. Ele inicializa o aplicativo, configura middlewares globais e inicia o servidor.
Funções Globais/Configurações:
NestFactory.create(AppModule): Cria uma instância da aplicação NestJS usando o AppModule como módulo raiz.
app.enableCors(): Habilita o Cross-Origin Resource Sharing (CORS), permitindo que o frontend (rodando em http://localhost:3000 em desenvolvimento) se comunique com o backend. Importante: Em produção, o origin deve ser o domínio real do frontend.
app.useGlobalPipes(new ValidationPipe()): Aplica um ValidationPipe globalmente. Isso garante que todos os DTOs (Data Transfer Objects) usados nos controladores sejam automaticamente validados de acordo com as regras definidas com class-validator.
transform: true: Converte o payload de entrada para uma instância da classe DTO.
whitelist: true: Remove propriedades do payload que não estão definidas no DTO.
forbidNonWhitelisted: true: Lança um erro se houver propriedades não permitidas no payload.
app.listen(port): Inicia o servidor HTTP na porta especificada (padrão 3001).
Interconexões: É o bootstrap do backend, conectando o NestJS ao ambiente de execução e configurando comportamentos globais que afetam todos os módulos e rotas.
src/app.module.ts
Propósito: O módulo raiz da aplicação NestJS. Ele agrega todos os outros módulos de funcionalidade, configurando a estrutura geral do backend.
Funções Globais/Configurações:
ConfigModule.forRoot({ isGlobal: true }): Carrega variáveis de ambiente do arquivo .env e as torna acessíveis globalmente através do ConfigService.
imports: Lista todos os módulos de funcionalidade (Auth, Users, Products, etc.) e módulos de infraestrutura (Prisma, Config, Common). Ao importar um módulo, seus provedores e controladores são disponibilizados para o restante da aplicação.
Dependências: Importa todos os módulos de funcionalidade e infraestrutura do projeto.
Interconexões: Atua como o orquestrador principal, garantindo que todos os componentes necessários estejam disponíveis e configurados corretamente para a aplicação.
src/app.controller.ts / src/app.service.ts
Propósito: Fornecem uma rota básica para o root da API e um endpoint de health check.
app.controller.ts:
@Get(): Retorna uma mensagem de boas-vindas.
@Get('health'): Retorna um status ok, útil para monitoramento de saúde da aplicação em ambientes de produção.
app.service.ts: Contém a lógica simples para as rotas do AppController.
Interconexões: São os endpoints mais básicos da API, servindo principalmente para verificar se o servidor está rodando.
II. Módulos de Infraestrutura e Utilidades Comuns
Esta seção detalha os módulos e componentes que fornecem serviços e funcionalidades globais ou de baixo nível.

src/prisma/
Propósito: Gerencia a conexão e interação com o banco de dados via Prisma ORM.
src/prisma/prisma.module.ts:
providers: [PrismaService]: Declara o PrismaService como um provedor.
exports: [PrismaService]: Exporta o PrismaService para que outros módulos possam injetá-lo e utilizá-lo.
src/prisma/prisma.service.ts:
@Injectable(): Marca a classe como um provedor injetável.
extends PrismaClient: Herda todas as funcionalidades do cliente Prisma.
onModuleInit(): Hook do ciclo de vida do NestJS. Garante que a conexão com o banco de dados seja estabelecida (this.$connect()) quando o módulo é inicializado.
enableShutdownHooks(): Configura um hook para fechar a conexão com o banco de dados (this.$disconnect()) de forma graciosa quando a aplicação é encerrada.
Dependências: PrismaClient (do @prisma/client).
Interconexões: O PrismaModule é importado por todos os módulos de funcionalidade que precisam acessar o banco de dados, permitindo que o PrismaService seja injetado em seus serviços.
src/config/
Propósito: Gerencia o carregamento e acesso a variáveis de ambiente e configurações da aplicação.
src/config/config.module.ts:
imports: [NestConfigModule.forRoot()]: Configura o módulo de configuração do NestJS para carregar variáveis do .env.
src/config/config.service.ts:
@Injectable(): Marca a classe como um provedor injetável.
constructor(private nestConfigService: NestConfigService): Injeta o ConfigService nativo do NestJS.
get<string>('VARIABLE_NAME'): Métodos getter para acessar variáveis de ambiente de forma tipada (ex: databaseUrl, jwtSecret). Isso centraliza o acesso às configurações e evita erros de digitação.
Dependências: @nestjs/config.
Interconexões: O ConfigModule é importado globalmente no AppModule, e o ConfigService é injetado em outros serviços (ex: AuthService, ShippingService, StripeService) para acessar configurações sensíveis como chaves de API e segredos JWT.
src/common/
Propósito: Contém componentes e utilitários que são compartilhados e aplicados globalmente em vários módulos da aplicação.
src/common/common.module.ts:
imports: [AuthModule]: Importa AuthModule porque JwtAuthGuard depende de provedores definidos lá (JwtService).
providers:
JwtAuthGuard: Provedor do guard de autenticação JWT.
CurrentUserDecorator: Provedor do decorator personalizado.
APP_FILTER, APP_INTERCEPTOR: Usam tokens especiais para aplicar HttpExceptionFilter e TransformInterceptor globalmente.
AppConstants: Provedor da classe de constantes.
exports: Torna esses provedores disponíveis para injeção em outros módulos.
Interconexões: Este módulo centraliza a configuração de comportamentos transversais da aplicação.
src/common/filters/http-exception.filter.ts
Propósito: Um filtro de exceção global que captura todas as HttpException lançadas na aplicação e formata a resposta de erro de forma consistente.
@Catch(HttpException): Indica que este filtro deve capturar exceções do tipo HttpException.
catch(exception, host): Método principal que formata a resposta JSON de erro, incluindo statusCode, timestamp, path e a mensagem/detalhes do erro.
Interconexões: Aplicado globalmente via APP_FILTER no CommonModule, garantindo que todas as respostas de erro HTTP tenham um formato padronizado e amigável para o frontend.
src/common/interceptors/transform.interceptor.ts
Propósito: Um interceptor global que transforma a resposta de sucesso de todas as requisições, encapsulando os dados retornados em um objeto data.
intercept(context, next): O método principal que usa rxjs/map para envolver a resposta.
Interconexões: Aplicado globalmente via APP_INTERCEPTOR no CommonModule. Isso padroniza a estrutura das respostas da API (ex: { "data": { ... } }), o que pode simplificar o tratamento de dados no frontend.
src/common/guards/jwt-auth.guard.ts
Propósito: Um guard de autenticação que protege rotas, garantindo que apenas usuários autenticados com um JWT válido possam acessá-las.
extends AuthGuard('jwt'): Utiliza a estratégia JWT do Passport.js.
Interconexões: Usado com o decorator @UseGuards(JwtAuthGuard) em controladores ou métodos de controlador para proteger endpoints.
src/common/decorators/current-user.decorator.ts
Propósito: Um decorator de parâmetro personalizado que extrai o objeto do usuário autenticado (req.user) e o injeta diretamente no parâmetro do método do controlador.
createParamDecorator: Função do NestJS para criar decorators de parâmetro.
Interconexões: Usado com @CurrentUser() em métodos de controlador protegidos por JwtAuthGuard para acessar facilmente os dados do usuário logado.
src/common/constants/app.constants.ts
Propósito: Armazena constantes globais da aplicação, como valores mínimos/máximos, limites, URLs padrão, etc.
static readonly: Define constantes que podem ser acessadas diretamente da classe (ex: AppConstants.FREE_SHIPPING_THRESHOLD).
Interconexões: Injetado como provedor no CommonModule e acessado em serviços (ex: ShippingService) para garantir consistência em valores chave.
III. Módulos de Funcionalidade
Esta seção detalha os módulos específicos de negócio do e-commerce.

src/auth/
Propósito: Gerencia a autenticação de usuários, incluindo registro, login e validação de tokens JWT.
src/auth/auth.module.ts: Importa UsersModule (para gerenciar usuários), PassportModule (para estratégias de autenticação) e JwtModule (para criação e validação de JWTs).
src/auth/auth.controller.ts:
POST /auth/register: Endpoint para registro de novos usuários.
POST /auth/login: Endpoint para login. Usa LocalAuthGuard para autenticação baseada em email/senha.
GET /auth/profile: Endpoint protegido por JWT para obter o perfil do usuário logado.
src/auth/auth.service.ts:
register(dto): Cria um novo usuário, hash da senha e salva no DB.
validateUser(email, pass): Valida credenciais de usuário (usado pela estratégia local).
login(user): Gera um JWT para o usuário autenticado.
src/auth/dto/register-user.dto.ts: Define a estrutura e regras de validação para dados de registro de usuário (nome, email, senha, telefone).
src/auth/dto/login-user.dto.ts: Define a estrutura e regras de validação para dados de login (email, senha).
src/auth/strategies/local.strategy.ts: Estratégia do Passport.js para autenticação baseada em email e senha. Usa AuthService.validateUser.
src/auth/strategies/jwt.strategy.ts: Estratégia do Passport.js para autenticação baseada em tokens JWT. Valida o token e anexa o usuário à requisição.
src/auth/interfaces/jwt-payload.interface.ts: Define a interface para o payload do JWT.
src/auth/guards/local-auth.guard.ts: Um guard simples que estende AuthGuard('local') para ser usado nas rotas de login.
Dependências: UsersModule, PrismaModule, @nestjs/passport, @nestjs/jwt, bcrypt, class-validator.
Interações:
Frontend: O frontend enviará credenciais para /auth/login e /auth/register. Após o login, armazenará o access_token e o enviará no cabeçalho Authorization para rotas protegidas.
UsersModule: AuthService interage com UsersService para criar e buscar usuários.
src/users/
Propósito: Gerencia as operações relacionadas aos usuários, seus perfis e endereços.
src/users/users.module.ts: Importa PrismaModule.
src/users/users.controller.ts:
POST /users: Cria um novo usuário (usado principalmente pelo registro).
GET /users/me: Obtém o perfil do usuário logado.
PATCH /users/me: Atualiza o perfil do usuário logado.
POST /users/me/addresses: Adiciona um novo endereço para o usuário logado.
GET /users/me/addresses: Obtém todos os endereços do usuário logado.
src/users/users.service.ts:
create(dto): Cria um novo usuário no DB.
findByEmail(email): Busca um usuário por email.
findById(id): Busca um usuário por ID.
update(id, dto): Atualiza dados de um usuário.
remove(id): Remove um usuário.
addAddress(userId, dto): Adiciona um endereço a um usuário.
findAddressesByUserId(userId): Retorna os endereços de um usuário.
src/users/dto/create-user.dto.ts: Define a estrutura para criação de usuário.
src/users/dto/update-user.dto.ts: Define a estrutura para atualização de usuário (usa PartialType).
src/users/dto/create-address.dto.ts: Define a estrutura para criação de endereço.
src/users/entities/user.entity.ts: Representação da entidade User (baseada no Prisma).
Dependências: PrismaModule, class-validator.
Interações:
AuthModule: AuthService utiliza UsersService para criar e validar usuários durante o registro e login.
OrdersModule: OrdersService utiliza UsersService para buscar endereços de entrega.
Frontend: Consumirá os endpoints /users/me para gerenciar o perfil do usuário.
src/categories/
Propósito: Gerencia as operações CRUD para categorias de produtos.
src/categories/categories.module.ts: Importa PrismaModule.
src/categories/categories.controller.ts:
POST /categories: Cria uma nova categoria.
GET /categories: Lista todas as categorias.
GET /categories/:id: Obtém uma categoria específica.
PATCH /categories/:id: Atualiza uma categoria.
DELETE /categories/:id: Remove uma categoria.
src/categories/categories.service.ts:
create(dto): Cria uma categoria.
findAll(): Lista todas as categorias.
findOne(id): Busca uma categoria por ID.
update(id, dto): Atualiza uma categoria.
remove(id): Remove uma categoria.
src/categories/dto/create-category.dto.ts: Define a estrutura para criação de categoria.
src/categories/dto/update-category.dto.ts: Define a estrutura para atualização de categoria.
src/categories/entities/category.entity.ts: Representação da entidade Category.
Dependências: PrismaModule, class-validator.
Interações:
ProductsModule: ProductsService utiliza CategoriesService para validar se uma categoria existe ao criar ou atualizar um produto.
Frontend: Consumirá /categories para exibir as categorias na navegação e filtros.
src/products/
Propósito: Gerencia as operações CRUD e busca/filtragem de produtos.
src/products/products.module.ts: Importa PrismaModule e CategoriesModule.
src/products/products.controller.ts:
POST /products: Cria um novo produto.
GET /products: Lista todos os produtos com suporte a filtros e ordenação via ProductQueryDto.
GET /products/featured: Lista produtos marcados como destaque.
GET /products/:id: Obtém um produto específico.
PATCH /products/:id: Atualiza um produto.
DELETE /products/:id: Remove um produto.
src/products/products.service.ts:
create(dto): Cria um produto, validando a categoryId.
findAll(query): Implementa a lógica de busca, filtragem (por search, categoryId, isFeatured, isNew) e ordenação (sortBy).
findFeatured(): Retorna produtos em destaque.
findOne(id): Busca um produto por ID.
update(id, dto): Atualiza um produto.
remove(id): Remove um produto.
src/products/dto/create-product.dto.ts: Define a estrutura para criação de produto, incluindo validações para preço, estoque, dimensões, etc.
src/products/dto/update-product.dto.ts: Define a estrutura para atualização de produto.
src/products/dto/product-query.dto.ts: Define os parâmetros de query para filtrar e ordenar produtos.
src/products/entities/product.entity.ts: Representação da entidade Product.
Dependências: PrismaModule, CategoriesModule, class-validator, class-transformer.
Interações:
CategoriesModule: ProductsService depende de CategoriesService para validar categorias.
CartModule, WishlistModule, OrdersModule, InventoryModule: Esses módulos dependem de ProductsService para obter informações de produtos (preço, estoque, etc.).
Frontend: Consumirá /products para as páginas de listagem e /products/:id para detalhes do produto.
src/cart/
Propósito: Gerencia as operações do carrinho de compras de um usuário.
src/cart/cart.module.ts: Importa PrismaModule, ProductsModule, UsersModule.
src/cart/cart.controller.ts:
GET /cart: Obtém ou cria o carrinho do usuário logado.
POST /cart/items: Adiciona um item ao carrinho.
PATCH /cart/items/:itemId: Atualiza a quantidade de um item no carrinho.
DELETE /cart/items/:itemId: Remove um item do carrinho.
DELETE /cart/clear: Limpa todo o carrinho.
src/cart/cart.service.ts:
getOrCreateCart(userId): Busca o carrinho de um usuário ou cria um novo se não existir.
addItemToCart(userId, dto): Adiciona um produto ao carrinho, verificando estoque e opções (tamanho/cor).
updateCartItemQuantity(userId, itemId, quantity): Atualiza a quantidade de um item, removendo-o se a quantidade for 0.
removeCartItem(userId, itemId): Remove um item específico do carrinho.
clearCart(userId): Remove todos os itens do carrinho.
calculateCartTotals(cart): Função auxiliar para calcular o total e a contagem de itens do carrinho.
src/cart/dto/add-to-cart.dto.ts: Define a estrutura para adicionar um item ao carrinho.
src/cart/dto/update-cart-item.dto.ts: Define a estrutura para atualizar a quantidade de um item.
src/cart/entities/cart.entity.ts: Representação das entidades Cart e CartItem.
Dependências: PrismaModule, ProductsModule, UsersModule, class-validator.
Interações:
ProductsModule: CartService utiliza ProductsService para obter detalhes do produto e verificar estoque.
UsersModule: CartService pode interagir com UsersService para garantir que o usuário existe (embora o JwtAuthGuard já faça isso).
OrdersModule: OrdersService utiliza CartService para obter o carrinho antes de criar um pedido.
Frontend: O frontend fará requisições para esses endpoints para gerenciar o carrinho de compras.
src/wishlist/
Propósito: Gerencia a lista de desejos de um usuário.
src/wishlist/wishlist.module.ts: Importa PrismaModule, ProductsModule, UsersModule.
src/wishlist/wishlist.controller.ts:
GET /wishlist: Obtém ou cria a wishlist do usuário logado.
POST /wishlist/items: Adiciona um item à wishlist.
DELETE /wishlist/items/:productId: Remove um item da wishlist.
src/wishlist/wishlist.service.ts:
getOrCreateWishlist(userId): Busca a wishlist de um usuário ou cria uma nova.
addItemToWishlist(userId, productId): Adiciona um produto à wishlist, verificando se já existe.
removeItemFromWishlist(userId, productId): Remove um produto da wishlist.
src/wishlist/dto/add-to-wishlist.dto.ts: Define a estrutura para adicionar um item à wishlist.
src/wishlist/entities/wishlist.entity.ts: Representação das entidades Wishlist e WishlistItem.
Dependências: PrismaModule, ProductsModule, UsersModule, class-validator.
Interações:
ProductsModule: WishlistService utiliza ProductsService para obter detalhes do produto.
Frontend: O frontend fará requisições para esses endpoints para gerenciar a lista de desejos.
src/orders/
Propósito: Gerencia a criação, visualização e status de pedidos.
src/orders/orders.module.ts: Importa PrismaModule, CartModule, UsersModule, ProductsModule.
src/orders/orders.controller.ts:
POST /orders: Cria um novo pedido a partir do carrinho do usuário.
GET /orders: Lista todos os pedidos do usuário logado.
GET /orders/:id: Obtém um pedido específico do usuário logado.
src/orders/orders.service.ts:
create(userId, dto): Lógica central para criar um pedido:
Obtém o carrinho do usuário.
Verifica estoque e captura o preço atual dos produtos.
Obtém e copia o endereço de entrega do usuário para o pedido (garantindo imutabilidade).
Realiza a criação do pedido e dos itens do pedido dentro de uma transação Prisma.
Decrementa o estoque dos produtos.
Limpa o carrinho após o pedido.
findAllByUserId(userId): Lista todos os pedidos de um usuário.
findOneByUserId(userId, orderId): Busca um pedido específico de um usuário.
src/orders/dto/create-order.dto.ts: Define a estrutura para criação de um pedido (método de pagamento, ID do endereço de entrega, detalhes de pagamento).
src/orders/entities/order.entity.ts: Representação das entidades Order e OrderItem.
Dependências: PrismaModule, CartModule, UsersModule, ProductsModule, class-validator.
Interações:
CartModule: OrdersService obtém o carrinho do CartService.
UsersModule: OrdersService obtém endereços do UsersService.
ProductsModule: OrdersService verifica estoque e preços com ProductsService.
PaymentsModule: PaymentsService atualiza o status de pedidos gerenciados por OrdersService.
InventoryModule: OrdersService (poderia) interagir com InventoryService para gerenciar estoque.
Frontend: O frontend enviará dados para /orders para finalizar a compra e consultará /orders para o histórico de pedidos.
src/payments/
Propósito: Gerencia o processamento de pagamentos e a integração com gateways de pagamento externos.
src/payments/payments.module.ts: Importa PrismaModule, OrdersModule, ConfigModule. Inclui StripeService como provedor.
src/payments/payments.controller.ts:
POST /payments/process: Endpoint para iniciar o processamento de um pagamento.
POST /payments/webhook/stripe: Endpoint para receber webhooks do Stripe (não protegido por JWT).
src/payments/payments.service.ts:
processPayment(userId, dto): Lógica principal para processar um pagamento. Verifica o status do pedido, delega o processamento a provedores específicos (ex: StripeService) e atualiza o status do pedido no DB.
handleStripeWebhook(payload, signature): Método para processar eventos de webhook recebidos do Stripe, atualizando o status do pedido com base nas notificações do gateway.
src/payments/dto/process-payment.dto.ts: Define a estrutura para processar um pagamento (ID do pedido, método, detalhes).
src/payments/providers/stripe.service.ts:
processCreditCardPayment(amount, token, orderId): Simula o processamento de pagamento via cartão de crédito com Stripe. Em uma implementação real, usaria a SDK do Stripe.
constructWebhookEvent(): (Comentado) Método para validar e construir eventos de webhook do Stripe.
Dependências: PrismaModule, OrdersModule, ConfigModule, class-validator.
Interações:
OrdersModule: PaymentsService interage com OrdersService para buscar e atualizar pedidos.
ConfigModule: StripeService usa ConfigService para obter chaves de API.
Frontend: O frontend enviará dados de pagamento (ex: token do cartão) para /payments/process.
src/shipping/
Propósito: Gerencia o cálculo de frete, incluindo validação de CEP e integração com APIs de transportadoras.
src/shipping/shipping.module.ts: Importa ConfigModule, ProductsModule.
src/shipping/shipping.controller.ts:
POST /shipping/calculate: Endpoint para calcular as opções de frete. (Público, não exige autenticação).
src/shipping/shipping.service.ts:
calculateShipping(dto): Lógica principal para calcular o frete:
Valida o CEP (usando ViaCEP).
Calcula o peso total, valor e dimensões dos itens do carrinho.
Implementa a lógica de simulação de frete regional do frontend, ajustando preços e prazos com base no CEP e nas características do pacote.
Em um cenário real, faria chamadas a APIs externas de transportadoras (ex: Correios).
src/shipping/dto/calculate-shipping.dto.ts: Define a estrutura para a requisição de cálculo de frete (CEP, itens do carrinho com detalhes do produto).
src/shipping/interfaces/correios.interface.ts: Define as interfaces para as opções de frete retornadas.
Dependências: ConfigModule, ProductsModule, axios (para ViaCEP), class-validator, class-transformer.
Interações:
Frontend: O FrontendShippingCalculator fará requisições para /shipping/calculate.
ProductsModule: ShippingService pode precisar de ProductsService para obter detalhes de peso/dimensões dos produtos (embora o DTO de entrada já contenha isso no exemplo atual).
src/inventory/
Propósito: Gerencia o estoque de produtos. Embora a lógica principal de decremento/incremento seja feita no OrdersService dentro de uma transação, este módulo pode expor endpoints para gerenciamento de estoque por administradores.
src/inventory/inventory.module.ts: Importa PrismaModule, ProductsModule.
src/inventory/inventory.controller.ts:
GET /inventory/:productId: Obtém o estoque de um produto.
PATCH /inventory/:productId/stock: Atualiza a quantidade de estoque de um produto. (Geralmente protegido por RolesGuard para admins).
src/inventory/inventory.service.ts:
getStock(productId): Retorna a quantidade em estoque de um produto.
updateStock(productId, quantity): Atualiza o estoque para uma quantidade específica.
decrementStock(productId, quantity): Decrementa o estoque (usado por OrdersService).
incrementStock(productId, quantity): Incrementa o estoque (usado para devoluções/cancelamentos).
src/inventory/dto/update-stock.dto.ts: Define a estrutura para atualização de estoque.
src/inventory/entities/stock.entity.ts: Representação da entidade de estoque (pode ser um objeto simples de retorno).
Dependências: PrismaModule, ProductsModule, class-validator.
Interações:
ProductsModule: InventoryService interage com ProductsService para acessar e modificar o estoque dos produtos.
OrdersModule: OrdersService utiliza InventoryService.decrementStock (ou faz a lógica diretamente no seu serviço, como no exemplo atual, para garantir transacionalidade).
Frontend (Admin): Um painel de administração poderia consumir esses endpoints para gerenciar o inventário.
IV. Fluxos de Interação Chave
1. Fluxo de Autenticação (Registro/Login)
Frontend (Register/Login Page): O usuário preenche o formulário.
Frontend (axios/fetch): Envia POST para /auth/register ou /auth/login com RegisterUserDto ou LoginUserDto.
Backend (AuthModule):
AuthController recebe a requisição.
Para register: AuthService.register cria o usuário (com senha hashed) via UsersService.
Para login: LocalAuthGuard valida as credenciais via AuthService.validateUser. Se válido, AuthService.login gera um JWT.
Backend (AuthService): Retorna o JWT e dados do usuário (sem senha).
Frontend: Armazena o JWT (ex: localStorage) e o anexa a futuras requisições para rotas protegidas (Authorization: Bearer <token>).
2. Fluxo de Gerenciamento de Produtos
Frontend (Products/ProductDetail Page):
Para listar: Envia GET para /products (com query params para filtros/ordenação).
Para detalhes: Envia GET para /products/:id.
Backend (ProductsModule):
ProductsController recebe a requisição.
ProductsService.findAll ou findOne consulta o DB via PrismaService, aplicando filtros/ordenação.
Backend (ProductsService): Retorna os dados dos produtos.
3. Fluxo do Carrinho de Compras
Frontend (useCart hook / Cart Components):
Para obter: Envia GET para /cart.
Para adicionar: Envia POST para /cart/items com AddToCartDto.
Para atualizar/remover: Envia PATCH/DELETE para /cart/items/:itemId.
Backend (CartModule):
CartController recebe a requisição (protegida por JwtAuthGuard).
CartService executa a lógica (criar/obter carrinho, adicionar/atualizar/remover itens) interagindo com PrismaService e ProductsService (para validação de estoque/preço).
Backend (CartService): Retorna o estado atualizado do carrinho.
4. Fluxo de Cálculo de Frete
Frontend (FrontendShippingCalculator): Envia POST para /shipping/calculate com CalculateShippingDto (CEP, itens do carrinho).
Backend (ShippingModule):
ShippingController recebe a requisição.
ShippingService.calculateShipping valida o CEP, calcula o peso/dimensões totais e simula (ou chama uma API real de transportadora) o cálculo de frete.
Backend (ShippingService): Retorna as opções de frete (ShippingOption[]).
5. Fluxo de Criação de Pedido
Frontend (Checkout Page): O usuário finaliza o processo de checkout.
Frontend (axios/fetch): Envia POST para /orders com CreateOrderDto.
Backend (OrdersModule):
OrdersController recebe a requisição (protegida por JwtAuthGuard).
OrdersService.create executa a lógica:
Obtém o carrinho do CartService.
Verifica estoque e preços dos produtos (ProductsService).
Obtém o endereço de entrega (UsersService).
Cria o pedido e os itens do pedido no DB dentro de uma transação Prisma.
Decrementa o estoque dos produtos.
Limpa o carrinho.
Backend (OrdersService): Retorna o objeto Order criado.
6. Fluxo de Processamento de Pagamento
Frontend (Checkout Page): Após a criação do pedido, o frontend pode iniciar o pagamento.
Frontend (axios/fetch): Envia POST para /payments/process com ProcessPaymentDto (ID do pedido, método de pagamento, detalhes).
Backend (PaymentsModule):
PaymentsController recebe a requisição (protegida por JwtAuthGuard).
PaymentsService.processPayment delega para o provedor de pagamento apropriado (ex: StripeService).
StripeService (simulado) processa o pagamento.
PaymentsService atualiza o status do pedido no DB com base no resultado.
Backend (PaymentsService): Retorna o pedido atualizado com o status do pagamento.
Webhook (Gateway de Pagamento -> Backend): Para pagamentos assíncronos (Pix, Boleto, ou confirmações de cartão), o gateway de pagamento envia um POST para o endpoint de webhook do backend (ex: /payments/webhook/stripe).
PaymentsController.handleStripeWebhook recebe e delega para PaymentsService.handleStripeWebhook para processar e atualizar o status do pedido.