#!/bin/bash

# call from root dir!

ROOT=`pwd`

cd $ROOT/activeql-server
VERSION=`npm version patch`

npm publish         # this will build 1st in dist
rm -rf dist         # otherwise you won't see changes in the ts-files in the running application

sleep 5

cd $ROOT/../activeql-starter/express
npm i activeql-server@$VERSION
