.DEFAULT_GOAL := help
.PHONY: help install dev build preview lint clean

# Scripts are always invoked as `pnpm run <name>`: several plausible script
# names (install, add, ...) collide with built-in pnpm commands, which take
# precedence and would run something else entirely. `pnpm lint` used to fall
# through to an unrelated `lint` binary on PATH for the same reason.

help: ## Show this help
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-9s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies exactly as the lockfile pins them
	pnpm install --frozen-lockfile

dev: ## Dev server at localhost:4321
	pnpm run dev

build: ## Production build to dist/, including the internal link check
	pnpm run build

preview: ## Build, then serve the production output
	pnpm run preview

lint: ## Every static check that does not need a build first
	pnpm run lint

clean: ## Remove build output
	rm -rf dist .astro
