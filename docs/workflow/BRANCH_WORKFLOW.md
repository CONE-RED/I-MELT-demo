# 🚀 I-MELT Branch Workflow & Deployment Strategy

## 📋 **Branch Structure**

### 🔧 **`main`** - Development Branch
- **Purpose**: Active development and feature work
- **Who uses it**: Developers, new features, bug fixes
- **Stability**: Latest features, may have minor issues
- **Auto-deploy**: No (manual testing required)

### 🧪 **`staging`** - Testing Branch  
- **Purpose**: Integration testing and QA validation
- **Who uses it**: QA team, stakeholders, demo rehearsals
- **Stability**: Feature-complete, undergoing testing
- **Auto-deploy**: Optional (staging environment)

### 🏭 **`production`** - Production Branch
- **Purpose**: Live production releases for client demos
- **Who uses it**: Clients, executives, live demonstrations  
- **Stability**: Bulletproof, fully tested and approved
- **Auto-deploy**: Yes (production environment)

---

## 🔄 **Development Workflow**

### **Standard Feature Development**
```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/amazing-new-feature

# 3. Develop and commit
git add .
git commit -m "Add amazing new feature"

# 4. Push and create PR to staging
git push -u origin feature/amazing-new-feature
# Create PR: feature/amazing-new-feature → staging
```

### **Testing & QA Process**
```bash
# 1. Merge approved features to staging
git checkout staging
git merge feature/amazing-new-feature

# 2. Deploy to staging environment
npm run build
npm run deploy:staging

# 3. Run full test suite
npm test
npm run e2e:staging

# 4. QA validation and stakeholder approval
```

### **Production Release**
```bash
# 1. Only merge TESTED features to production
git checkout production  
git merge staging

# 2. Create production release
git tag v1.0.0
git push origin production --tags

# 3. Deploy to production
npm run deploy:production
```

---

## 🛡️ **Branch Protection Rules**

### **`staging` Branch Protection**
- ✅ Require PR reviews (1 reviewer minimum)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators in restrictions

### **`production` Branch Protection**  
- ✅ Require PR reviews (2 reviewers minimum)
- ✅ Require status checks to pass
- ✅ Require signed commits
- ✅ Dismiss stale PR approvals
- ✅ Restrict pushes to administrators only

---

## 📊 **Quality Gates**

### **Staging Quality Gate**
- [ ] All unit tests pass (`npm test`)
- [ ] TypeScript compilation success (`npm run check`)  
- [ ] No console errors in browser
- [ ] Demo hotkeys work (1, 2, 3, R, ?)
- [ ] LazyFlow UX principles maintained

### **Production Quality Gate**
- [ ] All staging requirements met
- [ ] Full E2E test suite passes
- [ ] Performance benchmarks met
- [ ] Security scan clean
- [ ] Demo rehearsal successful
- [ ] Stakeholder sign-off obtained

---

## 🎯 **Demo Environment Strategy**

### **Staging Demo Environment**
- **URL**: `https://staging-imelt.cone-red.com`
- **Purpose**: Internal testing, QA validation
- **Data**: Test heat data, safe to break
- **Updates**: Automatic on staging branch push

### **Production Demo Environment**
- **URL**: `https://imelt.cone-red.com`  
- **Purpose**: Client demos, investor presentations
- **Data**: Polished demo data, deterministic scenarios
- **Updates**: Manual deployment after approval

---

## 🚨 **Emergency Procedures**

### **Hotfix Process**
```bash
# 1. Create hotfix branch from production
git checkout production
git checkout -b hotfix/critical-fix

# 2. Make minimal fix
git commit -m "Fix critical production issue"

# 3. Deploy immediately to production
git checkout production
git merge hotfix/critical-fix
git push origin production

# 4. Back-merge to staging and main
git checkout staging
git merge production
git checkout main  
git merge staging
```

### **Rollback Process**
```bash
# 1. Revert to previous production tag
git checkout production
git reset --hard v1.0.0  # Previous stable version
git push origin production --force

# 2. Redeploy previous version
npm run deploy:production
```

---

## 📝 **Commit Message Standards**

### **Format**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Types**
- `feat`: New feature
- `fix`: Bug fix  
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Add/update tests
- `chore`: Maintenance tasks

### **Examples**
```bash
feat(lazyflow): add hero insight calculator for mission control

fix(api): resolve foam collapse scenario endpoint error

docs: update branch workflow and deployment strategy
```

---

## 🔐 **Access Control**

### **Branch Permissions**
- **`main`**: All developers (read/write)
- **`staging`**: Developers + QA (read/write with PR)
- **`production`**: Admins only (read/write with PR approval)

### **Repository Roles**
- **Admin**: Full access, can force push, manage settings
- **Maintainer**: Merge PRs, create releases, manage branches
- **Developer**: Create PRs, review code, push to main
- **QA**: Create issues, review PRs, test staging

---

## 🎪 **Demo Day Checklist**

### **Pre-Demo (1 hour before)**
- [ ] Verify production environment is healthy
- [ ] Test all demo scenarios (1, 2, 3, R)
- [ ] Confirm LazyFlow UX is working perfectly
- [ ] Load test heat data (93378 with seed=42)
- [ ] Check confidence rings and hero insights

### **Demo Setup (15 minutes before)**  
- [ ] Open `https://imelt.cone-red.com` in presentation browser
- [ ] Verify auto-start simulator activated
- [ ] Test foam collapse scenario (hotkey `2`)
- [ ] Test AI recovery (hotkey `R`)
- [ ] Confirm "mind-reading" UX is impressive

### **Post-Demo**
- [ ] Note any issues or feedback
- [ ] Update demo scenarios if needed
- [ ] Plan improvements for next sprint

---

## 🚀 **Quick Commands**

```bash
# Switch to development
git checkout main

# Deploy to staging  
git checkout staging && git push origin staging

# Release to production
git checkout production && git push origin production

# Check all branches
git branch -a

# Clean up old branches
git branch -d feature/old-feature
git push origin --delete feature/old-feature
```

---

**Remember**: `production` branch should ALWAYS be demo-ready! 🎯

**LazyFlow Principle**: Every merge to production should make demos more impressive, never less! ⚡