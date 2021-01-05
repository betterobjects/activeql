#!/bin/bash

# call from root dir!

rsync -rtv angular/src/ ../activeql-starter/angular/src
rsync -rtv express/activeql/ ../activeql-starter/express/activeql
