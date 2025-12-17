# Hurl Patterns Reference

> Padrões de teste Hurl para diferentes cenários de API.

---

## Estrutura Básica

```hurl
# Comentário descritivo do teste
METHOD {{API_URL}}/path
Header: Value
{
  "body": "json"
}
HTTP <expected_status>
[Asserts]
jsonpath "$.field" == "value"
```

---

## 1. Autenticação

### 1.1 Login e Captura de Token

```hurl
# ===========================================
# AUTH: Login and capture token
# ===========================================
POST {{API_URL}}/auth/signin
Content-Type: application/json
{
  "email": "{{TEST_EMAIL}}",
  "password": "{{TEST_PASSWORD}}"
}
HTTP 200
[Captures]
token: jsonpath "$.access_token"
[Asserts]
jsonpath "$.access_token" exists
jsonpath "$.user" exists
```

### 1.2 Endpoint Protegido

```hurl
# ===========================================
# AUTH: Get current user (protected)
# ===========================================
GET {{API_URL}}/auth/me
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.user.id" exists
jsonpath "$.user.email" exists
```

### 1.3 Acesso Negado (sem token)

```hurl
# ===========================================
# AUTH: Unauthorized access
# ===========================================
GET {{API_URL}}/auth/me
HTTP 401
[Asserts]
jsonpath "$.message" exists
```

---

## 2. CRUD Operations

### 2.1 CREATE (POST)

```hurl
# ===========================================
# CREATE: New resource
# ===========================================
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "name": "Test Resource",
  "description": "Created by Hurl test"
}
HTTP 201
[Captures]
resource_id: jsonpath "$.data.id"
[Asserts]
jsonpath "$.data.id" exists
jsonpath "$.data.name" == "Test Resource"
duration < 2000
```

### 2.2 READ (GET list)

```hurl
# ===========================================
# READ: List resources
# ===========================================
GET {{API_URL}}/resources
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.data" isCollection
jsonpath "$.data" count >= 1
jsonpath "$.pagination.total" exists
```

### 2.3 READ (GET by ID)

```hurl
# ===========================================
# READ: Get resource by ID
# ===========================================
GET {{API_URL}}/resources/{{resource_id}}
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.data.id" == {{resource_id}}
jsonpath "$.data.name" exists
```

### 2.4 UPDATE (PUT/PATCH)

```hurl
# ===========================================
# UPDATE: Modify resource
# ===========================================
PUT {{API_URL}}/resources/{{resource_id}}
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "name": "Updated Resource"
}
HTTP 200
[Asserts]
jsonpath "$.data.name" == "Updated Resource"
```

### 2.5 DELETE

```hurl
# ===========================================
# DELETE: Remove resource
# ===========================================
DELETE {{API_URL}}/resources/{{resource_id}}
Authorization: Bearer {{token}}
HTTP 200

# Verify deletion
GET {{API_URL}}/resources/{{resource_id}}
Authorization: Bearer {{token}}
HTTP 404
```

---

## 3. Validação

### 3.1 Campo Obrigatório

```hurl
# ===========================================
# VALIDATION: Required field missing
# ===========================================
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "description": "Missing name field"
}
HTTP 400
[Asserts]
jsonpath "$.message" contains "name"
```

### 3.2 Tipo Inválido

```hurl
# ===========================================
# VALIDATION: Invalid data type
# ===========================================
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "name": 12345,
  "count": "not-a-number"
}
HTTP 400
```

### 3.3 Formato de Email

```hurl
# ===========================================
# VALIDATION: Invalid email format
# ===========================================
POST {{API_URL}}/users
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "email": "invalid-email",
  "name": "Test"
}
HTTP 400
[Asserts]
jsonpath "$.message" contains "email"
```

---

## 4. Edge Cases

### 4.1 Recurso Não Encontrado

```hurl
# ===========================================
# EDGE: Resource not found
# ===========================================
GET {{API_URL}}/resources/99999999
Authorization: Bearer {{token}}
HTTP 404
```

### 4.2 Lista Vazia

```hurl
# ===========================================
# EDGE: Empty list with filter
# ===========================================
GET {{API_URL}}/resources?status=nonexistent
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.data" isEmpty
```

### 4.3 Paginação

```hurl
# ===========================================
# EDGE: Pagination
# ===========================================
GET {{API_URL}}/resources?page=1&limit=5
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
jsonpath "$.data" count <= 5
jsonpath "$.pagination.page" == 1
jsonpath "$.pagination.limit" == 5
```

### 4.4 Duplicado

```hurl
# ===========================================
# EDGE: Duplicate entry
# ===========================================
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "name": "Unique Name",
  "code": "UNIQUE_CODE"
}
HTTP 201

# Try to create duplicate
POST {{API_URL}}/resources
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "name": "Another Name",
  "code": "UNIQUE_CODE"
}
HTTP 409
[Asserts]
jsonpath "$.message" contains "already exists"
```

---

## 5. Multi-tenancy

### 5.1 Isolamento por Account

```hurl
# ===========================================
# MULTI-TENANT: Account isolation
# ===========================================
# Login as user from Account A
POST {{API_URL}}/auth/signin
Content-Type: application/json
{
  "email": "{{ACCOUNT_A_EMAIL}}",
  "password": "{{ACCOUNT_A_PASSWORD}}"
}
HTTP 200
[Captures]
token_a: jsonpath "$.access_token"

# Create resource in Account A
POST {{API_URL}}/resources
Authorization: Bearer {{token_a}}
Content-Type: application/json
{
  "name": "Account A Resource"
}
HTTP 201
[Captures]
resource_id_a: jsonpath "$.data.id"

# Login as user from Account B
POST {{API_URL}}/auth/signin
Content-Type: application/json
{
  "email": "{{ACCOUNT_B_EMAIL}}",
  "password": "{{ACCOUNT_B_PASSWORD}}"
}
HTTP 200
[Captures]
token_b: jsonpath "$.access_token"

# Try to access Account A's resource from Account B
GET {{API_URL}}/resources/{{resource_id_a}}
Authorization: Bearer {{token_b}}
HTTP 404
```

---

## 6. Performance

### 6.1 Tempo de Resposta

```hurl
# ===========================================
# PERFORMANCE: Response time check
# ===========================================
GET {{API_URL}}/resources
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
duration < 500
```

### 6.2 Lista Grande

```hurl
# ===========================================
# PERFORMANCE: Large list
# ===========================================
GET {{API_URL}}/resources?limit=100
Authorization: Bearer {{token}}
HTTP 200
[Asserts]
duration < 2000
jsonpath "$.data" count <= 100
```

---

## 7. Assertions Úteis

```hurl
# String assertions
jsonpath "$.name" == "exact value"
jsonpath "$.name" contains "partial"
jsonpath "$.name" startsWith "prefix"
jsonpath "$.name" endsWith "suffix"
jsonpath "$.name" matches "^regex.*$"

# Number assertions
jsonpath "$.count" == 10
jsonpath "$.count" > 0
jsonpath "$.count" >= 1
jsonpath "$.count" < 100

# Boolean assertions
jsonpath "$.active" == true
jsonpath "$.deleted" == false

# Null/existence
jsonpath "$.optional" exists
jsonpath "$.removed" not exists
jsonpath "$.nullable" == null

# Collection assertions
jsonpath "$.items" isCollection
jsonpath "$.items" isEmpty
jsonpath "$.items" count == 5
jsonpath "$.items" count > 0

# Type assertions
jsonpath "$.id" isString
jsonpath "$.count" isInteger
jsonpath "$.price" isFloat
jsonpath "$.active" isBoolean

# Date format (regex)
jsonpath "$.createdAt" matches "^\\d{4}-\\d{2}-\\d{2}"
```

---

## 8. Variables e Captures

### 8.1 Capturar e Reusar

```hurl
# Capture ID from response
POST {{API_URL}}/resources
[Captures]
new_id: jsonpath "$.data.id"

# Use captured ID
GET {{API_URL}}/resources/{{new_id}}
```

### 8.2 Headers Capturados

```hurl
# Capture header
GET {{API_URL}}/files/download
[Captures]
content_type: header "Content-Type"
```

### 8.3 Variáveis de Ambiente

```bash
# Executar com variáveis
hurl --variables-file variables.env tests.hurl

# Ou inline
hurl --variable API_URL=http://localhost:3001/api/v1 tests.hurl
```

---

## 9. Options

```hurl
# Delay between requests (milliseconds)
[Options]
delay: 1000

# Skip SSL verification
[Options]
insecure: true

# Follow redirects
[Options]
location: true

# Retry on failure
[Options]
retry: 3
retry-interval: 1000
```
