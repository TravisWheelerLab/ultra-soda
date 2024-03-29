### rmsk-soda-example makefile
### ----------------
### Welcome to the Makefile, we hope you enjoy your stay! Run
### `make help` for help.
###

## --------------
## Public Targets
## --------------

### build
### -----
### Build the example app such that TypeScript files are compiled
### to JavaScript and the example/ directory is bundled into a
### single asset to be consumed by example/index.html.
###

.PHONY: build
build: builddir build/index.html
	npx tsc --build tsconfig-example.json
	npx webpack-cli --config webpack.config.js

### serve
### -----
### Build and serve the example app on port 8080.
###
.PHONY: serve
serve: build
	@echo "SERVE invoked at $$(date)"
	@echo "Running server on localhost:8080"
	@echo "Use ctrl-c to stop"
	@python3 -m http.server -d build/ -b 127.0.0.1 8080 && echo "Bye bye!"

### setup
### -----
### Install development dependencies, run this first!
###
.PHONY: setup
setup:
	@npm install --dev
	@echo "You will also need wget to run the example"

## ---------------
## Private Targets
## ---------------

builddir:
	mkdir -p build/

build/index.html: index.html
	cp index.html build/

## This lives way down here because it screws up the syntax highlighting
## for the rest of the file if it's higher up. Basically, we just grep
## the Makefile for special comments and barf out those lines.
MAGIC_COMMENT := \#\#\#
help:
	@cat Makefile | grep '^$(MAGIC_COMMENT)' | \
	sed 's/$(MAGIC_COMMENT) //' | sed 's/$(MAGIC_COMMENT)//' | less
