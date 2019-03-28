
.PHONY: wams lint fix bundle docs tags test graphs babel

wams: lint bundle docs tags

lint:
	npx eslint src;

fix:
	npx eslint src --fix;

bundle:
	npx browserify 'src/client.js' \
		--standalone wams-client \
		-g [ babelify ] \
		--outfile 'dist/wams-client.js';

docs:
	npx jsdoc -c .jsdocrc.json;

redoc:
	mv docs/styles/custom.css .
	rm -rf docs;
	mkdir -p docs/styles;
	mv custom.css docs/styles/;
	npx jsdoc -c .jsdocrc.json;

tags:
	ctags -R src;

test:
	npx jest --bail 1

graphs:
	npx arkit -c graphs/client.json
	npx arkit -c graphs/full.json
	npx arkit -c graphs/gestures.json
	npx arkit -c graphs/mixins.json
	npx arkit -c graphs/predefined.json
	npx arkit -c graphs/server.json
	npx arkit -c graphs/shared.json

babel:
	npx babel 'dist/wams-client.js' -o 'dist/wams-client.es5.js'

parcel:
	npx parcel build 'dist/wams-client.js' \
		-d 'dist' \
		--out-file 'wams-client.parcel.js';

