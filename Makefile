all: dist/extension.js

node_modules:
	npm install

dist/extension.js dist/prefs.js: node_modules
	npm run build
	@# Removes imports which are not captured. Rollup is creating loads of those.
	@sed -i "/import 'resource:/d" dist/extension.js
	@sed -i "/import 'resource:/d" dist/prefs.js

pack: dist/extension.js
	@cp -r schemas dist/
	@cp metadata.json LICENSE dist/
	@(cd dist && zip ../gnome-rectangle.zip -9r .)

clean:
	@rm -rf dist node_modules gnome-rectangle.zip
