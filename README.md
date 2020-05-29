# Auther

Auth server with wide grant type support

## Development

1. Create `.env` file using example `.env.example`
2. Run docker compose 
```
$ docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Production

```
$ docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
