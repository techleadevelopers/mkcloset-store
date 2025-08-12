#!/bin/bash

# ==============================================================================
# Script de Teste Automatizado para o Fluxo de Compra do Usuário Convidado
# Ambiente: Backend local
# Este script simula o fluxo completo de um usuário sem login, usando um guestId,
# incluindo criação de produto, adição ao carrinho, cálculo de frete e finalização do pedido.
# ==============================================================================

# --- Variáveis de Configuração ---
# ATENÇÃO: A URL DO BACKEND AGORA INCLUI O PREFIXO /api E ESTÁ NA PORTA 3000.
BACKEND_URL="http://localhost:3001" # Confirme se a porta é a 3000

# Dados do usuário convidado para o checkout
GUEST_NAME="Convidado Teste"
GUEST_EMAIL="convidado-$(date +%s%N | cut -c 1-10)@example.com" # Email único para cada execução
GUEST_PHONE="11987654321" # Formato brasileiro
GUEST_CPF="12345678900" # CPF válido para teste (pode ser fictício)

# Endereço de entrega do convidado
GUEST_SHIPPING_STREET="Rua Teste"
GUEST_SHIPPING_NUMBER="123"
GUEST_SHIPPING_COMPLEMENT="Apto 45"
GUEST_SHIPPING_NEIGHBORHOOD="Bairro Teste"
GUEST_SHIPPING_CITY="Sao Paulo"
GUEST_SHIPPING_STATE="SP"
GUEST_SHIPPING_ZIPCODE="01001000" # CEP válido para SP

# ID de uma categoria existente no seu banco de dados (da imagem fornecida)
# ESTE ID É CRUCIAL PARA A CRIAÇÃO DO PRODUTO!
EXISTING_CATEGORY_ID="9f0fe746-9ea3-44f4-8c89-d72b78174a72" # ID da categoria "Vestido"

# --- Funções Auxiliares ---
# Função para verificar se o comando jq está disponível
check_jq() {
  if ! command -v jq &> /dev/null; then
    echo "Erro: 'jq' não está instalado. Por favor, instale-o para executar este script."
    echo "No Ubuntu/Debian: sudo apt-get install jq"
    echo "No macOS (Homebrew): brew install jq"
    echo "No Windows (Chocolatey): choco install jq"
    exit 1
  fi
}

# --- Início do Script ---
check_jq
echo "Iniciando o teste de fluxo de compra do usuário convidado..."
echo "==========================================================="

# --- Passo 1: Gerar um ID para o Usuário Convidado (GuestId) ---
# Usando uuidgen se disponível, senão fallback para md5sum
if command -v uuidgen &> /dev/null; then
  GUEST_ID=$(uuidgen)
else
  GUEST_ID=$(date +%s%N | md5sum | head -c 32)
fi
echo -e "\n[PASSO 1/6] Gerando um guestId para o usuário: ${GUEST_ID}"

# --- Passo 2: Criar um Produto de Teste (USANDO CATEGORIA EXISTENTE E TODOS OS CAMPOS NECESSÁRIOS) ---
echo -e "\n[PASSO 2/6] Criando um produto de teste para adicionar ao carrinho (usando categoria existente)..."
PRODUCT_PAYLOAD='{
  "name": "Vestido Teste Automatizado",
  "description": "Vestido de teste para o fluxo de convidado.",
  "price": 120.00,
  "originalPrice": 150.00,
  "stock": 50,
  "categoryId": "'"${EXISTING_CATEGORY_ID}"'", # <--- USANDO O ID DA CATEGORIA "Vestido"
  "images": ["https://example.com/vestido_teste.jpg", "https://example.com/vestido_teste_2.jpg"],
  "sizes": ["P", "M", "G"],
  "colors": ["Preto", "Vermelho"],
  "isFeatured": false,
  "isNew": true,
  "weight": 0.5,
  "dimensions": { "length": 30, "width": 20, "height": 5 }
}'

PRODUCT_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/products" \
  -H "Content-Type: application/json" \
  -d "$PRODUCT_PAYLOAD")

# Assumindo que o backend usa o TransformInterceptor e retorna { data: ... }
PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.id')
PRODUCT_PRICE=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.price')
PRODUCT_NAME=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.name')

if [ "$PRODUCT_ID" != "null" ] && [ -n "$PRODUCT_ID" ]; then
    echo "✅ Produto de teste criado. ID: ${PRODUCT_ID}, Preço: ${PRODUCT_PRICE}, Nome: ${PRODUCT_NAME}"
else
    echo "❌ Erro: Não foi possível criar o produto de teste."
    echo "Resposta da API: $PRODUCT_RESPONSE"
    exit 1
fi

# --- Passo 3: Adicionar o Produto ao Carrinho (como convidado, com tamanho e cor) ---
echo -e "\n[PASSO 3/6] Adicionando o produto ao carrinho do convidado..."
ADD_TO_CART_PAYLOAD='{
  "productId": "'"${PRODUCT_ID}"'",
  "quantity": 1,
  "guestId": "'"${GUEST_ID}"'",
  "size": "M", # <--- ADICIONADO TAMANHO E COR
  "color": "Preto" # <--- ADICIONADO TAMANHO E COR
}'

CART_ADD_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/cart/items" \
  -H "Content-Type: application/json" \
  -d "$ADD_TO_CART_PAYLOAD")

# Assumindo que o backend usa o TransformInterceptor e retorna { data: ... }
CART_ITEM_ID=$(echo "$CART_ADD_RESPONSE" | jq -r '.data.id')
if [ "$CART_ITEM_ID" != "null" ] && [ -n "$CART_ITEM_ID" ]; then
    echo "✅ Item adicionado ao carrinho com sucesso! Item ID: ${CART_ITEM_ID}"
else
    echo "❌ Erro: Falha ao adicionar item ao carrinho."
    echo "Resposta da API: $CART_ADD_RESPONSE"
    exit 1
fi

# --- Passo 4: Obter o Carrinho para confirmar e extrair detalhes para frete ---
echo -e "\n[PASSO 4/6] Obtendo o carrinho para confirmar e preparar o cálculo de frete..."
GET_CART_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/cart?guestId=${GUEST_ID}")

# Extrai os itens do carrinho no formato esperado pelo DTO de cálculo de frete
# Assumindo que o backend usa o TransformInterceptor e retorna { data: { items: [...] } }
CART_ITEMS_FOR_SHIPPING=$(echo "$GET_CART_RESPONSE" | jq -c '.data.items | map({id: .id, quantity: .quantity, product: {id: .productId, name: .product.name, price: .product.price, weight: .product.weight, dimensions: .product.dimensions}})')

if [ "$(echo "$CART_ITEMS_FOR_SHIPPING" | jq 'length')" -gt 0 ]; then
    echo "✅ Carrinho obtido com sucesso. Itens para frete: $CART_ITEMS_FOR_SHIPPING"
else
    echo "❌ Erro: Carrinho vazio ou não encontrado. Resposta da API: $GET_CART_RESPONSE"
    exit 1
fi

# --- Passo 5: Calcular Opções de Frete ---
echo -e "\n[PASSO 5/6] Calculando opções de frete para o endereço do convidado..."
SHIPPING_CALC_PAYLOAD='{
  "zipCode": "'"${GUEST_SHIPPING_ZIPCODE}"'",
  "items": '"${CART_ITEMS_FOR_SHIPPING}"'
}'

SHIPPING_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/shipping/calculate" \
  -H "Content-Type: application/json" \
  -d "$SHIPPING_CALC_PAYLOAD")

# Extrai o preço e o nome do serviço da primeira opção de frete
SHIPPING_OPTION_PRICE=$(echo "$SHIPPING_RESPONSE" | jq -r '.options[0].price')
SHIPPING_OPTION_SERVICE=$(echo "$SHIPPING_RESPONSE" | jq -r '.options[0].serviceName')

if [ "$SHIPPING_OPTION_PRICE" != "null" ] && [ -n "$SHIPPING_OPTION_PRICE" ]; then
    echo "✅ Frete calculado com sucesso. Serviço: ${SHIPPING_OPTION_SERVICE}, Preço: R$${SHIPPING_OPTION_PRICE}"
else
    echo "❌ Erro: Falha ao calcular frete."
    echo "Resposta da API: $SHIPPING_RESPONSE"
    exit 1
fi

# --- Passo 6: Finalizar o Pedido (Checkout) como Convidado na rota /orders) ---
echo -e "\n[PASSO 6/6] Finalizando o pedido como convidado..."
CREATE_ORDER_PAYLOAD='{
  "paymentMethod": "PIX",
  "shippingService": "'"${SHIPPING_OPTION_SERVICE}"'",
  "shippingPrice": '"${SHIPPING_OPTION_PRICE}"',
  "guestId": "'"${GUEST_ID}"'",
  "guestContactInfo": {
    "name": "'"${GUEST_NAME}"'",
    "email": "'"${GUEST_EMAIL}"'",
    "phone": "'"${GUEST_PHONE}"'",
    "cpf": "'"${GUEST_CPF}"'"
  },
  "guestShippingAddress": {
    "street": "'"${GUEST_SHIPPING_STREET}"'",
    "number": "'"${GUEST_SHIPPING_NUMBER}"'",
    "complement": "'"${GUEST_SHIPPING_COMPLEMENT}"'",
    "neighborhood": "'"${GUEST_SHIPPING_NEIGHBORHOOD}"'",
    "city": "'"${GUEST_SHIPPING_CITY}"'",
    "state": "'"${GUEST_SHIPPING_STATE}"'",
    "zipCode": "'"${GUEST_SHIPPING_ZIPCODE}"'"
  },
  "shouldCreateAccount": false
}'

ORDER_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/orders" \
  -H "Content-Type: application/json" \
  -d "$CREATE_ORDER_PAYLOAD")

# Assumindo que o backend usa o TransformInterceptor e retorna { data: ... }
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.data.id')
ORDER_STATUS=$(echo "$ORDER_RESPONSE" | jq -r '.data.status')

if [ "$ORDER_ID" != "null" ] && [ -n "$ORDER_ID" ]; then
    echo "✅ Pedido finalizado com sucesso. ID do Pedido: ${ORDER_ID}, Status: ${ORDER_STATUS}"
else
    echo "❌ Erro: Falha ao finalizar o pedido."
    echo "Resposta da API: $ORDER_RESPONSE"
    exit 1
fi

echo -e "\n==========================================================="
echo "Teste de fluxo de compra de convidado concluído com sucesso!"
echo "==========================================================="

# --- Limpeza (Opcional, dependendo da necessidade de manter dados de teste) ---
# Para remover o produto de teste, você precisaria de um endpoint DELETE /products/:id
# echo -e "\n[LIMPEZA] Removendo produto de teste..."
# DELETE_PRODUCT_RESPONSE=$(curl -s -X DELETE "${BACKEND_URL}/products/${PRODUCT_ID}")
# if [ "$(echo "$DELETE_PRODUCT_RESPONSE" | jq -r '.message')" == "Produto removido com sucesso" ]; then
#     echo "✅ Produto de teste removido."
# else
#     echo "⚠️ Aviso: Falha ao remover produto de teste. Resposta: $DELETE_PRODUCT_RESPONSE"
# fi