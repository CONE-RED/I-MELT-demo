# 🧭 I-MELT Documentation Navigator
*Intelligent guide for Claude agents working on the I-MELT steel optimization demo*

---

## 🎯 **For Claude Agents: Start Here**

**Current Project State**: I-MELT is a demo system showcasing AI-driven steel production optimization. The system is functional but undergoing Factory-Ready enhancements for executive presentations.

**Your Role**: Help implement features, fix issues, and enhance the LazyFlow UX vision while maintaining demo reliability.

---

## 📂 **Documentation Structure**

### 🏗️ **`architecture/` - System Design & UX**
**When to use**: Implementing new features, UI changes, or understanding component relationships

- **`COMPONENT_ENHANCEMENT_ROADMAP.md`** → **READ FIRST for UI work**
  - LazyFlow UX methodology (8/10 → 10/10 "mind-reading" interface)
  - Component-by-component enhancement plans  
  - Visual design improvements needed
  - **Use when**: Modifying Dashboard, TopBar, SideNav, or any UI components

- **`LAZYFLOW_UX_ENHANCEMENT_PLAN.md`** → **Core UX philosophy**
  - "One-tap magic" and "invisible intelligence" principles
  - User experience metrics and success criteria
  - **Use when**: Questioning UX decisions or designing new interactions

### 🧪 **`testing/` - Quality Assurance**
**When to use**: Writing tests, fixing bugs, or validating functionality

- **`FACTORY_READY_ATDD_SPECS.md`** → **Critical for production readiness**
  - 12 Go/No-Go gates that must pass for steel industry demos
  - ATDD test specifications with exact acceptance criteria
  - **Use when**: Implementing auto-start, PDF generation, or demo features

- **`TESTING_PLAN.md`** → **Testing strategy and protocols**  
  - Comprehensive test coverage plans
  - Backend, frontend, and integration testing approaches
  - **Use when**: Writing new tests or debugging existing functionality

- **`COMPREHENSIVE_TEST_RESULTS.md`** → **Known issues and fixes**
  - Current test status and identified problems
  - Component-specific issues and remediation steps
  - **Use when**: Debugging specific component failures

### 📋 **`planning/` - Strategic Direction**
**When to use**: Understanding project priorities and implementation order

- **`ENHANCEMENT_ROADMAP.md`** → **Strategic development plan**
  - Dual-track strategy: Factory-Ready + LazyFlow Vision
  - Sprint-based implementation with clear success metrics
  - **Use when**: Planning work priority or understanding long-term vision

### 🔄 **`workflow/` - Development Process**
**When to use**: Git operations, deployments, or collaboration

- **`BRANCH_WORKFLOW.md`** → **Git strategy and deployment process**
  - Branch structure (main → staging → production)
  - Demo day preparation and quality gates
  - **Use when**: Creating branches, merging, or preparing releases

---

## 🚨 **Critical Context for Agents**

### **🏭 Factory-Ready Priority**
**Current Focus**: Passing 12 Go/No-Go gates for steel industry executives
- **G1**: Auto-start simulation (no empty cards during demos)
- **G5**: Real PDF ROI reports (not mock downloads)
- **G3**: Visual cause→effect indicators
- **G2**: One-key reset functionality

**Files to check first**: `docs/testing/FACTORY_READY_ATDD_SPECS.md`

### **⚡ LazyFlow Vision**
**Long-term Goal**: 10/10 "Laziness Score" - telepathic steel mastery
- Current: 8/10 (Hero insights working, predictive actions implemented)
- Target: Mind-reading interface that anticipates user needs

**Files to check first**: `docs/architecture/LAZYFLOW_UX_ENHANCEMENT_PLAN.md`

### **🎮 Demo Reliability** 
**Critical**: System must be 100% deterministic for presentations
- Seed=42 for consistent heat data (93378)
- Hotkeys: 1/2/3 (scenarios), R (recovery), ? (help)
- No random behavior that could disrupt executive demos

---

## 🛠️ **Common Agent Tasks & Documentation Guide**

### **Task: Implementing New UI Component**
1. **Read**: `docs/architecture/COMPONENT_ENHANCEMENT_ROADMAP.md`
2. **Check**: Component priority matrix and LazyFlow principles
3. **Follow**: Visual design guidelines and spacing intelligence
4. **Test**: Against usability checklist in same document

### **Task: Fixing Demo Issues**
1. **Read**: `docs/testing/COMPREHENSIVE_TEST_RESULTS.md`
2. **Check**: Known issues section for your specific problem
3. **Reference**: `docs/testing/FACTORY_READY_ATDD_SPECS.md` for acceptance criteria
4. **Validate**: Against Go/No-Go gate requirements

### **Task: Adding New Feature**
1. **Read**: `docs/planning/ENHANCEMENT_ROADMAP.md`
2. **Check**: Current sprint priorities and implementation order
3. **Reference**: `docs/architecture/LAZYFLOW_UX_ENHANCEMENT_PLAN.md` for UX alignment
4. **Test**: Following `docs/testing/TESTING_PLAN.md` protocols

### **Task: Preparing for Demo/Release**
1. **Read**: `docs/workflow/BRANCH_WORKFLOW.md`
2. **Check**: Demo day checklist and quality gates
3. **Validate**: All ATDD tests pass from `docs/testing/FACTORY_READY_ATDD_SPECS.md`
4. **Verify**: LazyFlow metrics meet targets

---

## 🎯 **Success Metrics to Track**

### **Factory-Ready Gates**
- [ ] G1: Auto-start works (no empty cards)
- [ ] G2: One-key reset functional
- [ ] G3: Visual cause→effect indicators
- [ ] G5: Real PDF generation
- [ ] G4: AI explainability (WHY bullets)
- [ ] G6-G12: See `docs/testing/FACTORY_READY_ATDD_SPECS.md`

### **LazyFlow UX Score**
- **Current**: 8/10 (Hero insights + predictive actions working)
- **Target**: 10/10 (Mind-reading telepathic interface)
- **Metrics**: User actions ≤3, time to value <5s, "How did it know?" reactions

---

## 🚀 **Quick Reference Commands**

```bash
# Development
npm run dev                    # Start with auto-simulation
npm run test                   # Run full test suite
npm run check                  # TypeScript validation

# Testing specific gates
npm run test:gate:G1          # Auto-start validation
npm run test:factory-sprint   # All factory-ready tests

# Demo preparation
npm run build && npm start    # Production build test
```

---

## 💡 **Agent Decision Framework**

### **When implementing changes, ask:**
1. **Does this support Factory-Ready demos?** → Check ATDD specs
2. **Does this align with LazyFlow principles?** → Check UX enhancement plan  
3. **Will this work reliably in executive presentations?** → Check workflow guidelines
4. **Is this the right priority?** → Check enhancement roadmap

### **Red flags to avoid:**
- ❌ Random/non-deterministic behavior (breaks demo consistency)
- ❌ Increasing cognitive load (violates LazyFlow principles)  
- ❌ Empty card states during presentations (fails Factory-Ready gates)
- ❌ Complex multi-step workflows (against "one-tap magic" vision)

---

**Remember**: This system demos AI value to steel industry executives. Every change should either improve demo reliability or advance the LazyFlow "mind-reading" user experience! 🧙‍♂️⚡