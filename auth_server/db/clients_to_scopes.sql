CREATE TABLE IF NOT EXISTS clients_to_scopes
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id  UUID REFERENCES clients (id),
    scope_id   UUID REFERENCES scopes (id)
);

INSERT INTO clients_to_scopes (client_id, scope_id)
VALUES ('95606486-1c2d-4843-802b-8468cf4fb6e9', '71c237b3-25f1-4d83-b5d2-7ee6e795d94f'),
       ('95606486-1c2d-4843-802b-8468cf4fb6e9', 'e3291399-a71d-4145-96ea-19ce1a565073');
