SHELL := /bin/bash

test:
	@node -e "require('urun')('test');"

compile: test
	@nomo
	@node_modules/.bin/uglifyjs hub-fork.js > hub-fork.min.js

.PHONY: test
