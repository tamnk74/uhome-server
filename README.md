### U home server

Api ser built by nodejs

### Start app with docker

> docker-compose up -d

#### Without docker

> npm start

### Restart app

> docker-compose restart node-app

#### Show log

> docker-compose logs -f node-app

#### Access node app and run seeder

> docker-compose exec node-app bash

> docker-compose exec redis redis-cli

### Build app

> npm run build

### Run seeder

> npm run seed

### Check eslint & prettier

> npm run lint

> npm run prettier

### Run test

> npm test

### Run cli

> npm link

> app-cli