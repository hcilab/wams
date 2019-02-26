
.PHONY: wams lint fix bundle docs tags test

wams: lint bundle docs tags

lint:
	npx eslint src;

fix:
	npx eslint src --fix;

bundle:
	npx browserify 'src/client.js' \
		--standalone wams-client \
		--outfile 'dist/wams-client.js';

docs:
	npx jsdoc -c .jsdocrc.json;

redoc:
	rm -rf docs;
	mkdir -p docs/styles;
	cp custom.css docs/styles/;
	npx jsdoc -c .jsdocrc.json;

tags:
	ctags -R src;

test:
	npx jest --bail 1

