PKGNAME:=borjes
PUBLISH_URL:=garciasevilla.com:/var/www/pkgs/

publish:
	mkdir -p .publish/$(PKGNAME)
	cp -r lib src package.json .publish/$(PKGNAME)
	cd .publish && tar -czf $(PKGNAME).tar.gz $(PKGNAME)
	scp .publish/$(PKGNAME).tar.gz $(PUBLISH_URL)
	rm -rf .publish

.PHONY: publish
