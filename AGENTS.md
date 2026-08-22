# Project Rules & Customizations

## 📌 Automatic Project Versioning Guideline

### Overview
Every web application built or updated in this codebase must display a visible, modern Version Badge in the UI (brand header, sidebar footer, and mobile top bar) and use the version string for asset cache busting (`?v=X.Y.Z`).

### Versioning Rules:
1. **Conversation Level (Minor Version)**:
   - Each NEW conversation opened by the user increments the minor version (`v0.1`, `v0.2`, `v0.3`...).
2. **Iteration Level (Patch Version)**:
   - Each edit/commit within the SAME conversation increments ONLY the patch version (`v0.6.9` -> `v0.6.10` -> `v0.6.11`...).
   - CRITICAL: NEVER bump the minor version (e.g. from `v0.6.9` to `v0.7.0`) during patch iterations. When patch reaches `.9`, ALWAYS continue with `.10`, `.11`, `.12`, etc. The minor version (`v0.6` -> `v0.7`) is ONLY incremented when a NEW conversation is started.
3. **UI Display**:
   - Show `<span class="version-badge">vX.Y.Z</span>` in the brand header, sidebar footer, and mobile header.
4. **Asset Cache Busting**:
   - Update script and style tags to `app.js?v=X.Y.Z`, `styles.css?v=X.Y.Z`, and JS module imports to `./data.js?v=X.Y.Z`.
5. **Git Commits & Push Mandatory Rule**:
   - The agent MUST ALWAYS automatically execute `git add .`, `git commit -m "feat(vX.Y.Z): ..."` AND `git push` immediately after completing every change or task. No change is complete until it is committed with the version tag and pushed to remote git.

## ⚡ Autonomous Execution & Zero Interruption Rule
- Execute all code modifications, terminal commands, file creations, testing, and git operations autonomously without pausing to request confirmation or asking trivial approval questions.
- Work proactively from start to finish on every task.

