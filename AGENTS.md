# Project Rules & Customizations

## 📌 Automatic Project Versioning Guideline

### Overview
Every change, feature, fix, or update in this codebase **MUST ALWAYS** increment the project version and reflect it in `version.json`, `js/version.js`, `index.html`, and `app.js`, as well as cache-busting strings (`?v=X.Y.Z`).

### Strict Versioning Rules:
1. **Conversation Level (Minor Version)**:
   - The first commit of each NEW conversation increments the MINOR version (`v0.16.0` -> `v0.17.0`, `v0.17.0` -> `v0.18.0`).
2. **Iteration / Push Level (Patch Version)**:
   - EVERY single edit, commit, and push within the SAME conversation increments the PATCH version (`v0.17.0` -> `v0.17.1` -> `v0.17.2`...).
   - **RULE**: There are NEVER two consecutive pushes or commits with the same version number. Every push MUST have a higher version than the previous one.
3. **Automated Version Bumper Script**:
   - Before committing, always run:
     ```powershell
     powershell -ExecutionPolicy Bypass -File scripts/bump-version.ps1 -Type patch
     ```
     (or `-Type minor` for new conversation start).
   - Alternatively, Git pre-commit hooks located in `.githooks/` are configured to automatically bump and stage version files if not already bumped.
4. **UI Display & Cache Busting**:
   - All `.app-version-tag` badges, header badges, and sidebar footer tags will automatically display `vX.Y.Z`.
   - Asset URLs (`styles.css?v=X.Y.Z`, `app.js?v=X.Y.Z`) are updated to guarantee immediate cache-invalidation on mobile Safari / PWA.
5. **Git Commits & Push Mandatory Rule**:
   - The agent MUST ALWAYS execute:
     1. Bump version: `powershell -ExecutionPolicy Bypass -File scripts/bump-version.ps1 -Type patch` (or minor)
     2. Stage all: `git add .`
     3. Commit with version: `git commit -m "feat(vX.Y.Z): <description>"` or `git commit -m "fix(vX.Y.Z): <description>"`
     4. Push: `git push`
   - No task is finished until pushed to `origin/main`.

## ⚡ Autonomous Execution & Zero Interruption Rule
- Execute all code modifications, terminal commands, file creations, testing, and git operations autonomously without pausing to request confirmation or asking trivial approval questions.
- Work proactively from start to finish on every task.

<!-- version-hook-active -->
