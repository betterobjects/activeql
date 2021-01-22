const concurrently = require('concurrently');

concurrently([
  { command: 'npm run server --silent', name: 'server' },
  { command: 'npm run client --silent', name: 'client' }
])

console.log( `
    \n\n
    ActiveQL development environment
    It is safe to ignore the messages and warning.
    \n\
    GraphQL API runs at http://localhost:3000/graphql
    Admin UI runs at http://localhost:4200
    \n\n`);
