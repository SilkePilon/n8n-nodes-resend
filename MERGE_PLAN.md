# Merge Plan: jannispkz/n8n-nodes-resend-complete → SilkePilon/n8n-nodes-resend

**Date:** January 27, 2026  
**PR:** #15  
**Fork Commit:** c7d67da5edd760fe925cb426ebe7fe6ccb891add

---

## 🎯 Objective

Merge the comprehensive improvements from jannispkz's fork while preserving our package identity and branding.

---

## 📋 Pre-Merge Checklist

- [ ] Create GitButler branch for merge work: `merge-pr-15`
- [ ] Add fork remote: `git remote add fork https://github.com/jannispkz/n8n-nodes-resend-complete.git`
- [ ] Fetch fork changes: `git fetch fork`
- [ ] Cherry-pick or merge fork's main branch

---

## 🔄 Merge Strategy

### Step 1: Setup (GitButler + Git)
```bash
# Create new GitButler branch for this work
but branch new merge-pr-15 --description "Merge jannispkz fork improvements"

# Add fork as remote
git remote add fork https://github.com/jannispkz/n8n-nodes-resend-complete.git

# Fetch fork
git fetch fork main
```

### Step 2: Initial Merge
```bash
# Merge fork's changes into our merge branch
git merge fork/main --no-commit --no-ff

# Or cherry-pick the main commit if needed
# git cherry-pick c7d67da5edd760fe925cb426ebe7fe6ccb891add
```

### Step 3: File-by-File Resolution

---

## 📁 Files to Merge

### 🔴 CRITICAL - Must Restore Identity

#### ✅ package.json
- [x] Restore package name: `n8n-nodes-resend`
- [x] Restore author: SilkePilon
- [x] Restore repository URLs
- [x] Keep version as: `1.2.3` → decide bump to `2.0.0` or `1.3.0`
- [x] Keep Node requirement: decide `>=20.15` or `>=20.20.0`
- [x] Adopt new keywords: `broadcast`, `template`, `contacts`

#### ✅ README.md
- [ ] Keep header image: `.github/media/resend.png` (not `readme_header_new.png`)
- [ ] Keep npm badge pointing to `n8n-nodes-resend`
- [ ] Adopt new resource documentation structure
- [ ] Keep installation instructions referencing `n8n-nodes-resend`
- [ ] Restore GitHub links to `SilkePilon/n8n-nodes-resend`
- [ ] Remove fork acknowledgment section

---

### ✅ ADOPT - Core Improvements

#### ✅ nodes/Resend/GenericFunctions.ts (NEW FILE)
- [x] Accept entire file - shared helper functions

#### ✅ nodes/Resend/Resend.node.ts
- [ ] Accept refactored version with new resources:
  - Templates (create, get, update, delete, list)
  - Segments (replaces Audiences)
  - Topics (create, get, update, delete, list)
  - Contact Properties (create, get, update, delete, list)
  - Webhooks (create, get, update, delete, list)
- [ ] Keep enhanced email operations
- [ ] Keep improved error handling

#### ✅ nodes/Resend/ResendTrigger.node.ts
- [ ] Accept enhanced webhook signature verification
- [ ] Accept new event types (domain.*, email.delivery_delayed)

#### ✅ credentials/ResendApi.credentials.ts
- [ ] Review minimal changes (likely no conflicts)

---

### 🟡 SELECTIVE - Documentation & Dev Tools

#### ✅ .nvmrc (NEW FILE)
- [x] Accept: Pins Node version to 20.20.0
- Decision: Keep if we adopt >=20.20.0 requirement

#### ✅ AGENTS.md (NEW FILE)
- [ ] Accept: Useful for AI-assisted development
- Optional: Can remove if not needed

#### ✅ CLAUDE.md (NEW FILE)
- [ ] Accept: Points to AGENTS.md
- Optional: Can remove if not needed

#### ✅ credentials/AGENTS.md (NEW FILE)
- [ ] Accept: Documentation for credentials
- Optional: Can remove if not needed

#### ✅ credentials/CLAUDE.md (NEW FILE)
- [ ] Accept: Points to AGENTS.md
- Optional: Can remove if not needed

#### ✅ nodes/Resend/AGENTS.md (NEW FILE)
- [ ] Accept: Documentation for node internals
- Optional: Can remove if not needed

#### ✅ nodes/Resend/CLAUDE.md (NEW FILE)
- [ ] Accept: Points to AGENTS.md
- Optional: Can remove if not needed

---

### ✅ ADOPT - Config & Build

#### ✅ .eslintrc.js
- [x] Accept: Adds `_audit/**` to ignore patterns

#### ✅ .gitignore
- [x] Accept: Adds `plans`, `.claude/` to ignore

#### ✅ .github/workflows/release.yml
- [x] Accept: Minor doc change (audience → segment)

---

### ❌ REJECT - Fork-Specific Assets

#### ❌ .github/media/readme_header_new.png (NEW FILE)
- [ ] Reject: Fork branding, keep ours

#### ❌ .github/media/readme_header_new.psd (NEW FILE)
- [ ] Reject: Fork branding source file

---

## ⚙️ Post-Merge Actions

### Version Decision
- [ ] **Option A:** Bump to `2.0.0` (breaking changes: Audiences → Segments)
- [ ] **Option B:** Bump to `1.3.0` (feature additions with backwards compat docs)
- [ ] **Option C:** Keep `1.2.3` and bump later

### Node Version Decision
- [ ] **Option A:** Keep `>=20.15` (broader compatibility)
- [ ] **Option B:** Adopt `>=20.20.0` (aligns with fork, stricter)

### Testing Checklist
- [ ] Build succeeds: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Formatting clean: `npm run format`
- [ ] Test email send operation
- [ ] Test new template operations
- [ ] Test webhook trigger with signature verification

### Commit Plan (GitButler)
- [ ] Stage changes to `merge-pr-15` branch
- [ ] Commit with message: "feat: merge jannispkz fork improvements (#15)"
- [ ] Push branch: `but push merge-pr-15`
- [ ] Create PR or merge to master

---

## 📊 Summary of Changes

### New Features
- ✅ Templates API (full CRUD)
- ✅ Segments (replaces Audiences)
- ✅ Topics API
- ✅ Contact Properties API
- ✅ Webhooks API
- ✅ Enhanced pagination (returnAll/limit)
- ✅ Shared helper functions (GenericFunctions.ts)

### Security Improvements
- ✅ Enhanced webhook signature verification
- ✅ Better Svix signature handling

### Code Quality
- ✅ Reduced code duplication
- ✅ Better error messages
- ✅ Cleaner parameter organization

### Breaking Changes
- ⚠️ Audiences concept replaced with Segments
- ⚠️ Some API response structures changed

---

## 🚨 Important Notes

1. **Package Name**: MUST remain `n8n-nodes-resend` for npm continuity
2. **Author**: MUST remain SilkePilon
3. **Repository**: MUST point to `SilkePilon/n8n-nodes-resend`
4. **Branding**: Keep original images and branding
5. **Backwards Compatibility**: Document migration path for Audiences → Segments

---

## 📝 Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Package name | `n8n-nodes-resend` | Preserve npm package identity |
| Author | SilkePilon | Original author |
| Version bump | TBD | Depends on breaking change stance |
| Node version | TBD | Balance compatibility vs. strictness |
| AGENTS.md files | TBD | Useful for AI dev, but optional |
| Fork branding assets | Reject | Keep original branding |

---

## 🎉 Success Criteria

- [x] All new features merged successfully
- [ ] Package identity preserved
- [ ] Tests pass (build, lint, format)
- [ ] Documentation updated appropriately
- [ ] No merge conflicts in final code
- [ ] Ready to publish to npm
