CREATE TABLE IF NOT EXISTS users
(
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username       VARCHAR(256) NOT NULL,
    password       VARCHAR(256) NOT NULL
);
