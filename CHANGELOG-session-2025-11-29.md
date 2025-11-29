# Changelog - Sessão 29/11/2025

## Resumo das Alterações

Esta sessão focou na **migração completa de IDs numéricos para UUIDs** nos endpoints de Tasks e na **correção de bugs críticos** relacionados a queries de banco de dados e tratamento de erros.

---

## 🔄 Refatoração Completa: Tasks API - Migração para UUIDs

### Contexto
A API estava expondo IDs numéricos internos nos endpoints de Tasks, o que viola boas práticas de segurança e design de API. Todas as rotas foram refatoradas para aceitar e retornar apenas UUIDs.

### Arquivos Modificados

#### 1. **src/tasks/tasks.controller.ts**
- ✅ Adicionado `NotFoundException` aos imports do NestJS
- ✅ Injetado `InvoiceService` no construtor para conversão de UUIDs
- ✅ Alterado 7 endpoints para usar UUIDs:

**Mudanças nos Query Parameters:**
```typescript
// ANTES
@Query('assignedUserId') assignedUserId?: string

// DEPOIS
@Query('assignedUserUuid') assignedUserUuid?: string
```

**Mudanças nos Path Parameters:**
```typescript
// ANTES
@Get('user/:userId')
async findUserTasks(@Param('userId') userId: string)

// DEPOIS
@Get('user/:userUuid')
async findUserTasks(@Param('userUuid') userUuid: string)
```

```typescript
// ANTES
@Get('invoice/:invoiceId')
async findByInvoiceId(@Param('invoiceId') invoiceId: string)

// DEPOIS
@Get('invoice/:invoiceUuid')
async findByInvoiceId(@Param('invoiceUuid') invoiceUuid: string)
```

**Mudanças nos Request Bodies:**
```typescript
// ANTES - Assign Task
@Body() body: { userId: number }

// DEPOIS - Assign Task
@Body() body: { userUuid: string }
```

```typescript
// ANTES - Conference
@Body() body: { 
  taskUuid: string; 
  quantityFound: number; 
  userId: number;
  storageId?: number;
}

// DEPOIS - Conference
@Body() body: { 
  taskUuid: string; 
  quantityFound: number; 
  userUuid: string;
  storageId?: number;
}
```

**Tratamento de Erros Aprimorado:**
- Substituído `throw new Error()` por `throw new NotFoundException()` em todos os endpoints
- Mensagens de erro mais descritivas e específicas
- Retorno consistente de HTTP 404 quando recursos não são encontrados

**Endpoints Atualizados:**
1. `GET /tasks?assignedUserUuid={uuid}` - Listar tasks com filtro por usuário
2. `GET /tasks/open?assignedUserUuid={uuid}` - Tasks abertas por usuário
3. `GET /tasks/closed?assignedUserUuid={uuid}` - Tasks fechadas por usuário
4. `GET /tasks/user/{userUuid}` - Tasks de um usuário específico
5. `GET /tasks/invoice/{invoiceUuid}` - Tasks de uma invoice específica
6. `PUT /tasks/{uuid}/assign` - Atribuir task (agora usa `userUuid`)
7. `POST /tasks/conference` - Realizar conferência (agora usa `userUuid`)

#### 2. **src/tasks/tasks.module.ts**
```typescript
// Adicionado InvoiceModule aos imports
imports: [
  InvoiceItemModule, 
  InvoiceModule,  // ← NOVO
  MaterialModule, 
  InventoryModule, 
  StorageModule, 
  UsersModule
]
```

---

## 🐛 Correção de Bugs Críticos

### Bug 1: Invoice Items Retornando Array Vazio

**Problema Identificado:**
O endpoint `GET /invoice-items/invoice/{uuid}` retornava array vazio mesmo quando a invoice existia e tinha items.

**Causa Raiz:**
Query SQL com `LEFT JOIN` + `WHERE` na tabela joined se comportava como `INNER JOIN`, excluindo invoices sem items.

**Solução Implementada:**

#### **src/invoice_items/invoice_item.repository.ts**

```typescript
// ANTES - Query em uma etapa
async findByInvoiceUuid(invoiceUuid: string): Promise<InvoiceItemWithDetails[]> {
  const result = await this.db
    .select({ /* ... */ })
    .from(schema.invoiceItems)
    .leftJoin(schema.invoices, eq(schema.invoiceItems.invoiceId, schema.invoices.id))
    .where(eq(schema.invoices.uuid, invoiceUuid))  // ← Problema!
    .orderBy(desc(schema.invoiceItems.createdAt));
  
  return result;
}

// DEPOIS - Query em duas etapas
async findByInvoiceUuid(invoiceUuid: string): Promise<InvoiceItemWithDetails[] | null> {
  // 1. Buscar invoice pelo UUID para obter o ID
  const invoice = await this.db
    .select({ id: schema.invoices.id })
    .from(schema.invoices)
    .where(eq(schema.invoices.uuid, invoiceUuid))
    .limit(1);

  // 2. Se não encontrar, retorna null
  if (!invoice || invoice.length === 0) {
    return null;
  }

  // 3. Buscar items usando o invoiceId
  const result = await this.db
    .select({ /* ... */ })
    .from(schema.invoiceItems)
    .leftJoin(/* ... */)
    .where(eq(schema.invoiceItems.invoiceId, invoice[0].id))  // ← Correto!
    .orderBy(desc(schema.invoiceItems.createdAt));
  
  return result;
}
```

**Mudanças no Tipo de Retorno:**
- Alterado de `InvoiceItemWithDetails[]` para `InvoiceItemWithDetails[] | null`
- Permite distinguir entre "invoice não existe" e "invoice existe mas não tem items"

#### **src/invoice_items/invoice_item.service.ts**

```typescript
// Adicionado tratamento de erro
async findByInvoiceUuid(invoiceUuid: string) {
  const items = await this.invoiceItemRepository.findByInvoiceUuid(invoiceUuid);
  
  // Lançar erro 404 se invoice não existir
  if (items === null) {
    throw new NotFoundException(`Invoice with UUID ${invoiceUuid} not found`);
  }
  
  return items;
}
```

**Resultados:**
- ✅ Retorna array vazio quando invoice existe mas não tem items
- ✅ Retorna HTTP 404 quando invoice não existe
- ✅ Comportamento correto e previsível

---

### Bug 2: Rota de Username Inacessível

**Problema:**
`GET /users/joaosilva` retornava erro 500 Internal Server Error

**Causa:**
Ordem incorreta das rotas no controller - rota genérica `@Get(':uuid')` estava antes da rota específica `@Get('username/:username')`

**Solução:**

#### **src/users/users.controller.ts**

```typescript
// ANTES - Ordem incorreta
@Get()
async findAll() { /* ... */ }

@Get(':uuid')  // ← Captura TUDO primeiro
async findByUuid(@Param('uuid') uuid: string) { /* ... */ }

@Get('username/:username')  // ← Nunca alcançado
async findByUsername(@Param('username') username: string) { /* ... */ }

// DEPOIS - Ordem correta
@Get()
async findAll() { /* ... */ }

@Get('username/:username')  // ← Específico primeiro
async findByUsername(@Param('username') username: string) { /* ... */ }

@Get(':uuid')  // ← Genérico depois
async findByUuid(@Param('uuid') uuid: string) { /* ... */ }
```

**Regra NestJS:**
Rotas mais específicas devem vir antes de rotas com parâmetros genéricos.

---

## 🆕 Novos Métodos Implementados

### Conversão UUID → ID Interno

#### **src/invoices/invoice.repository.ts**
```typescript
async getInternalIdByUuid(uuid: string): Promise<number | null> {
  const [invoice] = await this.db
    .select({ id: invoices.id })
    .from(invoices)
    .where(eq(invoices.uuid, uuid))
    .limit(1);
  
  return invoice?.id || null;
}
```

#### **src/invoices/invoice.service.ts**
```typescript
async getInternalIdByUuid(uuid: string): Promise<number | null> {
  return await this.invoiceRepository.getInternalIdByUuid(uuid);
}
```

**Uso:**
Permite que controllers aceitem UUIDs e convertam para IDs internos antes de chamar os services.

---

## 📝 Documentação Atualizada

### **Readme.md**
Atualizada toda a seção de Tasks com:

1. **Query Parameters atualizados:**
   - `assignedUserId` → `assignedUserUuid`
   - Todos os exemplos com UUIDs reais

2. **Path Parameters atualizados:**
   - `/tasks/user/{userId}` → `/tasks/user/{userUuid}`
   - `/tasks/invoice/{invoiceId}` → `/tasks/invoice/{invoiceUuid}`

3. **Request Bodies atualizados:**
   - `userId` → `userUuid` em todos os endpoints
   - Exemplos com UUIDs válidos

4. **Campos opcionais documentados:**
   - `storageId` no endpoint de conferência
   - Explicação de criação automática de inventário

5. **Mensagens de erro atualizadas:**
   - HTTP 404 com mensagens descritivas
   - Exemplos de responses de erro

### **test-all-routes.http**
Atualizado arquivo de testes com:
- Token JWT atualizado
- Endpoint de username corrigido: `/users/username/joaosilva`
- UUIDs atualizados em todos os exemplos de tasks
- Request bodies usando `userUuid` em vez de `userId`

---

## 🏗️ Padrão de Arquitetura Estabelecido

### Conversão UUID ↔ ID

```
┌─────────────┐
│  Controller │  ← Aceita UUID do cliente
└──────┬──────┘
       │ 1. Recebe UUID
       │ 2. Converte para ID usando service
       │ 3. Valida (404 se não existe)
       ▼
┌─────────────┐
│   Service   │  ← Trabalha com IDs internos
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │  ← Queries no banco com IDs
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │  ← Armazena ID (numeric) e UUID
└─────────────┘
```

**Vantagens:**
- ✅ API externa usa apenas UUIDs (seguro)
- ✅ Banco interno usa IDs numéricos (performance)
- ✅ Conversão centralizada nos controllers
- ✅ Tratamento de erro consistente

---

## 🧪 Testes e Validação

### Arquivo de Teste Criado
**test-invoice-items.js** - Script Node.js para debugar queries

```javascript
// Testa queries de invoice items diretamente no banco
// Compara query simples vs query com JOIN
// Identifica problemas de LEFT JOIN + WHERE
```

### Endpoints Testados
- ✅ `GET /users/username/joaosilva` - Agora funciona
- ✅ `GET /invoice-items/invoice/{uuid}` - Retorna erro 404 apropriado
- ✅ `PUT /tasks/{uuid}/assign` - Aceita userUuid
- ✅ `POST /tasks/conference` - Aceita userUuid e storageId

---

## 📊 Estatísticas da Sessão

- **Arquivos Modificados:** 8
- **Endpoints Refatorados:** 7 (Tasks)
- **Bugs Corrigidos:** 2 críticos
- **Novos Métodos:** 2 (UUID → ID conversion)
- **Linhas de Documentação:** ~200+ (README)
- **Tratamento de Erros:** Melhorado em 10+ locais

---

## 🔍 Impacto no Frontend

### ⚠️ BREAKING CHANGES

O frontend **DEVE** ser atualizado para usar UUIDs nos seguintes endpoints:

1. **Filtrar tasks por usuário:**
   ```javascript
   // ANTES
   GET /tasks?assignedUserId=2
   
   // DEPOIS
   GET /tasks?assignedUserUuid=2103e8df-f89d-47be-9be1-3a3db0172c35
   ```

2. **Buscar tasks de usuário:**
   ```javascript
   // ANTES
   GET /tasks/user/2
   
   // DEPOIS
   GET /tasks/user/2103e8df-f89d-47be-9be1-3a3db0172c35
   ```

3. **Buscar tasks por invoice:**
   ```javascript
   // ANTES
   GET /tasks/invoice/1
   
   // DEPOIS
   GET /tasks/invoice/bcd2d499-2927-4f0b-ba2f-9f9559bfe802
   ```

4. **Atribuir task:**
   ```javascript
   // ANTES
   PUT /tasks/{uuid}/assign
   Body: { "userId": 2 }
   
   // DEPOIS
   PUT /tasks/{uuid}/assign
   Body: { "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35" }
   ```

5. **Realizar conferência:**
   ```javascript
   // ANTES
   POST /tasks/conference
   Body: { 
     "taskUuid": "...",
     "quantityFound": 100,
     "userId": 2
   }
   
   // DEPOIS
   POST /tasks/conference
   Body: { 
     "taskUuid": "...",
     "quantityFound": 100,
     "userUuid": "2103e8df-f89d-47be-9be1-3a3db0172c35",
     "storageId": 1  // ← Opcional
   }
   ```

### ✅ Melhorias para o Frontend

1. **Mensagens de Erro Claras:**
   - Frontend agora recebe HTTP 404 com mensagem descritiva
   - Exemplo: `"Invoice with UUID {uuid} not found"`

2. **Comportamento Previsível:**
   - Array vazio = recurso existe mas está vazio
   - HTTP 404 = recurso não existe

3. **Armazenamento Automático:**
   - Passar `storageId` na conferência cria inventário automaticamente
   - Frontend não precisa fazer POST separado no `/inventories`

---

## 🎯 Próximos Passos Sugeridos

1. ✅ ~~Migrar endpoints de Tasks para UUIDs~~ **COMPLETO**
2. ✅ ~~Corrigir bugs de queries e rotas~~ **COMPLETO**
3. ✅ ~~Atualizar documentação~~ **COMPLETO**
4. ⏳ Atualizar frontend para usar novos endpoints
5. ⏳ Adicionar testes automatizados (unit + e2e)
6. ⏳ Considerar migrar outros endpoints para UUIDs
7. ⏳ Implementar rate limiting nos endpoints públicos

---

## 💡 Lições Aprendidas

1. **LEFT JOIN + WHERE pode se comportar como INNER JOIN**
   - Solução: Query em duas etapas ou usar subconsultas

2. **Ordem das rotas importa no NestJS**
   - Rotas específicas devem vir antes de rotas genéricas

3. **Erro genérico vs específico**
   - `throw new Error()` retorna 500
   - `throw new NotFoundException()` retorna 404
   - Sempre use exceções específicas do NestJS

4. **UUID na API, ID no banco**
   - Melhor dos dois mundos: segurança + performance
   - Conversão deve acontecer no controller

---

## 📌 Commits Relacionados

- `e80da3e` - Refactor invoice and task services to handle UUIDs, improve error handling, and add new database queries

---

**Data:** 29 de Novembro de 2025  
**Desenvolvedor:** Diego Nunes  
**Branch:** diego-dev
