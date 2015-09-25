PKGNAME:=borjes
PUBLISH_URL:=garciasevilla.com:/var/www/pkgs/

test:
	node test/unify.js
	node test/cfg.js english.cfg.yml sentences_EN.txt
	node test/cfg.js english.pcfg.yml sentences_EN.txt
	node test/cfg.js english.lcfg.yml sentences_EN.txt
	node test/hpsg.js spanish.json sentences_ES.txt

publish:
	mkdir -p .publish/$(PKGNAME)
	cp -r lib src package.json .publish/$(PKGNAME)
	cd .publish && tar -czf $(PKGNAME).tar.gz $(PKGNAME)
	scp .publish/$(PKGNAME).tar.gz $(PUBLISH_URL)
	rm -rf .publish

.PHONY: publish test
