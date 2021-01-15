#!/bin/bash

# call from root dir!

rsync -rtv angular/src/ ../activeql-starter/angular/src
rsync -rtv express/activeql/ ../activeql-starter/express/activeql

rsync -rtv angular/src/ ../activeql-generator/starter-template/angular/src
rsync -rtv express/activeql/ ../activeql-generator/starter-template/express/activeql
