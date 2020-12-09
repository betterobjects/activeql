const concurrently = require('concurrently');

console.info('Starting ActiveQL-on-Rails 🚀');
concurrently(
  [
    {
      command: 'ng serve',
      prefixColor: 'blue',
      name: 'ng'
    },
    {
      command: '../express/node_modules/.bin/ts-node-dev -P ../express/tsconfig.json --no-notify --inspect -- ../express/app.ts --watch ../express',
      prefixColor: 'yellow',
      name: 'gql'
    }
  ],
  {
    prefix: 'name',
    killOthers: ['failure', 'success'],
    restartTries: 3
  }
);


