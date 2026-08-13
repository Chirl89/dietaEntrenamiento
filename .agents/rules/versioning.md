# Versioning Rule

Every project edit must display a visible version badge in the UI and update cache-busting version strings (`?v=X.Y.Z`).

- New conversation = minor version bump (`v0.1` -> `v0.2`).
- Iteration within same conversation = patch version bump (`v0.1.0` -> `v0.1.1` -> `v0.1.2`).
- Mandatory Git Step: ALWAYS run `git add .`, `git commit -m "feat(vX.Y.Z): ..."` and `git push` automatically after completing every edit.

