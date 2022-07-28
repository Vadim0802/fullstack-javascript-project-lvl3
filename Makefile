page-loader:
	node bin/page-loader.js

install-deps:
	npm ci

lint:
	npm run lint

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8