CREATE TYPE client_type AS ENUM ('public', 'confidential');

CREATE TABLE IF NOT EXISTS clients
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(256) NOT NULL,
    client_id           VARCHAR(256) NOT NULL,
    client_secret       VARCHAR(256),
    type                client_type NOT NULL,
    redirect_url        VARCHAR(256)[] NOT NULL
);

INSERT INTO clients
VALUES ('95606486-1c2d-4843-802b-8468cf4fb6e9', 'Demo Client', 'demo-client', NULL ,'public', '{"http://localhost:5000/cb"}');
