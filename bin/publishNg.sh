#!/bin/bash

# call from root dir!

ROOT=`pwd`

cd $ROOT/angular/projects/activeql-admin-ui
VERSION=`npm version patch`

cd $ROOT/angular
ng build activeql-admin-ui --prod

cd $ROOT/angular/dist/activeql-admin-ui
npm publish

rm -rf $ROOT/angular/dist

sleep 5

cd $ROOT/../activeql-starter/angular
npm i activeql-admin-ui@$VERSION

sleep 2

cp $ROOT/../activeql-starter/angular/package.json $ROOT/../activeql-generator/starter-template/angular/package.json
cp $ROOT/../activeql-starter/angular/package-lock.json $ROOT/../activeql-generator/starter-template/angular/package-lock.json
