### U home server

Api server built by nodejs

### Start app with docker

> docker-compose up -d

#### Without docker

> npm start

### Restart app

> docker-compose restart app

#### Show log

> docker-compose logs -f app

#### Access node app and run seeder

> docker-compose exec app bash

> docker-compose exec redis redis-cli

### Build app

> npm run build

### Check eslint & prettier

> npm run lint

> npm run prettier

### Run test

> npm test