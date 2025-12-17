# httpyac Patterns Reference

> Padrões de teste httpyac para diferentes cenários de API.
> Documentação oficial: https://httpyac.github.io/

---

## Estrutura Básica

```http
### Nome do Teste
# @name identificador
METHOD {{API_URL}}/path
Header: Value

{
  "body": "json"
}

?? status == 200
?? body.field == "value"
```

**Separador:** Use `###` para separar requests no mesmo arquivo.

---

## 1. Autenticação

### 1.1 Login e Captura de Token

```http
### AUTH: Login and capture token
# @name login
POST {{API_URL}}/auth/signin
Content-Type: application/json

{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}

?? status == 200
?? body.access_token isString

###
# Captura o token para uso em requests seguintes
@token = {{login.access_token}}
```

### 1.2 Endpoint Protegido

```http
### AUTH: Get current user (protected)
# @name getMe
GET {{API_URL}}/auth/me
Authorization: Bearer {{token}}

?? status == 200
?? body.user.id isString
?? body.user.email isString
```

### 1.3 Acesso Negado (sem token)

```http
### AUTH: Unauthorized access
GET {{API_URL}}/auth/me

?? status == 401
?? body.message isString
```

---

## 2. CRUD Operations

### 2.1 CREATE (POST)

```http
### CREATE: New resource
# @name createResource
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Test Resource",
  "description": "Created by httpyac test"
}

?? status == 201
?? body.data.id isString
?? body.data.name == "Test Resource"
?? duration < 2000

###
@resourceId = {{createResource.data.id}}
```

### 2.2 READ (GET list)

```http
### READ: List resources
GET {{API_URL}}/resources
Authorization: Bearer {{token}}

?? status == 200
?? body.data isArray
?? body.data length > 0
?? body.pagination.total isNumber
```

### 2.3 READ (GET by ID)

```http
### READ: Get resource by ID
GET {{API_URL}}/resources/{{resourceId}}
Authorization: Bearer {{token}}

?? status == 200
?? body.data.id == {{resourceId}}
?? body.data.name isString
```

### 2.4 UPDATE (PUT/PATCH)

```http
### UPDATE: Modify resource
PUT {{API_URL}}/resources/{{resourceId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Updated Resource"
}

?? status == 200
?? body.data.name == "Updated Resource"
```

### 2.5 DELETE

```http
### DELETE: Remove resource
DELETE {{API_URL}}/resources/{{resourceId}}
Authorization: Bearer {{token}}

?? status == 200

### DELETE: Verify deletion
GET {{API_URL}}/resources/{{resourceId}}
Authorization: Bearer {{token}}

?? status == 404
```

---

## 3. Validação

### 3.1 Campo Obrigatório

```http
### VALIDATION: Required field missing
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "description": "Missing name field"
}

?? status == 400
?? body.message includes "name"
```

### 3.2 Tipo Inválido

```http
### VALIDATION: Invalid data type
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": 12345,
  "count": "not-a-number"
}

?? status == 400
```

### 3.3 Formato de Email

```http
### VALIDATION: Invalid email format
POST {{API_URL}}/users
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "email": "invalid-email",
  "name": "Test"
}

?? status == 400
?? body.message includes "email"
```

---

## 4. Edge Cases

### 4.1 Recurso Não Encontrado

```http
### EDGE: Resource not found
GET {{API_URL}}/resources/99999999-9999-9999-9999-999999999999
Authorization: Bearer {{token}}

?? status == 404
```

### 4.2 Lista Vazia

```http
### EDGE: Empty list with filter
GET {{API_URL}}/resources?status=nonexistent
Authorization: Bearer {{token}}

?? status == 200
?? body.data isArray
?? body.data length == 0
```

### 4.3 Paginação

```http
### EDGE: Pagination
GET {{API_URL}}/resources?page=1&limit=5
Authorization: Bearer {{token}}

?? status == 200
?? body.data length <= 5
?? body.pagination.page == 1
?? body.pagination.limit == 5
```

### 4.4 Duplicado

```http
### EDGE: Create unique resource
# @name uniqueResource
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Unique Name",
  "code": "UNIQUE_CODE_{{$timestamp}}"
}

?? status == 201

### EDGE: Duplicate entry attempt
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Another Name",
  "code": "UNIQUE_CODE_{{$timestamp}}"
}

?? status == 409
?? body.message includes "already exists"
```

---

## 5. Multi-tenancy

### 5.1 Isolamento por Account

```http
### MULTI-TENANT: Login Account A
# @name loginA
POST {{API_URL}}/auth/signin
Content-Type: application/json

{
  "email": "{{ACCOUNT_A_EMAIL}}",
  "password": "{{ACCOUNT_A_PASSWORD}}"
}

?? status == 200

###
@tokenA = {{loginA.access_token}}

### MULTI-TENANT: Create resource in Account A
# @name resourceA
POST {{API_URL}}/resources
Authorization: Bearer {{tokenA}}
Content-Type: application/json

{
  "name": "Account A Resource"
}

?? status == 201

###
@resourceIdA = {{resourceA.data.id}}

### MULTI-TENANT: Login Account B
# @name loginB
POST {{API_URL}}/auth/signin
Content-Type: application/json

{
  "email": "{{ACCOUNT_B_EMAIL}}",
  "password": "{{ACCOUNT_B_PASSWORD}}"
}

?? status == 200

###
@tokenB = {{loginB.access_token}}

### MULTI-TENANT: Try access Account A resource from B
GET {{API_URL}}/resources/{{resourceIdA}}
Authorization: Bearer {{tokenB}}

?? status == 404
```

---

## 6. Performance

### 6.1 Tempo de Resposta

```http
### PERFORMANCE: Response time check
GET {{API_URL}}/resources
Authorization: Bearer {{token}}

?? status == 200
?? duration < 500
```

### 6.2 Lista Grande

```http
### PERFORMANCE: Large list
GET {{API_URL}}/resources?limit=100
Authorization: Bearer {{token}}

?? status == 200
?? duration < 2000
?? body.data length <= 100
```

---

## 7. Assertions Disponíveis

```http
# Status
?? status == 200
?? status >= 200
?? status < 300

# String assertions
?? body.name == "exact value"
?? body.name includes "partial"
?? body.name startsWith "prefix"
?? body.name endsWith "suffix"
?? body.name matches "^regex.*$"

# Number assertions
?? body.count == 10
?? body.count > 0
?? body.count >= 1
?? body.count < 100

# Boolean assertions
?? body.active == true
?? body.deleted == false

# Type assertions
?? body.id isString
?? body.count isNumber
?? body.active isBoolean
?? body.items isArray
?? body.data isObject

# Array assertions
?? body.items length == 5
?? body.items length > 0

# Existence
?? body.optional exists
?? body.removed not exists

# Duration
?? duration < 1000
?? duration <= 2000

# Headers
?? header Content-Type == "application/json; charset=utf-8"
```

---

## 8. Variáveis e Captures

### 8.1 Variáveis de Ambiente

Arquivo `http-client.env.json`:
```json
{
  "local": {
    "API_URL": "http://localhost:3001/api/v1",
    "TEST_EMAIL": "test@example.com",
    "TEST_PASSWORD": "Test123!"
  },
  "staging": {
    "API_URL": "https://staging.api.com/api/v1"
  }
}
```

### 8.2 Capturar e Reusar

```http
### Capture ID from response
# @name create
POST {{API_URL}}/resources
Content-Type: application/json

{ "name": "Test" }

###
@newId = {{create.data.id}}

### Use captured ID
GET {{API_URL}}/resources/{{newId}}
```

### 8.3 Variáveis Built-in

```http
# Timestamp
{{$timestamp}}

# UUID
{{$uuid}}

# Random integer
{{$randomInt}}

# ISO date
{{$isoTimestamp}}

# Sleep (delay em ms)
{{$sleep 3000}}
```

---

## 9. Scripts JavaScript

### 9.1 Pre-request Script

```http
### With pre-request script
{{
  // Executa ANTES do request
  exports.customHeader = `Custom-${Date.now()}`;
}}
GET {{API_URL}}/resources
X-Custom-Header: {{customHeader}}
```

### 9.2 Post-request Script (Test)

```http
### With test script
GET {{API_URL}}/resources
Authorization: Bearer {{token}}

{{
  const { test, expect } = require('httpyac');

  test('should return array', () => {
    expect(response.body.data).toBeArray();
  });

  test('should have valid items', () => {
    response.body.data.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeString();
    });
  });
}}
```

---

## 10. CLI Commands

```bash
# Executar todos os testes
npx httpyac send docs/features/*/tests/api/*.http --all -e local

# Executar arquivo específico
npx httpyac send docs/features/F0001/tests/api/01-crud.http --all -e local

# Output em formato JUnit (para CI)
npx httpyac send tests/*.http --all -e local --junit > test-results.xml

# Output JSON
npx httpyac send tests/*.http --all -e local --json

# Verbose
npx httpyac send tests/*.http --all -e local -v

# Bail on first failure
npx httpyac send tests/*.http --all -e local --bail
```

---

## 11. Estrutura de Arquivo Recomendada

```http
# ===========================================
# Feature: [Feature Name]
# File: 01-[module]-crud.http
# ===========================================

# -------------------------------------------
# SETUP: Variables from previous files
# -------------------------------------------
@token = {{login.access_token}}

# -------------------------------------------
# TEST 1: Create Resource
# -------------------------------------------
### CREATE: New resource
# @name createResource
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Test Resource"
}

?? status == 201
?? body.data.id isString

###
@resourceId = {{createResource.data.id}}

# -------------------------------------------
# TEST 2: Read Resource
# -------------------------------------------
### READ: Get created resource
GET {{API_URL}}/resources/{{resourceId}}
Authorization: Bearer {{token}}

?? status == 200
?? body.data.name == "Test Resource"

# -------------------------------------------
# CLEANUP (optional)
# -------------------------------------------
### CLEANUP: Delete test resource
DELETE {{API_URL}}/resources/{{resourceId}}
Authorization: Bearer {{token}}

?? status == 200
```
