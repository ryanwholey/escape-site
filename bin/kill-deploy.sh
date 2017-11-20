#!/bin/bash

./node_modules/.bin/forever list | grep rw-escape- | awk '{print $7}' | while read line; do ./node_modules/.bin/forever stop $line; done
