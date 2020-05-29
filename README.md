# Auther

Auth server with wide grant type support

## Development

-  Create `.env` file using example `.env.example`
-  Create public/private keypair then move to `src/data`
```
$ npx babel-node scripts/cli secrets keypair [secret] keypair.json
```
- Run docker compose 
```
$ docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Production

```
$ docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
