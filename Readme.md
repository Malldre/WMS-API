# 📦 Documentação da API - Sistema WMS (Warehouse Management System)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Swagger UI](#swagger-ui)
3. [Autenticação](#autenticação)
4. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Companies](#companies)
   - [Suppliers](#suppliers)
   - [Material Categories](#material-categories)
   - [Materials](#materials)
   - [Storages](#storages)
   - [Invoices](#invoices)
   - [Invoice Items](#invoice-items)
   - [Inventories](#inventories)
5. [Fluxo Completo de Uso](#fluxo-completo-de-uso)
6. [Códigos de Status HTTP](#códigos-de-status-http)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Modelo de Dados](#modelo-de-dados)

---

## 🎯 Visão Geral

Esta API REST foi desenvolvida para gerenciar operações de um sistema WMS (Warehouse Management System), incluindo:

- ✅ Gestão de empresas e fornecedores
- ✅ Controle de categorias e materiais
- ✅ Gerenciamento de armazéns (storages)
- ✅ Controle de notas fiscais e seus itens
- ✅ Rastreabilidade completa de inventário

**Base URL:** `http://localhost:3000`

**Tecnologias:**
- NestJS v10
- PostgreSQL
- Drizzle ORM
- JWT Authentication
- Swagger/OpenAPI

---

## 📚 Swagger UI

A documentação interativa está disponível em:

```
http://localhost:3000/api/docs
```

### Recursos do Swagger:

- 🔍 Exploração interativa de todos os endpoints
- 📝 Schemas de request/response
- 🧪 Testar requisições diretamente no navegador
- 🔐 Sistema de autenticação integrado
- 📖 Descrições detalhadas de cada operação

### Como usar o Swagger:

1. Acesse `http://localhost:3000/api/docs`
2. Faça login no endpoint `/auth/login`
3. Copie o `access_token` retornado
4. Clique no botão **"Authorize"** no topo da página
5. Cole o token no formato: `Bearer {seu_token_aqui}`
6. Agora você pode testar todos os endpoints protegidos

---

## 🔐 Autenticação

Todos os endpoints (exceto `/auth/login`) requerem autenticação via JWT.

### Login

Obtenha um token JWT para acessar os endpoints protegidos.

**Endpoint:** `POST /auth/login`

**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "senha123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJpYXQiOjE3MDA0ODQwMDAsImV4cCI6MTcwMDQ4NzYwMH0.abc123def456..."
}
```

**Como usar o token:**

Em todas as requisições subsequentes, adicione o header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta de erro (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 📚 Endpoints

### Auth

#### `POST /auth/login`

Realizar login e obter token JWT.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Responses:**
- `200` - Login realizado com sucesso
- `401` - Credenciais inválidas

---

### Companies

Gerenciamento de empresas do sistema.

#### `GET /companies`

Listar todas as empresas.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "cnpj": "12345678901234",
    "name": "Empresa ABC LTDA",
    "street": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "country": "Brasil",
    "postalCode": "01234567",
    "status": "ACTIVE",
    "createdAt": "2024-11-20T10:00:00.000Z"
  }
]
```

#### `GET /companies/{uuid}`

Buscar empresa por UUID.

**Parameters:**
- `uuid` (path) - UUID da empresa

**Responses:**
- `200` - Empresa encontrada
- `404` - Empresa não encontrada

#### `GET /companies/cnpj/{cnpj}`

Buscar empresa por CNPJ.

**Parameters:**
- `cnpj` (path) - CNPJ da empresa (14 dígitos)

**Exemplo:**
```
GET /companies/cnpj/12345678901234
```

#### `POST /companies`

Criar nova empresa.

**Request Body:**
```json
{
  "cnpj": "12345678901234",
  "name": "Empresa ABC LTDA",
  "street": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "postalCode": "01234567",
  "status": "ACTIVE"
}
```

**Campos obrigatórios:**
- `cnpj` - CNPJ da empresa (14 dígitos, único)
- `name` - Nome da empresa (máx. 255 caracteres)
- `street` - Endereço (máx. 255 caracteres)
- `city` - Cidade (máx. 100 caracteres)
- `state` - Estado, sigla (máx. 2 caracteres)
- `country` - País (máx. 100 caracteres)
- `postalCode` - CEP (máx. 10 caracteres)

**Campos opcionais:**
- `status` - Status da empresa: `ACTIVE`, `INACTIVE`, `BLOCKED` (padrão: `ACTIVE`)

**Responses:**
- `201` - Empresa criada com sucesso
- `409` - Empresa com este CNPJ já existe

#### `PUT /companies/{uuid}`

Atualizar empresa.

**Parameters:**
- `uuid` (path) - UUID da empresa

**Request Body:**
```json
{
  "name": "Empresa ABC LTDA - Matriz",
  "status": "INACTIVE"
}
```

**Responses:**
- `200` - Empresa atualizada com sucesso
- `404` - Empresa não encontrada

#### `DELETE /companies/{uuid}`

Deletar empresa.

**Parameters:**
- `uuid` (path) - UUID da empresa

**Responses:**
- `200` - Empresa deletada com sucesso
- `404` - Empresa não encontrada

---

### Suppliers

Gerenciamento de fornecedores. Cada fornecedor está vinculado a uma empresa (Company).

#### `GET /suppliers`

Listar todos os fornecedores.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "uuid": "650e8400-e29b-41d4-a716-446655440001",
    "companyId": 1,
    "createdAt": "2024-11-20T10:30:00.000Z",
    "company": {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "cnpj": "98765432109876",
      "name": "Fornecedor XYZ Ltda",
      "street": "Avenida Principal, 456",
      "city": "Rio de Janeiro",
      "state": "RJ",
      "country": "Brasil",
      "postalCode": "20000000",
      "status": "ACTIVE"
    }
  }
]
```

#### `GET /suppliers/{uuid}`

Buscar fornecedor por UUID.

#### `GET /suppliers/cnpj/{cnpj}`

Buscar fornecedor por CNPJ.

#### `POST /suppliers`

Criar novo fornecedor.

**Request Body:**
```json
{
  "cnpj": "98765432109876",
  "name": "Fornecedor XYZ Ltda",
  "street": "Avenida Principal, 456",
  "city": "Rio de Janeiro",
  "state": "RJ",
  "country": "Brasil",
  "postalCode": "20000000",
  "status": "ACTIVE"
}
```

**⚠️ Importante:** 
- Se já existir uma `Company` com esse CNPJ, ela será **reutilizada**
- Caso contrário, uma nova `Company` será criada automaticamente
- Isso permite que a mesma empresa seja fornecedor e cliente

**Responses:**
- `201` - Fornecedor criado com sucesso
- `409` - Fornecedor com este CNPJ já existe

#### `PUT /suppliers/{uuid}`

Atualizar fornecedor.

**Request Body:**
```json
{
  "name": "Fornecedor XYZ Ltda - Filial",
  "status": "INACTIVE"
}
```

#### `DELETE /suppliers/{uuid}`

Deletar fornecedor.

**⚠️ Nota:** Ao deletar um fornecedor, apenas o vínculo (`supplierInfo`) é removido. A `Company` permanece no banco, pois pode ter outros vínculos.

---

### Material Categories

Gerenciamento de categorias de materiais.

#### `GET /material-categories`

Listar todas as categorias.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "uuid": "750e8400-e29b-41d4-a716-446655440002",
    "name": "Parafusos e Fixadores",
    "description": "Parafusos, porcas, arruelas e fixadores em geral",
    "materialUnit": "UN",
    "createdAt": "2024-11-20T11:00:00.000Z"
  }
]
```

#### `GET /material-categories/{uuid}`

Buscar categoria por UUID.

#### `GET /material-categories/name/{name}`

Buscar categoria por nome.

**Exemplo:**
```
GET /material-categories/name/Parafusos%20e%20Fixadores
```

#### `POST /material-categories`

Criar nova categoria.

**Request Body:**
```json
{
  "name": "Parafusos e Fixadores",
  "description": "Parafusos, porcas, arruelas e fixadores em geral",
  "materialUnit": "UN"
}
```

**Unidades de medida suportadas:**

| Código | Descrição |
|--------|-----------|
| `BX` | Caixa |
| `CM` | Centímetro |
| `GR` | Grama |
| `KG` | Quilograma |
| `LT` | Litro |
| `M2` | Metro Quadrado |
| `M3` | Metro Cúbico |
| `ML` | Mililitro |
| `MT` | Metro |
| `PK` | Pacote |
| `UN` | Unidade |

**Responses:**
- `201` - Categoria criada com sucesso
- `409` - Categoria com este nome já existe

#### `PUT /material-categories/{uuid}`

Atualizar categoria.

#### `DELETE /material-categories/{uuid}`

Deletar categoria.

---

### Materials

Gerenciamento de materiais.

#### `GET /materials`

Listar todos os materiais.

**Response (200 OK):**
```json
[
  {
    "id": 4,
    "uuid": "850e8400-e29b-41d4-a716-446655440003",
    "externalCode": "PAR-001",
    "categoryId": 1,
    "description": "Parafuso Allen M6 x 20mm - Aço Inox",
    "materialUnit": "UN",
    "status": "ACTIVE",
    "createdAt": "2024-11-20T11:30:00.000Z"
  }
]
```

#### `GET /materials/{uuid}`

Buscar material por UUID.

#### `GET /materials/external-code/{externalCode}`

Buscar material por código externo.

**Exemplo:**
```
GET /materials/external-code/PAR-001
```

#### `GET /materials/category/{categoryId}`

Buscar materiais por categoria.

**Exemplo:**
```
GET /materials/category/1
```

#### `POST /materials`

Criar novo material.

**Request Body:**
```json
{
  "externalCode": "PAR-001",
  "categoryId": 1,
  "description": "Parafuso Allen M6 x 20mm - Aço Inox",
  "materialUnit": "UN",
  "status": "ACTIVE"
}
```

**Campos obrigatórios:**
- `externalCode` - Código externo do material, único (máx. 50 caracteres)
- `categoryId` - ID da categoria
- `description` - Descrição do material (máx. 255 caracteres)
- `materialUnit` - Unidade de medida (veja tabela acima)

**Campos opcionais:**
- `status` - Status: `ACTIVE`, `INACTIVE`, `DISCONTINUED`, `DEVELOPMENT` (padrão: `ACTIVE`)

**Status do Material:**

| Status | Descrição |
|--------|-----------|
| `ACTIVE` | Material ativo e disponível |
| `INACTIVE` | Material inativo temporariamente |
| `DISCONTINUED` | Material descontinuado |
| `DEVELOPMENT` | Material em desenvolvimento |

**Responses:**
- `201` - Material criado com sucesso
- `409` - Material com este código externo já existe

#### `PUT /materials/{uuid}`

Atualizar material.

**Request Body:**
```json
{
  "description": "Parafuso Allen M6 x 20mm - Aço Inox 304",
  "status": "DISCONTINUED"
}
```

#### `DELETE /materials/{uuid}`

Deletar material.

---

### Storages

Gerenciamento de locais de armazenamento (armazéns, prateleiras, etc.).

#### `GET /storages`

Listar todos os storages.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "uuid": "950e8400-e29b-41d4-a716-446655440004",
    "code": "A01-01",
    "name": "Armazém Principal - Setor A - Prateleira 01",
    "companyId": 1,
    "createdAt": "2024-11-20T12:00:00.000Z"
  }
]
```

#### `GET /storages/{uuid}`

Buscar storage por UUID.

#### `GET /storages/code/{code}`

Buscar storage por código.

**Exemplo:**
```
GET /storages/code/A01-01
```

#### `GET /storages/company/{companyId}`

Buscar storages por empresa.

**Exemplo:**
```
GET /storages/company/1
```

#### `POST /storages`

Criar novo storage.

**Request Body:**
```json
{
  "code": "A01-01",
  "name": "Armazém Principal - Setor A - Prateleira 01",
  "companyId": 1
}
```

**Campos obrigatórios:**
- `code` - Código do local, único (máx. 50 caracteres)
- `name` - Nome/descrição do local (máx. 255 caracteres)
- `companyId` - ID da empresa responsável

**Responses:**
- `201` - Storage criado com sucesso
- `409` - Storage com este código já existe

#### `PUT /storages/{uuid}`

Atualizar storage.

#### `DELETE /storages/{uuid}`

Deletar storage.

---

### Invoices

Gerenciamento de notas fiscais de recebimento.

#### `GET /invoices`

Listar todas as notas fiscais.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "uuid": "a50e8400-e29b-41d4-a716-446655440005",
    "invoiceNumber": "NF-2024-001",
    "supplierId": 1,
    "receivedAt": "2024-11-20T08:30:00.000Z",
    "status": "PENDING",
    "createdAt": "2024-11-20T12:30:00.000Z"
  }
]
```

#### `GET /invoices/{uuid}`

Buscar nota fiscal por UUID.

#### `POST /invoices`

Criar nova nota fiscal.

**Request Body:**
```json
{
  "invoiceNumber": "NF-2024-001",
  "supplierId": 1,
  "receivedAt": "2024-11-20T08:30:00.000Z",
  "status": "PENDING"
}
```

**Campos obrigatórios:**
- `invoiceNumber` - Número da nota fiscal, único (máx. 50 caracteres)
- `supplierId` - ID do fornecedor
- `receivedAt` - Data/hora de recebimento (formato ISO 8601)

**Campos opcionais:**
- `status` - Status da nota (padrão: `PENDING`)

**Status da Invoice:**

| Status | Descrição |
|--------|-----------|
| `PENDING` | Pendente de recebimento (padrão) |
| `WAITING_INSPECTION` | Aguardando inspeção |
| `RECEIVED` | Recebida e conferida |
| `REJECTED` | Rejeitada |
| `CANCELLED` | Cancelada |

**Fluxo de Status:**
```
PENDING → WAITING_INSPECTION → RECEIVED
   ↓
REJECTED / CANCELLED
```

**Responses:**
- `201` - Invoice criada com sucesso
- `409` - Invoice com este número já existe

#### `PUT /invoices/{uuid}`

Atualizar nota fiscal.

**Request Body:**
```json
{
  "status": "RECEIVED"
}
```

#### `DELETE /invoices/{uuid}`

Deletar nota fiscal.

---

### Invoice Items

Gerenciamento de itens de notas fiscais. Cada item representa um material recebido em uma nota fiscal.

#### `GET /invoice-items`

Listar todos os itens.

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "uuid": "b50e8400-e29b-41d4-a716-446655440006",
    "invoiceId": 1,
    "materialId": 4,
    "quantity": "100.000",
    "totalValue": "1500.00",
    "unitValue": "15.000000",
    "status": "WAITING",
    "remark": "Material em boas condições",
    "createdAt": "2024-11-20T13:00:00.000Z"
  }
]
```

#### `GET /invoice-items/{uuid}`

Buscar item por UUID.

#### `POST /invoice-items`

Criar novo item de nota fiscal.

**Request Body:**
```json
{
  "invoiceId": 1,
  "materialId": 4,
  "quantity": "100",
  "totalValue": "1500.00",
  "status": "WAITING",
  "remark": "Material em boas condições"
}
```

**Campos obrigatórios:**
- `invoiceId` - ID da nota fiscal
- `materialId` - ID do material
- `quantity` - Quantidade recebida (string, suporta decimais até 3 casas)
- `totalValue` - Valor total do item (string, suporta decimais até 2 casas)

**Campos opcionais:**
- `status` - Status do item (padrão: `WAITING`)
- `remark` - Observações sobre o item

**⚠️ Nota:** O campo `unitValue` é **calculado automaticamente** pelo banco de dados:
```sql
unitValue = totalValue / quantity
```

**Status do Invoice Item:**

| Status | Descrição |
|--------|-----------|
| `WAITING` | Aguardando conferência (padrão) |
| `COUNTING` | Em processo de contagem |
| `CONFORMING` | Conforme/aprovado |
| `DIVERGENT` | Divergente (quantidade ou qualidade) |
| `DAMAGED` | Danificado |
| `MISSING` | Faltando |
| `MISMATCHED` | Incompatível com pedido |

**Fluxo de Status:**
```
WAITING → COUNTING → CONFORMING / DIVERGENT
   ↓
DAMAGED / MISSING / MISMATCHED (a qualquer momento)
```

**Responses:**
- `201` - Item criado com sucesso
- `400` - Dados inválidos (foreign key, valores, etc.)

#### `PUT /invoice-items/{uuid}`

Atualizar item de nota fiscal.

**Request Body:**
```json
{
  "status": "CONFORMING",
  "remark": "Material conferido e aprovado"
}
```

**Exemplo - Marcar como divergente:**
```json
{
  "quantity": "950",
  "status": "DIVERGENT",
  "remark": "Nota indica 1000 unidades, recebido 950"
}
```

#### `DELETE /invoice-items/{uuid}`

Deletar item de nota fiscal.

---

### Inventories

Gerenciamento de inventário. Cada registro de inventário representa um item de nota fiscal armazenado em um local específico, garantindo **rastreabilidade completa**.

#### `GET /inventories`

Listar todo o inventário.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "uuid": "c50e8400-e29b-41d4-a716-446655440007",
    "materialId": 2,
    "storageId": 1,
    "quantity": "100.000",
    "reserved": "0.000",
    "available": "100.000",
    "createdAt": "2024-11-20T13:30:00.000Z"
  }
]
```

**⚠️ Importante sobre o campo `materialId`:**
- O campo `materialId` no inventário refere-se ao **ID do invoice item** (não do material diretamente)
- Isso garante **rastreabilidade completa**: você sabe exatamente de qual nota fiscal veio cada item no estoque
- Mesmo material de fornecedores ou notas diferentes terá registros separados no inventário

**Campo calculado `available`:**
```sql
available = quantity - reserved
```

#### `GET /inventories/{uuid}`

Buscar inventário por UUID.

#### `GET /inventories/invoice-item/{invoiceItemId}`

Buscar inventário por invoice item.

**Exemplo:**
```
GET /inventories/invoice-item/2
```

Retorna todos os locais onde o item de nota fiscal específico está armazenado.

**Response:**
```json
[
  {
    "id": 1,
    "uuid": "c50e8400-e29b-41d4-a716-446655440007",
    "materialId": 2,
    "storageId": 1,
    "quantity": "100.000",
    "reserved": "0.000",
    "available": "100.000",
    "createdAt": "2024-11-20T13:30:00.000Z"
  },
  {
    "id": 5,
    "uuid": "c50e8400-e29b-41d4-a716-446655440011",
    "materialId": 2,
    "storageId": 3,
    "quantity": "50.000",
    "reserved": "10.000",
    "available": "40.000",
    "createdAt": "2024-11-21T08:15:00.000Z"
  }
]
```

#### `GET /inventories/storage/{storageId}`

Buscar inventário por storage.

**Exemplo:**
```
GET /inventories/storage/1
```

Retorna todos os itens armazenados em um local específico.

#### `GET /inventories/search?invoiceItemId={id}&storageId={id}`

Buscar inventário específico (invoice item + storage).

**Exemplo:**
```
GET /inventories/search?invoiceItemId=2&storageId=1
```

Retorna o inventário de um item de nota fiscal em um local específico.

#### `POST /inventories`

Criar novo registro de inventário.

**Request Body:**
```json
{
  "invoiceItemId": 2,
  "storageId": 1,
  "quantity": "100"
}
```

**Campos obrigatórios:**
- `invoiceItemId` - ID do item de nota fiscal
- `storageId` - ID do local de armazenamento
- `quantity` - Quantidade armazenada (string, suporta decimais até 3 casas)

**⚠️ Validação:** Não é permitido criar dois registros com o mesmo `invoiceItemId` + `storageId` (constraint de unicidade).

**Responses:**
- `201` - Inventário criado com sucesso
- `409` - Inventário para este invoice item e storage já existe
- `400` - Invoice item ou storage não existe

#### `PUT /inventories/{uuid}`

Atualizar registro de inventário.

**Request Body:**
```json
{
  "quantity": "150"
}
```

**Exemplo - Mover para outro storage:**
```json
{
  "storageId": 2,
  "quantity": "100"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "uuid": "c50e8400-e29b-41d4-a716-446655440007",
  "materialId": 2,
  "storageId": 2,
  "quantity": "150.000",
  "reserved": "0.000",
  "available": "150.000",
  "createdAt": "2024-11-20T13:30:00.000Z"
}
```

#### `DELETE /inventories/{uuid}`

Deletar registro de inventário.

---

## 🔄 Fluxo Completo de Uso

### Cenário: Recebimento de Materiais de um Fornecedor

Este exemplo mostra o fluxo completo desde a criação de categorias até o registro no inventário.

#### 1️⃣ Autenticação

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ Guarde o `access_token` e use em todas as próximas requisições.

---

#### 2️⃣ Criar Categoria de Material

```http
POST /material-categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Parafusos e Fixadores",
  "description": "Parafusos, porcas, arruelas e fixadores em geral",
  "materialUnit": "UN"
}
```

**Response:**
```json
{
  "id": 1,
  "uuid": "750e8400-e29b-41d4-a716-446655440002",
  "name": "Parafusos e Fixadores",
  "description": "Parafusos, porcas, arruelas e fixadores em geral",
  "materialUnit": "UN",
  "createdAt": "2024-11-20T11:00:00.000Z"
}
```

✅ Guarde o `id: 1`

---

#### 3️⃣ Criar Materiais

```http
POST /materials
Authorization: Bearer {token}
Content-Type: application/json

{
  "externalCode": "PAR-001",
  "categoryId": 1,
  "description": "Parafuso Allen M6 x 20mm - Aço Inox",
  "materialUnit": "UN",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "id": 4,
  "uuid": "850e8400-e29b-41d4-a716-446655440003",
  "externalCode": "PAR-001",
  "categoryId": 1,
  "description": "Parafuso Allen M6 x 20mm - Aço Inox",
  "materialUnit": "UN",
  "status": "ACTIVE",
  "createdAt": "2024-11-20T11:30:00.000Z"
}
```

✅ Guarde o `id: 4`

Repita para criar outros materiais (PAR-002, FER-001, etc.).

---

#### 4️⃣ Criar Fornecedor

```http
POST /suppliers
Authorization: Bearer {token}
Content-Type: application/json

{
  "cnpj": "98765432109876",
  "name": "Fornecedor ABC Ltda",
  "street": "Avenida Principal, 456",
  "city": "Rio de Janeiro",
  "state": "RJ",
  "country": "Brasil",
  "postalCode": "20000000",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "id": 1,
  "uuid": "650e8400-e29b-41d4-a716-446655440001",
  "companyId": 1,
  "createdAt": "2024-11-20T10:30:00.000Z",
  "company": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "cnpj": "98765432109876",
    "name": "Fornecedor ABC Ltda",
    "street": "Avenida Principal, 456",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "country": "Brasil",
    "postalCode": "20000000",
    "status": "ACTIVE"
  }
}
```

✅ Guarde o `id: 1`

---

#### 5️⃣ Criar Storage (Local de Armazenamento)

```http
POST /storages
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "A01-01",
  "name": "Armazém Principal - Setor A - Prateleira 01",
  "companyId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "uuid": "950e8400-e29b-41d4-a716-446655440004",
  "code": "A01-01",
  "name": "Armazém Principal - Setor A - Prateleira 01",
  "companyId": 1,
  "createdAt": "2024-11-20T12:00:00.000Z"
}
```

✅ Guarde o `id: 1`

---

#### 6️⃣ Criar Nota Fiscal

```http
POST /invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceNumber": "NF-2024-001",
  "supplierId": 1,
  "receivedAt": "2024-11-20T08:30:00.000Z",
  "status": "PENDING"
}
```

**Response:**
```json
{
  "id": 1,
  "uuid": "a50e8400-e29b-41d4-a716-446655440005",
  "invoiceNumber": "NF-2024-001",
  "supplierId": 1,
  "receivedAt": "2024-11-20T08:30:00.000Z",
  "status": "PENDING",
  "createdAt": "2024-11-20T12:30:00.000Z"
}
```

✅ Guarde o `id: 1`

---

#### 7️⃣ Adicionar Itens à Nota Fiscal

```http
POST /invoice-items
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceId": 1,
  "materialId": 4,
  "quantity": "1000",
  "totalValue": "500.00",
  "status": "WAITING",
  "remark": "Material conforme especificação"
}
```

**Response:**
```json
{
  "id": 2,
  "uuid": "b50e8400-e29b-41d4-a716-446655440006",
  "invoiceId": 1,
  "materialId": 4,
  "quantity": "1000.000",
  "totalValue": "500.00",
  "unitValue": "0.500000",
  "status": "WAITING",
  "remark": "Material conforme especificação",
  "createdAt": "2024-11-20T13:00:00.000Z"
}
```

✅ Guarde o `id: 2`

Repita para adicionar outros itens da nota fiscal.

---

#### 8️⃣ Conferir e Aprovar Item

```http
PUT /invoice-items/b50e8400-e29b-41d4-a716-446655440006
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "CONFORMING",
  "remark": "Material conferido - OK"
}
```

**Response:**
```json
{
  "id": 2,
  "uuid": "b50e8400-e29b-41d4-a716-446655440006",
  "invoiceId": 1,
  "materialId": 4,
  "quantity": "1000.000",
  "totalValue": "500.00",
  "unitValue": "0.500000",
  "status": "CONFORMING",
  "remark": "Material conferido - OK",
  "createdAt": "2024-11-20T13:00:00.000Z"
}
```

---

#### 9️⃣ Registrar no Inventário

```http
POST /inventories
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceItemId": 2,
  "storageId": 1,
  "quantity": "1000"
}
```

**Response:**
```json
{
  "id": 1,
  "uuid": "c50e8400-e29b-41d4-a716-446655440007",
  "materialId": 2,
  "storageId": 1,
  "quantity": "1000.000",
  "reserved": "0.000",
  "available": "1000.000",
  "createdAt": "2024-11-20T13:30:00.000Z"
}
```

🎉 **Agora você tem rastreabilidade completa:**
- Sabe que esse estoque veio do **invoice item #2**
- Da **nota fiscal NF-2024-001**
- Do **fornecedor ABC** (CNPJ 98765432109876)
- Material **PAR-001** (Parafuso Allen M6 x 20mm)
- Está no **storage A01-01** (Armazém Principal - Setor A - Prateleira 01)
- Quantidade: **1000 unidades disponíveis**

---

#### 🔟 Consultar Inventário

**Ver tudo no storage A01-01:**
```http
GET /inventories/storage/1
Authorization: Bearer {token}
```

**Ver onde está o item da nota fiscal #2:**
```http
GET /inventories/invoice-item/2
Authorization: Bearer {token}
```

**Ver inventário específico:**
```http
GET /inventories/search?invoiceItemId=2&storageId=1
Authorization: Bearer {token}
```

---

## 📊 Códigos de Status HTTP

| Código | Descrição | Quando ocorre |
|--------|-----------|---------------|
| `200 OK` | Requisição bem-sucedida | GET, PUT, DELETE com sucesso |
| `201 Created` | Recurso criado com sucesso | POST com sucesso |
| `400 Bad Request` | Dados inválidos na requisição | Campos obrigatórios faltando, tipos errados, foreign keys inválidas |
| `401 Unauthorized` | Token ausente ou inválido | Sem token, token expirado, token malformado |
| `404 Not Found` | Recurso não encontrado | UUID não existe, recurso foi deletado |
| `409 Conflict` | Conflito de dados | CNPJ duplicado, código externo duplicado, constraint de unicidade |
| `500 Internal Server Error` | Erro interno do servidor | Erro não tratado, problema no banco de dados |

---

## ⚠️ Tratamento de Erros

### Erro 401 - Não autenticado

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Solução:** 
1. Faça login em `/auth/login`
2. Copie o `access_token`
3. Inclua no header: `Authorization: Bearer {token}`

---

### Erro 404 - Recurso não encontrado

```json
{
  "statusCode": 404,
  "message": "Material with UUID 850e8400-xxxx not found"
}
```

**Solução:** Verifique se o UUID está correto ou se o recurso existe.

---

### Erro 409 - Conflito (duplicação)

```json
{
  "statusCode": 409,
  "message": "Company with this CNPJ already exists"
}
```

**Solução:** 
- O recurso que você está tentando criar já existe
- Use o endpoint de busca para encontrá-lo
- Ou atualize o existente com PUT

---

### Erro 400 - Foreign Key inválida

```json
{
  "statusCode": 400,
  "message": "insert or update on table \"invoice_item\" violates foreign key constraint",
  "detail": "Key (material_id)=(99) is not present in table \"material\"."
}
```

**Solução:** 
- O ID referenciado não existe
- Crie o recurso pai antes (ex: material, invoice, supplier, etc.)
- Verifique se os IDs estão corretos

---

### Erro 400 - Validação de dados

```json
{
  "statusCode": 400,
  "message": [
    "cnpj must be exactly 14 characters",
    "name should not be empty"
  ],
  "error": "Bad Request"
}
```

**Solução:** Corrija os campos indicados na mensagem de erro.

---

## 📐 Modelo de Dados

### Diagrama de Relacionamentos

```
┌─────────────────┐
│    Company      │
│─────────────────│
│ id              │◄───┐
│ uuid            │    │
│ cnpj (unique)   │    │
│ name            │    │
│ street          │    │
│ city            │    │
│ state           │    │
│ country         │    │
│ postalCode      │    │
│ status          │    │
│ createdAt       │    │
└─────────────────┘    │
         ▲             │
         │             │
         │             │
┌────────┴──────────┐  │
│   SupplierInfo    │  │
│───────────────────│  │
│ id                │  │
│ uuid              │  │
│ companyId         │──┘
│ createdAt         │
└───────────────────┘
         ▲
         │
         │
┌────────┴──────────┐         ┌──────────────────┐
│     Invoice       │         │ MaterialCategory │
│───────────────────│         │──────────────────│
│ id                │         │ id               │
│ uuid              │         │ uuid             │
│ invoiceNumber     │         │ name (unique)    │
│ supplierId        │──┐      │ description      │
│ receivedAt        │  │      │ materialUnit     │
│ status            │  │      │ createdAt        │
│ createdAt         │  │      └──────────────────┘
└───────────────────┘  │               ▲
         ▲             │               │
         │             │               │
         │             │      ┌────────┴────────┐
┌────────┴──────────┐  │      │    Material     │
│   InvoiceItem     │  │      │─────────────────│
│───────────────────│  │      │ id              │
│ id                │  │      │ uuid            │
│ uuid              │  │      │ externalCode    │
│ invoiceId         │──┘      │ categoryId      │──┐
│ materialId        │─────────┤ description     │  │
│ quantity          │         │ materialUnit    │  │
│ totalValue        │         │ status          │  │
│ unitValue (calc)  │         │ createdAt       │  │
│ status            │         └─────────────────┘  │
│ remark            │                              │
│ createdAt         │                              │
└───────────────────┘                              │
         ▲                                         │
         │                                         │
         │                                         │
┌────────┴──────────┐         ┌───────────────────┴┐
│    Inventory      │         │      Storage       │
│───────────────────│         │────────────────────│
│ id                │         │ id                 │
│ uuid              │         │ uuid               │
│ materialId (FK)   │─────────┤ code (unique)      │
│ storageId         │         │ name               │
│ quantity          │         │ companyId          │──┐
│ reserved          │         │ createdAt          │  │
│ available (calc)  │         └────────────────────┘  │
│ createdAt         │                                 │
└───────────────────┘                                 │
         │                                            │
         └────────────────────────────────────────────┘
```

### Legenda:
- `▲` - Relacionamento um-para-muitos
- `(FK)` - Foreign Key
- `(unique)` - Constraint de unicidade
- `(calc)` - Campo calculado automaticamente

### Relacionamentos Principais:

1. **Company ↔ SupplierInfo**: Uma empresa pode ser fornecedor (1:1)
2. **Company ↔ Storage**: Uma empresa possui múltiplos storages (1:N)
3. **SupplierInfo ↔ Invoice**: Um fornecedor tem múltiplas invoices (1:N)
4. **MaterialCategory ↔ Material**: Uma categoria tem múltiplos materiais (1:N)
5. **Invoice ↔ InvoiceItem**: Uma invoice tem múltiplos itens (1:N)
6. **Material ↔ InvoiceItem**: Um material pode estar em múltiplos invoice items (1:N)
7. **InvoiceItem ↔ Inventory**: Um invoice item pode estar em múltiplos storages (1:N)
8. **Storage ↔ Inventory**: Um storage contém múltiplos invoice items (1:N)

---

## 📝 Observações Importantes

### 1. Rastreabilidade Completa

O sistema garante rastreabilidade através da seguinte cadeia:

```
Material ────┐
             ▼
         Invoice Item ────► Inventory ────► Storage
             ▲
             │
         Invoice
             ▲
             │
         Supplier
             ▲
             │
         Company
```

**Você sempre sabe:**
- ✅ De qual fornecedor veio o material
- ✅ Em qual nota fiscal foi recebido
- ✅ Qual item específico da nota (com quantidade e valor)
- ✅ Onde está armazenado
- ✅ Quantidade disponível e reservada

**Exemplo prático:**

Se você tem 2000 parafusos PAR-001 no estoque, sendo:
- 1000 da NF-2024-001 (Fornecedor ABC) no storage A01-01
- 1000 da NF-2024-010 (Fornecedor XYZ) no storage B02-03

Você consegue rastrear cada lote separadamente, mesmo sendo o mesmo material!

---

### 2. Reutilização de Companies

Ao criar um Supplier:

```http
POST /suppliers
{
  "cnpj": "12345678901234",
  "name": "Fornecedor ABC"
  ...
}
```

**Comportamento:**
1. Sistema verifica se existe uma `Company` com CNPJ `12345678901234`
2. **Se existir:** Reutiliza a `Company` existente e apenas cria o vínculo `SupplierInfo`
3. **Se não existir:** Cria nova `Company` + novo `SupplierInfo`

**Benefícios:**
- ✅ A mesma empresa pode ser fornecedor e cliente
- ✅ Evita duplicação de dados de empresas
- ✅ Mantém histórico unificado por CNPJ

---

### 3. Campos Calculados

Alguns campos são calculados automaticamente pelo banco de dados:

#### Invoice Item - Unit Value
```sql
unitValue = totalValue / quantity
```

**Exemplo:**
```json
{
  "quantity": "1000",
  "totalValue": "500.00"
}
```
→ `unitValue` será `0.500000`

#### Inventory - Available
```sql
available = quantity - reserved
```

**Exemplo:**
```json
{
  "quantity": "1000.000",
  "reserved": "250.000"
}
```
→ `available` será `750.000`

---

### 4. Status e Fluxos

#### Material Status
```
DEVELOPMENT → ACTIVE → INACTIVE → DISCONTINUED
      ↓
   ACTIVE (aprovado)
```

#### Invoice Status
```
PENDING → WAITING_INSPECTION → RECEIVED
   ↓
REJECTED
   ↓
CANCELLED
```

#### Invoice Item Status
```
WAITING → COUNTING → CONFORMING
   │         │
   │         └─────► DIVERGENT
   │
   └─────► DAMAGED / MISSING / MISMATCHED
```

---

### 5. Soft Delete vs Hard Delete

Esta API usa **hard delete** em todos os módulos:

- ⚠️ Ao deletar, o registro é **permanentemente removido** do banco
- ⚠️ Não há campos `deletedAt` ou `deletedById`
- ⚠️ Não é possível recuperar registros deletados

**Atenção ao deletar:**
- Company com Suppliers vinculados
- Material com Invoice Items
- Invoice com Invoice Items
- Storage com Inventory
- Invoice Item com Inventory

**Recomendação:** Use o campo `status` para inativar em vez de deletar:
```json
{
  "status": "INACTIVE"
}
```

---

### 6. Unicidade e Constraints

#### Campos únicos por tabela:

| Tabela | Campo único | Descrição |
|--------|-------------|-----------|
| Company | `cnpj` | CNPJ deve ser único |
| Company | `uuid` | UUID gerado automaticamente |
| Material | `externalCode` | Código externo do material |
| MaterialCategory | `name` | Nome da categoria |
| Storage | `code` | Código do local |
| Invoice | `invoiceNumber` | Número da nota fiscal |
| Inventory | `materialId + storageId` | Não pode ter mesmo invoice item em mesmo storage |

---

### 7. Formato de Datas

Todas as datas devem ser enviadas no formato **ISO 8601**:

```
2024-11-20T08:30:00.000Z
```

**Componentes:**
- `2024-11-20` - Data (YYYY-MM-DD)
- `T` - Separador
- `08:30:00.000` - Hora (HH:MM:SS.mmm)
- `Z` - Timezone UTC

**Exemplos válidos:**
```
2024-11-20T08:30:00Z
2024-11-20T08:30:00.000Z
2024-11-20T08:30:00-03:00
```

---

### 8. Precisão Numérica

#### Quantidades (quantity, reserved, available):
- Tipo: `NUMERIC(10, 3)`
- Precisão: 10 dígitos no total
- Escala: 3 casas decimais
- Exemplo: `1234567.890`

#### Valores monetários (totalValue, unitValue):
- `totalValue`: `NUMERIC(10, 2)` → 2 casas decimais
- `unitValue`: `NUMERIC(15, 6)` → 6 casas decimais (para cálculo preciso)
- Exemplo total: `12345678.90`
- Exemplo unitário: `123456789.012345`

**⚠️ Envie sempre como string para preservar precisão:**
```json
{
  "quantity": "1000.500",
  "totalValue": "15000.75"
}
```

---

## 🚀 Começando

### Pré-requisitos

- Node.js v18 ou superior
- PostgreSQL v14 ou superior
- npm ou yarn

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/wms-api.git
cd wms-api
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/wms_db

# JWT
JWT_SECRET=sua_chave_secreta_aqui_muito_segura
JWT_EXPIRES_IN=1h

# Server
PORT=3000
NODE_ENV=development
```

4. **Execute as migrations:**
```bash
npm run db:push
```

5. **Inicie o servidor:**
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

6. **Acesse a aplicação:**
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

---

## 🧪 Testando a API

### Usando cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'

# Listar materiais (substitua {token} pelo access_token)
curl -X GET http://localhost:3000/materials \
  -H "Authorization: Bearer {token}"
```

### Usando Postman

1. Importe a collection (se disponível)
2. Configure a variável `{{baseUrl}}` = `http://localhost:3000`
3. Configure a variável `{{token}}` após o login
4. Use `{{token}}` no header Authorization

### Usando Swagger UI

1. Acesse `http://localhost:3000/api/docs`
2. Clique em "Authorize" (cadeado no topo)
3. Faça login em `/auth/login` para obter o token
4. Cole o token no formato: `Bearer {seu_token}`
5. Teste os endpoints diretamente na interface

---

## 📧 Suporte

Para dúvidas, problemas ou sugestões:

- 📧 Email: contato@wms.com
- 🐛 Issues: https://github.com/seu-usuario/wms-api/issues
- 📖 Wiki: https://github.com/seu-usuario/wms-api/wiki

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 🔄 Changelog

### [1.0.0] - 2024-11-20

#### Adicionado
- ✨ Sistema completo de autenticação JWT
- ✨ CRUD completo de Companies
- ✨ CRUD completo de Suppliers (com reutilização de Companies)
- ✨ CRUD completo de Material Categories
- ✨ CRUD completo de Materials
- ✨ CRUD completo de Storages
- ✨ CRUD completo de Invoices
- ✨ CRUD completo de Invoice Items (com cálculo automático de unit value)
- ✨ CRUD completo de Inventories (com rastreabilidade por invoice item)
- ✨ Documentação Swagger/OpenAPI completa
- ✨ Validação de dados em todos os endpoints
- ✨ Tratamento de erros padronizado

---

**Versão da API:** 1.0.0  
**Última atualização:** 20 de Novembro de 2024  
**Desenvolvido com:** ❤️ e NestJS