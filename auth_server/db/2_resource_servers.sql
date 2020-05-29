CREATE TABLE IF NOT EXISTS resource_servers
(
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(256) NOT NULL
);

INSERT INTO resource_servers
VALUES ('7bcbbbfa-3c97-4238-9366-fef23e442e60', 'demo-resource-server');
