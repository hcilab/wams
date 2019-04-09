#!/bin/bash

# Author: Michael van der Kamp
# Date: August 21, 2018
#
# This bash script opens a new vim instance with three windows, one of which
# holds a terminal for accessing external commands.
#
# This file will be where I maintain my personal preference for opening up vim
#  when working on a project. This is intended as a template, but is perfectly
#  usable if a project follows this simple layout.

vim \
  index.js \
  src/*.js \
  src/client/*.js \
  src/server/*.js \
  src/shared/*.js \
  src/predefined/*.js \
  src/gestures/*.js \
  src/mixins/*.js \
  tests/*.js \
  tests/client/*.js \
  tests/server/*.js \
  tests/shared/*.js \
  tests/mixins/*.js \
  tests/gestures/*.js \
  tests/predefined/*.js \
  examples/*.js \
  README.md \
  TODO.md \
  DESIGN.md \
  .eslintrc.json \
  .jsdocrc.json \
  package.json \
  "+vertical botright terminal" \
  "+aboveleft new" \
  "+argument 2" \
  "+resize +10"

  # "+bot vnew +setlocal\ buftype=nofile" \
  # "+abo new" \


