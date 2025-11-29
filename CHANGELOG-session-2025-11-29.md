# Changelog - Sessão 29/11/2025

## 📋 Resumo
Migração completa dos endpoints de Tasks para UUIDs e correção de bugs críticos em queries e rotas.

---

## ⚠️ BREAKING CHANGES - Frontend

### Endpoints de Tasks Alterados

**Query Parameters:**
- `assignedUserId` → `assignedUserUuid`

**Path Parameters:**
- `GET /tasks/user/{userId}` → `GET /tasks/user/{userUuid}`
- `GET /tasks/invoice/{invoiceId}` → `GET /tasks/invoice/{invoiceUuid}`

**Request Bodies:**
```typescript
// PUT /tasks/:uuid/assign
{ "userId": 2 } → { "userUuid": "uuid-string" }

// POST /tasks/conference
{ 
  "taskUuid": "...",
  "quantityFound": 100,
  "userId": 2
}
→
{ 
  "taskUuid": "...",
  "quantityFound": 100,
  "userUuid": "uuid-string",
  "storageId": 1  // opcional
}
```

---

## 🔄 Alterações Principais

### 1. Tasks Controller (`src/tasks/tasks.controller.ts`)
- ✅ 7 endpoints migrados para aceitar UUIDs em vez de IDs
- ✅ Injetado `InvoiceService` para conversões
- ✅ Tratamento de erros com `NotFoundException` (HTTP 404)
- ✅ Validação de UUIDs antes de processar requests

**Endpoints atualizados:**
1. `GET /tasks?assignedUserUuid={uuid}`
2. `GET /tasks/open?assignedUserUuid={uuid}`
3. `GET /tasks/closed?assignedUserUuid={uuid}`
4. `GET /tasks/user/{userUuid}`
5. `GET /tasks/invoice/{invoiceUuid}`
6. `PUT /tasks/:uuid/assign`
7. `POST /tasks/conference`

### 2. Invoice Items Repository (`src/invoice_items/invoice_item.repository.ts`)
**Bug corrigido:** Query retornava array vazio incorretamente

**Solução:** Query em duas etapas
1. Buscar invoice pelo UUID
2. Se existir, buscar items pelo ID interno
3. Se não existir, retornar `null`

**Tipo de retorno:** `InvoiceItemWithDetails[] | null`

### 3. Users Controller (`src/users/users.controller.ts`)
**Bug corrigido:** Rota `GET /users/username/:username` inacessível

**Solução:** Reordenar rotas - específicas antes de genéricas
```typescript
@Get('username/:username')  // específica
@Get(':uuid')               // genérica
```

### 4. Novos Métodos de Conversão
**Arquivos:** `invoice.repository.ts` e `invoice.service.ts`

```typescript
async getInternalIdByUuid(uuid: string): Promise<number | null>
```
Converte UUID externo para ID interno do banco.

### 5. Documentação Atualizada
- ✅ README.md - Todos os endpoints de Tasks
- ✅ test-all-routes.http - Exemplos atualizados
- ✅ Parâmetro `storageId` opcional documentado

---

## 🏗️ Arquitetura

**Padrão UUID ↔ ID:**
- Controller recebe UUID → converte para ID → valida → chama service
- API externa usa UUIDs (segurança)
- Banco usa IDs numéricos (performance)

---

## 📊 Estatísticas

- **Arquivos modificados:** 8
- **Endpoints refatorados:** 7
- **Bugs corrigidos:** 2
- **Novos métodos:** 2

---

## 💡 Lições Aprendidas

1. **LEFT JOIN + WHERE** pode se comportar como INNER JOIN → usar query em duas etapas
2. **Ordem de rotas** no NestJS importa → específicas antes de genéricas
3. **Exceções específicas** (`NotFoundException`) retornam HTTP 404 correto
4. **UUID na API + ID no banco** = segurança + performance

---

**Commit:** `e80da3e` - Refactor invoice and task services to handle UUIDs  
**Data:** 29/11/2025 | **Dev:** Diego Nunes | **Branch:** diego-dev
