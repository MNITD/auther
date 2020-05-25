CREATE TYPE client_type AS ENUM ('public', 'confidential');

CREATE TABLE IF NOT EXISTS clients
(
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(256) NOT NULL,
    client_id           VARCHAR(256) NOT NULL,
    client_secret       VARCHAR(256),
    type                client_type NOT NULL,
    redirect_url        VARCHAR(256)[] NOT NULL
);