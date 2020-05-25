CREATE TABLE IF NOT EXISTS codes
(
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id               UUID REFERENCES clients (id),
    redirect_uri            VARCHAR(256) NOT NULL,
    expires_at              TIMESTAMP NOT NULL,
    code_challenge          VARCHAR(256) NOT NULL,
    code_challenge_method   VARCHAR(256) NOT NULL
);
