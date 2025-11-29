# 🆕 Documentaaao da API - Sistema WMS (Warehouse Management System)

## 🆕 andice

1. [Visao Geral](#visao-geral)
2. [Novidades da v2.0.0](#novidades-da-v200)
3. [Autenticação](#Autenticação)
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
   - [Fluxo de Conferência com Tasks](#fluxo-de-Conferência-com-tasks)
6. [Cadigos de Status HTTP](#cadigos-de-status-http)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Modelo de Dados](#modelo-de-dados)
   - [Diagrama de Relacionamentos Completo](#diagrama-de-relacionamentos-completo)
   - [Principais Relacionamentos](#principais-relacionamentos)
   - [Rastreabilidade Completa](#rastreabilidade-completa)
9. [Observaaaes Importantes](#observaaaes-importantes)
   - [1. Rastreabilidade Completa](#1-rastreabilidade-completa)
   - [2. Reutilizaaao de Companies](#2-reutilizaaao-de-companies)
   - [3. Campos Calculados automáticamente](#3-campos-calculados-automáticamente)
   - [4. Status e Fluxos](#4-status-e-fluxos)
   - [5. Soft Delete vs Hard Delete](#5-soft-delete-vs-hard-delete)
   - [6. Unicidade e Constraints](#6-unicidade-e-constraints)
   - [7. Formato de Datas](#7-formato-de-datas)
   - [8. Precisao Numarica](#8-precisao-numarica)
   - [9. Sistema de Tasks](#9-sistema-de-tasks)
   - [10. Sistema de Identificadores (ID vs UUID)](#10-sistema-de-identificadores-id-vs-uuid)
10. [Comeaando](#comeaando)
    - [Pra-requisitos](#pra-requisitos)
    - [Instalaaao](#instalaaao)
11. [Testando a API](#testando-a-api)
    - [Usando cURL](#usando-curl)
    - [Usando Postman](#usando-postman)
12. [Suporte](#suporte)
13. [Licenaa](#licenaa)
14. [Contribuindo](#contribuindo)
15. [Changelog](#changelog)

---

## 🆕 Visao Geral

Esta API REST foi desenvolvida para gerenciar operaaaes completas de um sistema WMS (Warehouse Management System), incluindo:

- ✨ Gestao de empresas e fornecedores
- ✨ Controle de categorias e materiais
- ✨ Gerenciamento de armazans (storages) com seleção de localização
- ✨ Controle de notas fiscais e seus itens
- ✨ Rastreabilidade completa de inventário por item de nota fiscal
- ✨ **Sistema de tarefas (Tasks) para operaaaes de armazam**
- ✨ **Conferência automatizada com validaaao de quantidades**
- ✨ **Criação automática de inventário após Conferência bem-sucedida**

**Base URL:** `http://localhost:3000`

**Tecnologias:**
- NestJS v11
- PostgreSQL 14+
- Drizzle ORM v0.44.7
- JWT Authentication (Passport.js)
- bcrypt (hash de senhas)
- Docker & Docker Compose

**Versao da API:** 2.0.0

---

## 🆕 Novidades da v2.0.0

### 🆕 Principais Mudanças

#### 1. **Sistema de Storages Aprimorado**
- ✨ Novo endpoint `GET /storages/names/list` para listar apenas nomes de locais
- 🆕 Método `findById()` adicionado ao repositório
- 🆕 Método `findByName()` para buscar storages por nome
- 🆕 **Constraint de unicidade**: Agora os nomes dos storages devem ser únicos no sistema

#### 2. **Workflow de Conferência Melhorado**
- 🆕 Suporte a **seleção de localização (storage)** durante a Conferência
- ✨ **Criação automática de inventário** após Conferência bem-sucedida
- 🆕 Status da tarefa muda automáticamente para `IN_PROGRESS` ao ser atribuída
- 🆕 Parâmetro opcional `storageId` no endpoint de Conferência

#### 3. **Sistema de Rastreabilidade Aprimorado**
- 🆕 inventários agora referenciam **invoice_items** ao invés de materials
- 🆕 Rastreamento mais preciso: cada item de nota fiscal tem seu próprio registro
- 🆕 Novos Métodos no repositório de Invoice Items:
  - `findByInvoiceUuid()`: Buscar itens por UUID da nota
  - `findByInvoiceAndMaterialWithId()`: Buscar com retorno de IDs numéricos

#### 4. **Migração para UUIDs nas Tasks** 🔄
- ✅ **BREAKING CHANGE**: Todos os endpoints de Tasks agora usam UUIDs
- 🔐 Query parameters: `assignedUserId` → `assignedUserUuid`
- 🔗 Path parameters: `/tasks/user/{userId}` → `/tasks/user/{userUuid}`
- 🔗 Path parameters: `/tasks/invoice/{invoiceId}` → `/tasks/invoice/{invoiceUuid}`
- 📝 Request bodies: `userId` → `userUuid` em todos os endpoints
- ✅ 7 endpoints refatorados para maior segurança

#### 5. **Gerenciamento de Senhas** 🔑
- ✨ Novo endpoint `POST /auth/change-password` para trocar senha
- 🔓 Novo endpoint `POST /auth/reset-password` para redefinir senha
- 🔒 Validação de senha atual antes de permitir mudança
- 📧 Reset de senha via email (implementação básica)

#### 6. **Migrações de Banco de Dados**
- 📦 Adicionadas Migrações `0001` e `0002` para evolução do schema
- 📦 Suporte completo ao Drizzle ORM v0.44.7

#### 7. **Arquivo de Testes Completo**
- 📝 Novo arquivo `test-all-routes.http` com 82+ endpoints testados
- 📂 Organizado por módulos para facilitar testes
- ⚙️ Variáveis configuráveis para `baseUrl` e `token`

---

## 🆕 Autenticação

Todos os endpoints (exceto `/auth/login`) requerem Autenticação via JWT Bearer Token.

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

Em todas as requisiaaes subsequentes, adicione o header:
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

**🆕 Expiraaao do Token:**
- Padrao: 1 hora
- após expirado, faaa login novamente para obter novo token

---

## 🆕 Endpoints

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

**Campos obrigatarios:**
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
- `401` - Credenciais invalidas

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

---

#### `POST /auth/change-password`

Trocar senha do usuário autenticado.

**Autenticação:** ✅ Requerida (Bearer Token)

**Request Body:**
```json
{
  "currentPassword": "SenhaAntiga123!",
  "newPassword": "SenhaNova456!"
}
```

**Campos obrigatórios:**
- `currentPassword` - Senha atual do usuário
- `newPassword` - Nova senha desejada (mín. 6 caracteres)

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Responses:**
- `200` - Senha alterada com sucesso
- `401` - Senha atual incorreta ou token inválido
- `404` - Usuário não encontrado

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu-token}" \
  -d '{"currentPassword":"SenhaAntiga123!","newPassword":"SenhaNova456!"}'
```

---

#### `POST /auth/reset-password`

Redefinir senha de usuário (rota pública - sem autenticação).

**⚠️ Nota de Segurança:** Esta é uma implementação básica. Em produção, deve-se:
- Enviar email com token único de redefinição
- Validar token temporário antes de permitir reset
- Implementar expiração de token (ex: 15 minutos)
- Adicionar rate limiting para prevenir abuso

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "newPassword": "NovaSenha789!"
}
```

**Campos obrigatórios:**
- `email` - Email do usuário cadastrado
- `newPassword` - Nova senha desejada (mín. 6 caracteres)

**Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

**Responses:**
- `200` - Senha redefinida com sucesso
- `401` - Email não encontrado no sistema

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","newPassword":"NovaSenha789!"}'
```


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
    "name": "Joao Silva",
    "createdAt": "2024-11-20T14:30:00.000Z"
  }
]
```

**🆕 Nota:** A senha nao a retornada nas respostas por seguranaa.

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
  "name": "Joao Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - usuário encontrado
- `404` - usuário nao encontrado

---

#### `POST /users`

Criar novo usuário.

**Request Body:**
```json
{
  "username": "joao.silva",
  "password": "Senha@123",
  "name": "Joao Silva"
}
```

**Campos obrigatarios:**
- `username` - Nome de usuário anico (man. 3, max. 50 caracteres)
- `password` - Senha do usuário (man. 6, max. 100 caracteres)

**Campos opcionais:**
- `name` - Nome completo do usuário (max. 255 caracteres)

**Validaaaes:**
- ✨ Username deve ter pelo menos 3 caracteres
- ✨ Senha deve ter pelo menos 6 caracteres
- ✨ Username deve ser anico no sistema
- ✨ Senha sera hasheada automáticamente antes de salvar

**Response (201 Created):**
```json
{
  "id": 2,
  "username": "joao.silva",
  "name": "Joao Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `201` - usuário criado com sucesso
- `409` - usuário com este username ja existe
- `400` - Dados invalidos (validaaao falhou)

**Exemplo de erro de validaaao:**
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
  "name": "Joao Silva Santos",
  "password": "NovaSenha@456"
}
```

**Campos opcionais:**
- `username` - Novo nome de usuário (man. 3, max. 50 caracteres)
- `password` - Nova senha (man. 6, max. 100 caracteres)
- `name` - Novo nome completo (max. 255 caracteres)

**Exemplos de atualizaaao:**

**Atualizar apenas a senha:**
```json
{
  "password": "NovaSenha@789"
}
```

**Atualizar apenas o nome:**
```json
{
  "name": "Joao Silva Santos"
}
```

**Atualizar username e nome:**
```json
{
  "username": "joao.silva2",
  "name": "Joao Silva Santos"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "joao.silva2",
  "name": "Joao Silva Santos",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - usuário atualizado com sucesso
- `404` - usuário nao encontrado
- `409` - Novo username ja existe (se tentar mudar para username em uso)
- `400` - Dados invalidos

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
  "name": "Joao Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - usuário deletado com sucesso
- `404` - usuário nao encontrado

**🆕 Atenaao:** Esta a uma exclusao permanente (hard delete). O usuário nao podera mais fazer login.

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
    "city": "Sao Paulo",
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
- `404` - Empresa nao encontrada

---

#### `GET /companies/cnpj/{cnpj}`

Buscar empresa por CNPJ.

**Parameters:**
- `cnpj` (path) - CNPJ da empresa (14 dagitos)

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
  "city": "Sao Paulo",
  "state": "SP",
  "country": "Brasil",
  "postalCode": "01234567",
  "status": "ACTIVE"
}
```

**Campos obrigatarios:**
- `cnpj` - CNPJ da empresa (14 dagitos, anico)
- `name` - Nome da empresa (max. 255 caracteres)
- `street` - Endereao (max. 255 caracteres)
- `city` - Cidade (max. 100 caracteres)
- `state` - Estado, sigla (max. 2 caracteres)
- `country` - Paas (max. 100 caracteres)
- `postalCode` - CEP (max. 10 caracteres)

**Campos opcionais:**
- `status` - Status da empresa (padrao: `ACTIVE`)

**Status disponaveis:**
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
  "city": "Sao Paulo",
  "state": "SP",
  "country": "Brasil",
  "postalCode": "01234567",
  "status": "ACTIVE",
  "createdAt": "2024-11-20T10:00:00.000Z"
}
```

**Responses:**
- `201` - Empresa criada com sucesso
- `409` - Empresa com este CNPJ ja existe

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

**Todos os campos sao opcionais.** Envie apenas os que deseja atualizar.

**Responses:**
- `200` - Empresa atualizada com sucesso
- `404` - Empresa nao encontrada

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
- `404` - Empresa nao encontrada

---

### Suppliers

Gerenciamento de fornecedores. Cada fornecedor esta vinculado a uma empresa (Company).

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
- `cnpj` (path) - CNPJ do fornecedor (14 dagitos)

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

**🆕 Importante - Reutilizaaao de Companies:** 
- Se ja existir uma `Company` com esse CNPJ, ela sera **reutilizada**
- Caso contrario, uma nova `Company` sera criada automáticamente
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
- `409` - Fornecedor com este CNPJ ja existe

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

**🆕 Nota:** Ao deletar um fornecedor, apenas o vanculo (`supplierInfo`) a removido. A `Company` permanece no banco, pois pode ter outros vanculos.

**Responses:**
- `200` - Fornecedor deletado com sucesso
- `404` - Fornecedor nao encontrado

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

**Campos obrigatarios:**
- `name` - Nome da categoria, anico (max. 100 caracteres)
- `materialUnit` - Unidade de medida padrao

**Campos opcionais:**
- `description` - Descriaao da categoria (max. 255 caracteres)

**Unidades de medida suportadas:**

| Cadigo | Descriaao |
|--------|-----------|
| `BX` | Caixa |
| `CM` | Centametro |
| `GR` | Grama |
| `KG` | Quilograma |
| `LT` | Litro |
| `M2` | Metro Quadrado |
| `M3` | Metro Cabico |
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
- `409` - Categoria com este nome ja existe

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
    "description": "Parafuso Allen M6 x 20mm - Aao Inox",
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

Buscar material por cadigo externo.

**Parameters:**
- `externalCode` (path) - Cadigo externo do material

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
  "description": "Parafuso Allen M6 x 20mm - Aao Inox",
  "materialUnit": "UN",
  "status": "ACTIVE"
}
```

**Campos obrigatarios:**
- `externalCode` - Cadigo externo do material, anico (max. 50 caracteres)
- `categoryId` - ID da categoria
- `description` - Descriaao do material (max. 255 caracteres)
- `materialUnit` - Unidade de medida (veja tabela acima)

**Campos opcionais:**
- `status` - Status do material (padrao: `ACTIVE`)

**Status do Material:**

| Status | Descriaao |
|--------|-----------|
| `ACTIVE` | Material ativo e disponavel |
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
  "description": "Parafuso Allen M6 x 20mm - Aao Inox",
  "materialUnit": "UN",
  "status": "ACTIVE",
  "createdAt": "2024-11-20T11:30:00.000Z"
}
```

**Responses:**
- `201` - Material criado com sucesso
- `409` - Material com este cadigo externo ja existe

---

#### `PUT /materials/{uuid}`

Atualizar material.

**Parameters:**
- `uuid` (path) - UUID do material

**Request Body:**
```json
{
  "description": "Parafuso Allen M6 x 20mm - Aao Inox 304",
  "status": "DISCONTINUED"
}
```

---

#### `DELETE /materials/{uuid}`

Deletar material.

---

### Storages

Gerenciamento de locais de armazenamento (armazans, prateleiras, setores, etc.).

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
    "name": "Armazam Principal - Setor A - Prateleira 01",
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

Buscar storage por cadigo.

**Parameters:**
- `code` (path) - Cadigo do storage

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
  "name": "Armazam Principal - Setor A - Prateleira 01",
  "companyId": 1
}
```

**Campos obrigatarios:**
- `code` - Cadigo do local, anico (max. 50 caracteres)
- `name` - Nome/descriaao do local (max. 255 caracteres)
- `companyId` - ID da empresa responsavel

**Response (201 Created):**
```json
{
  "id": 1,
  "uuid": "950e8400-e29b-41d4-a716-446655440004",
  "code": "A01-01",
  "name": "Armazam Principal - Setor A - Prateleira 01",
  "companyId": 1,
  "createdAt": "2024-11-20T12:00:00.000Z"
}
```

**Responses:**
- `201` - Storage criado com sucesso
- `409` - Storage com este cadigo ja existe

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

**Campos obrigatarios:**
- `invoiceNumber` - Namero da nota fiscal, anico (max. 50 caracteres)
- `supplierId` - ID do fornecedor
- `receivedAt` - Data/hora de recebimento (formato ISO 8601)

**Campos opcionais:**
- `status` - Status da nota (padrao: `PENDING`)

**Status da Invoice:**

| Status | Descriaao |
|--------|-----------|
| `PENDING` | Pendente de recebimento (padrao) |
| `WAITING_INSPECTION` | Aguardando inspeaao |
| `RECEIVED` | Recebida e conferida |
| `REJECTED` | Rejeitada |
| `CANCELLED` | Cancelada |

**Fluxo de Status:**
```
PENDING ✨ WAITING_INSPECTION ✨ RECEIVED
   ✨
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
- `409` - Invoice com este namero ja existe

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
    "remark": "Material em boas condiaaes",
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
  "remark": "Material em boas condiaaes"
}
```

**Campos obrigatarios:**
- `invoiceId` - ID da nota fiscal
- `materialId` - ID do material
- `quantity` - Quantidade recebida (string, suporta decimais ata 3 casas)
- `totalValue` - Valor total do item (string, suporta decimais ata 2 casas)

**Campos opcionais:**
- `status` - Status do item (padrao: `WAITING`)
- `remark` - Observaaaes sobre o item (max. 255 caracteres)

**🆕 Campo Calculado:** 
O campo `unitValue` a **calculado automáticamente** pelo banco de dados:
```sql
unitValue = totalValue / quantity
```

**Status do Invoice Item:**

| Status | Descriaao |
|--------|-----------|
| `WAITING` | Aguardando Conferência (padrao) |
| `COUNTING` | Em processo de contagem |
| `CONFORMING` | Conforme/aprovado |
| `DIVERGENT` | Divergente (quantidade ou qualidade) |
| `DAMAGED` | Danificado |
| `MISSING` | Faltando |
| `MISMATCHED` | Incompatavel com pedido |

**Fluxo de Status:**
```
WAITING ✨ COUNTING ✨ CONFORMING / DIVERGENT
   ✨
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
  "remark": "Material em boas condiaaes",
  "createdAt": "2024-11-20T13:00:00.000Z"
}
```

**Responses:**
- `201` - Item criado com sucesso
- `400` - Dados invalidos (foreign key, valores, etc.)

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

Gerenciamento de inventário. Cada registro de inventário representa um item de nota fiscal armazenado em um local especafico, garantindo **rastreabilidade completa**.

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

**🆕 Importante sobre o campo `materialId`:**
- O campo `materialId` no inventário refere-se ao **ID do invoice item** (nao do material diretamente)
- Isso garante **rastreabilidade completa**: voca sabe exatamente de qual nota fiscal veio cada item no estoque
- Mesmo material de fornecedores ou notas diferentes tera registros separados no inventário

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

Retorna todos os locais onde o item de nota fiscal especafico esta armazenado.

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

Retorna todos os itens armazenados em um local especafico.

---

#### `GET /inventories/search?invoiceItemId={id}&storageId={id}`

Buscar inventário especafico (invoice item + storage).

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

**Campos obrigatarios:**
- `invoiceItemId` - ID do item de nota fiscal
- `storageId` - ID do local de armazenamento
- `quantity` - Quantidade armazenada (string, suporta decimais ata 3 casas)

**🆕 Validaaao:** Nao a permitido criar dois registros com o mesmo `invoiceItemId` + `storageId` (constraint de unicidade).

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
- `201` - inventário criado com sucesso
- `409` - inventário para este invoice item e storage ja existe
- `400` - Invoice item ou storage nao existe

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

Gerenciamento de tarefas do armazam. As tarefas representam operaaaes que precisam ser realizadas, como Conferência, armazenamento, separaaao, etc.

#### Tipos de Tarefas

| Tipo | Descriaao | Uso Principal |
|------|-----------|---------------|
| `CONFERENCE` | Conferência de recebimento | Validar quantidade recebida vs nota fiscal |
| `STORAGE` | Armazenamento de materiais | Alocar material em local fasico |
| `PICKING` | Separaaao de materiais | Separar materiais para expediaao/uso |
| `PACKAGING` | Embalagem de materiais | Embalar materiais |
| `SHIPPING` | Expediaao | Despachar materiais |
| `INVENTORY` | inventário/Contagem | Contagem fasica de estoque |
| `DEMOBILIZATION` | Desmobilizaaao | Desmobilizar equipamentos/materiais |

#### Status de Tarefas

| Status | Descriaao |
|--------|-----------|
| `PENDING` | Pendente (padrao) |
| `IN_PROGRESS` | Em andamento |
| `COMPLETED` | Concluada |
| `CANCELLED` | Cancelada |

**Fluxo de Status:**
```
PENDING ✨ IN_PROGRESS ✨ COMPLETED
   ✨
CANCELLED
```

---

#### `GET /tasks`

Listar todas as tarefas com filtros opcionais.

**Query Parameters:**
- `status` (opcional) - Filtrar por status: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `taskType` (opcional) - Filtrar por tipo: `PICKING`, `STORAGE`, `CONFERENCE`, etc.
- `assignedUserUuid` (opcional) - Filtrar por usuário atribuado (UUID)

**Exemplos:**

```http
# Todas as tarefas
GET /tasks
Authorization: Bearer {token}

# Tarefas pendentes
GET /tasks?status=PENDING
Authorization: Bearer {token}

# Tarefas de Conferência
GET /tasks?taskType=CONFERENCE
Authorization: Bearer {token}

# Tarefas do usuário 2
GET /tasks?assignedUserUuid=2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}

# Tarefas de Conferência pendentes do usuário 2
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

# Minhas tarefas de Conferência em andamento
GET /tasks/my-tasks?status=IN_PROGRESS&taskType=CONFERENCE
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "uuid": "e8d71a24-6c83-4e69-a787-bd4de3529d94",
    "title": "Conferência - Nota 1234568",
    "description": "Lote de luvas de proteaao",
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

# Tarefas de Conferência abertas
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

# Tarefas de armazenamento concluadas
GET /tasks/closed?taskType=STORAGE
Authorization: Bearer {token}
```

---

#### `GET /tasks/user/{userUuid}`

Listar tarefas de um usuário especafico.

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

# Tarefas concluadas do usuário 1
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
  "description": "Conferir quantidade de Luvas de Seguranaa",
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
- `404` - Tarefa nao encontrada

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
  "issuedBy": "Joao Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-25T23:59:59.000Z"
}
```

**Campos obrigatarios:**
- `title` - Tatulo da tarefa (max. 255 caracteres)
- `taskType` - Tipo da tarefa: `PICKING`, `STORAGE`, `CONFERENCE`, `PACKAGING`, `SHIPPING`, `INVENTORY`, `DEMOBILIZATION`

**Campos opcionais:**
- `description` - Descriaao detalhada (max. 1024 caracteres)
- `status` - Status inicial (padrao: `PENDING`)
- `dueDate` - Data/hora limite para conclusao (formato ISO 8601)
- `invoiceId` - ID da nota fiscal relacionada
- `materialId` - ID do material relacionado
- `itemSpecification` - Especificaaao do item (max. 255 caracteres)
- `assignedUserId` - ID do usuário atribuado
- `issuedBy` - Nome de quem emitiu a tarefa (max. 255 caracteres)
- `entryDate` - Data de entrada/Criação da tarefa (formato ISO 8601)

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

**Exemplos de Criação por tipo:**

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

**Tarefa de Separaaao:**
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
- `400` - Dados invalidos

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
  "issuedBy": "Joao Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z"
}
```

**Todos os campos sao opcionais.** Envie apenas os campos que deseja atualizar.

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
  "issuedBy": "Joao Silva",
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
  "issuedBy": "Joao Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z",
  "updatedAt": "2025-11-24T11:00:00.000Z"
}
```

**Responses:**
- `200` - Tarefa atualizada com sucesso
- `404` - Tarefa nao encontrada

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

**Status validos:**
- `PENDING` - Pendente
- `IN_PROGRESS` - Em andamento
- `COMPLETED` - Concluada (atualiza `completedAt` automáticamente)
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

**🆕 Comportamento especial:**
- Quando status = `COMPLETED`, o campo `completedAt` a preenchido automáticamente com a data/hora atual
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
- `404` - Tarefa nao encontrada
- `400` - usuário nao existe

---

#### `POST /tasks/conference`

Realizar Conferência de material (tarefa de Conferência).

**🆕 Importante:** 
- A tarefa deve ter `invoiceId` e `materialId` preenchidos
- Deve existir um `invoice_item` correspondente
- A quantidade esperada vem da nota fiscal (`invoice_item.quantity`)
- Se `storageId` for fornecido e a Conferência for conforme, o inventário a criado automáticamente

**Request Body:**
```json
{
  "taskUuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "quantityFound": 145,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35",
  "storageId": 1
}
```

**Campos obrigatarios:**
- `taskUuid` - UUID da tarefa de Conferência
- `quantityFound` - Quantidade encontrada durante a Conferência
- `userUuid` - UUID do usuário que esta realizando a Conferência

**Campos opcionais:**
- `storageId` - ID do local de armazenamento (se fornecido e Conferência conforme, cria inventário automáticamente)

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
  "message": "Conferência realizada com sucesso. Quantidade esta conforme a nota fiscal. inventário criado/atualizado.",
  "quantityFound": 150,
  "expectedQuantity": 150,
  "requiresReview": false
}
```

**Exemplo - Conferência com divergancia:**

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
  "message": "DIVERGaNCIA DETECTADA: Esperado 150, mas foram encontrados 145.",
  "quantityFound": 145,
  "expectedQuantity": 150,
  "requiresReview": true
}
```

**O que acontece ao conferir:**

1. ✨ Task a atualizada:
   - `status` ✨ `COMPLETED`
   - `completedAt` ✨ data/hora atual
   - `countedQuantity` ✨ quantidade encontrada
   - `assignedUserId` ✨ usuário que conferiu

2. ✨ Invoice Item a atualizado:
   - `status` ✨ `CONFORMING` (se quantidade correta) ou `DIVERGENT` (se diferente)
   - `remark` ✨ descriaao da conformidade ou divergancia

**Cenarios de Conferência:**

| Esperado | Encontrado | Status | Mensagem |
|----------|------------|--------|----------|
| <!-- filepath: c:\Users\diego\Repo\MALLDRE WMS\5sem\WMS-API\Readme.md -->
# 🆕 Documentaaao da API - Sistema WMS (Warehouse Management System)

## 🆕 andice

1. [Visao Geral](#visao-geral)
2. [Autenticação](#Autenticação)
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
   - [Fluxo de Conferência com Tasks](#fluxo-de-Conferência-com-tasks)
5. [Cadigos de Status HTTP](#cadigos-de-status-http)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Modelo de Dados](#modelo-de-dados)
9. [Comeaando](#comeaando)
10. [Observaaaes Importantes](#observaaaes-importantes)
11. [Testando a API](#testando-a-api)
12. [Suporte](#suporte)
13. [Changelog](#changelog)

---

## 🆕 Visao Geral

Esta API REST foi desenvolvida para gerenciar operaaaes completas de um sistema WMS (Warehouse Management System), incluindo:

- ✨ Gestao de empresas e fornecedores
- ✨ Controle de categorias e materiais
- ✨ Gerenciamento de armazans (storages)
- ✨ Controle de notas fiscais e seus itens
- ✨ Rastreabilidade completa de inventário
- ✨ **Sistema de tarefas (Tasks) para operaaaes de armazam**
- ✨ **Conferência automatizada com validaaao de quantidades**

**Base URL:** `http://localhost:3000`

**Tecnologias:**
- NestJS v10
- PostgreSQL 14+
- Drizzle ORM
- JWT Authentication
- bcrypt (hash de senhas)

**Versao da API:** 1.1.0

---

## 🆕 Autenticação

Todos os endpoints (exceto `/auth/login`) requerem Autenticação via JWT Bearer Token.

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

Em todas as requisiaaes subsequentes, adicione o header:
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

**🆕 Expiraaao do Token:**
- Padrao: 1 hora
- após expirado, faaa login novamente para obter novo token

---

## 🆕 Endpoints

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

**Campos obrigatarios:**
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
- `401` - Credenciais invalidas

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
    "name": "Joao Silva",
    "createdAt": "2024-11-20T14:30:00.000Z"
  }
]
```

**🆕 Nota:** A senha nao a retornada nas respostas por seguranaa.

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
  "name": "Joao Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - usuário encontrado
- `404` - usuário nao encontrado

---

#### `POST /users`

Criar novo usuário.

**Request Body:**
```json
{
  "username": "joao.silva",
  "password": "Senha@123",
  "name": "Joao Silva"
}
```

**Campos obrigatarios:**
- `username` - Nome de usuário anico (man. 3, max. 50 caracteres)
- `password` - Senha do usuário (man. 6, max. 100 caracteres)

**Campos opcionais:**
- `name` - Nome completo do usuário (max. 255 caracteres)

**Validaaaes:**
- ✨ Username deve ter pelo menos 3 caracteres
- ✨ Senha deve ter pelo menos 6 caracteres
- ✨ Username deve ser anico no sistema
- ✨ Senha sera hasheada automáticamente antes de salvar

**Response (201 Created):**
```json
{
  "id": 2,
  "username": "joao.silva",
  "name": "Joao Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `201` - usuário criado com sucesso
- `409` - usuário com este username ja existe
- `400` - Dados invalidos (validaaao falhou)

**Exemplo de erro de validaaao:**
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
  "name": "Joao Silva Santos",
  "password": "NovaSenha@456"
}
```

**Campos opcionais:**
- `username` - Novo nome de usuário (man. 3, max. 50 caracteres)
- `password` - Nova senha (man. 6, max. 100 caracteres)
- `name` - Novo nome completo (max. 255 caracteres)

**Exemplos de atualizaaao:**

**Atualizar apenas a senha:**
```json
{
  "password": "NovaSenha@789"
}
```

**Atualizar apenas o nome:**
```json
{
  "name": "Joao Silva Santos"
}
```

**Atualizar username e nome:**
```json
{
  "username": "joao.silva2",
  "name": "Joao Silva Santos"
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "username": "joao.silva2",
  "name": "Joao Silva Santos",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - usuário atualizado com sucesso
- `404` - usuário nao encontrado
- `409` - Novo username ja existe (se tentar mudar para username em uso)
- `400` - Dados invalidos

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
  "name": "Joao Silva",
  "createdAt": "2024-11-20T14:30:00.000Z"
}
```

**Responses:**
- `200` - usuário deletado com sucesso
- `404` - usuário nao encontrado

**🆕 Atenaao:** Esta a uma exclusao permanente (hard delete). O usuário nao podera mais fazer login.

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
    "city": "Sao Paulo",
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
- `404` - Empresa nao encontrada

---

#### `GET /companies/cnpj/{cnpj}`

Buscar empresa por CNPJ.

**Parameters:**
- `cnpj` (path) - CNPJ da empresa (14 dagitos)

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
  "city": "Sao Paulo",
  "state": "SP",
  "country": "Brasil",
  "postalCode": "01234567",
  "status": "ACTIVE"
}
```

**Campos obrigatarios:**
- `cnpj` - CNPJ da empresa (14 dagitos, anico)
- `name` - Nome da empresa (max. 255 caracteres)
- `street` - Endereao (max. 255 caracteres)
- `city` - Cidade (max. 100 caracteres)
- `state` - Estado, sigla (max. 2 caracteres)
- `country` - Paas (max. 100 caracteres)
- `postalCode` - CEP (max. 10 caracteres)

**Campos opcionais:**
- `status` - Status da empresa (padrao: `ACTIVE`)

**Status disponaveis:**
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
  "city": "Sao Paulo",
  "state": "SP",
  "country": "Brasil",
  "postalCode": "01234567",
  "status": "ACTIVE",
  "createdAt": "2024-11-20T10:00:00.000Z"
}
```

**Responses:**
- `201` - Empresa criada com sucesso
- `409` - Empresa com este CNPJ ja existe

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

**Todos os campos sao opcionais.** Envie apenas os que deseja atualizar.

**Responses:**
- `200` - Empresa atualizada com sucesso
- `404` - Empresa nao encontrada

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
- `404` - Empresa nao encontrada

---

### Suppliers

Gerenciamento de fornecedores. Cada fornecedor esta vinculado a uma empresa (Company).

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
- `cnpj` (path) - CNPJ do fornecedor (14 dagitos)

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

**🆕 Importante - Reutilizaaao de Companies:** 
- Se ja existir uma `Company` com esse CNPJ, ela sera **reutilizada**
- Caso contrario, uma nova `Company` sera criada automáticamente
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
- `409` - Fornecedor com este CNPJ ja existe

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

**🆕 Nota:** Ao deletar um fornecedor, apenas o vanculo (`supplierInfo`) a removido. A `Company` permanece no banco, pois pode ter outros vanculos.

**Responses:**
- `200` - Fornecedor deletado com sucesso
- `404` - Fornecedor nao encontrado

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

**Campos obrigatarios:**
- `name` - Nome da categoria, anico (max. 100 caracteres)
- `materialUnit` - Unidade de medida padrao

**Campos opcionais:**
- `description` - Descriaao da categoria (max. 255 caracteres)

**Unidades de medida suportadas:**

| Cadigo | Descriaao |
|--------|-----------|
| `BX` | Caixa |
| `CM` | Centametro |
| `GR` | Grama |
| `KG` | Quilograma |
| `LT` | Litro |
| `M2` | Metro Quadrado |
| `M3` | Metro Cabico |
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
- `409` - Categoria com este nome ja existe

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
    "description": "Parafuso Allen M6 x 20mm - Aao Inox",
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

Buscar material por cadigo externo.

**Parameters:**
- `externalCode` (path) - Cadigo externo do material

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
  "description": "Parafuso Allen M6 x 20mm - Aao Inox",
  "materialUnit": "UN",
  "status": "ACTIVE"
}
```

**Campos obrigatarios:**
- `externalCode` - Cadigo externo do material, anico (max. 50 caracteres)
- `categoryId` - ID da categoria
- `description` - Descriaao do material (max. 255 caracteres)
- `materialUnit` - Unidade de medida (veja tabela acima)

**Campos opcionais:**
- `status` - Status do material (padrao: `ACTIVE`)

**Status do Material:**

| Status | Descriaao |
|--------|-----------|
| `ACTIVE` | Material ativo e disponavel |
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
  "description": "Parafuso Allen M6 x 20mm - Aao Inox",
  "materialUnit": "UN",
  "status": "ACTIVE",
  "createdAt": "2024-11-20T11:30:00.000Z"
}
```

**Responses:**
- `201` - Material criado com sucesso
- `409` - Material com este cadigo externo ja existe

---

#### `PUT /materials/{uuid}`

Atualizar material.

**Parameters:**
- `uuid` (path) - UUID do material

**Request Body:**
```json
{
  "description": "Parafuso Allen M6 x 20mm - Aao Inox 304",
  "status": "DISCONTINUED"
}
```

---

#### `DELETE /materials/{uuid}`

Deletar material.

---

### Storages

Gerenciamento de locais de armazenamento (armazans, prateleiras, setores, etc.).

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
    "name": "Armazam Principal - Setor A - Prateleira 01",
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

Buscar storage por cadigo.

**Parameters:**
- `code` (path) - Cadigo do storage

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
  "name": "Armazam Principal - Setor A - Prateleira 01",
  "companyId": 1
}
```

**Campos obrigatarios:**
- `code` - Cadigo do local, anico (max. 50 caracteres)
- `name` - Nome/descriaao do local (max. 255 caracteres)
- `companyId` - ID da empresa responsavel

**Response (201 Created):**
```json
{
  "id": 1,
  "uuid": "950e8400-e29b-41d4-a716-446655440004",
  "code": "A01-01",
  "name": "Armazam Principal - Setor A - Prateleira 01",
  "companyId": 1,
  "createdAt": "2024-11-20T12:00:00.000Z"
}
```

**Responses:**
- `201` - Storage criado com sucesso
- `409` - Storage com este cadigo ja existe

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

**Campos obrigatarios:**
- `invoiceNumber` - Namero da nota fiscal, anico (max. 50 caracteres)
- `supplierId` - ID do fornecedor
- `receivedAt` - Data/hora de recebimento (formato ISO 8601)

**Campos opcionais:**
- `status` - Status da nota (padrao: `PENDING`)

**Status da Invoice:**

| Status | Descriaao |
|--------|-----------|
| `PENDING` | Pendente de recebimento (padrao) |
| `WAITING_INSPECTION` | Aguardando inspeaao |
| `RECEIVED` | Recebida e conferida |
| `REJECTED` | Rejeitada |
| `CANCELLED` | Cancelada |

**Fluxo de Status:**
```
PENDING ✨ WAITING_INSPECTION ✨ RECEIVED
   ✨
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
- `409` - Invoice com este namero ja existe

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
    "remark": "Material em boas condiaaes",
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
  "remark": "Material em boas condiaaes"
}
```

**Campos obrigatarios:**
- `invoiceId` - ID da nota fiscal
- `materialId` - ID do material
- `quantity` - Quantidade recebida (string, suporta decimais ata 3 casas)
- `totalValue` - Valor total do item (string, suporta decimais ata 2 casas)

**Campos opcionais:**
- `status` - Status do item (padrao: `WAITING`)
- `remark` - Observaaaes sobre o item (max. 255 caracteres)

**🆕 Campo Calculado:** 
O campo `unitValue` a **calculado automáticamente** pelo banco de dados:
```sql
unitValue = totalValue / quantity
```

**Status do Invoice Item:**

| Status | Descriaao |
|--------|-----------|
| `WAITING` | Aguardando Conferência (padrao) |
| `COUNTING` | Em processo de contagem |
| `CONFORMING` | Conforme/aprovado |
| `DIVERGENT` | Divergente (quantidade ou qualidade) |
| `DAMAGED` | Danificado |
| `MISSING` | Faltando |
| `MISMATCHED` | Incompatavel com pedido |

**Fluxo de Status:**
```
WAITING ✨ COUNTING ✨ CONFORMING / DIVERGENT
   ✨
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
  "remark": "Material em boas condiaaes",
  "createdAt": "2024-11-20T13:00:00.000Z"
}
```

**Responses:**
- `201` - Item criado com sucesso
- `400` - Dados invalidos (foreign key, valores, etc.)

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

Gerenciamento de inventário. Cada registro de inventário representa um item de nota fiscal armazenado em um local especafico, garantindo **rastreabilidade completa**.

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

**🆕 Importante sobre o campo `materialId`:**
- O campo `materialId` no inventário refere-se ao **ID do invoice item** (nao do material diretamente)
- Isso garante **rastreabilidade completa**: voca sabe exatamente de qual nota fiscal veio cada item no estoque
- Mesmo material de fornecedores ou notas diferentes tera registros separados no inventário

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

Retorna todos os locais onde o item de nota fiscal especafico esta armazenado.

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

Retorna todos os itens armazenados em um local especafico.

---

#### `GET /inventories/search?invoiceItemId={id}&storageId={id}`

Buscar inventário especafico (invoice item + storage).

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

**Campos obrigatarios:**
- `invoiceItemId` - ID do item de nota fiscal
- `storageId` - ID do local de armazenamento
- `quantity` - Quantidade armazenada (string, suporta decimais ata 3 casas)

**🆕 Validaaao:** Nao a permitido criar dois registros com o mesmo `invoiceItemId` + `storageId` (constraint de unicidade).

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
- `201` - inventário criado com sucesso
- `409` - inventário para este invoice item e storage ja existe
- `400` - Invoice item ou storage nao existe

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

Gerenciamento de tarefas do armazam. As tarefas representam operaaaes que precisam ser realizadas, como Conferência, armazenamento, separaaao, etc.

#### Tipos de Tarefas

| Tipo | Descriaao | Uso Principal |
|------|-----------|---------------|
| `CONFERENCE` | Conferência de recebimento | Validar quantidade recebida vs nota fiscal |
| `STORAGE` | Armazenamento de materiais | Alocar material em local fasico |
| `PICKING` | Separaaao de materiais | Separar materiais para expediaao/uso |
| `PACKAGING` | Embalagem de materiais | Embalar materiais |
| `SHIPPING` | Expediaao | Despachar materiais |
| `INVENTORY` | inventário/Contagem | Contagem fasica de estoque |
| `DEMOBILIZATION` | Desmobilizaaao | Desmobilizar equipamentos/materiais |

#### Status de Tarefas

| Status | Descriaao |
|--------|-----------|
| `PENDING` | Pendente (padrao) |
| `IN_PROGRESS` | Em andamento |
| `COMPLETED` | Concluada |
| `CANCELLED` | Cancelada |

**Fluxo de Status:**
```
PENDING ✨ IN_PROGRESS ✨ COMPLETED
   ✨
CANCELLED
```

---

#### `GET /tasks`

Listar todas as tarefas com filtros opcionais.

**Query Parameters:**
- `status` (opcional) - Filtrar por status: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `taskType` (opcional) - Filtrar por tipo: `PICKING`, `STORAGE`, `CONFERENCE`, etc.
- `assignedUserUuid` (opcional) - Filtrar por usuário atribuado (UUID)

**Exemplos:**

```http
# Todas as tarefas
GET /tasks
Authorization: Bearer {token}

# Tarefas pendentes
GET /tasks?status=PENDING
Authorization: Bearer {token}

# Tarefas de Conferência
GET /tasks?taskType=CONFERENCE
Authorization: Bearer {token}

# Tarefas do usuário 2
GET /tasks?assignedUserUuid=2103e8df-f89d-47be-9be1-3a3db0172c35
Authorization: Bearer {token}

# Tarefas de Conferência pendentes do usuário 2
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

# Minhas tarefas de Conferência em andamento
GET /tasks/my-tasks?status=IN_PROGRESS&taskType=CONFERENCE
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "uuid": "e8d71a24-6c83-4e69-a787-bd4de3529d94",
    "title": "Conferência - Nota 1234568",
    "description": "Lote de luvas de proteaao",
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

# Tarefas de Conferência abertas
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

# Tarefas de armazenamento concluadas
GET /tasks/closed?taskType=STORAGE
Authorization: Bearer {token}
```

---

#### `GET /tasks/user/{userUuid}`

Listar tarefas de um usuário especafico.

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

# Tarefas concluadas do usuário 1
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
  "description": "Conferir quantidade de Luvas de Seguranaa",
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
- `404` - Tarefa nao encontrada

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
  "issuedBy": "Joao Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-25T23:59:59.000Z"
}
```

**Campos obrigatarios:**
- `title` - Tatulo da tarefa (max. 255 caracteres)
- `taskType` - Tipo da tarefa: `PICKING`, `STORAGE`, `CONFERENCE`, `PACKAGING`, `SHIPPING`, `INVENTORY`, `DEMOBILIZATION`

**Campos opcionais:**
- `description` - Descriaao detalhada (max. 1024 caracteres)
- `status` - Status inicial (padrao: `PENDING`)
- `dueDate` - Data/hora limite para conclusao (formato ISO 8601)
- `invoiceId` - ID da nota fiscal relacionada
- `materialId` - ID do material relacionado
- `itemSpecification` - Especificaaao do item (max. 255 caracteres)
- `assignedUserId` - ID do usuário atribuado
- `issuedBy` - Nome de quem emitiu a tarefa (max. 255 caracteres)
- `entryDate` - Data de entrada/Criação da tarefa (formato ISO 8601)

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

**Exemplos de Criação por tipo:**

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

**Tarefa de Separaaao:**
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
- `400` - Dados invalidos

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
  "issuedBy": "Joao Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z"
}
```

**Todos os campos sao opcionais.** Envie apenas os campos que deseja atualizar.

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
  "issuedBy": "Joao Silva",
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
  "issuedBy": "Joao Silva",
  "entryDate": "2025-11-20T10:00:00.000Z",
  "dueDate": "2025-12-23T23:59:59.000Z",
  "updatedAt": "2025-11-24T11:00:00.000Z"
}
```

**Responses:**
- `200` - Tarefa atualizada com sucesso
- `404` - Tarefa nao encontrada

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

**Status validos:**
- `PENDING` - Pendente
- `IN_PROGRESS` - Em andamento
- `COMPLETED` - Concluada (atualiza `completedAt` automáticamente)
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

**🆕 Comportamento especial:**
- Quando status = `COMPLETED`, o campo `completedAt` a preenchido automáticamente com a data/hora atual
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
- `404` - Tarefa nao encontrada
- `400` - usuário nao existe

---

#### `POST /tasks/conference`

Realizar Conferência de material (tarefa de Conferência).

**🆕 Importante:** 
- A tarefa deve ter `invoiceId` e `materialId` preenchidos
- Deve existir um `invoice_item` correspondente
- A quantidade esperada vem da nota fiscal (`invoice_item.quantity`)
- Se `storageId` for fornecido e a Conferência for conforme, o inventário a criado automáticamente

**Request Body:**
```json
{
  "taskUuid": "53a6f1c2-0dbc-4588-9195-6041b533c667",
  "quantityFound": 145,
  "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35",
  "storageId": 1
}
```

**Campos obrigatarios:**
- `taskUuid` - UUID da tarefa de Conferência
- `quantityFound` - Quantidade encontrada durante a Conferência
- `userUuid` - UUID do usuário que esta realizando a Conferência

**Campos opcionais:**
- `storageId` - ID do local de armazenamento (se fornecido e Conferência conforme, cria inventário automáticamente)

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
  "message": "Conferência realizada com sucesso. Quantidade esta conforme a nota fiscal. inventário criado/atualizado.",
  "quantityFound": 150,
  "expectedQuantity": 150,
  "requiresReview": false
}
```

**Exemplo - Conferência com divergancia:**

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
  "message": "DIVERGaNCIA DETECTADA: Esperado 150, mas foram encontrados 145.",
  "quantityFound": 145,
  "expectedQuantity": 150,
  "requiresReview": true
}
```

**O que acontece ao conferir:**

1. ✨ Task a atualizada:
   - `status` ✨ `COMPLETED`
   - `completedAt` ✨ data/hora atual
   - `countedQuantity` ✨ quantidade encontrada
   - `assignedUserId` ✨ usuário que conferiu

2. ✨ Invoice Item a atualizado:
   - `status` ✨ `CONFORMING` (se quantidade correta) ou `DIVERGENT` (se diferente)
   - `remark` ✨ descriaao da conformidade ou divergancia

**Cenarios de Conferência:**

| Esperado | Encontrado | Status | Mensagem |
|----------|------------|--------|----------|
| 150 | 150 | `CONFORMING` | ✨ Quantidade esta conforme a nota fiscal |
| 150 | 145 | `DIVERGENT` | 🆕 DIVERGaNCIA: Esperado 150, encontrado 145 |
| 150 | 155 | `DIVERGENT` | 🆕 DIVERGaNCIA: Esperado 150, encontrado 155 |

**Responses:**
- `200` - Conferência realizada (conforme ou divergente)
- `404` - Tarefa nao encontrada ou invoice item nao encontrado
- `400` - Dados invalidos ou tarefa nao a do tipo CONFERENCE

**🆕 Notas importantes:**
- A tarefa deve ser do tipo `CONFERENCE`
- Deve existir um `invoice_item` com o `invoiceId` e `materialId` especificados na tarefa
- A Conferência pode ser realizada mesmo com divergancia
- Se houver divergancia, o sistema retorna `success: false` mas registra a contagem

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
- `404` - Tarefa nao encontrada

**🆕 Atenaao:** Esta a uma exclusao permanente (hard delete). A tarefa nao podera ser recuperada.

---

## 🆕 Fluxos Completos

### Fluxo de Recebimento de Material

Este fluxo demonstra como registrar o recebimento completo de materiais de um fornecedor, desde o cadastro ata o inventário.

#### 1🆕 Autenticação

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

✨ Guarde o `access_token` e use em todas as praximas requisiaaes.

---

#### 2🆕 Criar Categoria de Material

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

✨ Guarde o `id: 1`

---

#### 3🆕 Criar Materiais

```http
POST /materials
Authorization: Bearer {token}
Content-Type: application/json

{
  "externalCode": "PAR-001",
  "categoryId": 1,
  "description": "Parafuso Allen M6 x 20mm - Aao Inox",
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
  "description": "Parafuso Allen M6 x 20mm - Aao Inox",
  "materialUnit": "UN",
  "status": "ACTIVE",
  "createdAt": "2024-11-20T11:30:00.000Z"
}
```

✨ Guarde o `id: 4`

Repita para criar outros materiais (PAR-002, FER-001, etc.).

---

#### 4🆕 Criar Fornecedor

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

✨ Guarde o `id: 1`

---

#### 5🆕 Criar Storage (Local de Armazenamento)

```http
POST /storages
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "A01-01",
  "name": "Armazam Principal - Setor A - Prateleira 01",
  "companyId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "uuid": "950e8400-e29b-41d4-a716-446655440004",
  "code": "A01-01",
  "name": "Armazam Principal - Setor A - Prateleira 01",
  "companyId": 1,
  "createdAt": "2024-11-20T12:00:00.000Z"
}
```

✨ Guarde o `id: 1`

---

#### 6🆕 Criar Nota Fiscal

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

✨ Guarde o `id: 1`

---

#### 7🆕 Adicionar Itens a Nota Fiscal

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
  "remark": "Material conforme especificaaao"
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
  "remark": "Material conforme especificaaao",
  "createdAt": "2024-11-20T13:00:00.000Z"
}
```

✨ Guarde o `id: 2`

Repita para adicionar outros itens da nota fiscal.

---

#### 8🆕 Conferir e Aprovar Item

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

#### 9🆕 Registrar no inventário

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

🆕 **Agora voca tem rastreabilidade completa:**
- Sabe que esse estoque veio do **invoice item #2**
- Da **nota fiscal NF-2024-001**
- Do **fornecedor ABC** (CNPJ 98765432109876)
- Material **PAR-001** (Parafuso Allen M6 x 20mm)
- Esta no **storage A01-01** (Armazam Principal - Setor A - Prateleira 01)
- Quantidade: **1000 unidades disponaveis**

---

### Fluxo de Conferência com Tasks

Este fluxo demonstra como usar o sistema de tarefas para gerenciar a Conferência de materiais recebidos.

#### 1🆕 Criar Tarefa de Conferência

após receber a nota fiscal, crie uma tarefa para conferir o material:

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
  "itemSpecification": "Parafuso Allen M6 x 20mm - Aao Inox",
  "issuedBy": "Joao Silva - Supervisor",
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

✨ Tarefa criada e aguardando atribuiaao

---

#### 2🆕 Listar Tarefas Pendentes

O operador do armazam visualiza suas tarefas pendentes:

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
    "issuedBy": "Joao Silva - Supervisor"
  }
]
```

---

#### 3🆕 Atribuir Tarefa a um Operador

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

#### 4🆕 Operador Inicia a Conferência

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

#### 5🆕 Realizar a Conferência

O operador conta os materiais e registra o resultado:

**Cenario A - Quantidade Conforme:**

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
  "message": "Conferência realizada com sucesso. Quantidade esta conforme a nota fiscal. inventário criado/atualizado.",
  "quantityFound": 1000,
  "expectedQuantity": 1000,
  "requiresReview": false
}
```

✨ **O que aconteceu:**
- Task ✨ Status `COMPLETED` com `completedAt` preenchido
- Invoice Item ✨ Status `CONFORMING`
- Material pode ser armazenado

---

**Cenario B - Divergancia na Quantidade:**

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

**Response (Divergancia):**
```json
{
  "success": false,
  "message": "DIVERGaNCIA DETECTADA: Esperado 1000, mas foram encontrados 950.",
  "quantityFound": 950,
  "expectedQuantity": 1000,
  "requiresReview": true
}
```

🆕 **O que aconteceu:**
- Task ✨ Status `COMPLETED` (Conferência finalizada)
- Invoice Item ✨ Status `DIVERGENT` com observaaao da diferenaa
- Supervisor precisa revisar e tomar aaao

---

#### 6🆕 Consultar Status da Conferência

Verificar o status da tarefa concluada:

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

#### 7🆕 Listar Tarefas Concluadas

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

## 🆕 Cadigos de Status HTTP

| Cadigo | Descriaao | Quando ocorre |
|--------|-----------|---------------|
| `200 OK` | Requisiaao bem-sucedida | GET, PUT, DELETE com sucesso |
| `201 Created` | Recurso criado com sucesso | POST com sucesso |
| `400 Bad Request` | Dados invalidos na requisiaao | Campos obrigatarios faltando, tipos errados, foreign keys invalidas |
| `401 Unauthorized` | Token ausente ou invalido | Sem token, token expirado, token malformado |
| `404 Not Found` | Recurso nao encontrado | UUID nao existe, recurso foi deletado |
| `409 Conflict` | Conflito de dados | CNPJ duplicado, cadigo externo duplicado, constraint de unicidade |
| `500 Internal Server Error` | Erro interno do servidor | Erro nao tratado, problema no banco de dados |

---

## 🆕 Tratamento de Erros

### Erro 401 - Nao autenticado

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Soluaao:** Faaa login novamente para obter um novo token valido.

---

### Erro 404 - Recurso nao encontrado

```json
{
  "statusCode": 404,
  "message": "User with UUID 550e8400-e29b-41d4-a716-446655440000 not found"
}
```

**Soluaao:** Verifique se o UUID esta correto. O recurso pode ter sido deletado.

---

### Erro 409 - Conflito (duplicaaao)

```json
{
  "statusCode": 409,
  "message": "Company with this CNPJ already exists"
}
```

**Soluaao:** 
- O recurso que voca esta tentando criar ja existe
- Use o endpoint de busca para encontra-lo
- Ou atualize o existente com PUT

---

### Erro 400 - Foreign Key invalida

```json
{
  "statusCode": 400,
  "message": "insert or update on table \"invoice_item\" violates foreign key constraint",
  "detail": "Key (material_id)=(99) is not present in table \"material\"."
}
```

**Soluaao:** 
- O ID referenciado nao existe
- Crie o recurso pai antes (ex: material, invoice, supplier, etc.)
- Verifique se os IDs estao corretos

---

### Erro 400 - Validaaao de dados

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

**Soluaao:** Corrija os campos indicados na mensagem de erro.

---

## 🆕 Modelo de Dados

### Diagrama de Relacionamentos Completo

```
+---------------------+
a       User          a
a---------------------a
a id (PK)             a
a uuid (unique)       a
a username (unique)   a
a password (hash)     a
a name                a
a createdAt           a
+---------------------+
         ✨
         a assignedUserId
         a
+---------------------+       +---------------------+
a      Company        a       a   MaterialCategory  a
a---------------------a       a---------------------a
a id (PK)             a       a id (PK)             a
a uuid (unique)       a       a uuid (unique)       a
a cnpj (unique)       a       a name (unique)       a
a name                a       a description         a
a street              a       a materialUnit        a
a city                a       a createdAt           a
a state               a       +---------------------+
a country             a                a
a postalCode          a                a categoryId
a status              a                ✨
a createdAt           a       +---------------------+
+---------------------+       a      Material       a
         a                    a---------------------a
         a companyId          a id (PK)             a
         a                    a uuid (unique)       a
         ✨                    a externalCode (uniq) a
+---------------------+       a categoryId (FK)     a
a   SupplierInfo      a       a description         a
a---------------------a       a materialUnit        a
a id (PK)             a       a status              a
a uuid (unique)       a       a createdAt           a
a companyId (FK)      a       +---------------------+
a createdAt           a                a
+---------------------+                a materialId
         a                             a
         a supplierId                  a
         ✨                             ✨
+---------------------+       +---------------------+
a      Invoice        a       a    InvoiceItem      a
a---------------------a       a---------------------a
a id (PK)             a       a id (PK)             a
a uuid (unique)       a       a uuid (unique)       a
a invoiceNumber (uniq)a?------a invoiceId (FK)      a
a supplierId (FK)     a       a materialId (FK)     a
a receivedAt          a       a quantity            a
a status              a       a totalValue          a
a createdAt           a       a unitValue (calc)    a
+---------------------+       a status              a
         a                    a remark              a
         a invoiceId          a createdAt           a
         a                    +---------------------+
         a                             a
         a                             a invoiceItemId
         a                             ✨
         a                    +---------------------+
         a                    a     Inventory       a
         a                    a---------------------a
         a                    a id (PK)             a
         a                    a uuid (unique)       a
         a                    a invoiceItemId (FK)  a
         a                    a storageId (FK)      a
         a                    a quantity            a
         a                    a reserved            a
         a                    a available (calc)    a
         a                    a createdAt           a
         a                    +---------------------+
         a                             a
         a                             a
         ✨                             ✨
+---------------------+       +---------------------+
a        Task         a       a      Storage        a
a---------------------a       a---------------------a
a id (PK)             a       a id (PK)             a
a uuid (unique)       a       a uuid (unique)       a
a title               a       a code (unique)       a
a description         a       a name                a
a status              a       a companyId (FK)      a
a dueDate             a       a createdAt           a
a createdAt           a       +---------------------+
a taskType            a
a invoiceId (FK)      a
a materialId (FK)     a
a itemSpecification   a
a assignedUserId (FK) a
a issuedBy            a
a entryDate           a
a completedAt         a
a expectedQuantity    a
a countedQuantity     a
a countAttempts       a
a lastCountAt         a
+---------------------+

**Legenda:**
- PK = Primary Key (id interno, nao exposto na API)
- FK = Foreign Key (relacionamento entre tabelas)
- (unique) = Constraint de unicidade
- (calc) = Campo calculado automáticamente
- (hash) = Campo com hash bcrypt
```

### Principais Relacionamentos

1. **Company ✨ SupplierInfo**: 1:N (uma empresa pode ser fornecedor)
2. **Company ✨ Storage**: 1:N (uma empresa pode ter varios storages)
3. **MaterialCategory ✨ Material**: 1:N (uma categoria tem varios materiais)
4. **Supplier ✨ Invoice**: 1:N (um fornecedor emite varias notas)
5. **Invoice ✨ InvoiceItem**: 1:N (uma nota tem varios itens)
6. **Material ✨ InvoiceItem**: 1:N (um material pode estar em varios itens)
7. **InvoiceItem ✨ Inventory**: 1:N (um item pode estar em varios locais)
8. **Storage ✨ Inventory**: 1:N (um local armazena varios itens)
9. **User ✨ Task**: 1:N (um usuário tem varias tarefas atribuídas)
10. **Invoice ✨ Task**: 1:N (uma nota gera varias tarefas)
11. **Material ✨ Task**: 1:N (um material pode ter varias tarefas)

### Rastreabilidade Completa

```
+-------------+
a  Material   a (O que?)
+-------------+
       a
       ✨
+-------------+
aInvoiceItem  a (Quanto? Por quanto?)
+-------------+
       a
       +--✨ Invoice --✨ Supplier --✨ Company (De quem? Quando?)
       a
       +--✨ Inventory --✨ Storage --✨ Company (Onde?)
              a
              +--✨ Task (Quem conferiu? Quando?)
```

**Com este modelo voca consegue:**
- ✨ Rastrear cada unidade de material ata sua origem (nota fiscal + fornecedor)
- ✨ Saber exatamente onde cada lote esta armazenado
- ✨ Identificar quem conferiu, armazenou e movimentou cada item
- ✨ Separar estoques do mesmo material de fornecedores diferentes
- ✨ Manter histarico completo de operaaaes via Tasks
- ✨ Calcular valores unitarios automáticamente
- ✨ Controlar quantidade disponavel vs reservada

---

## 🆕 Observaaaes Importantes

### 1. Rastreabilidade Completa

O sistema garante rastreabilidade atravas da seguinte cadeia:

```
Material ----+
             ✨
         Invoice Item ----✨ Inventory ----✨ Storage
             ✨
             a
         Invoice
             ✨
             a
         Supplier
             ✨
             a
         Company
```

**Voca sempre sabe:**
- ✨ De qual fornecedor veio o material
- ✨ Em qual nota fiscal foi recebido
- ✨ Qual item especafico da nota (com quantidade e valor)
- ✨ Onde esta armazenado
- ✨ Quantidade disponavel e reservada

**Exemplo pratico:**

Se voca tem 2000 parafusos PAR-001 no estoque, sendo:
- 1000 da NF-2024-001 (Fornecedor ABC) no storage A01-01
- 1000 da NF-2024-010 (Fornecedor XYZ) no storage B02-03

Voca consegue rastrear cada lote separadamente, mesmo sendo o mesmo material!

---

### 2. Reutilizaaao de Companies

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
2. **Se existir:** Reutiliza a `Company` existente e apenas cria o vanculo `SupplierInfo`
3. **Se nao existir:** Cria nova `Company` + novo `SupplierInfo`

**Benefacios:**
- ✨ A mesma empresa pode ser fornecedor e cliente
- ✨ Evita duplicaaao de dados de empresas
- ✨ Mantam histarico unificado por CNPJ

---

### 3. Campos Calculados automáticamente

Alguns campos sao **calculados automáticamente pelo PostgreSQL** usando generated columns:

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
- Calculado automáticamente quando `totalValue` ou `quantity` mudam
- Armazenado fisicamente no banco (STORED)
- Nao pode ser inserido ou atualizado manualmente
- Previne divisao por zero

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
  "unitValue": "0.500000"  // ✨ Calculado automáticamente
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
- Calculado automáticamente quando `quantity` ou `reserved` mudam
- Sempre reflete a quantidade realmente disponavel
- Nao pode ser inserido ou atualizado manualmente

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
  "available": "1000.000"  // ✨ Calculado automáticamente
}

// após reservar 250 unidades:
PUT /inventories/{uuid}
{
  "reserved": "250"
}

// Resposta:
{
  "quantity": "1000.000",
  "reserved": "250.000",
  "available": "750.000"  // ✨ Atualizado automáticamente
}
```

**🆕 Importante:**
- Estes campos sao **read-only** na API
- Qualquer tentativa de enviar valores para eles sera **ignorada**
- O PostgreSQL garante que os valores estao sempre corretos
- Use-os para consultas e relatarios com seguranaa

---

### 4. Status e Fluxos

#### Material Status
```
DEVELOPMENT ✨ ACTIVE ✨ INACTIVE ✨ DISCONTINUED
      ✨
   ACTIVE (aprovado)
```

#### Invoice Status
```
PENDING ✨ WAITING_INSPECTION ✨ RECEIVED
   ✨
REJECTED
   ✨
CANCELLED
```

#### Invoice Item Status
```
WAITING ✨ COUNTING ✨ CONFORMING
   a         a
   a         +-----✨ DIVERGENT
   a
   +-----✨ DAMAGED / MISSING / MISMATCHED
```

#### Task Status
```
PENDING ✨ IN_PROGRESS ✨ COMPLETED
   ✨
CANCELLED
```

---

### 5. Soft Delete vs Hard Delete

**Hard Delete (usado atualmente):**
- Todos os endpoints DELETE fazem exclusao permanente
- Dados sao removidos fisicamente do banco
- Nao ha recuperaaao possavel

**🆕 Cuidado:** Antes de deletar, certifique-se de que nao ha dependancias:
- Nao delete Companies que tam Suppliers/Customers
- Nao delete Materials que tam Invoice Items
- Nao delete Storages que tam Inventory

---

### 6. Unicidade e Constraints

**Campos únicos no sistema:**
- `users.username` - Nome de usuário
- `companies.cnpj` - CNPJ da empresa
- `materials.externalCode` - Cadigo externo do material
- `materialCategories.name` - Nome da categoria
- `storages.code` - Cadigo do local
- `invoices.invoiceNumber` - Namero da nota fiscal
- `(inventories.invoiceItemId, inventories.storageId)` - Par anico de invoice item + storage

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

### 8. Precisao Numarica

#### Quantidades (quantity, reserved, available):
- Tipo: `NUMERIC(10, 3)`
- Precisao: 10 dagitos no total
- Escala: 3 casas decimais
- Exemplo: `1234567.890`

#### Valores monetarios (totalValue, unitValue):
- `totalValue`: `NUMERIC(10, 2)` ✨ 2 casas decimais
- `unitValue`: `NUMERIC(15, 6)` ✨ 6 casas decimais (para calculo preciso)
- Exemplo total: `12345678.90`
- Exemplo unitario: `123456789.012345`

**🆕 Envie sempre como string para preservar precisao:**
```json
{
  "quantity": "1000.500",
  "totalValue": "15000.75"
}
```

---

### 9. Sistema de Tasks

**Boas praticas:**

✨ **Criar tasks automáticamente:**
- Ao receber nota fiscal ✨ criar task de CONFERENCE
- após Conferência ✨ criar task de STORAGE
- Quando preciso separar ✨ criar task de PICKING

✨ **Atribuiaao de tasks:**
- Use `assignedUserId` para designar responsavel
- Tasks sem atribuiaao ficam no "pool" para qualquer um pegar

✨ **Conferência com tasks:**
- Sempre use o endpoint `/tasks/conference` para conferir
- Isso garante registro de quem conferiu e quando
- Detecta automáticamente divergancias

✨ **Monitoramento:**
- Use `/tasks/open` para ver trabalho pendente
- Use `/tasks/closed` para ver histarico
- Use filtros por `taskType` para analise especafica

---

### 10. Sistema de Identificadores (ID vs UUID)

#### Por que dois identificadores?

**ID (interno - nao exposto):**
- Tipo: `SERIAL` (auto-incremento)
- Uso: Foreign keys internas do banco
- Performance: andices mais rapidos
- **Nunca** retornado nas respostas da API

**UUID (pablico - exposto):**
- Tipo: `UUID v4`
- Uso: Identificador pablico em todas as respostas
- Seguranaa: Nao revela informaaaes sobre quantidade de registros
- Portabilidade: anico globalmente

#### Como funciona na pratica

**✨ Errado - Usar ID interno:**
```http
GET /materials/4
Authorization: Bearer {token}

// Erro 404 - Endpoint nao existe
```

**✨ Correto - Usar UUID:**
```http
GET /materials/850e8400-e29b-41d4-a716-446655440003
Authorization: Bearer {token}

// Funciona!
```

#### Estrutura de Resposta

```json
{
  // ✨ "id" nao a retornado
  "uuid": "850e8400-e29b-41d4-a716-446655440003",  // ✨ Use este
  "externalCode": "PAR-001",
  "categoryId": 1,  // 🆕 Foreign key - apenas para referancia
  "description": "Parafuso Allen M6 x 20mm",
  "createdAt": "2024-11-20T11:30:00.000Z"
}
```

#### Foreign Keys

Foreign keys usam **ID numarico interno** por performance:

```json
POST /invoice-items
{
  "invoiceId": 1,      // 🆕 ID numarico (interno)
  "materialId": 4,     // 🆕 ID numarico (interno)
  "quantity": "100",
  "totalValue": "1500.00"
}
```

**Como obter o ID numarico?**

1. Ao criar um recurso, guarde o `id` da resposta
2. Ou busque pelo UUID e use o `id` retornado
3. Ou busque por outros campos (cadigo, nome, etc.)

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
  "id": 4,  // ✨ Guarde este ID para usar em foreign keys
  "uuid": "850e8400-e29b-41d4-a716-446655440003",
  "externalCode": "PAR-001"
}

// 2. Criar invoice item usando o ID
POST /invoice-items
{
  "materialId": 4,  // ✨ Use o ID recebido acima
  "invoiceId": 1,
  "quantity": "100"
}
```

#### Busca por UUID vs Busca por ID

| Operaaao | Usa UUID | Usa ID | Exemplo |
|----------|----------|--------|---------|
| GET especafico | ✨ Sim | ✨ Nao | `GET /materials/{uuid}` |
| PUT/DELETE | ✨ Sim | ✨ Nao | `PUT /materials/{uuid}` |
| POST (foreign key) | ✨ Nao | ✨ Sim | `materialId: 4` |
| Relacionamentos | ✨ Nao | ✨ Sim | `invoiceId: 1` |

#### Benefacios desta Abordagem

✨ **Seguranaa:** UUIDs nao revelam quantidade de registros
✨ **Performance:** IDs numéricos para joins sao mais rapidos
✨ **Portabilidade:** UUIDs podem ser gerados no client se necessario
✨ **Escalabilidade:** Facil migraaao entre bancos diferentes

---

## 🆕 Comeaando

### Pra-requisitos

- Node.js v18 ou superior
- PostgreSQL v14 ou superior
- npm ou yarn

### Instalaaao

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuário/wms-api.git
cd wms-api
```

2. **Instale as dependancias:**
```bash
npm install
```

3. **Configure as Variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://usuário:senha@localhost:5432/wms_db

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

# Produaao
npm run build
npm run start:prod
```

6. **Acesse a aplicaaao:**
- API: `http://localhost:3000`

---

## 🆕 Testando a API

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

**🆕 Dica:** Use o arquivo `test-all-routes.http` na raiz do projeto! Ele contam **80+ exemplos prontos** de requisiaaes organizadas por madulo.

### Usando o arquivo test-all-routes.http

O projeto inclui um arquivo completo com todos os endpoints testados. Voca pode usa-lo com:

- **VS Code:** Instale a extensao [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- **IntelliJ/WebStorm:** Suporte nativo para arquivos `.http`

**Como usar:**

1. **Configure as Variáveis:**
   - Altere `@baseUrl` se necessario (padrao: `http://localhost:3000`)
   - após fazer login, copie o `access_token` e cole em `@token`

2. **Execute as requisiaaes:**
   - Clique em "Send Request" acima de cada requisiaao
   - Ou use o atalho `Ctrl+Alt+R` (VS Code)

3. **Navegue pelos módulos:**
   - O arquivo esta organizado em seaaes por madulo
   - Use a estrutura de navegaaao do editor para pular entre seaaes

**Benefacios:**

✨ **Todos os endpoints testados** - Nao precisa escrever cURL ou Postman collections
✨ **Exemplos de todos os cenarios** - Criação, atualizaaao, busca, deleaao
✨ **Variáveis reutilizaveis** - Defina `@token` uma vez, use em todas as requisiaaes
✨ **Sintaxe simples** - Mais facil que cURL, mais rapido que Postman
✨ **Versionado com o cadigo** - Sempre atualizado com as Mudanças da API
✨ **Facil compartilhamento** - Envie o arquivo para o time usar

**Exemplo de uso pratico:**

```http
### 1. Faaa login primeiro
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

**🆕 localização:** `/test-all-routes.http` na raiz do projeto

**🆕 módulos incluados:**
- ✨ Auth (Login)
- ✨ Users (CRUD completo)
- ✨ Companies (CRUD completo)
- ✨ Suppliers (CRUD completo)
- ✨ Material Categories (CRUD completo)
- ✨ Materials (CRUD completo)
- ✨ Storages (CRUD completo + lista de nomes)
- ✨ Invoices (CRUD completo)
- ✨ Invoice Items (CRUD completo + filtros)
- ✨ Inventories (CRUD completo + buscas avanaadas)
- ✨ Tasks (CRUD completo + Conferência + filtros + atribuiaao)

**✨ Produtividade:** Com o arquivo `.http`, voca pode testar toda a API em minutos!


### Usando Postman

1. Importe a collection (se disponavel)
2. Configure a variavel `{{baseUrl}}` = `http://localhost:3000`
3. Configure a variavel `{{token}}` após o login
4. Use `{{token}}` no header Authorization

---

## 🆕 Suporte

Para davidas, problemas ou sugestaes:

- 🆕 Email: contato@wms.com
- 🆕 Issues: https://github.com/seu-usuário/wms-api/issues
- 🆕 Wiki: https://github.com/seu-usuário/wms-api/wiki

---

## 🆕 Licenaa

Este projeto esta sob a licenaa MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🆕 Contribuindo

Contribuiaaes sao bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas Mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 🆕 Changelog

### [1.1.0] - 2024-11-24

#### Adicionado
- ✨ Sistema completo de Tasks (Tarefas)
- ✨ Endpoint de Conferência com validaaao automática
- ✨ Filtros avanaados para listagem de tasks
- ✨ Atribuiaao de tasks a usuários
- ✨ Integraaao tasks + invoice items para Conferência
- ✨ Campos de rastreamento de contagem (countedQuantity, countAttempts, lastCountAt)

#### Modificado
- 🆕 Documentaaao expandida com fluxos de tasks
- 🆕 Melhorias na rastreabilidade de operaaaes

### [1.0.0] - 2024-11-20

#### Adicionado
- ✨ Sistema completo de Autenticação JWT
- ✨ CRUD completo de Users (com hash de senha)
- ✨ CRUD completo de Companies
- ✨ CRUD completo de Suppliers (com reutilizaaao de Companies)
- ✨ CRUD completo de Material Categories
- ✨ CRUD completo de Materials
- ✨ CRUD completo de Storages
- ✨ CRUD completo de Invoices
- ✨ CRUD completo de Invoice Items (com calculo automatico de unit value)
- ✨ CRUD completo de Inventories (com rastreabilidade por invoice item)
- ✨ Validaaao de dados em todos os endpoints
- ✨ Tratamento de erros padronizado
- ✨ Hash automatico de senhas com bcrypt

---

**Versao da API:** 1.1.0  
**altima atualizaaao:** 24 de Novembro de 2024  
**Desenvolvido com:** 🆕 e NestJS









