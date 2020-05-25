CREATE TABLE IF NOT EXISTS clients_to_scopes
(
    client_id  UUID REFERENCES clients (id),
    scope_id   UUID REFERENCES scopes (id)
);
