CREATE TABLE IF NOT EXISTS resource_servers
(
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(256) NOT NULL
);
