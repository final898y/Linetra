---
title: Linetra — Commit Message Standards
version: v1.0
date: 2026-05-25
status: Active
author: Linetra Dev Team
---

# Linetra Commit Message Standards

## Format
`<type>(<scope>): <subject>`

## Allowed Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semi colons, etc; no code change
- `refactor`: Refactoring production code
- `perf`: Code change that improves performance
- `test`: Adding missing tests, refactoring tests
- `chore`: Updating build tasks, package manager configs, etc.

## Recommended Scopes
- `frontend`: Changes in `/frontend`
- `backend`: Changes in `/backend`
- `docs`: Documentation changes in `/docs`
- `db`: Database migrations or schema changes
- `root`: Root-level configuration changes

## Examples
- `feat(frontend): implement standardized report template selector`
- `fix(backend): correct timezone parse error in Actual Due`
- `docs(product): update PRD to v2.0`
