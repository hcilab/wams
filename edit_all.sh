#!/bin/bash

vim \
  src/*.js \
  src/client/*.js \
  src/server/*.js \
  src/shared/*.js \
  tests/*.js \
  tests/client/*.js \
  tests/server/*.js \
  tests/shared/*.js \
  examples/*.js \
  TODO.md \
  README.md \
  DESIGN.md \
  "+bot vnew +setlocal\ buftype=nofile" \
  "+abo new" \
  "+argu 2" \
  "+resize +10"

