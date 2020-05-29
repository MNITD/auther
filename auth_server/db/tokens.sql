CREATE TABLE IF NOT EXISTS tokens
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users (id),
    client_id           UUID REFERENCES clients (id),
    code_id             UUID NOT NULL,
    expires_at          VARCHAR(256) NOT NULL
);
