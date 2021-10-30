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

### Sequelize

> npx sequelize-cli seed:generate --name

> npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string

> npx sequelize-cli migration:generate --name

> npx sequelize-cli db:migrate

> npx sequelize-cli db:migrate:undo

> npx sequelize-cli db:seed:all

> npx sequelize-cli db:seed:undo --seed name-of-seed-as-in-data

> npx sequelize-cli db:seed --seed name-of-seed-as-in-data
