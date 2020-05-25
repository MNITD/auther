CREATE TABLE IF NOT EXISTS tokens
(
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID REFERENCES users (id),
    client_id           UUID REFERENCES clients (id),
    code_id             UUID REFERENCES codes (id),
    expires_at          TIMESTAMP NOT NULL
);
