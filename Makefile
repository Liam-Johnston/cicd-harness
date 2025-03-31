build:
	docker compose run bun scripts/build.ts

bump:
	docker compose run bun x commit-and-tag-version@12.5.0
