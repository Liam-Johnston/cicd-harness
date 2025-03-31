build:
	docker compose run bun scripts/build.ts

bump:
	bunx commit-and-tag-version@12.5.0
