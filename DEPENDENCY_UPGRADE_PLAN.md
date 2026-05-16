# Dependency Upgrade Plan - Security Vulnerabilities Fix

## Executive Summary

This document outlines the plan to address **19 total vulnerabilities** (11 high, 2 moderate in backend; 6 high, 2 moderate in frontend) identified by npm audit, along with deprecated package replacements.

---

## 🔴 bobscribe-backend Upgrades

### Critical Security Updates

#### 1. Fastify v4 → v5 (BREAKING CHANGE)
**Current:** `^4.26.0`  
**Target:** `^5.8.5`

**Vulnerabilities Fixed:**
- ✅ fast-uri path traversal (GHSA-q3j6-qgpj-74h6) - High
- ✅ fast-uri host confusion (GHSA-v39h-62p7-jpjc) - High  
- ✅ DoS via unbounded memory (GHSA-mrq3-vjjr-p77c) - Low
- ✅ Content-Type header bypass (GHSA-jx2c-rxcm-jvmq) - High
- ✅ request.protocol spoofing (GHSA-444r-cwp2-x5xf) - Moderate

**Breaking Changes to Review:**
- Plugin registration API may have changed
- Schema validation updates
- Request/Reply lifecycle changes

**Code Impact Assessment:**
- ✅ [`src/index.ts`](bobscribe-backend/src/index.ts:1) - Uses standard Fastify patterns, likely compatible
- ✅ [`src/routes/planner.routes.ts`](bobscribe-backend/src/routes/planner.routes.ts:1) - Need to verify route handlers
- ⚠️ Plugin registrations (cors, multipart) - May need syntax updates

#### 2. TypeScript ESLint v6 → v8 (BREAKING CHANGE)
**Current:** `^6.19.0` (both plugin and parser)  
**Target:** `^8.59.3`

**Vulnerabilities Fixed:**
- ✅ minimatch ReDoS (GHSA-3ppc-4f35-3m26) - High
- ✅ minimatch combinatorial backtracking (GHSA-7r86-cg39-jmmj) - High
- ✅ minimatch nested extglobs (GHSA-23c5-xmqv-rm74) - High

**Breaking Changes:**
- New ESLint rules and configurations
- Some rules deprecated or renamed
- TypeScript version requirements may change

#### 3. ESLint v8 → v9 (RECOMMENDED)
**Current:** `^8.56.0` (deprecated)  
**Target:** `^9.x`

**Deprecation Warnings:**
- ⚠️ eslint@8.57.1 is no longer supported
- ⚠️ @humanwhocodes/config-array → @eslint/config-array
- ⚠️ @humanwhocodes/object-schema → @eslint/object-schema

**Breaking Changes:**
- Flat config format required (eslint.config.js)
- Need to migrate from .eslintrc format

### Deprecated Packages to Replace

1. **inflight** → Use `lru-cache` for async request coalescing
2. **glob v7** → Upgrade to glob v10+
3. **rimraf v3** → Upgrade to rimraf v4+

---

## 🟡 bobscribe-planner Upgrades

### Critical Security Updates

#### 1. Vite v5 → v8 (BREAKING CHANGE)
**Current:** `^5.0.8`  
**Target:** `^8.0.13`

**Vulnerabilities Fixed:**
- ✅ esbuild request/response vulnerability (GHSA-67mh-4wv8-2f99) - Moderate
- ✅ Vite path traversal in .map handling (GHSA-4w7w-66w2-5vf9) - Moderate

**Breaking Changes to Review:**
- Plugin API changes
- Configuration structure updates
- Build output changes

**Code Impact Assessment:**
- ⚠️ [`vite.config.ts`](bobscribe-planner/vite.config.ts:1) - Simple config, likely compatible
- ✅ Uses standard React plugin - Should work with v8

#### 2. TypeScript ESLint v6 → v8 (NON-BREAKING for runtime)
**Current:** `^6.14.0` (both plugin and parser)  
**Target:** `^8.59.3`

**Vulnerabilities Fixed:**
- ✅ minimatch ReDoS vulnerabilities (same as backend)

#### 3. ESLint v8 → v9 (RECOMMENDED)
**Current:** `^8.55.0` (deprecated)  
**Target:** `^9.x`

**Code Impact Assessment:**
- ⚠️ [`.eslintrc.cjs`](bobscribe-planner/.eslintrc.cjs:1) - Needs migration to flat config

---

## 📋 Implementation Strategy

### Phase 1: Backend Updates (Breaking Changes)

```bash
cd bobscribe-backend

# Update Fastify and related packages
npm install fastify@^5.8.5 @fastify/cors@latest @fastify/multipart@latest

# Update TypeScript ESLint
npm install -D @typescript-eslint/eslint-plugin@^8.59.3 @typescript-eslint/parser@^8.59.3

# Update ESLint (optional but recommended)
npm install -D eslint@^9.x
```

**Post-Update Actions:**
1. Test server startup: `npm run dev`
2. Verify all routes work correctly
3. Check error handling
4. Verify CORS and multipart functionality
5. Run existing tests if available

### Phase 2: Frontend Updates (Breaking Changes)

```bash
cd bobscribe-planner

# Update Vite
npm install -D vite@^8.0.13

# Update TypeScript ESLint
npm install -D @typescript-eslint/eslint-plugin@^8.59.3 @typescript-eslint/parser@^8.59.3

# Update ESLint (optional but recommended)
npm install -D eslint@^9.x
```

**Post-Update Actions:**
1. Test dev server: `npm run dev`
2. Test build: `npm run build`
3. Verify all components render correctly
4. Check for console errors
5. Test production preview: `npm run preview`

### Phase 3: ESLint Migration (Both Projects)

If upgrading to ESLint v9, create new flat config files:

**Backend:** Create `eslint.config.js`
**Frontend:** Create `eslint.config.js` and remove `.eslintrc.cjs`

---

## ⚠️ Risk Assessment

### High Risk Changes
1. **Fastify v4 → v5** - Core framework upgrade, potential API changes
2. **Vite v5 → v8** - Build tool upgrade, may affect bundling

### Medium Risk Changes
1. **TypeScript ESLint v6 → v8** - Linting rules may change
2. **ESLint v8 → v9** - Configuration format change

### Low Risk Changes
1. Plugin updates (cors, multipart) - Usually backward compatible

---

## 🧪 Testing Checklist

### Backend Testing
- [ ] Server starts without errors
- [ ] Health check endpoint responds: `GET /`
- [ ] Planner analyze endpoint works: `POST /api/v1/planner/analyze`
- [ ] CORS headers present in responses
- [ ] File upload functionality works
- [ ] Error handling works correctly
- [ ] Logs display properly

### Frontend Testing
- [ ] Dev server starts: `npm run dev`
- [ ] Build completes: `npm run build`
- [ ] All pages render correctly
- [ ] API calls to backend work
- [ ] No console errors
- [ ] Production build works: `npm run preview`

---

## 📝 Rollback Plan

If issues occur after updates:

```bash
# Backend rollback
cd bobscribe-backend
git checkout package.json package-lock.json
npm install

# Frontend rollback
cd bobscribe-planner
git checkout package.json package-lock.json
npm install
```

---

## 🎯 Success Criteria

✅ All 19 vulnerabilities resolved  
✅ No deprecated package warnings  
✅ All tests pass  
✅ Applications run without errors  
✅ No breaking changes in functionality  

---

## 📚 Additional Resources

- [Fastify v5 Migration Guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/)
- [Vite v8 Migration Guide](https://vitejs.dev/guide/migration.html)
- [ESLint v9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [TypeScript ESLint v8 Release Notes](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8)

---

**Generated:** 2026-05-16  
**Status:** Ready for Implementation