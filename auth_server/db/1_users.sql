CREATE TABLE IF NOT EXISTS users
(
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username       VARCHAR(256) NOT NULL,
    password       VARCHAR(256) NOT NULL
);

INSERT INTO users
VALUES ('1913ca37-dd9e-450f-93a6-e2897bf2bd69', 'TEST', '$2b$10$IBIRY43Skp8OcZ9whbAjbOJ.gPKkdg8cO2ZOLI0TzcxoOqUszDmpi');
