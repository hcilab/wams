
.PHONY: wams parcel docs tags test graphs report

wams:  parcel docs tags

parcel:
	npx parcel build 'src/client.js' --out-dir dist/wams;

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

report:
	pandoc report.md -o report.pdf

