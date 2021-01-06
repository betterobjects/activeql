#!/bin/bash

# call from root dir!

ROOT=`pwd`

cd $ROOT/angular/projects/activeql-admin-ui
npm version patch

cd $ROOT/angular
ng build activeql-admin-ui --prod

cd $ROOT/angular/dist/activeql-admin-ui
npm publish
