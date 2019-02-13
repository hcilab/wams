
wams:
	npx eslint src;
	npx browserify 'src/client.js' \
		--standalone wams-client \
		--outfile 'dist/wams-client.js';
	npx jsdoc -c .jsdocrc.json;
	ctags -R src;

test:
	npm test

