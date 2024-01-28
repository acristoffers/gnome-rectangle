all: dist/extension.js

node_modules:
	npm install

dist/extension.js dist/prefs.js: node_modules
	tsc --build tsconfig.json

pack: dist/extension.js
	@cp -r schemas dist/
	@cp metadata.json LICENSE dist/
	@(cd dist && zip ../gnome-rectangle.zip -9r .)

clean:
	@rm -rf dist node_modules gnome-rectangle.zip
