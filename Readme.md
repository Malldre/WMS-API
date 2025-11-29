# 📦 Documentação da API - Sistema WMS (Warehouse Management System)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Novidades da v2.0.0](#novidades-da-v200)
3. [Autenticação](#autenticação)
4. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Users](#users)
   - [Companies](#companies)
   - [Suppliers](#suppliers)
   - [Material Categories](#material-categories)
   - [Materials](#materials)
   - [Storages](#storages)
   - [Invoices](#invoices)
   - [Invoice Items](#invoice-items)
   - [Inventories](#inventories)
   - [Tasks](#tasks)
5. [Fluxos Completos](#fluxos-completos)
   - [Fluxo de Recebimento de Material](#fluxo-de-recebimento-de-material)
   - [Fluxo de Conferência com Tasks](#fluxo-de-conferência-com-tasks)
6. [Códigos de Status HTTP](#códigos-de-status-http)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Modelo de Dados](#modelo-de-dados)
   - [Diagrama de Relacionamentos Completo](#diagrama-de-relacionamentos-completo)
   - [Principais Relacionamentos](#principais-relacionamentos)
   - [Rastreabilidade Completa](#rastreabilidade-completa)
9. [Observações Importantes](#observações-importantes)
   - [1. Rastreabilidade Completa](#1-rastreabilidade-completa)
   - [2. Reutilização de Companies](#2-reutilização-de-companies)
   - [3. Campos Calculados Automaticamente](#3-campos-calculados-automaticamente)
   - [4. Status e Fluxos](#4-status-e-fluxos)
   - [5. Soft Delete vs Hard Delete](#5-soft-delete-vs-hard-delete)
   - [6. Unicidade e Constraints](#6-unicidade-e-constraints)
   - [7. Formato de Datas](#7-formato-de-datas)
   - [8. Precisão Numérica](#8-precisão-numérica)
   - [9. Sistema de Tasks](#9-sistema-de-tasks)
   - [10. Sistema de Identificadores (ID vs UUID)](#10-sistema-de-identificadores-id-vs-uuid)
10. [Começando](#começando)
    - [Pré-requisitos](#pré-requisitos)
    - [Instalação](#instalação)
11. [Testando a API](#testando-a-api)
    - [Usando cURL](#usando-curl)
    - [Usando Postman](#usando-postman)
12. [Suporte](#suporte)
13. [Licença](#licença)
14. [Contribuindo](#contribuindo)
15. [Changelog](#changelog)

---

## 🎯 Visão Geral

Esta API REST foi desenvolvida para gerenciar operações completas de um sistema WMS (Warehouse Management System), incluindo:

- ✅ Gestão de empresas e fornecedores
- ✅ Controle de categorias e materiais
- ✅ Gerenciamento de armazéns (storages) com seleção de localização
- ✅ Controle de notas fiscais e seus itens
- ✅ Rastreabilidade completa de inventário por item de nota fiscal
- ✅ **Sistema de tarefas (Tasks) para operações de armazém**
- ✅ **Conferência automatizada com validação de quantidades**
- ✅ **Criação automática de inventário após conferência bem-sucedida**

**Base URL:** `http://localhost:3000`

**Tecnologias:**
- NestJS v11
- PostgreSQL 14+
- Drizzle ORM v0.44.7
- JWT Authentication (Passport.js)
- bcrypt (hash de senhas)
- Docker & Docker Compose

**Versão da API:** 2.0.0

---

## 🆕 Novidades da v2.0.0

### 🎯 Principais Mudanças

#### 1. **Sistema de Storages Aprimorado**
- ✨ Novo endpoint `GET /storages/names/list` para listar apenas nomes de locais
- 🔍 Método `findById()` adicionado ao repositório
- 🔍 Método `findByName()` para buscar storages por nome
- 🔒 **Constraint de unicidade**: Agora os nomes dos storages devem ser únicos no sistema

#### 2. **Workflow de Conferência Melhorado**
- 📍 Suporte a **seleção de localização (storage)** durante a conferência
- ✅ **Criação automática de inventário** após conferência bem-sucedida
- 🔄 Status da tarefa muda automaticamente para `IN_PROGRESS` ao ser atribuída
- 🎯 Parâmetro opcional `storageId` no endpoint de conferência

#### 3. **Sistema de Rastreabilidade Aprimorado**
- 🔗 Inventários agora referenciam **invoice_items** ao invés de materials
- 📦 Rastreamento mais preciso: cada item de nota fiscal tem seu próprio registro
- 🆔 Novos métodos no repositório de Invoice Items:
  - `findByInvoiceUuid()`: Buscar itens por UUID da nota
  - `findByInvoiceAndMaterialWithId()`: Buscar com retorno de IDs numéricos

#### 4. **Migrações de Banco de Dados**
- 📄 Adicionadas migrações `0001` e `0002` para evolução do schema
- 🗄️ Suporte completo ao Drizzle ORM v0.44.7

#### 5. **Arquivo de Testes Completo**
- 📝 Novo arquivo `test-all-routes.http` com 80+ endpoints testados
- ⚡ Organizado por módulos para facilitar testes
- 🔧 Variáveis configuráveis para `baseUrl` e `token`

---

## 🔐 Autenticação

Todos os endpoints (exceto `/auth/login`) requerem autenticação via JWT Bearer Token.

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

**⏱️ Expiração do Token:**
- Padrão: 1 hora
- Após expirado, faça login novamente para obter novo token

---

## 📚 Endpoints

### Auth

#### `POST /auth/login`

Realizar login e obter token JWT.

**Request Body:**
```json
{
  "username": "admin",
  "password": "senha123"
}
```

**Campos obrigatórios:**
- `username` - Nome de usuário
- `password` - Senha

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Responses:**
- `200` - Login realizado com sucesso
- `401` - Credenciais inválidas

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

---

### Users

Gerenciamento de usuários do sistema.

#### `GET /users`

Listar todos os usuários.

**Exemplo:**
```http
GET /users
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "admin",
    "name": "Administrador",
    "createdAt": "2024-11-20T10:00:00.000Z"
  },
  {
    "id": 2,
    "username": "joao.silva",
    "name": "João Silva",
    "createdAt": "2024-11-20T14:30:00.000Z"
  }
]
```

**⚠️ Nota:** A senha não é retornada nas respostas por segurança.

---

#### `GET /users/{username}`

Buscar usuário por username.

**Parameters:**
- `username` (path) - Nome de usuário

**Exemplo:**
```http
GET /users/joao.silva
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "joao.silva",
  "name": "João Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - Usuário encontrado
- `404` - Usuário não encontrado

---

#### `POST /users`

Criar novo usuário.

**Request Body:**
```json
{
  "username": "joao.silva",
  "password": "Senha@123",
  "name": "João Silva"
}
```

**Campos obrigatórios:**
- `username` - Nome de usuário único (mín. 3, máx. 50 caracteres)
- `password` - Senha do usuário (mín. 6, máx. 100 caracteres)

**Campos opcionais:**
- `name` - Nome completo do usuário (máx. 255 caracteres)

**Validações:**
- ✅ Username deve ter pelo menos 3 caracteres
- ✅ Senha deve ter pelo menos 6 caracteres
- ✅ Username deve ser único no sistema
- ✅ Senha será hasheada automaticamente antes de salvar

**Response (201 Created):**
```json
{
  "id": 2,
  "username": "joao.silva",
  "name": "João Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `201` - Usuário criado com sucesso
- `409` - Usuário com este username já existe
- `400` - Dados inválidos (validação falhou)

**Exemplo de erro de validação:**
```json
{
  "statusCode": 400,
  "message": [
    "username should not be empty",
    "username must be longer than or equal to 3 characters",
    "password should not be empty",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

---

#### `PUT /users/{username}`

Atualizar usuário.

**Parameters:**
- `username` (path) - Nome de usuário atual

**Request Body:**
```json
{
  "username": "joao.silva2",
  "name": "João Silva Santos",
  "password": "NovaSenha@456"
}
```

**Campos opcionais:**
- `username` - Novo nome de usuário (mín. 3, máx. 50 caracteres)
- `password` - Nova senha (mín. 6, máx. 100 caracteres)
- `name` - Novo nome completo (máx. 255 caracteres)

**Exemplos de atualização:**

**Atualizar apenas a senha:**
```json
{
  "password": "NovaSenha@789"
}
```

**Atualizar apenas o nome:**
```json
{
  "name": "João Silva Santos"
}
```

**Atualizar username e nome:**
```json
{
  "username": "joao.silva2",
  "name": "João Silva Santos"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "joao.silva2",
  "name": "João Silva Santos",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - Usuário atualizado com sucesso
- `404` - Usuário não encontrado
- `409` - Novo username já existe (se tentar mudar para username em uso)
- `400` - Dados inválidos

---

#### `DELETE /users/{username}`

Deletar usuário.

**Parameters:**
- `username` (path) - Nome de usuário

**Exemplo:**
```http
DELETE /users/joao.silva
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "joao.silva",
  "name": "João Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - Usuário deletado com sucesso
- `404` - Usuário não encontrado

**⚠️ Atenção:** Esta é uma exclusão permanente (hard delete). O usuário não poderá mais fazer login.

---

### Companies

Gerenciamento de empresas do sistema.

#### `GET /companies`

Listar todas as empresas.

**Exemplo:**
```http
GET /companies
Authorization: Bearer {token}
```

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

---

#### `GET /companies/{uuid}`

Buscar empresa por UUID.

**Parameters:**
- `uuid` (path) - UUID da empresa

**Exemplo:**
```http
GET /companies/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

**Responses:**
- `200` - Empresa encontrada
- `404` - Empresa não encontrada

---

#### `GET /companies/cnpj/{cnpj}`

Buscar empresa por CNPJ.

**Parameters:**
- `cnpj` (path) - CNPJ da empresa (14 dígitos)

**Exemplo:**
```http
GET /companies/cnpj/12345678901234
Authorization: Bearer {token}
```

---

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
- `status` - Status da empresa (padrão: `ACTIVE`)

**Status disponíveis:**
- `ACTIVE` - Ativo
- `INACTIVE` - Inativo
- `BLOCKED` - Bloqueado

**Response (201 Created):**
```json
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
```

**Responses:**
- `201` - Empresa criada com sucesso
- `409` - Empresa com este CNPJ já existe

---

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

**Todos os campos são opcionais.** Envie apenas os que deseja atualizar.

**Responses:**
- `200` - Empresa atualizada com sucesso
- `404` - Empresa não encontrada

---

#### `DELETE /companies/{uuid}`

Deletar empresa.

**Parameters:**
- `uuid` (path) - UUID da empresa

**Exemplo:**
```http
DELETE /companies/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

**Responses:**
- `200` - Empresa deletada com sucesso
- `404` - Empresa não encontrada

---

### Suppliers

Gerenciamento de fornecedores. Cada fornecedor está vinculado a uma empresa (Company).

#### `GET /suppliers`

Listar todos os fornecedores.

**Exemplo:**
```http
GET /suppliers
Authorization: Bearer {token}
```

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

---

#### `GET /suppliers/{uuid}`

Buscar fornecedor por UUID.

**Parameters:**
- `uuid` (path) - UUID do fornecedor

---

#### `GET /suppliers/cnpj/{cnpj}`

Buscar fornecedor por CNPJ.

**Parameters:**
- `cnpj` (path) - CNPJ do fornecedor (14 dígitos)

**Exemplo:**
```http
GET /suppliers/cnpj/98765432109876
Authorization: Bearer {token}
```

---

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

**⚠️ Importante - Reutilização de Companies:** 
- Se já existir uma `Company` com esse CNPJ, ela será **reutilizada**
- Caso contrário, uma nova `Company` será criada automaticamente
- Isso permite que a mesma empresa seja fornecedor e cliente

**Response (201 Created):**
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
    "name": "Fornecedor XYZ Ltda",
    "street": "Avenida Principal, 456",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "country": "Brasil",
    "postalCode": "20000000",
    "status": "ACTIVE"
  }
}
```

**Responses:**
- `201` - Fornecedor criado com sucesso
- `409` - Fornecedor com este CNPJ já existe

---

#### `PUT /suppliers/{uuid}`

Atualizar fornecedor.

**Parameters:**
- `uuid` (path) - UUID do fornecedor

**Request Body:**
```json
{
  "name": "Fornecedor XYZ Ltda - Filial",
  "status": "INACTIVE"
}
```

---

#### `DELETE /suppliers/{uuid}`

Deletar fornecedor.

**Parameters:**
- `uuid` (path) - UUID do fornecedor

**Exemplo:**
```http
DELETE /suppliers/650e8400-e29b-41d4-a716-446655440001
Authorization: Bearer {token}
```

**⚠️ Nota:** Ao deletar um fornecedor, apenas o vínculo (`supplierInfo`) é removido. A `Company` permanece no banco, pois pode ter outros vínculos.

**Responses:**
- `200` - Fornecedor deletado com sucesso
- `404` - Fornecedor não encontrado

---

### Material Categories

Gerenciamento de categorias de materiais.

#### `GET /material-categories`

Listar todas as categorias.

**Exemplo:**
```http
GET /material-categories
Authorization: Bearer {token}
```

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

---

#### `GET /material-categories/{uuid}`

Buscar categoria por UUID.

---

#### `GET /material-categories/name/{name}`

Buscar categoria por nome.

**Parameters:**
- `name` (path) - Nome da categoria

**Exemplo:**
```http
GET /material-categories/name/Parafusos%20e%20Fixadores
Authorization: Bearer {token}
```

---

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

**Campos obrigatórios:**
- `name` - Nome da categoria, único (máx. 100 caracteres)
- `materialUnit` - Unidade de medida padrão

**Campos opcionais:**
- `description` - Descrição da categoria (máx. 255 caracteres)

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

**Response (201 Created):**
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

**Responses:**
- `201` - Categoria criada com sucesso
- `409` - Categoria com este nome já existe

---

#### `PUT /material-categories/{uuid}`

Atualizar categoria.

**Parameters:**
- `uuid` (path) - UUID da categoria

**Request Body:**
```json
{
  "description": "Parafusos, porcas, arruelas, buchas e fixadores em geral"
}
```

---

#### `DELETE /material-categories/{uuid}`

Deletar categoria.

---

### Materials

Gerenciamento de materiais.

#### `GET /materials`

Listar todos os materiais.

**Exemplo:**
```http
GET /materials
Authorization: Bearer {token}
```

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

---

#### `GET /materials/{uuid}`

Buscar material por UUID.

---

#### `GET /materials/external-code/{externalCode}`

Buscar material por código externo.

**Parameters:**
- `externalCode` (path) - Código externo do material

**Exemplo:**
```http
GET /materials/external-code/PAR-001
Authorization: Bearer {token}
```

---

#### `GET /materials/category/{categoryId}`

Buscar materiais por categoria.

**Parameters:**
- `categoryId` (path) - ID da categoria

**Exemplo:**
```http
GET /materials/category/1
Authorization: Bearer {token}
```

---

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
- `status` - Status do material (padrão: `ACTIVE`)

**Status do Material:**

| Status | Descrição |
|--------|-----------|
| `ACTIVE` | Material ativo e disponível |
| `INACTIVE` | Material inativo temporariamente |
| `DISCONTINUED` | Material descontinuado |
| `DEVELOPMENT` | Material em desenvolvimento |

**Response (201 Created):**
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

**Responses:**
- `201` - Material criado com sucesso
- `409` - Material com este código externo já existe

---

#### `PUT /materials/{uuid}`

Atualizar material.

**Parameters:**
- `uuid` (path) - UUID do material

**Request Body:**
```json
{
  "description": "Parafuso Allen M6 x 20mm - Aço Inox 304",
  "status": "DISCONTINUED"
}
```

---

#### `DELETE /materials/{uuid}`

Deletar material.

---

### Storages

Gerenciamento de locais de armazenamento (armazéns, prateleiras, setores, etc.).

#### `GET /storages`

Listar todos os storages.

**Exemplo:**
```http
GET /storages
Authorization: Bearer {token}
```

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

---

#### `GET /storages/{uuid}`

Buscar storage por UUID.

---

#### `GET /storages/code/{code}`

Buscar storage por código.

**Parameters:**
- `code` (path) - Código do storage

**Exemplo:**
```http
GET /storages/code/A01-01
Authorization: Bearer {token}
```

---

#### `GET /storages/company/{companyId}`

Buscar storages por empresa.

**Parameters:**
- `companyId` (path) - ID da empresa

**Exemplo:**
```http
GET /storages/company/1
Authorization: Bearer {token}
```

---

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

**Response (201 Created):**
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

**Responses:**
- `201` - Storage criado com sucesso
- `409` - Storage com este código já existe

---

#### `PUT /storages/{uuid}`

Atualizar storage.

---

#### `DELETE /storages/{uuid}`

Deletar storage.

---

### Invoices

Gerenciamento de notas fiscais de recebimento.

#### `GET /invoices`

Listar todas as notas fiscais.

**Exemplo:**
```http
GET /invoices
Authorization: Bearer {token}
```

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

---

#### `GET /invoices/{uuid}`

Buscar nota fiscal por UUID.

---

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

**Response (201 Created):**
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

**Responses:**
- `201` - Invoice criada com sucesso
- `409` - Invoice com este número já existe

---

#### `PUT /invoices/{uuid}`

Atualizar nota fiscal.

**Parameters:**
- `uuid` (path) - UUID da invoice

**Request Body:**
```json
{
  "status": "RECEIVED"
}
```

---

#### `DELETE /invoices/{uuid}`

Deletar nota fiscal.

---

### Invoice Items

Gerenciamento de itens de notas fiscais. Cada item representa um material recebido em uma nota fiscal.

#### `GET /invoice-items`

Listar todos os itens.

**Query Parameters:**
- `invoiceId` (opcional) - Filtrar por ID da invoice
- `materialId` (opcional) - Filtrar por ID do material

**Exemplo:**
```http
GET /invoice-items
Authorization: Bearer {token}

# Com filtros
GET /invoice-items?invoiceId=1
GET /invoice-items?materialId=4
GET /invoice-items?invoiceId=1&materialId=4
```

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

---

#### `GET /invoice-items/{uuid}`

Buscar item por UUID.

---

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
- `remark` - Observações sobre o item (máx. 255 caracteres)

**⚠️ Campo Calculado:** 
O campo `unitValue` é **calculado automaticamente** pelo banco de dados:
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

**Response (201 Created):**
```json
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
```

**Responses:**
- `201` - Item criado com sucesso
- `400` - Dados inválidos (foreign key, valores, etc.)

---

#### `PUT /invoice-items/{uuid}`

Atualizar item de nota fiscal.

**Parameters:**
- `uuid` (path) - UUID do invoice item

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
  "quantity": "95",
  "status": "DIVERGENT",
  "remark": "Nota indica 100 unidades, recebido 95"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "uuid": "b50e8400-e29b-41d4-a716-446655440006",
  "invoiceId": 1,
  "materialId": 4,
  "quantity": "95.000",
  "totalValue": "1500.00",
  "unitValue": "15.789474",
  "status": "DIVERGENT",
  "remark": "Nota indica 100 unidades, recebido 95",
  "createdAt": "2024-11-20T13:00:00.000Z"
}
```

---

#### `DELETE /invoice-items/{uuid}`

Deletar item de nota fiscal.

---

### Inventories

Gerenciamento de inventário. Cada registro de inventário representa um item de nota fiscal armazenado em um local específico, garantindo **rastreabilidade completa**.

#### `GET /inventories`

Listar todo o inventário.

**Exemplo:**
```http
GET /inventories
Authorization: Bearer {token}
```

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

---

#### `GET /inventories/{uuid}`

Buscar inventário por UUID.

---

#### `GET /inventories/invoice-item/{invoiceItemId}`

Buscar inventário por invoice item.

**Parameters:**
- `invoiceItemId` (path) - ID do invoice item

**Exemplo:**
```http
GET /inventories/invoice-item/2
Authorization: Bearer {token}
```

Retorna todos os locais onde o item de nota fiscal específico está armazenado.

---

#### `GET /inventories/storage/{storageId}`

Buscar inventário por storage.

**Parameters:**
- `storageId` (path) - ID do storage

**Exemplo:**
```http
GET /inventories/storage/1
Authorization: Bearer {token}
```

Retorna todos os itens armazenados em um local específico.

---

#### `GET /inventories/search?invoiceItemId={id}&storageId={id}`

Buscar inventário específico (invoice item + storage).

**Query Parameters:**
- `invoiceItemId` - ID do invoice item
- `storageId` - ID do storage

**Exemplo:**
```http
GET /inventories/search?invoiceItemId=2&storageId=1
Authorization: Bearer {token}
```

---

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

**Response (201 Created):**
```json
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
```

**Responses:**
- `201` - Inventário criado com sucesso
- `409` - Inventário para este invoice item e storage já existe
- `400` - Invoice item ou storage não existe

---

#### `PUT /inventories/{uuid}`

Atualizar registro de inventário.

**Parameters:**
- `uuid` (path) - UUID do inventário

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

---

#### `DELETE /inventories/{uuid}`

Deletar registro de inventário.

---

### Tasks

Gerenciamento de tarefas do armazém. As tarefas representam operações que precisam ser realizadas, como conferência, armazenamento, separação, etc.

#### Tipos de Tarefas

| Tipo | Descrição | Uso Principal |
|------|-----------|---------------|
| `CONFERENCE` | Conferência de recebimento | Validar quantidade recebida vs nota fiscal |
| `STORAGE` | Armazenamento de materiais | Alocar material em local físico |
| `PICKING` | Separação de materiais | Separar materiais para expedição/uso |
| `PACKAGING` | Embalagem de materiais | Embalar materiais |
| `SHIPPING` | Expedição | Despachar materiais |
| `INVENTORY` | Inventário/Contagem | Contagem física de estoque |
| `DEMOBILIZATION` | Desmobilização | Desmobilizar equipamentos/materiais |

#### Status de Tarefas

| Status | Descrição |
|--------|-----------|
| `PENDING` | Pendente (padrão) |
| `IN_PROGRESS` | Em andamento |
| `COMPLETED` | Concluída |
| `CANCELLED` | Cancelada |

**Fluxo de Status:**
```
PENDING → IN_PROGRESS → COMPLETED
   ↓
CANCELLED
```

---

#### `GET /tasks`

Listar todas as tarefas com filtros opcionais.

**Query Parameters:**
- `status` (opcional) - Filtrar por status: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `taskType` (opcional) - Filtrar por tipo: `PICKING`, `STORAGE`, `CONFERENCE`, etc.
- `assignedUserUuid` (opcional) - Filtrar por usuário atribuído (UUID)

**Exemplos:**

```http
# Todas as tarefas
GET /tasks
Authorization: Bearer {token}

# Tarefas pendentes
GET /tasks?status=PENDING
Authorization: Bearer {token}

# Tarefas de conferência
GET /tasks?taskType=CONFERENCE
Authorization: Bearer {token}

# Tarefas do usuário 2
GET /tasks?assignedUserUuid=2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}

# Tarefas de conferência pendentes do usuário 2
GET /tasks?status=PENDING&taskType=CONFERENCE&assignedUserUuid=2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "uuid": "13d74eb4-99e8-4707-94c5-ddb4adb56f80",
    "title": "Conferência - Nota 1234567",
    "description": "Caixa com equipamento de PI",
    "status": "PENDING",
    "dueDate": null,
    "createdAt": "2025-11-20T23:22:18.772Z",
    "taskType": "CONFERENCE",
    "invoiceId": 1,
    "materialId": 4,
    "itemSpecification": "Bota CAT-23456",
    "assignedUserId": null,
    "issuedBy": "Fulano Ciclano da Silva",
    "entryDate": null,
    "completedAt": null,
    "expectedQuantity": null,
    "countedQuantity": null,
    "countAttempts": 0,
    "lastCountAt": null
  }
]
```

---

#### `GET /tasks/my-tasks`

Listar tarefas do usuário autenticado (usa o `userId` do token JWT).

**Query Parameters:**
- `status` (opcional) - Filtrar por status
- `taskType` (opcional) - Filtrar por tipo

**Exemplos:**

```http
# Minhas tarefas
GET /tasks/my-tasks
Authorization: Bearer {token}

# Minhas tarefas pendentes
GET /tasks/my-tasks?status=PENDING
Authorization: Bearer {token}

# Minhas tarefas de conferência em andamento
GET /tasks/my-tasks?status=IN_PROGRESS&taskType=CONFERENCE
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "uuid": "e8d71a24-6c83-4e69-a787-bd4de3529d94",
    "title": "Conferência - Nota 1234568",
    "description": "Lote de luvas de proteção",
    "status": "IN_PROGRESS",
    "taskType": "CONFERENCE",
    "assignedUserId": 2,
    "issuedBy": "Maria Santos",
    "createdAt": "2025-11-20T23:22:18.974Z"
  }
]
```

---

#### `GET /tasks/open`

Listar tarefas abertas (status `PENDING` ou `IN_PROGRESS`).

**Query Parameters:**
- `taskType` (opcional) - Filtrar por tipo
- `assignedUserUuid` (opcional) - Filtrar por usuário (UUID)

**Exemplos:**

```http
# Todas as tarefas abertas
GET /tasks/open
Authorization: Bearer {token}

# Tarefas de conferência abertas
GET /tasks/open?taskType=CONFERENCE
Authorization: Bearer {token}

# Tarefas abertas do usuário 2
GET /tasks/open?assignedUserUuid=2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}
```

---

#### `GET /tasks/closed`

Listar tarefas fechadas (status `COMPLETED` ou `CANCELLED`).

**Query Parameters:**
- `taskType` (opcional) - Filtrar por tipo
- `assignedUserUuid` (opcional) - Filtrar por usuário (UUID)

**Exemplos:**

```http
# Todas as tarefas fechadas
GET /tasks/closed
Authorization: Bearer {token}

# Tarefas de armazenamento concluídas
GET /tasks/closed?taskType=STORAGE
Authorization: Bearer {token}
```

---

#### `GET /tasks/user/{userUuid}`

Listar tarefas de um usuário específico.

**Parameters:**
- `userUuid` (path) - UUID do usuário

**Query Parameters:**
- `status` (opcional) - Filtrar por status
- `taskType` (opcional) - Filtrar por tipo

**Exemplos:**

```http
# Todas as tarefas do usuário 1
GET /tasks/user/2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}

# Tarefas concluídas do usuário 1
GET /tasks/user/2103e8df-f89d-47be-9be1-3a3db0172c35?status=COMPLETED
Authorization: Bearer {token}

# Tarefas de picking em andamento do usuário 1
GET /tasks/user/2103e8df-f89d-47be-9be1-3a3db0172c35?status=IN_PROGRESS&taskType=PICKING
Authorization: Bearer {token}
```

---

#### `GET /tasks/invoice/{invoiceUuid}`

Buscar tarefas relacionadas a uma nota fiscal.

**Parameters:**
- `invoiceUuid` (path) - UUID da nota fiscal

**Exemplo:**

```http
GET /tasks/invoice/1
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "uuid": "13d74eb4-99e8-4707-94c5-ddb4adb56f80",
    "title": "Conferência - Nota 1234567",
    "taskType": "CONFERENCE",
    "invoiceId": 1,
    "materialId": 4,
    "status": "PENDING"
  },
  {
    "uuid": "20405b02-f980-4652-8b70-5e04d38a31fe",
    "title": "Armazenamento - Nota 1234567",
    "taskType": "STORAGE",
    "invoiceId": 1,
    "materialId": 4,
    "status": "PENDING"
  }
]
```

---

#### `GET /tasks/{uuid}`

Buscar tarefa por UUID.

**Parameters:**
- `uuid` (path) - UUID da tarefa

**Exemplo:**

```http
GET /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "uuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "title": "Conferência - Nota NF-15",
  "description": "Conferir quantidade de Luvas de Segurança",
  "status": "PENDING",
  "dueDate": "2025-12-23T23:59:59.000Z",
  "createdAt": "2025-11-23T20:47:34.142Z",
  "taskType": "CONFERENCE",
  "invoiceId": 4,
  "materialId": 12,
  "itemSpecification": null,
  "assignedUserId": null,
  "issuedBy": null,
  "entryDate": null,
  "completedAt": null,
  "expectedQuantity": null,
  "countedQuantity": null,
  "countAttempts": 0,
  "lastCountAt": null
}
```

**Responses:**
- `200` - Tarefa encontrada
- `404` - Tarefa não encontrada

---

#### `POST /tasks`

Criar nova tarefa.

**Request Body:**
```json
{
  "title": "Conferência - Nota NF-001234",
  "description": "Conferir quantidade de material recebido",
  "taskType": "CONFERENCE",
  "status": "PENDING",
  "invoiceId": 1,
  "materialId": 4,
  "itemSpecification": "Luva PVC Tamanho G",
  "issuedBy": "João Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-25T23:59:59.000Z"
}
```

**Campos obrigatórios:**
- `title` - Título da tarefa (máx. 255 caracteres)
- `taskType` - Tipo da tarefa: `PICKING`, `STORAGE`, `CONFERENCE`, `PACKAGING`, `SHIPPING`, `INVENTORY`, `DEMOBILIZATION`

**Campos opcionais:**
- `description` - Descrição detalhada (máx. 1024 caracteres)
- `status` - Status inicial (padrão: `PENDING`)
- `dueDate` - Data/hora limite para conclusão (formato ISO 8601)
- `invoiceId` - ID da nota fiscal relacionada
- `materialId` - ID do material relacionado
- `itemSpecification` - Especificação do item (máx. 255 caracteres)
- `assignedUserId` - ID do usuário atribuído
- `issuedBy` - Nome de quem emitiu a tarefa (máx. 255 caracteres)
- `entryDate` - Data de entrada/criação da tarefa (formato ISO 8601)

**Response (201 Created):**
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Conferência - Nota NF-001234",
  "description": "Conferir quantidade de material recebido",
  "status": "PENDING",
  "taskType": "CONFERENCE",
  "invoiceId": 1,
  "materialId": 4,
  "createdAt": "2025-11-24T10:30:00.000Z"
}
```

**Exemplos de criação por tipo:**

**Tarefa de Conferência:**
```json
{
  "title": "Conferência - NF-12345",
  "description": "Conferir lote de parafusos",
  "taskType": "CONFERENCE",
  "invoiceId": 1,
  "materialId": 4,
  "issuedBy": "Maria Santos",
  "dueDate": "2025-11-30T17:00:00.000Z"
}
```

**Tarefa de Armazenamento:**
```json
{
  "title": "Armazenar - Lote A-001",
  "description": "Armazenar parafusos no setor A",
  "taskType": "STORAGE",
  "invoiceId": 1,
  "materialId": 4,
  "itemSpecification": "Armazenar na prateleira A01-01",
  "assignedUserId": 2
}
```

**Tarefa de Separação:**
```json
{
  "title": "Separar - Pedido #789",
  "description": "Separar materiais para obra X",
  "taskType": "PICKING",
  "assignedUserId": 3,
  "dueDate": "2025-11-25T12:00:00.000Z"
}
```

**Responses:**
- `201` - Tarefa criada com sucesso
- `400` - Dados inválidos

---

#### `PUT /tasks/{uuid}`

Atualizar tarefa.

**Parameters:**
- `uuid` (path) - UUID da tarefa

**Request Body:**
```json
{
  "title": "Conferência - NF-001234 - Urgente",
  "status": "IN_PROGRESS",
  "assignedUserId": 2,
  "issuedBy": "João Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z"
}
```

**Todos os campos são opcionais.** Envie apenas os campos que deseja atualizar.

**Exemplos:**

**Atualizar apenas o status:**
```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Atribuir a um usuário:**
```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667
Authorization: Bearer {token}
Content-Type: application/json

{
  "assignedUserId": 2
}
```

**Atualizar datas:**
```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667
Authorization: Bearer {token}
Content-Type: application/json

{
  "issuedBy": "João Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z"
}
```

**Response (200 OK):**
```json
{
  "uuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "title": "Conferência - NF-001234 - Urgente",
  "status": "IN_PROGRESS",
  "assignedUserId": 2,
  "issuedBy": "João Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z",
  "updatedAt": "2025-11-24T11:00:00.000Z"
}
```

**Responses:**
- `200` - Tarefa atualizada com sucesso
- `404` - Tarefa não encontrada

---

#### `PUT /tasks/{uuid}/status`

Atualizar apenas o status da tarefa.

**Parameters:**
- `uuid` (path) - UUID da tarefa

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Status válidos:**
- `PENDING` - Pendente
- `IN_PROGRESS` - Em andamento
- `COMPLETED` - Concluída (atualiza `completedAt` automaticamente)
- `CANCELLED` - Cancelada

**Exemplo:**

```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

**Response (200 OK):**
```json
{
  "uuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "title": "Conferência - NF-001234",
  "status": "COMPLETED",
  "completedAt": "2025-11-24T11:30:00.000Z"
}
```

**⚠️ Comportamento especial:**
- Quando status = `COMPLETED`, o campo `completedAt` é preenchido automaticamente com a data/hora atual
- Quando status muda para outro valor, `completedAt` permanece inalterado

---

#### `PUT /tasks/{uuid}/assign`

Atribuir tarefa a um usuário.

**Parameters:**
- `uuid` (path) - UUID da tarefa

**Request Body:**
```json
{
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35"
}
```

**Exemplo:**

```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35"
}
```

**Response (200 OK):**
```json
{
  "uuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "title": "Conferência - NF-001234",
  "assignedUserId": 2,
  "status": "PENDING"
}
```

**Responses:**
- `200` - Tarefa atribuída com sucesso
- `404` - Tarefa não encontrada
- `400` - Usuário não existe

---

#### `POST /tasks/conference`

Realizar conferência de material (tarefa de conferência).

**⚠️ Importante:** 
- A tarefa deve ter `invoiceId` e `materialId` preenchidos
- Deve existir um `invoice_item` correspondente
- A quantidade esperada vem da nota fiscal (`invoice_item.quantity`)
- Se `storageId` for fornecido e a conferência for conforme, o inventário é criado automaticamente

**Request Body:**
```json
{
  "taskUuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "quantityFound": 145,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35",
  "storageId": 1
}
```

**Campos obrigatórios:**
- `taskUuid` - UUID da tarefa de conferência
- `quantityFound` - Quantidade encontrada durante a conferência
- `userUuid` - UUID do usuário que está realizando a conferência

**Campos opcionais:**
- `storageId` - ID do local de armazenamento (se fornecido e conferência conforme, cria inventário automaticamente)

**Exemplo - Conferência com quantidade conforme e armazenamento:**

```http
POST /tasks/conference
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskUuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "quantityFound": 150,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35",
  "storageId": 1
}
```

**Response (200 OK - Conforme com armazenamento):**
```json
{
  "success": true,
  "message": "Conferência realizada com sucesso. Quantidade está conforme a nota fiscal. Inventário criado/atualizado.",
  "quantityFound": 150,
  "expectedQuantity": 150,
  "requiresReview": false
}
```

**Exemplo - Conferência com divergência:**

```http
POST /tasks/conference
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskUuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "quantityFound": 145,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35",
  "storageId": 1
}
```

**Response (200 OK - Divergente):**
```json
{
  "success": false,
  "message": "DIVERGÊNCIA DETECTADA: Esperado 150, mas foram encontrados 145.",
  "quantityFound": 145,
  "expectedQuantity": 150,
  "requiresReview": true
}
```

**O que acontece ao conferir:**

1. ✅ Task é atualizada:
   - `status` → `COMPLETED`
   - `completedAt` → data/hora atual
   - `countedQuantity` → quantidade encontrada
   - `assignedUserId` → usuário que conferiu

2. ✅ Invoice Item é atualizado:
   - `status` → `CONFORMING` (se quantidade correta) ou `DIVERGENT` (se diferente)
   - `remark` → descrição da conformidade ou divergência

**Cenários de conferência:**

| Esperado | Encontrado | Status | Mensagem |
|----------|------------|--------|----------|
| <!-- filepath: c:\Users\diego\Repo\MALLDRE WMS\5sem\WMS-API\Readme.md -->
# 📦 Documentação da API - Sistema WMS (Warehouse Management System)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Users](#users)
   - [Companies](#companies)
   - [Suppliers](#suppliers)
   - [Material Categories](#material-categories)
   - [Materials](#materials)
   - [Storages](#storages)
   - [Invoices](#invoices)
   - [Invoice Items](#invoice-items)
   - [Inventories](#inventories)
   - [Tasks](#tasks)
4. [Fluxos Completos](#fluxos-completos)
   - [Fluxo de Recebimento de Material](#fluxo-de-recebimento-de-material)
   - [Fluxo de Conferência com Tasks](#fluxo-de-conferência-com-tasks)
5. [Códigos de Status HTTP](#códigos-de-status-http)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Modelo de Dados](#modelo-de-dados)
9. [Começando](#começando)
10. [Observações Importantes](#observações-importantes)
11. [Testando a API](#testando-a-api)
12. [Suporte](#suporte)
13. [Changelog](#changelog)

---

## 🎯 Visão Geral

Esta API REST foi desenvolvida para gerenciar operações completas de um sistema WMS (Warehouse Management System), incluindo:

- ✅ Gestão de empresas e fornecedores
- ✅ Controle de categorias e materiais
- ✅ Gerenciamento de armazéns (storages)
- ✅ Controle de notas fiscais e seus itens
- ✅ Rastreabilidade completa de inventário
- ✅ **Sistema de tarefas (Tasks) para operações de armazém**
- ✅ **Conferência automatizada com validação de quantidades**

**Base URL:** `http://localhost:3000`

**Tecnologias:**
- NestJS v10
- PostgreSQL 14+
- Drizzle ORM
- JWT Authentication
- bcrypt (hash de senhas)

**Versão da API:** 1.1.0

---

## 🔐 Autenticação

Todos os endpoints (exceto `/auth/login`) requerem autenticação via JWT Bearer Token.

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

**⏱️ Expiração do Token:**
- Padrão: 1 hora
- Após expirado, faça login novamente para obter novo token

---

## 📚 Endpoints

### Auth

#### `POST /auth/login`

Realizar login e obter token JWT.

**Request Body:**
```json
{
  "username": "admin",
  "password": "senha123"
}
```

**Campos obrigatórios:**
- `username` - Nome de usuário
- `password` - Senha

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Responses:**
- `200` - Login realizado com sucesso
- `401` - Credenciais inválidas

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

---

### Users

Gerenciamento de usuários do sistema.

#### `GET /users`

Listar todos os usuários.

**Exemplo:**
```http
GET /users
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "admin",
    "name": "Administrador",
    "createdAt": "2024-11-20T10:00:00.000Z"
  },
  {
    "id": 2,
    "username": "joao.silva",
    "name": "João Silva",
    "createdAt": "2024-11-20T14:30:00.000Z"
  }
]
```

**⚠️ Nota:** A senha não é retornada nas respostas por segurança.

---

#### `GET /users/{username}`

Buscar usuário por username.

**Parameters:**
- `username` (path) - Nome de usuário

**Exemplo:**
```http
GET /users/joao.silva
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "joao.silva",
  "name": "João Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - Usuário encontrado
- `404` - Usuário não encontrado

---

#### `POST /users`

Criar novo usuário.

**Request Body:**
```json
{
  "username": "joao.silva",
  "password": "Senha@123",
  "name": "João Silva"
}
```

**Campos obrigatórios:**
- `username` - Nome de usuário único (mín. 3, máx. 50 caracteres)
- `password` - Senha do usuário (mín. 6, máx. 100 caracteres)

**Campos opcionais:**
- `name` - Nome completo do usuário (máx. 255 caracteres)

**Validações:**
- ✅ Username deve ter pelo menos 3 caracteres
- ✅ Senha deve ter pelo menos 6 caracteres
- ✅ Username deve ser único no sistema
- ✅ Senha será hasheada automaticamente antes de salvar

**Response (201 Created):**
```json
{
  "id": 2,
  "username": "joao.silva",
  "name": "João Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `201` - Usuário criado com sucesso
- `409` - Usuário com este username já existe
- `400` - Dados inválidos (validação falhou)

**Exemplo de erro de validação:**
```json
{
  "statusCode": 400,
  "message": [
    "username should not be empty",
    "username must be longer than or equal to 3 characters",
    "password should not be empty",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

---

#### `PUT /users/{username}`

Atualizar usuário.

**Parameters:**
- `username` (path) - Nome de usuário atual

**Request Body:**
```json
{
  "username": "joao.silva2",
  "name": "João Silva Santos",
  "password": "NovaSenha@456"
}
```

**Campos opcionais:**
- `username` - Novo nome de usuário (mín. 3, máx. 50 caracteres)
- `password` - Nova senha (mín. 6, máx. 100 caracteres)
- `name` - Novo nome completo (máx. 255 caracteres)

**Exemplos de atualização:**

**Atualizar apenas a senha:**
```json
{
  "password": "NovaSenha@789"
}
```

**Atualizar apenas o nome:**
```json
{
  "name": "João Silva Santos"
}
```

**Atualizar username e nome:**
```json
{
  "username": "joao.silva2",
  "name": "João Silva Santos"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "joao.silva2",
  "name": "João Silva Santos",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - Usuário atualizado com sucesso
- `404` - Usuário não encontrado
- `409` - Novo username já existe (se tentar mudar para username em uso)
- `400` - Dados inválidos

---

#### `DELETE /users/{username}`

Deletar usuário.

**Parameters:**
- `username` (path) - Nome de usuário

**Exemplo:**
```http
DELETE /users/joao.silva
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "joao.silva",
  "name": "João Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - Usuário deletado com sucesso
- `404` - Usuário não encontrado

**⚠️ Atenção:** Esta é uma exclusão permanente (hard delete). O usuário não poderá mais fazer login.

---

### Companies

Gerenciamento de empresas do sistema.

#### `GET /companies`

Listar todas as empresas.

**Exemplo:**
```http
GET /companies
Authorization: Bearer {token}
```

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

---

#### `GET /companies/{uuid}`

Buscar empresa por UUID.

**Parameters:**
- `uuid` (path) - UUID da empresa

**Exemplo:**
```http
GET /companies/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

**Responses:**
- `200` - Empresa encontrada
- `404` - Empresa não encontrada

---

#### `GET /companies/cnpj/{cnpj}`

Buscar empresa por CNPJ.

**Parameters:**
- `cnpj` (path) - CNPJ da empresa (14 dígitos)

**Exemplo:**
```http
GET /companies/cnpj/12345678901234
Authorization: Bearer {token}
```

---

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
- `status` - Status da empresa (padrão: `ACTIVE`)

**Status disponíveis:**
- `ACTIVE` - Ativo
- `INACTIVE` - Inativo
- `BLOCKED` - Bloqueado

**Response (201 Created):**
```json
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
```

**Responses:**
- `201` - Empresa criada com sucesso
- `409` - Empresa com este CNPJ já existe

---

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

**Todos os campos são opcionais.** Envie apenas os que deseja atualizar.

**Responses:**
- `200` - Empresa atualizada com sucesso
- `404` - Empresa não encontrada

---

#### `DELETE /companies/{uuid}`

Deletar empresa.

**Parameters:**
- `uuid` (path) - UUID da empresa

**Exemplo:**
```http
DELETE /companies/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

**Responses:**
- `200` - Empresa deletada com sucesso
- `404` - Empresa não encontrada

---

### Suppliers

Gerenciamento de fornecedores. Cada fornecedor está vinculado a uma empresa (Company).

#### `GET /suppliers`

Listar todos os fornecedores.

**Exemplo:**
```http
GET /suppliers
Authorization: Bearer {token}
```

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

---

#### `GET /suppliers/{uuid}`

Buscar fornecedor por UUID.

**Parameters:**
- `uuid` (path) - UUID do fornecedor

---

#### `GET /suppliers/cnpj/{cnpj}`

Buscar fornecedor por CNPJ.

**Parameters:**
- `cnpj` (path) - CNPJ do fornecedor (14 dígitos)

**Exemplo:**
```http
GET /suppliers/cnpj/98765432109876
Authorization: Bearer {token}
```

---

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

**⚠️ Importante - Reutilização de Companies:** 
- Se já existir uma `Company` com esse CNPJ, ela será **reutilizada**
- Caso contrário, uma nova `Company` será criada automaticamente
- Isso permite que a mesma empresa seja fornecedor e cliente

**Response (201 Created):**
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
    "name": "Fornecedor XYZ Ltda",
    "street": "Avenida Principal, 456",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "country": "Brasil",
    "postalCode": "20000000",
    "status": "ACTIVE"
  }
}
```

**Responses:**
- `201` - Fornecedor criado com sucesso
- `409` - Fornecedor com este CNPJ já existe

---

#### `PUT /suppliers/{uuid}`

Atualizar fornecedor.

**Parameters:**
- `uuid` (path) - UUID do fornecedor

**Request Body:**
```json
{
  "name": "Fornecedor XYZ Ltda - Filial",
  "status": "INACTIVE"
}
```

---

#### `DELETE /suppliers/{uuid}`

Deletar fornecedor.

**Parameters:**
- `uuid` (path) - UUID do fornecedor

**Exemplo:**
```http
DELETE /suppliers/650e8400-e29b-41d4-a716-446655440001
Authorization: Bearer {token}
```

**⚠️ Nota:** Ao deletar um fornecedor, apenas o vínculo (`supplierInfo`) é removido. A `Company` permanece no banco, pois pode ter outros vínculos.

**Responses:**
- `200` - Fornecedor deletado com sucesso
- `404` - Fornecedor não encontrado

---

### Material Categories

Gerenciamento de categorias de materiais.

#### `GET /material-categories`

Listar todas as categorias.

**Exemplo:**
```http
GET /material-categories
Authorization: Bearer {token}
```

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

---

#### `GET /material-categories/{uuid}`

Buscar categoria por UUID.

---

#### `GET /material-categories/name/{name}`

Buscar categoria por nome.

**Parameters:**
- `name` (path) - Nome da categoria

**Exemplo:**
```http
GET /material-categories/name/Parafusos%20e%20Fixadores
Authorization: Bearer {token}
```

---

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

**Campos obrigatórios:**
- `name` - Nome da categoria, único (máx. 100 caracteres)
- `materialUnit` - Unidade de medida padrão

**Campos opcionais:**
- `description` - Descrição da categoria (máx. 255 caracteres)

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

**Response (201 Created):**
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

**Responses:**
- `201` - Categoria criada com sucesso
- `409` - Categoria com este nome já existe

---

#### `PUT /material-categories/{uuid}`

Atualizar categoria.

**Parameters:**
- `uuid` (path) - UUID da categoria

**Request Body:**
```json
{
  "description": "Parafusos, porcas, arruelas, buchas e fixadores em geral"
}
```

---

#### `DELETE /material-categories/{uuid}`

Deletar categoria.

---

### Materials

Gerenciamento de materiais.

#### `GET /materials`

Listar todos os materiais.

**Exemplo:**
```http
GET /materials
Authorization: Bearer {token}
```

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

---

#### `GET /materials/{uuid}`

Buscar material por UUID.

---

#### `GET /materials/external-code/{externalCode}`

Buscar material por código externo.

**Parameters:**
- `externalCode` (path) - Código externo do material

**Exemplo:**
```http
GET /materials/external-code/PAR-001
Authorization: Bearer {token}
```

---

#### `GET /materials/category/{categoryId}`

Buscar materiais por categoria.

**Parameters:**
- `categoryId` (path) - ID da categoria

**Exemplo:**
```http
GET /materials/category/1
Authorization: Bearer {token}
```

---

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
- `status` - Status do material (padrão: `ACTIVE`)

**Status do Material:**

| Status | Descrição |
|--------|-----------|
| `ACTIVE` | Material ativo e disponível |
| `INACTIVE` | Material inativo temporariamente |
| `DISCONTINUED` | Material descontinuado |
| `DEVELOPMENT` | Material em desenvolvimento |

**Response (201 Created):**
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

**Responses:**
- `201` - Material criado com sucesso
- `409` - Material com este código externo já existe

---

#### `PUT /materials/{uuid}`

Atualizar material.

**Parameters:**
- `uuid` (path) - UUID do material

**Request Body:**
```json
{
  "description": "Parafuso Allen M6 x 20mm - Aço Inox 304",
  "status": "DISCONTINUED"
}
```

---

#### `DELETE /materials/{uuid}`

Deletar material.

---

### Storages

Gerenciamento de locais de armazenamento (armazéns, prateleiras, setores, etc.).

#### `GET /storages`

Listar todos os storages.

**Exemplo:**
```http
GET /storages
Authorization: Bearer {token}
```

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

---

#### `GET /storages/{uuid}`

Buscar storage por UUID.

---

#### `GET /storages/code/{code}`

Buscar storage por código.

**Parameters:**
- `code` (path) - Código do storage

**Exemplo:**
```http
GET /storages/code/A01-01
Authorization: Bearer {token}
```

---

#### `GET /storages/company/{companyId}`

Buscar storages por empresa.

**Parameters:**
- `companyId` (path) - ID da empresa

**Exemplo:**
```http
GET /storages/company/1
Authorization: Bearer {token}
```

---

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

**Response (201 Created):**
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

**Responses:**
- `201` - Storage criado com sucesso
- `409` - Storage com este código já existe

---

#### `PUT /storages/{uuid}`

Atualizar storage.

---

#### `DELETE /storages/{uuid}`

Deletar storage.

---

### Invoices

Gerenciamento de notas fiscais de recebimento.

#### `GET /invoices`

Listar todas as notas fiscais.

**Exemplo:**
```http
GET /invoices
Authorization: Bearer {token}
```

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

---

#### `GET /invoices/{uuid}`

Buscar nota fiscal por UUID.

---

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

**Response (201 Created):**
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

**Responses:**
- `201` - Invoice criada com sucesso
- `409` - Invoice com este número já existe

---

#### `PUT /invoices/{uuid}`

Atualizar nota fiscal.

**Parameters:**
- `uuid` (path) - UUID da invoice

**Request Body:**
```json
{
  "status": "RECEIVED"
}
```

---

#### `DELETE /invoices/{uuid}`

Deletar nota fiscal.

---

### Invoice Items

Gerenciamento de itens de notas fiscais. Cada item representa um material recebido em uma nota fiscal.

#### `GET /invoice-items`

Listar todos os itens.

**Query Parameters:**
- `invoiceId` (opcional) - Filtrar por ID da invoice
- `materialId` (opcional) - Filtrar por ID do material

**Exemplo:**
```http
GET /invoice-items
Authorization: Bearer {token}

# Com filtros
GET /invoice-items?invoiceId=1
GET /invoice-items?materialId=4
GET /invoice-items?invoiceId=1&materialId=4
```

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

---

#### `GET /invoice-items/{uuid}`

Buscar item por UUID.

---

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
- `remark` - Observações sobre o item (máx. 255 caracteres)

**⚠️ Campo Calculado:** 
O campo `unitValue` é **calculado automaticamente** pelo banco de dados:
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

**Response (201 Created):**
```json
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
```

**Responses:**
- `201` - Item criado com sucesso
- `400` - Dados inválidos (foreign key, valores, etc.)

---

#### `PUT /invoice-items/{uuid}`

Atualizar item de nota fiscal.

**Parameters:**
- `uuid` (path) - UUID do invoice item

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
  "quantity": "95",
  "status": "DIVERGENT",
  "remark": "Nota indica 100 unidades, recebido 95"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "uuid": "b50e8400-e29b-41d4-a716-446655440006",
  "invoiceId": 1,
  "materialId": 4,
  "quantity": "95.000",
  "totalValue": "1500.00",
  "unitValue": "15.789474",
  "status": "DIVERGENT",
  "remark": "Nota indica 100 unidades, recebido 95",
  "createdAt": "2024-11-20T13:00:00.000Z"
}
```

---

#### `DELETE /invoice-items/{uuid}`

Deletar item de nota fiscal.

---

### Inventories

Gerenciamento de inventário. Cada registro de inventário representa um item de nota fiscal armazenado em um local específico, garantindo **rastreabilidade completa**.

#### `GET /inventories`

Listar todo o inventário.

**Exemplo:**
```http
GET /inventories
Authorization: Bearer {token}
```

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

---

#### `GET /inventories/{uuid}`

Buscar inventário por UUID.

---

#### `GET /inventories/invoice-item/{invoiceItemId}`

Buscar inventário por invoice item.

**Parameters:**
- `invoiceItemId` (path) - ID do invoice item

**Exemplo:**
```http
GET /inventories/invoice-item/2
Authorization: Bearer {token}
```

Retorna todos os locais onde o item de nota fiscal específico está armazenado.

---

#### `GET /inventories/storage/{storageId}`

Buscar inventário por storage.

**Parameters:**
- `storageId` (path) - ID do storage

**Exemplo:**
```http
GET /inventories/storage/1
Authorization: Bearer {token}
```

Retorna todos os itens armazenados em um local específico.

---

#### `GET /inventories/search?invoiceItemId={id}&storageId={id}`

Buscar inventário específico (invoice item + storage).

**Query Parameters:**
- `invoiceItemId` - ID do invoice item
- `storageId` - ID do storage

**Exemplo:**
```http
GET /inventories/search?invoiceItemId=2&storageId=1
Authorization: Bearer {token}
```

---

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

**Response (201 Created):**
```json
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
```

**Responses:**
- `201` - Inventário criado com sucesso
- `409` - Inventário para este invoice item e storage já existe
- `400` - Invoice item ou storage não existe

---

#### `PUT /inventories/{uuid}`

Atualizar registro de inventário.

**Parameters:**
- `uuid` (path) - UUID do inventário

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

---

#### `DELETE /inventories/{uuid}`

Deletar registro de inventário.

---

### Tasks

Gerenciamento de tarefas do armazém. As tarefas representam operações que precisam ser realizadas, como conferência, armazenamento, separação, etc.

#### Tipos de Tarefas

| Tipo | Descrição | Uso Principal |
|------|-----------|---------------|
| `CONFERENCE` | Conferência de recebimento | Validar quantidade recebida vs nota fiscal |
| `STORAGE` | Armazenamento de materiais | Alocar material em local físico |
| `PICKING` | Separação de materiais | Separar materiais para expedição/uso |
| `PACKAGING` | Embalagem de materiais | Embalar materiais |
| `SHIPPING` | Expedição | Despachar materiais |
| `INVENTORY` | Inventário/Contagem | Contagem física de estoque |
| `DEMOBILIZATION` | Desmobilização | Desmobilizar equipamentos/materiais |

#### Status de Tarefas

| Status | Descrição |
|--------|-----------|
| `PENDING` | Pendente (padrão) |
| `IN_PROGRESS` | Em andamento |
| `COMPLETED` | Concluída |
| `CANCELLED` | Cancelada |

**Fluxo de Status:**
```
PENDING → IN_PROGRESS → COMPLETED
   ↓
CANCELLED
```

---

#### `GET /tasks`

Listar todas as tarefas com filtros opcionais.

**Query Parameters:**
- `status` (opcional) - Filtrar por status: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `taskType` (opcional) - Filtrar por tipo: `PICKING`, `STORAGE`, `CONFERENCE`, etc.
- `assignedUserUuid` (opcional) - Filtrar por usuário atribuído (UUID)

**Exemplos:**

```http
# Todas as tarefas
GET /tasks
Authorization: Bearer {token}

# Tarefas pendentes
GET /tasks?status=PENDING
Authorization: Bearer {token}

# Tarefas de conferência
GET /tasks?taskType=CONFERENCE
Authorization: Bearer {token}

# Tarefas do usuário 2
GET /tasks?assignedUserUuid=2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}

# Tarefas de conferência pendentes do usuário 2
GET /tasks?status=PENDING&taskType=CONFERENCE&assignedUserUuid=2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "uuid": "13d74eb4-99e8-4707-94c5-ddb4adb56f80",
    "title": "Conferência - Nota 1234567",
    "description": "Caixa com equipamento de PI",
    "status": "PENDING",
    "dueDate": null,
    "createdAt": "2025-11-20T23:22:18.772Z",
    "taskType": "CONFERENCE",
    "invoiceId": 1,
    "materialId": 4,
    "itemSpecification": "Bota CAT-23456",
    "assignedUserId": null,
    "issuedBy": "Fulano Ciclano da Silva",
    "entryDate": null,
    "completedAt": null,
    "expectedQuantity": null,
    "countedQuantity": null,
    "countAttempts": 0,
    "lastCountAt": null
  }
]
```

---

#### `GET /tasks/my-tasks`

Listar tarefas do usuário autenticado (usa o `userId` do token JWT).

**Query Parameters:**
- `status` (opcional) - Filtrar por status
- `taskType` (opcional) - Filtrar por tipo

**Exemplos:**

```http
# Minhas tarefas
GET /tasks/my-tasks
Authorization: Bearer {token}

# Minhas tarefas pendentes
GET /tasks/my-tasks?status=PENDING
Authorization: Bearer {token}

# Minhas tarefas de conferência em andamento
GET /tasks/my-tasks?status=IN_PROGRESS&taskType=CONFERENCE
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "uuid": "e8d71a24-6c83-4e69-a787-bd4de3529d94",
    "title": "Conferência - Nota 1234568",
    "description": "Lote de luvas de proteção",
    "status": "IN_PROGRESS",
    "taskType": "CONFERENCE",
    "assignedUserId": 2,
    "issuedBy": "Maria Santos",
    "createdAt": "2025-11-20T23:22:18.974Z"
  }
]
```

---

#### `GET /tasks/open`

Listar tarefas abertas (status `PENDING` ou `IN_PROGRESS`).

**Query Parameters:**
- `taskType` (opcional) - Filtrar por tipo
- `assignedUserUuid` (opcional) - Filtrar por usuário (UUID)

**Exemplos:**

```http
# Todas as tarefas abertas
GET /tasks/open
Authorization: Bearer {token}

# Tarefas de conferência abertas
GET /tasks/open?taskType=CONFERENCE
Authorization: Bearer {token}

# Tarefas abertas do usuário 2
GET /tasks/open?assignedUserUuid=2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}
```

---

#### `GET /tasks/closed`

Listar tarefas fechadas (status `COMPLETED` ou `CANCELLED`).

**Query Parameters:**
- `taskType` (opcional) - Filtrar por tipo
- `assignedUserUuid` (opcional) - Filtrar por usuário (UUID)

**Exemplos:**

```http
# Todas as tarefas fechadas
GET /tasks/closed
Authorization: Bearer {token}

# Tarefas de armazenamento concluídas
GET /tasks/closed?taskType=STORAGE
Authorization: Bearer {token}
```

---

#### `GET /tasks/user/{userUuid}`

Listar tarefas de um usuário específico.

**Parameters:**
- `userUuid` (path) - UUID do usuário

**Query Parameters:**
- `status` (opcional) - Filtrar por status
- `taskType` (opcional) - Filtrar por tipo

**Exemplos:**

```http
# Todas as tarefas do usuário 1
GET /tasks/user/2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}

# Tarefas concluídas do usuário 1
GET /tasks/user/2103e8df-f89d-47be-9be1-3a3db0172c35?status=COMPLETED
Authorization: Bearer {token}

# Tarefas de picking em andamento do usuário 1
GET /tasks/user/2103e8df-f89d-47be-9be1-3a3db0172c35?status=IN_PROGRESS&taskType=PICKING
Authorization: Bearer {token}
```

---

#### `GET /tasks/invoice/{invoiceUuid}`

Buscar tarefas relacionadas a uma nota fiscal.

**Parameters:**
- `invoiceUuid` (path) - UUID da nota fiscal

**Exemplo:**

```http
GET /tasks/invoice/1
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "uuid": "13d74eb4-99e8-4707-94c5-ddb4adb56f80",
    "title": "Conferência - Nota 1234567",
    "taskType": "CONFERENCE",
    "invoiceId": 1,
    "materialId": 4,
    "status": "PENDING"
  },
  {
    "uuid": "20405b02-f980-4652-8b70-5e04d38a31fe",
    "title": "Armazenamento - Nota 1234567",
    "taskType": "STORAGE",
    "invoiceId": 1,
    "materialId": 4,
    "status": "PENDING"
  }
]
```

---

#### `GET /tasks/{uuid}`

Buscar tarefa por UUID.

**Parameters:**
- `uuid` (path) - UUID da tarefa

**Exemplo:**

```http
GET /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "uuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "title": "Conferência - Nota NF-15",
  "description": "Conferir quantidade de Luvas de Segurança",
  "status": "PENDING",
  "dueDate": "2025-12-23T23:59:59.000Z",
  "createdAt": "2025-11-23T20:47:34.142Z",
  "taskType": "CONFERENCE",
  "invoiceId": 4,
  "materialId": 12,
  "itemSpecification": null,
  "assignedUserId": null,
  "issuedBy": null,
  "entryDate": null,
  "completedAt": null,
  "expectedQuantity": null,
  "countedQuantity": null,
  "countAttempts": 0,
  "lastCountAt": null
}
```

**Responses:**
- `200` - Tarefa encontrada
- `404` - Tarefa não encontrada

---

#### `POST /tasks`

Criar nova tarefa.

**Request Body:**
```json
{
  "title": "Conferência - Nota NF-001234",
  "description": "Conferir quantidade de material recebido",
  "taskType": "CONFERENCE",
  "status": "PENDING",
  "invoiceId": 1,
  "materialId": 4,
  "itemSpecification": "Luva PVC Tamanho G",
  "issuedBy": "João Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-25T23:59:59.000Z"
}
```

**Campos obrigatórios:**
- `title` - Título da tarefa (máx. 255 caracteres)
- `taskType` - Tipo da tarefa: `PICKING`, `STORAGE`, `CONFERENCE`, `PACKAGING`, `SHIPPING`, `INVENTORY`, `DEMOBILIZATION`

**Campos opcionais:**
- `description` - Descrição detalhada (máx. 1024 caracteres)
- `status` - Status inicial (padrão: `PENDING`)
- `dueDate` - Data/hora limite para conclusão (formato ISO 8601)
- `invoiceId` - ID da nota fiscal relacionada
- `materialId` - ID do material relacionado
- `itemSpecification` - Especificação do item (máx. 255 caracteres)
- `assignedUserId` - ID do usuário atribuído
- `issuedBy` - Nome de quem emitiu a tarefa (máx. 255 caracteres)
- `entryDate` - Data de entrada/criação da tarefa (formato ISO 8601)

**Response (201 Created):**
```json
{
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Conferência - Nota NF-001234",
  "description": "Conferir quantidade de material recebido",
  "status": "PENDING",
  "taskType": "CONFERENCE",
  "invoiceId": 1,
  "materialId": 4,
  "createdAt": "2025-11-24T10:30:00.000Z"
}
```

**Exemplos de criação por tipo:**

**Tarefa de Conferência:**
```json
{
  "title": "Conferência - NF-12345",
  "description": "Conferir lote de parafusos",
  "taskType": "CONFERENCE",
  "invoiceId": 1,
  "materialId": 4,
  "issuedBy": "Maria Santos",
  "dueDate": "2025-11-30T17:00:00.000Z"
}
```

**Tarefa de Armazenamento:**
```json
{
  "title": "Armazenar - Lote A-001",
  "description": "Armazenar parafusos no setor A",
  "taskType": "STORAGE",
  "invoiceId": 1,
  "materialId": 4,
  "itemSpecification": "Armazenar na prateleira A01-01",
  "assignedUserId": 2
}
```

**Tarefa de Separação:**
```json
{
  "title": "Separar - Pedido #789",
  "description": "Separar materiais para obra X",
  "taskType": "PICKING",
  "assignedUserId": 3,
  "dueDate": "2025-11-25T12:00:00.000Z"
}
```

**Responses:**
- `201` - Tarefa criada com sucesso
- `400` - Dados inválidos

---

#### `PUT /tasks/{uuid}`

Atualizar tarefa.

**Parameters:**
- `uuid` (path) - UUID da tarefa

**Request Body:**
```json
{
  "title": "Conferência - NF-001234 - Urgente",
  "status": "IN_PROGRESS",
  "assignedUserId": 2,
  "issuedBy": "João Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z"
}
```

**Todos os campos são opcionais.** Envie apenas os campos que deseja atualizar.

**Exemplos:**

**Atualizar apenas o status:**
```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**Atribuir a um usuário:**
```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667
Authorization: Bearer {token}
Content-Type: application/json

{
  "assignedUserId": 2
}
```

**Atualizar datas:**
```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667
Authorization: Bearer {token}
Content-Type: application/json

{
  "issuedBy": "João Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z"
}
```

**Response (200 OK):**
```json
{
  "uuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "title": "Conferência - NF-001234 - Urgente",
  "status": "IN_PROGRESS",
  "assignedUserId": 2,
  "issuedBy": "João Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z",
  "updatedAt": "2025-11-24T11:00:00.000Z"
}
```

**Responses:**
- `200` - Tarefa atualizada com sucesso
- `404` - Tarefa não encontrada

---

#### `PUT /tasks/{uuid}/status`

Atualizar apenas o status da tarefa.

**Parameters:**
- `uuid` (path) - UUID da tarefa

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Status válidos:**
- `PENDING` - Pendente
- `IN_PROGRESS` - Em andamento
- `COMPLETED` - Concluída (atualiza `completedAt` automaticamente)
- `CANCELLED` - Cancelada

**Exemplo:**

```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

**Response (200 OK):**
```json
{
  "uuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "title": "Conferência - NF-001234",
  "status": "COMPLETED",
  "completedAt": "2025-11-24T11:30:00.000Z"
}
```

**⚠️ Comportamento especial:**
- Quando status = `COMPLETED`, o campo `completedAt` é preenchido automaticamente com a data/hora atual
- Quando status muda para outro valor, `completedAt` permanece inalterado

---

#### `PUT /tasks/{uuid}/assign`

Atribuir tarefa a um usuário.

**Parameters:**
- `uuid` (path) - UUID da tarefa

**Request Body:**
```json
{
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35"
}
```

**Exemplo:**

```http
PUT /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35"
}
```

**Response (200 OK):**
```json
{
  "uuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "title": "Conferência - NF-001234",
  "assignedUserId": 2,
  "status": "PENDING"
}
```

**Responses:**
- `200` - Tarefa atribuída com sucesso
- `404` - Tarefa não encontrada
- `400` - Usuário não existe

---

#### `POST /tasks/conference`

Realizar conferência de material (tarefa de conferência).

**⚠️ Importante:** 
- A tarefa deve ter `invoiceId` e `materialId` preenchidos
- Deve existir um `invoice_item` correspondente
- A quantidade esperada vem da nota fiscal (`invoice_item.quantity`)
- Se `storageId` for fornecido e a conferência for conforme, o inventário é criado automaticamente

**Request Body:**
```json
{
  "taskUuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "quantityFound": 145,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35",
  "storageId": 1
}
```

**Campos obrigatórios:**
- `taskUuid` - UUID da tarefa de conferência
- `quantityFound` - Quantidade encontrada durante a conferência
- `userUuid` - UUID do usuário que está realizando a conferência

**Campos opcionais:**
- `storageId` - ID do local de armazenamento (se fornecido e conferência conforme, cria inventário automaticamente)

**Exemplo - Conferência com quantidade conforme e armazenamento:**

```http
POST /tasks/conference
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskUuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "quantityFound": 150,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35",
  "storageId": 1
}
```

**Response (200 OK - Conforme com armazenamento):**
```json
{
  "success": true,
  "message": "Conferência realizada com sucesso. Quantidade está conforme a nota fiscal. Inventário criado/atualizado.",
  "quantityFound": 150,
  "expectedQuantity": 150,
  "requiresReview": false
}
```

**Exemplo - Conferência com divergência:**

```http
POST /tasks/conference
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskUuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "quantityFound": 145,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35",
  "storageId": 1
}
```

**Response (200 OK - Divergente):**
```json
{
  "success": false,
  "message": "DIVERGÊNCIA DETECTADA: Esperado 150, mas foram encontrados 145.",
  "quantityFound": 145,
  "expectedQuantity": 150,
  "requiresReview": true
}
```

**O que acontece ao conferir:**

1. ✅ Task é atualizada:
   - `status` → `COMPLETED`
   - `completedAt` → data/hora atual
   - `countedQuantity` → quantidade encontrada
   - `assignedUserId` → usuário que conferiu

2. ✅ Invoice Item é atualizado:
   - `status` → `CONFORMING` (se quantidade correta) ou `DIVERGENT` (se diferente)
   - `remark` → descrição da conformidade ou divergência

**Cenários de conferência:**

| Esperado | Encontrado | Status | Mensagem |
|----------|------------|--------|----------|
| 150 | 150 | `CONFORMING` | ✅ Quantidade está conforme a nota fiscal |
| 150 | 145 | `DIVERGENT` | ⚠️ DIVERGÊNCIA: Esperado 150, encontrado 145 |
| 150 | 155 | `DIVERGENT` | ⚠️ DIVERGÊNCIA: Esperado 150, encontrado 155 |

**Responses:**
- `200` - Conferência realizada (conforme ou divergente)
- `404` - Tarefa não encontrada ou invoice item não encontrado
- `400` - Dados inválidos ou tarefa não é do tipo CONFERENCE

**⚠️ Notas importantes:**
- A tarefa deve ser do tipo `CONFERENCE`
- Deve existir um `invoice_item` com o `invoiceId` e `materialId` especificados na tarefa
- A conferência pode ser realizada mesmo com divergência
- Se houver divergência, o sistema retorna `success: false` mas registra a contagem

---

#### `DELETE /tasks/{uuid}`

Deletar tarefa.

**Parameters:**
- `uuid` (path) - UUID da tarefa

**Exemplo:**

```http
DELETE /tasks/53a6f1c2-0dbc-4588-9195-6041b533c667
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "uuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "title": "Conferência - NF-001234",
  "status": "PENDING",
  "createdAt": "2025-11-23T20:47:34.142Z"
}
```

**Responses:**
- `200` - Tarefa deletada com sucesso
- `404` - Tarefa não encontrada

**⚠️ Atenção:** Esta é uma exclusão permanente (hard delete). A tarefa não poderá ser recuperada.

---

## 🔄 Fluxos Completos

### Fluxo de Recebimento de Material

Este fluxo demonstra como registrar o recebimento completo de materiais de um fornecedor, desde o cadastro até o inventário.

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

### Fluxo de Conferência com Tasks

Este fluxo demonstra como usar o sistema de tarefas para gerenciar a conferência de materiais recebidos.

#### 1️⃣ Criar Tarefa de Conferência

Após receber a nota fiscal, crie uma tarefa para conferir o material:

```http
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Conferência - NF-2024-001",
  "description": "Conferir lote de parafusos Allen M6",
  "taskType": "CONFERENCE",
  "invoiceId": 1,
  "materialId": 4,
  "itemSpecification": "Parafuso Allen M6 x 20mm - Aço Inox",
  "issuedBy": "João Silva - Supervisor",
  "dueDate": "2024-11-25T17:00:00.000Z"
}
```

**Response:**
```json
{
  "uuid": "abc123-def456-ghi789",
  "title": "Conferência - NF-2024-001",
  "description": "Conferir lote de parafusos Allen M6",
  "status": "PENDING",
  "taskType": "CONFERENCE",
  "invoiceId": 1,
  "materialId": 4,
  "createdAt": "2024-11-20T14:00:00.000Z"
}
```

✅ Tarefa criada e aguardando atribuição

---

#### 2️⃣ Listar Tarefas Pendentes

O operador do armazém visualiza suas tarefas pendentes:

```http
GET /tasks?status=PENDING&taskType=CONFERENCE
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "uuid": "abc123-def456-ghi789",
    "title": "Conferência - NF-2024-001",
    "description": "Conferir lote de parafusos Allen M6",
    "status": "PENDING",
    "taskType": "CONFERENCE",
    "dueDate": "2024-11-25T17:00:00.000Z",
    "issuedBy": "João Silva - Supervisor"
  }
]
```

---

#### 3️⃣ Atribuir Tarefa a um Operador

O supervisor atribui a tarefa a um operador:

```http
PUT /tasks/abc123-def456-ghi789/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35"
}
```

**Response:**
```json
{
  "uuid": "abc123-def456-ghi789",
  "title": "Conferência - NF-2024-001",
  "assignedUserId": 2,
  "status": "PENDING"
}
```

---

#### 4️⃣ Operador Inicia a Conferência

O operador marca a tarefa como em andamento:

```http
PUT /tasks/abc123-def456-ghi789/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

---

#### 5️⃣ Realizar a Conferência

O operador conta os materiais e registra o resultado:

**Cenário A - Quantidade Conforme:**

```http
POST /tasks/conference
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskUuid": "abc123-def456-ghi789",
  "quantityFound": 1000,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Conferência realizada com sucesso. Quantidade está conforme a nota fiscal. Inventário criado/atualizado.",
  "quantityFound": 1000,
  "expectedQuantity": 1000,
  "requiresReview": false
}
```

✅ **O que aconteceu:**
- Task → Status `COMPLETED` com `completedAt` preenchido
- Invoice Item → Status `CONFORMING`
- Material pode ser armazenado

---

**Cenário B - Divergência na Quantidade:**

```http
POST /tasks/conference
Authorization: Bearer {token}
Content-Type: application/json

{
  "taskUuid": "abc123-def456-ghi789",
  "quantityFound": 950,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35"
}
```

**Response (Divergência):**
```json
{
  "success": false,
  "message": "DIVERGÊNCIA DETECTADA: Esperado 1000, mas foram encontrados 950.",
  "quantityFound": 950,
  "expectedQuantity": 1000,
  "requiresReview": true
}
```

⚠️ **O que aconteceu:**
- Task → Status `COMPLETED` (conferência finalizada)
- Invoice Item → Status `DIVERGENT` com observação da diferença
- Supervisor precisa revisar e tomar ação

---

#### 6️⃣ Consultar Status da Conferência

Verificar o status da tarefa concluída:

```http
GET /tasks/abc123-def456-ghi789
Authorization: Bearer {token}
```

**Response:**
```json
{
  "uuid": "abc123-def456-ghi789",
  "title": "Conferência - NF-2024-001",
  "status": "COMPLETED",
  "taskType": "CONFERENCE",
  "completedAt": "2024-11-20T15:30:00.000Z",
  "countedQuantity": 950,
  "assignedUserId": 2
}
```

---

#### 7️⃣ Listar Tarefas Concluídas

```http
GET /tasks/closed?taskType=CONFERENCE
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "uuid": "abc123-def456-ghi789",
    "title": "Conferência - NF-2024-001",
    "status": "COMPLETED",
    "taskType": "CONFERENCE",
    "completedAt": "2024-11-20T15:30:00.000Z",
    "assignedUserId": 2
  }
]
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

**Solução:** Faça login novamente para obter um novo token válido.

---

### Erro 404 - Recurso não encontrado

```json
{
  "statusCode": 404,
  "message": "User with UUID 550e8400-e29b-41d4-a716-446655440000 not found"
}
```

**Solução:** Verifique se o UUID está correto. O recurso pode ter sido deletado.

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

### Diagrama de Relacionamentos Completo

```
┌─────────────────────┐
│       User          │
│─────────────────────│
│ id (PK)             │
│ uuid (unique)       │
│ username (unique)   │
│ password (hash)     │
│ name                │
│ createdAt           │
└─────────────────────┘
         ▲
         │ assignedUserId
         │
┌─────────────────────┐       ┌─────────────────────┐
│      Company        │       │   MaterialCategory  │
│─────────────────────│       │─────────────────────│
│ id (PK)             │       │ id (PK)             │
│ uuid (unique)       │       │ uuid (unique)       │
│ cnpj (unique)       │       │ name (unique)       │
│ name                │       │ description         │
│ street              │       │ materialUnit        │
│ city                │       │ createdAt           │
│ state               │       └─────────────────────┘
│ country             │                │
│ postalCode          │                │ categoryId
│ status              │                ▼
│ createdAt           │       ┌─────────────────────┐
└─────────────────────┘       │      Material       │
         │                    │─────────────────────│
         │ companyId          │ id (PK)             │
         │                    │ uuid (unique)       │
         ▼                    │ externalCode (uniq) │
┌─────────────────────┐       │ categoryId (FK)     │
│   SupplierInfo      │       │ description         │
│─────────────────────│       │ materialUnit        │
│ id (PK)             │       │ status              │
│ uuid (unique)       │       │ createdAt           │
│ companyId (FK)      │       └─────────────────────┘
│ createdAt           │                │
└─────────────────────┘                │ materialId
         │                             │
         │ supplierId                  │
         ▼                             ▼
┌─────────────────────┐       ┌─────────────────────┐
│      Invoice        │       │    InvoiceItem      │
│─────────────────────│       │─────────────────────│
│ id (PK)             │       │ id (PK)             │
│ uuid (unique)       │       │ uuid (unique)       │
│ invoiceNumber (uniq)│◄──────│ invoiceId (FK)      │
│ supplierId (FK)     │       │ materialId (FK)     │
│ receivedAt          │       │ quantity            │
│ status              │       │ totalValue          │
│ createdAt           │       │ unitValue (calc)    │
└─────────────────────┘       │ status              │
         │                    │ remark              │
         │ invoiceId          │ createdAt           │
         │                    └─────────────────────┘
         │                             │
         │                             │ invoiceItemId
         │                             ▼
         │                    ┌─────────────────────┐
         │                    │     Inventory       │
         │                    │─────────────────────│
         │                    │ id (PK)             │
         │                    │ uuid (unique)       │
         │                    │ invoiceItemId (FK)  │
         │                    │ storageId (FK)      │
         │                    │ quantity            │
         │                    │ reserved            │
         │                    │ available (calc)    │
         │                    │ createdAt           │
         │                    └─────────────────────┘
         │                             │
         │                             │
         ▼                             ▼
┌─────────────────────┐       ┌─────────────────────┐
│        Task         │       │      Storage        │
│─────────────────────│       │─────────────────────│
│ id (PK)             │       │ id (PK)             │
│ uuid (unique)       │       │ uuid (unique)       │
│ title               │       │ code (unique)       │
│ description         │       │ name                │
│ status              │       │ companyId (FK)      │
│ dueDate             │       │ createdAt           │
│ createdAt           │       └─────────────────────┘
│ taskType            │
│ invoiceId (FK)      │
│ materialId (FK)     │
│ itemSpecification   │
│ assignedUserId (FK) │
│ issuedBy            │
│ entryDate           │
│ completedAt         │
│ expectedQuantity    │
│ countedQuantity     │
│ countAttempts       │
│ lastCountAt         │
└─────────────────────┘

**Legenda:**
- PK = Primary Key (id interno, não exposto na API)
- FK = Foreign Key (relacionamento entre tabelas)
- (unique) = Constraint de unicidade
- (calc) = Campo calculado automaticamente
- (hash) = Campo com hash bcrypt
```

### Principais Relacionamentos

1. **Company ↔ SupplierInfo**: 1:N (uma empresa pode ser fornecedor)
2. **Company ↔ Storage**: 1:N (uma empresa pode ter vários storages)
3. **MaterialCategory ↔ Material**: 1:N (uma categoria tem vários materiais)
4. **Supplier ↔ Invoice**: 1:N (um fornecedor emite várias notas)
5. **Invoice ↔ InvoiceItem**: 1:N (uma nota tem vários itens)
6. **Material ↔ InvoiceItem**: 1:N (um material pode estar em vários itens)
7. **InvoiceItem ↔ Inventory**: 1:N (um item pode estar em vários locais)
8. **Storage ↔ Inventory**: 1:N (um local armazena vários itens)
9. **User ↔ Task**: 1:N (um usuário tem várias tarefas atribuídas)
10. **Invoice ↔ Task**: 1:N (uma nota gera várias tarefas)
11. **Material ↔ Task**: 1:N (um material pode ter várias tarefas)

### Rastreabilidade Completa

```
┌─────────────┐
│  Material   │ (O que?)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│InvoiceItem  │ (Quanto? Por quanto?)
└──────┬──────┘
       │
       ├──► Invoice ──► Supplier ──► Company (De quem? Quando?)
       │
       └──► Inventory ──► Storage ──► Company (Onde?)
              │
              └──► Task (Quem conferiu? Quando?)
```

**Com este modelo você consegue:**
- ✅ Rastrear cada unidade de material até sua origem (nota fiscal + fornecedor)
- ✅ Saber exatamente onde cada lote está armazenado
- ✅ Identificar quem conferiu, armazenou e movimentou cada item
- ✅ Separar estoques do mesmo material de fornecedores diferentes
- ✅ Manter histórico completo de operações via Tasks
- ✅ Calcular valores unitários automaticamente
- ✅ Controlar quantidade disponível vs reservada

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

### 3. Campos Calculados Automaticamente

Alguns campos são **calculados automaticamente pelo PostgreSQL** usando generated columns:

#### Invoice Item - Unit Value
```sql
unitValue NUMERIC(15, 6) GENERATED ALWAYS AS (
  CASE 
    WHEN quantity = 0 THEN 0 
    ELSE totalValue / quantity 
  END
) STORED
```

**Comportamento:**
- Calculado automaticamente quando `totalValue` ou `quantity` mudam
- Armazenado fisicamente no banco (STORED)
- Não pode ser inserido ou atualizado manualmente
- Previne divisão por zero

**Exemplo:**
```json
POST /invoice-items
{
  "quantity": "1000",
  "totalValue": "500.00"
}

// Resposta:
{
  "quantity": "1000.000",
  "totalValue": "500.00",
  "unitValue": "0.500000"  // ← Calculado automaticamente
}
```

---

#### Inventory - Available Quantity
```sql
available NUMERIC(10, 3) GENERATED ALWAYS AS (
  quantity - reserved
) STORED
```

**Comportamento:**
- Calculado automaticamente quando `quantity` ou `reserved` mudam
- Sempre reflete a quantidade realmente disponível
- Não pode ser inserido ou atualizado manualmente

**Exemplo:**
```json
POST /inventories
{
  "quantity": "1000",
  "reserved": "0"
}

// Resposta:
{
  "quantity": "1000.000",
  "reserved": "0.000",
  "available": "1000.000"  // ← Calculado automaticamente
}

// Após reservar 250 unidades:
PUT /inventories/{uuid}
{
  "reserved": "250"
}

// Resposta:
{
  "quantity": "1000.000",
  "reserved": "250.000",
  "available": "750.000"  // ← Atualizado automaticamente
}
```

**⚠️ Importante:**
- Estes campos são **read-only** na API
- Qualquer tentativa de enviar valores para eles será **ignorada**
- O PostgreSQL garante que os valores estão sempre corretos
- Use-os para consultas e relatórios com segurança

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

#### Task Status
```
PENDING → IN_PROGRESS → COMPLETED
   ↓
CANCELLED
```

---

### 5. Soft Delete vs Hard Delete

**Hard Delete (usado atualmente):**
- Todos os endpoints DELETE fazem exclusão permanente
- Dados são removidos fisicamente do banco
- Não há recuperação possível

**⚠️ Cuidado:** Antes de deletar, certifique-se de que não há dependências:
- Não delete Companies que têm Suppliers/Customers
- Não delete Materials que têm Invoice Items
- Não delete Storages que têm Inventory

---

### 6. Unicidade e Constraints

**Campos únicos no sistema:**
- `users.username` - Nome de usuário
- `companies.cnpj` - CNPJ da empresa
- `materials.externalCode` - Código externo do material
- `materialCategories.name` - Nome da categoria
- `storages.code` - Código do local
- `invoices.invoiceNumber` - Número da nota fiscal
- `(inventories.invoiceItemId, inventories.storageId)` - Par único de invoice item + storage

---

### 7. Formato de Datas

Todas as datas seguem o formato **ISO 8601**:

```
2024-11-20T08:30:00.000Z
```

**Componentes:**
- `2024-11-20` - Data (YYYY-MM-DD)
- `T` - Separador
- `08:30:00.000` - Hora (HH:MM:SS.mmm)
- `Z` - UTC (Zulu time)

**Exemplo em JavaScript:**
```javascript
new Date().toISOString()
// "2024-11-20T08:30:00.000Z"
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

### 9. Sistema de Tasks

**Boas práticas:**

✅ **Criar tasks automaticamente:**
- Ao receber nota fiscal → criar task de CONFERENCE
- Após conferência → criar task de STORAGE
- Quando preciso separar → criar task de PICKING

✅ **Atribuição de tasks:**
- Use `assignedUserId` para designar responsável
- Tasks sem atribuição ficam no "pool" para qualquer um pegar

✅ **Conferência com tasks:**
- Sempre use o endpoint `/tasks/conference` para conferir
- Isso garante registro de quem conferiu e quando
- Detecta automaticamente divergências

✅ **Monitoramento:**
- Use `/tasks/open` para ver trabalho pendente
- Use `/tasks/closed` para ver histórico
- Use filtros por `taskType` para análise específica

---

### 10. Sistema de Identificadores (ID vs UUID)

#### Por que dois identificadores?

**ID (interno - não exposto):**
- Tipo: `SERIAL` (auto-incremento)
- Uso: Foreign keys internas do banco
- Performance: Índices mais rápidos
- **Nunca** retornado nas respostas da API

**UUID (público - exposto):**
- Tipo: `UUID v4`
- Uso: Identificador público em todas as respostas
- Segurança: Não revela informações sobre quantidade de registros
- Portabilidade: Único globalmente

#### Como funciona na prática

**❌ Errado - Usar ID interno:**
```http
GET /materials/4
Authorization: Bearer {token}

// Erro 404 - Endpoint não existe
```

**✅ Correto - Usar UUID:**
```http
GET /materials/850e8400-e29b-41d4-a716-446655440003
Authorization: Bearer {token}

// Funciona!
```

#### Estrutura de Resposta

```json
{
  // ❌ "id" não é retornado
  "uuid": "850e8400-e29b-41d4-a716-446655440003",  // ✅ Use este
  "externalCode": "PAR-001",
  "categoryId": 1,  // ⚠️ Foreign key - apenas para referência
  "description": "Parafuso Allen M6 x 20mm",
  "createdAt": "2024-11-20T11:30:00.000Z"
}
```

#### Foreign Keys

Foreign keys usam **ID numérico interno** por performance:

```json
POST /invoice-items
{
  "invoiceId": 1,      // ⚠️ ID numérico (interno)
  "materialId": 4,     // ⚠️ ID numérico (interno)
  "quantity": "100",
  "totalValue": "1500.00"
}
```

**Como obter o ID numérico?**

1. Ao criar um recurso, guarde o `id` da resposta
2. Ou busque pelo UUID e use o `id` retornado
3. Ou busque por outros campos (código, nome, etc.)

**Exemplo completo:**

```http
// 1. Criar material
POST /materials
{
  "externalCode": "PAR-001",
  "categoryId": 1,
  "description": "Parafuso Allen M6"
}

// Resposta:
{
  "id": 4,  // ← Guarde este ID para usar em foreign keys
  "uuid": "850e8400-e29b-41d4-a716-446655440003",
  "externalCode": "PAR-001"
}

// 2. Criar invoice item usando o ID
POST /invoice-items
{
  "materialId": 4,  // ← Use o ID recebido acima
  "invoiceId": 1,
  "quantity": "100"
}
```

#### Busca por UUID vs Busca por ID

| Operação | Usa UUID | Usa ID | Exemplo |
|----------|----------|--------|---------|
| GET específico | ✅ Sim | ❌ Não | `GET /materials/{uuid}` |
| PUT/DELETE | ✅ Sim | ❌ Não | `PUT /materials/{uuid}` |
| POST (foreign key) | ❌ Não | ✅ Sim | `materialId: 4` |
| Relacionamentos | ❌ Não | ✅ Sim | `invoiceId: 1` |

#### Benefícios desta Abordagem

✅ **Segurança:** UUIDs não revelam quantidade de registros
✅ **Performance:** IDs numéricos para joins são mais rápidos
✅ **Portabilidade:** UUIDs podem ser gerados no client se necessário
✅ **Escalabilidade:** Fácil migração entre bancos diferentes

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

**💡 Dica:** Use o arquivo `test-all-routes.http` na raiz do projeto! Ele contém **80+ exemplos prontos** de requisições organizadas por módulo.

### Usando o arquivo test-all-routes.http

O projeto inclui um arquivo completo com todos os endpoints testados. Você pode usá-lo com:

- **VS Code:** Instale a extensão [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- **IntelliJ/WebStorm:** Suporte nativo para arquivos `.http`

**Como usar:**

1. **Configure as variáveis:**
   - Altere `@baseUrl` se necessário (padrão: `http://localhost:3000`)
   - Após fazer login, copie o `access_token` e cole em `@token`

2. **Execute as requisições:**
   - Clique em "Send Request" acima de cada requisição
   - Ou use o atalho `Ctrl+Alt+R` (VS Code)

3. **Navegue pelos módulos:**
   - O arquivo está organizado em seções por módulo
   - Use a estrutura de navegação do editor para pular entre seções

**Benefícios:**

✅ **Todos os endpoints testados** - Não precisa escrever cURL ou Postman collections
✅ **Exemplos de todos os cenários** - Criação, atualização, busca, deleção
✅ **Variáveis reutilizáveis** - Defina `@token` uma vez, use em todas as requisições
✅ **Sintaxe simples** - Mais fácil que cURL, mais rápido que Postman
✅ **Versionado com o código** - Sempre atualizado com as mudanças da API
✅ **Fácil compartilhamento** - Envie o arquivo para o time usar

**Exemplo de uso prático:**

```http
### 1. Faça login primeiro
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "******"
}

### 2. Copie o access_token da resposta e cole em @token
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### 3. Agora todos os endpoints funcionam!
GET {{baseUrl}}/materials
Authorization: Bearer {{token}}
```

**📁 Localização:** `/test-all-routes.http` na raiz do projeto

**🔗 Módulos incluídos:**
- ✅ Auth (Login)
- ✅ Users (CRUD completo)
- ✅ Companies (CRUD completo)
- ✅ Suppliers (CRUD completo)
- ✅ Material Categories (CRUD completo)
- ✅ Materials (CRUD completo)
- ✅ Storages (CRUD completo + lista de nomes)
- ✅ Invoices (CRUD completo)
- ✅ Invoice Items (CRUD completo + filtros)
- ✅ Inventories (CRUD completo + buscas avançadas)
- ✅ Tasks (CRUD completo + conferência + filtros + atribuição)

**⚡ Produtividade:** Com o arquivo `.http`, você pode testar toda a API em minutos!


### Usando Postman

1. Importe a collection (se disponível)
2. Configure a variável `{{baseUrl}}` = `http://localhost:3000`
3. Configure a variável `{{token}}` após o login
4. Use `{{token}}` no header Authorization

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

### [1.1.0] - 2024-11-24

#### Adicionado
- ✨ Sistema completo de Tasks (Tarefas)
- ✨ Endpoint de conferência com validação automática
- ✨ Filtros avançados para listagem de tasks
- ✨ Atribuição de tasks a usuários
- ✨ Integração tasks + invoice items para conferência
- ✨ Campos de rastreamento de contagem (countedQuantity, countAttempts, lastCountAt)

#### Modificado
- 🔄 Documentação expandida com fluxos de tasks
- 🔄 Melhorias na rastreabilidade de operações

### [1.0.0] - 2024-11-20

#### Adicionado
- ✨ Sistema completo de autenticação JWT
- ✨ CRUD completo de Users (com hash de senha)
- ✨ CRUD completo de Companies
- ✨ CRUD completo de Suppliers (com reutilização de Companies)
- ✨ CRUD completo de Material Categories
- ✨ CRUD completo de Materials
- ✨ CRUD completo de Storages
- ✨ CRUD completo de Invoices
- ✨ CRUD completo de Invoice Items (com cálculo automático de unit value)
- ✨ CRUD completo de Inventories (com rastreabilidade por invoice item)
- ✨ Validação de dados em todos os endpoints
- ✨ Tratamento de erros padronizado
- ✨ Hash automático de senhas com bcrypt

---

**Versão da API:** 1.1.0  
**Última atualização:** 24 de Novembro de 2024  
**Desenvolvido com:** ❤️ e NestJS








