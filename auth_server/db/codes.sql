CREATE TABLE IF NOT EXISTS codes
(
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id               UUID REFERENCES clients (id),
    redirect_uri            VARCHAR(256) NOT NULL,
    expires_at              VARCHAR(256) NOT NULL,
    code_challenge          VARCHAR(256) NOT NULL,
    code_challenge_method   VARCHAR(256) NOT NULL
);
