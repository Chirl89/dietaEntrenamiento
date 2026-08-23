# Versioning Rule

Every edit, commit, and push MUST ALWAYS increment the application version.

- Start of new conversation: minor bump (`v0.16.0` -> `v0.17.0`).
- Every iteration / commit / push within the conversation: patch bump (`v0.17.0` -> `v0.17.1` -> `v0.17.2`).
- Script to run before commit: `powershell -ExecutionPolicy Bypass -File scripts/bump-version.ps1`
- Mandatory Git Step: ALWAYS commit with `feat(vX.Y.Z): ...` or `fix(vX.Y.Z): ...` and run `git push` autonomously.
- No commit or push may ever occur without incrementing the version.
