CREATE TABLE IF NOT EXISTS resource_servers
(
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name           VARCHAR(256) NOT NULL
);
