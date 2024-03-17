NAME=rectangle
DOMAIN=acristoffers.me

.PHONY: all pack install clean

all: dist/extension.js dist/prefs.ui

node_modules: package.json
	npm install

dist/extension.js dist/prefs.js: node_modules src/extension.ts src/prefs.ts
	tsc --build tsconfig.json

dist/prefs.ui:
	cp ui/prefs.ui dist/prefs.ui

schemas/gschemas.compiled: schemas/org.gnome.shell.extensions.$(NAME).gschema.xml
	glib-compile-schemas schemas

$(NAME).zip: dist/extension.js dist/prefs.js dist/prefs.ui schemas/gschemas.compiled
	@cp -r schemas dist/
	@cp metadata.json dist/
	@(cd dist && zip ../$(NAME).zip -9r .)

pack: $(NAME).zip

install: $(NAME).zip
	@touch ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)
	@rm -rf ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)
	@mv dist ~/.local/share/gnome-shell/extensions/$(NAME)@$(DOMAIN)

clean:
	@rm -rf dist node_modules $(NAME).zip

