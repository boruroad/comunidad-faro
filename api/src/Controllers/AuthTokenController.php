<?php

class AuthTokenController extends CrudController
{
    protected $resourceLabel = 'auth token';
    protected $allowedFields = array();
    protected $filterableFields = array('usuario_id', 'token_type');
    protected $writeRoles = array('SUPERADMIN');

    public function __construct()
    {
        $this->repo = new AuthTokenRepository();
    }

    public function create($request)
    {
        return $this->fail('auth_tokens is managed internally', 400);
    }

    public function update($request)
    {
        return $this->fail('auth_tokens is managed internally', 400);
    }

    public function delete($request)
    {
        $usuario = $this->requireAuth();
        if (!$usuario) {
            return $this->fail('unauthorized', 401);
        }
        if (!$this->hasAnyRole($usuario, $this->writeRoles)) {
            return $this->fail('insufficient permissions', 403);
        }

        $token = isset($request['token']) ? trim((string) $request['token']) : '';
        if ($token === '') {
            return $this->fail('token is required', 422);
        }

        $tokenType = isset($request['token_type']) ? strtoupper(trim((string) $request['token_type'])) : 'AUTH';
        if ($tokenType !== 'AUTH' && $tokenType !== 'PASSWORD_RESET') {
            return $this->fail('token_type must be AUTH or PASSWORD_RESET', 422);
        }

        $this->repo->revokeByToken($token, $tokenType);

        return $this->ok(array(), 'auth token revoked');
    }
}
