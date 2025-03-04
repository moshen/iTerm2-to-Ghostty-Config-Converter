SHELL := bash

num_processors := $(shell nproc || printf "1")

export EMCC_CFLAGS = -msimd128 -O2

dist/index.html: dist/index.mjs
	cp src/index.html dist/index.html

dist/index.mjs: dist/wrapper.js
	cp src/index.mjs dist/index.mjs

dist/wrapper.js: vendor/libplist/src/libplist-2.0.la
	emcc -s MODULARIZE -s WASM=1 \
	-s EXPORTED_RUNTIME_METHODS='["cwrap", "FS"]' \
	-s EXPORTED_FUNCTIONS='["_run"]' \
	-s ALLOW_MEMORY_GROWTH=1 \
	-I vendor/libplist/include \
	-L vendor/libplist/src/.libs \
	-l:libplist-2.0.a \
	-o dist/wrapper.js \
	src/wrapper.c

vendor/libplist/src/libplist-2.0.la: vendor/libplist/libcnary/libcnary.la
	cd vendor/libplist \
		&& emmake make -j${num_processors} -C src libplist-2.0.la

vendor/libplist/libcnary/libcnary.la: vendor/libplist/Makefile
	cd vendor/libplist \
		&& emmake make -j${num_processors} -C libcnary libcnary.la

vendor/libplist/Makefile: vendor/libplist/configure
	cd vendor/libplist \
		&& emconfigure ./configure

vendor/libplist/configure: vendor/libplist/COPYING
	cd vendor/libplist \
		&& autoreconf -f -i

vendor/libplist/COPYING:
	git submodule init
	git submodule update

.PHONY = clean-submodules
clean-submodules:
	git submodule foreach git reset --hard
	git submodule foreach git clean -fdx

.PHONY = clean-dist
clean-dist:

.PHONY = clean
clean: clean-submodules clean-dist

.PHONY = clean-index
clean-index:
	rm -f dist/index.html dist/index.mjs

.PHONY = serve
serve: dist/index.html
	./scripts/redbean.exe -l 127.0.0.1 -p 8080 -w / -D dist
