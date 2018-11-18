#!/bin/bash

# Author: Michael van der Kamp
# Date: August 21, 2018
#
# This bash script opens a new vim instance with three windows, one of which is
#  a small scratch buffer for reading the output of external commands.
#
# This file will be where I maintain my personal preference for opening up vim
#  when working on a project. This is intended as a template, but is perfectly
#  usable if a project follows this simple layout.

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
  README.md \
  TODO.md \
  DESIGN.md \
  "+bot vnew +setlocal\ buftype=nofile" \
  "+abo new" \
  "+argu 2" \
  "+resize +10"


