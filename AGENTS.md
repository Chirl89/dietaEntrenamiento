# Project Rules & Customizations

## 📌 Automatic Project Versioning Guideline

### Overview
Every web application built or updated in this codebase must display a visible, modern Version Badge in the UI (brand header, sidebar footer, and mobile top bar) and use the version string for asset cache busting (`?v=X.Y.Z`).

### Versioning Rules:
1. **Conversation Level (Minor Version)**:
   - Each NEW conversation opened by the user increments the minor version (`v0.1`, `v0.2`, `v0.3`...).
2. **Iteration Level (Patch Version)**:
   - Each edit/commit within the SAME conversation increments the patch version (`v0.1.0` -> `v0.1.1` -> `v0.1.2`...).
3. **UI Display**:
   - Show `<span class="version-badge">vX.Y.Z</span>` in the brand header, sidebar footer, and mobile header.
4. **Asset Cache Busting**:
   - Update script and style tags to `app.js?v=X.Y.Z`, `styles.css?v=X.Y.Z`, and JS module imports to `./data.js?v=X.Y.Z`.
5. **Git Commits**:
   - Include the version tag in git commit messages (e.g. `feat(v0.1.1): ...`).
