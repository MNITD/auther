CREATE TABLE IF NOT EXISTS scopes
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(256) NOT NULL,
    description         VARCHAR(256),
    resource_server_id  UUID REFERENCES resource_servers (id)
);

INSERT INTO scopes
VALUES ('71c237b3-25f1-4d83-b5d2-7ee6e795d94f', 'scope1', 'Scope 1', '7bcbbbfa-3c97-4238-9366-fef23e442e60'),
       ('da86020f-a795-495f-ae8f-4a0cae514a1c', 'scope2', 'Scope 2', '7bcbbbfa-3c97-4238-9366-fef23e442e60'),
       ('db3de888-55e5-42a4-89b0-2bd442e5cfef', 'scope3', 'Scope 3', '7bcbbbfa-3c97-4238-9366-fef23e442e60'),
       ('e3291399-a71d-4145-96ea-19ce1a565073', 'file:read', 'Allows get file', '7bcbbbfa-3c97-4238-9366-fef23e442e60');
