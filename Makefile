dev:
	npx webpack-dev-server

lint:
	npx eslint .

install:
	yarn install

build:
	rm -rf ./dist
	NODE_ENV=production npx webpack
	echo divergent-throat.surge.sh > ./dist/CNAME
