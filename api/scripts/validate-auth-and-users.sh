#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -f "$ROOT_DIR/.env" ]]; then
  # shellcheck disable=SC2046
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ROOT_DIR/.env" | xargs)
fi

API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8099}"
TEST_ADMIN_EMAIL="${TEST_ADMIN_EMAIL:-}"
TEST_ADMIN_PASSWORD="${TEST_ADMIN_PASSWORD:-}"
TEST_COMUNIDAD_ID="${TEST_COMUNIDAD_ID:-1}"
TEST_ROL_ID="${TEST_ROL_ID:-2}"

if [[ -z "$TEST_ADMIN_EMAIL" || -z "$TEST_ADMIN_PASSWORD" ]]; then
  echo "ERROR: define TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD en api/.env"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

LAST_BODY_FILE=""
LAST_STATUS=""

request() {
  local method="$1"
  local path="$2"
  local body="${3:-{}}"
  local auth_token="${4:-}"
  local out="$TMP_DIR/response.json"

  local headers=(-H "Content-Type: application/json")
  if [[ -n "$auth_token" ]]; then
    headers+=(-H "Authorization: Bearer $auth_token")
  fi

  LAST_STATUS=$(curl -sS -o "$out" -w "%{http_code}" -X "$method" "$API_BASE_URL$path" "${headers[@]}" -d "$body")
  LAST_BODY_FILE="$out"

  echo "[$method] $path -> HTTP $LAST_STATUS"
  cat "$LAST_BODY_FILE"
  echo ""
}

json_read() {
  local expr="$1"
  php -r '$f=$argv[1]; $expr=$argv[2]; $d=json_decode(file_get_contents($f), true); if(!$d){exit(1);} $parts=explode(".",$expr); $v=$d; foreach($parts as $p){ if($p===""){continue;} if(!is_array($v)||!array_key_exists($p,$v)){ exit(2);} $v=$v[$p]; } if(is_array($v)){ echo json_encode($v, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); } else { echo $v; }' "$LAST_BODY_FILE" "$expr"
}

assert_status() {
  local expected="$1"
  if [[ "$LAST_STATUS" != "$expected" ]]; then
    echo "ASSERT FAIL: esperado HTTP $expected, recibido $LAST_STATUS"
    exit 1
  fi
}

assert_success_true() {
  local value
  value=$(json_read "success" || true)
  if [[ "$value" != "1" && "$value" != "true" ]]; then
    echo "ASSERT FAIL: success no es true"
    exit 1
  fi
}

assert_success_false() {
  local value
  value=$(json_read "success" || true)
  if [[ "$value" != "" && "$value" != "0" && "$value" != "false" ]]; then
    echo "ASSERT FAIL: success no es false"
    exit 1
  fi
}

echo "== 1) Login admin =="
request POST /api/v1/auth/login "{\"email\":\"$TEST_ADMIN_EMAIL\",\"password\":\"$TEST_ADMIN_PASSWORD\"}"
assert_status 200
assert_success_true
ADMIN_TOKEN=$(json_read "data.token")


echo "== 2) Validate token =="
request POST /api/v1/auth/validate "{\"token\":\"$ADMIN_TOKEN\"}"
assert_status 200
assert_success_true


echo "== 3) Profile =="
request GET /api/v1/usuarios/profile "{}" "$ADMIN_TOKEN"
assert_status 200
assert_success_true

SUFFIX="$(date +%s)"
NEW_EMAIL="qa.user.${SUFFIX}@example.com"
NEW_PASS='QaPass1234!Test'


echo "== 4) Register (solo email/password/confirmPassword) =="
request POST /api/v1/auth/register "{\"email\":\"$NEW_EMAIL\",\"password\":\"$NEW_PASS\",\"confirmPassword\":\"$NEW_PASS\"}"
assert_status 200
assert_success_true
REGISTERED_ID=$(json_read "data.user.id")


echo "== 5) Login con cuenta recien registrada debe fallar (inactiva) =="
request POST /api/v1/auth/login "{\"email\":\"$NEW_EMAIL\",\"password\":\"$NEW_PASS\"}"
assert_status 401
assert_success_false


echo "== 6) Admin activa la cuenta =="
request POST /api/v1/usuarios/activate "{\"id\":$REGISTERED_ID}" "$ADMIN_TOKEN"
assert_status 200
assert_success_true


echo "== 7) Login tras activacion =="
request POST /api/v1/auth/login "{\"email\":\"$NEW_EMAIL\",\"password\":\"$NEW_PASS\"}"
assert_status 200
assert_success_true
USER_TOKEN=$(json_read "data.token")


echo "== 8) Forgot password =="
request POST /api/v1/auth/forgot-password "{\"email\":\"$NEW_EMAIL\"}"
assert_status 200
assert_success_true


echo "== 9) Obtener token reset desde DB (solo QA local) =="
RESET_TOKEN=$(php -r '
require $argv[1] . "/bootstrap.php";
$db = Connection::getInstance();
$email = $argv[2];
$sql = "SELECT t.token FROM auth_tokens t JOIN usuarios u ON u.id=t.usuario_id WHERE u.email=? AND t.token_type=\"PASSWORD_RESET\" AND t.revoked_at IS NULL ORDER BY t.id DESC LIMIT 1";
$stmt = $db->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();
echo $row ? $row["token"] : "";
' "$ROOT_DIR" "$NEW_EMAIL")

if [[ -z "$RESET_TOKEN" ]]; then
  echo "ASSERT FAIL: no se pudo leer token de reseteo desde DB"
  exit 1
fi


echo "== 10) Validate reset token =="
request POST /api/v1/auth/validate-reset-token "{\"token\":\"$RESET_TOKEN\"}"
assert_status 200
assert_success_true

NEW_PASS_2='QaPass1234!Renew'

echo "== 11) Reset password =="
request POST /api/v1/auth/reset-password "{\"token\":\"$RESET_TOKEN\",\"new_password\":\"$NEW_PASS_2\"}"
assert_status 200
assert_success_true


echo "== 12) Login con nueva password =="
request POST /api/v1/auth/login "{\"email\":\"$NEW_EMAIL\",\"password\":\"$NEW_PASS_2\"}"
assert_status 200
assert_success_true



echo "== 11) CRUD usuarios (admin) =="
ADMIN_CREATED_EMAIL="qa.admin.created.${SUFFIX}@example.com"
ADMIN_CREATED_PASS='QaPass1234!Admin'
request POST /api/v1/usuarios "{\"email\":\"$ADMIN_CREATED_EMAIL\",\"password\":\"$ADMIN_CREATED_PASS\",\"comunidad_id\":$TEST_COMUNIDAD_ID,\"rol_id\":$TEST_ROL_ID,\"activo\":1}" "$ADMIN_TOKEN"
assert_status 200
assert_success_true
CRUD_ID=$(json_read "data.item.id")

request GET "/api/v1/usuarios/detail?id=$CRUD_ID" "{}" "$ADMIN_TOKEN"
assert_status 200
assert_success_true

request PUT "/api/v1/usuarios?id=$CRUD_ID" "{\"activo\":0}" "$ADMIN_TOKEN"
assert_status 200
assert_success_true

request DELETE "/api/v1/usuarios?id=$CRUD_ID" "{}" "$ADMIN_TOKEN"
assert_status 200
assert_success_true


echo "== 12) Logout =="
request POST /api/v1/auth/logout "{\"token\":\"$ADMIN_TOKEN\"}"
assert_status 200
assert_success_true


echo "== 13) Validate token luego de logout (debe fallar) =="
request POST /api/v1/auth/validate "{\"token\":\"$ADMIN_TOKEN\"}"
assert_status 401
assert_success_false


echo "OK: validación auth + usuarios completada"
