#!/bin/bash

vim src/* \
  dist/view.html \
  examples/*.js \
  tests/* \
  TODO.md \
  README.md \
  DESIGN.md \
  "+bot vnew +setlocal\ buftype=nofile" \
  "+abo new" \
  "+b tests/server.test.js" \
  "+resize +10"

