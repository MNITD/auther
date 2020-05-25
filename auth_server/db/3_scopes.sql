CREATE TABLE IF NOT EXISTS scopes
(
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(256) NOT NULL,
    description         VARCHAR(256),
    resource_server_id  UUID REFERENCES resource_servers (id)
);
