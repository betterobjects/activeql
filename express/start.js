const concurrently = require('concurrently');

process.env['PORT'] = '4000';
concurrently([
  { command: 'npm run server', name: 'server', prefixColor: 'black' },
  { command: 'npm run client', name: 'client', prefixColor: 'blue' }
])

console.log( `
    \n\n
    ActiveQL development environment
    It is safe to ignore the messages and warning.
    \n\
    GraphQL API runs at http://localhost:4000/graphql
    Subscriptions at ws://localhost:4000/graphql
    Admin UI runs at http://localhost:4200
    \n\n`);
