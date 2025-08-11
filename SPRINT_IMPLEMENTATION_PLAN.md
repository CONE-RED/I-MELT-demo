# 🏃‍♂️ Sprint-Based Implementation Plan
*ATDD-Driven Development for Factory-Ready Steel Industry Demos*

---

## 🎯 **Implementation Strategy**

Following **Conny 4.0's brutal Go/No-Go assessment**, we're implementing a **dual-track approach** prioritizing factory readiness while maintaining the LazyFlow UX vision.

**Core Principle**: **Every sprint delivers measurable demo improvement with ATDD validation**

---

## 🏭 **FACTORY-READY TRACK: Critical Path to Steel Industry Success**

### **🚀 Factory Sprint 1: Critical Demo Infrastructure**
**Duration**: 3 weeks  
**Goal**: Pass Go/No-Go Gates G1, G2, G3, G5  
**Outcome**: Eliminate "empty card" failures, provide real ROI materials

#### **Week 1: Deterministic Foundation**

**Epic 1.1: Auto-Start Simulation (G1)**
```typescript
// ATDD Feature
Feature: Deterministic auto-start
  As a presenter
  I want simulation to start automatically with consistent data
  So that I never see empty cards during demos

Scenario: Page loads with running simulation
  Given I navigate to demo URL
  When page loads
  Then simulation auto-starts with seed=42
  And heat 93378 shows active data
  And timeline displays progress within 5 seconds
```

**Implementation Tasks**:
- [ ] Create `AutoStartService.ts` with seed parameter handling
- [ ] Update server `/api/demo/start` to accept URL parameters
- [ ] Modify MissionControl to trigger auto-start on mount
- [ ] Add loading states that transition to real data
- [ ] Implement deep-link support (`/?seed=42&scenario=energy-spike`)

**ATDD Tests**:
```bash
# API Tests
npm run test:api -- --grep "deterministic start"

# E2E Tests  
npm run test:e2e -- --grep "auto-start simulation"
```

**Epic 1.2: One-Key Reset (G2)**
```typescript
Feature: Deterministic demo reset
  As a presenter  
  I want to reset to identical conditions
  So that every demo run is predictable

Scenario: Reset restores baseline
  Given demo is running with modifications
  When I press "0" or click "Reset & Seed"
  Then simulation restarts with seed=42
  And metrics return to baseline values
```

**Implementation Tasks**:
- [ ] Add "Reset & Seed" button to MissionControl
- [ ] Implement hotkey handler for "0" key
- [ ] Create `resetToBaseline()` API endpoint
- [ ] Preserve URL parameters during reset
- [ ] Clear all scenario modifications

---

#### **Week 2: Visual Impact & ROI**

**Epic 1.3: Visual Cause→Effect (G3)**
```typescript
Feature: Visible cause-effect relationships
  As a presenter
  I want to show measurable impact of actions
  So that value is visually obvious

Scenario: Energy spike shows measurable impact
  Given demo is running normally
  When I trigger "Energy Spike"
  Then kWh/t increases within 10 seconds
  And delta indicators show change direction
  And confidence updates reflect new conditions
```

**Implementation Tasks**:
- [ ] Create `DeltaIndicator.tsx` component (↗↘→)
- [ ] Add before/after comparison display
- [ ] Implement metric change animations
- [ ] Update HeroInsightCalculator for scenario impacts
- [ ] Add progress bars for improvement processes

**Epic 1.4: Real PDF ROI Generation (G5)**
```typescript
Feature: One-click PDF ROI generation
  As a decision maker
  I want financial analysis in PDF format
  So that I can share with stakeholders

Scenario: Generate real PDF with line items
  Given demo shows improvements
  When I click "Generate ROI Report"
  Then PDF downloads within 10 seconds
  And contains energy cost line items
  And shows ≥€1000/month savings
```

**Implementation Tasks**:
- [ ] Install PDFKit: `npm install pdfkit @types/pdfkit`
- [ ] Create `PDFService.ts` for server-side generation
- [ ] Build ROI calculation engine with configurable prices
- [ ] Design professional PDF template
- [ ] Add API endpoint: `POST /api/roi/report`
- [ ] Update MissionControl with ROI button

---

#### **Week 3: Integration & Testing**

**Integration Tasks**:
- [ ] Wire all components together in MissionControl
- [ ] Add comprehensive error handling
- [ ] Implement loading states and transitions
- [ ] Test scenario flow: Normal → Crisis → Recovery → ROI
- [ ] Performance optimization for sub-5-second loads

**ATDD Validation**:
```bash
# Full test suite for Factory Sprint 1
npm run test:factory-sprint-1

# Specific gate validation
npm run test:gate:G1  # Auto-start
npm run test:gate:G2  # Reset  
npm run test:gate:G3  # Cause-effect
npm run test:gate:G5  # PDF ROI
```

**Sprint 1 Definition of Done**:
- [ ] All G1, G2, G3, G5 ATDD tests pass
- [ ] No empty cards on page load
- [ ] Real PDF generation working
- [ ] Visual delta indicators functional
- [ ] One-key reset maintains consistency
- [ ] Demo runs smoothly without presenter intervention

---

### **🔍 Factory Sprint 2: Trust & Explainability**  
**Duration**: 2 weeks  
**Goal**: Pass Go/No-Go Gates G4, G6, G9, G10  
**Outcome**: Build credibility with WHY explanations and security docs

#### **Week 4: Explainable AI**

**Epic 2.1: WHY Explanations (G4)**
```typescript
Feature: Explainable AI recommendations
  As an operator
  I want to understand why actions are recommended
  So that I can trust and verify decisions

Scenario: Recommendations show WHY bullets
  Given system shows recommendation
  When I view recommendation card
  Then WHY bullet points are displayed
  And bullets reference specific parameters (PF, THD, foam)
  And confidence bar is visible
```

**Implementation Tasks**:
- [ ] Create `ExplanationEngine.ts` for WHY generation
- [ ] Add physics-based reasoning (power factor, THD, foam index)
- [ ] Design WHY bullet component with icons
- [ ] Update PredictiveActionEngine with explanations
- [ ] Add deterministic fallbacks for LLM failures

**Epic 2.2: LF/CC Sync Guard (G6)**
```typescript
Feature: Ladle/Caster synchronization monitoring
  As a process manager
  I want to prevent temperature losses during delays
  So that I avoid >€1M/year losses

Scenario: Caster delay shows risk
  Given demo is in tapping phase
  When I trigger "Caster Delay"
  Then banner shows "ΔT loss risk"
  And € loss per 10°C is displayed
```

**Implementation Tasks**:
- [ ] Create caster delay scenario in scenarios/
- [ ] Add temperature loss calculation (€ per °C)
- [ ] Design sync guard banner component
- [ ] Implement superheat target recommendations
- [ ] Add to demo hotkey system

---

#### **Week 5: Security & Transparency**

**Epic 2.3: Security Integration Drawer (G9)**
```typescript
Feature: Security and integration documentation
  As an IT decision maker
  I want to understand security approach
  So that I can assess technical feasibility

Scenario: Security drawer provides comprehensive info
  Given I click "Security/Integration" tab
  When drawer opens
  Then RBAC overview is visible
  And historian/OPC read-only path is documented
  And I can answer IT questions in 30 seconds
```

**Implementation Tasks**:
- [ ] Create SecurityDrawer.tsx component
- [ ] Document RBAC implementation approach
- [ ] Add historian/OPC-UA integration pathway
- [ ] Include air-gap deployment options
- [ ] Add audit log capabilities overview

**Epic 2.4: Truth-in-Demo (G10)**
```typescript
Feature: Demo transparency and provenance
  As a prospect
  I want to understand what data is real vs simulated
  So that I can set appropriate expectations

Scenario: Provenance pills on all data
  Given I view any data card
  When I check data source
  Then provenance pill shows "Simulated from anonymized 1,574 heats"
  And confidence level is displayed
```

**Implementation Tasks**:
- [ ] Create ProvenancePill.tsx component
- [ ] Add to all data cards and metrics
- [ ] Include confidence indicators throughout
- [ ] Align ranges with deck claims (8-12% energy, ±2°C)
- [ ] Add dataset size and anonymization details

---

### **✨ Factory Sprint 3: Professional Polish**
**Duration**: 2 weeks  
**Goal**: Pass Go/No-Go Gates G7, G8, G11, G12  
**Outcome**: Executive-ready presentation with presenter tools

#### **Week 6: Persona & Presenter Tools**

**Epic 3.1: Persona Adaptation (G7)**
```typescript
Feature: Role-based interface adaptation
  As different user types
  I want information relevant to my role
  So that I focus on what matters to me

Scenario: Operator sees process signals
  Given I select "Operator" persona
  When viewing dashboard
  Then process signals are prominent
  And action buttons are large and clear
```

**Implementation Tasks**:
- [ ] Create PersonaSelector.tsx component
- [ ] Implement persona-specific layouts
- [ ] Operator: Process signals + action buttons
- [ ] Manager: Financial KPIs + ROI highlights  
- [ ] Metallurgist: Chemistry + projections
- [ ] Store persona preference in localStorage

**Epic 3.2: Talk-Track Overlay (G11)**
```typescript
Feature: Presenter guidance overlay
  As a presenter
  I want guided talking points
  So that I don't lose narrative flow if interrupted

Scenario: Talk-track activation
  Given I am presenting
  When I press "~" key
  Then overlay shows Hook → Pain → Spike → Win → ROI → Next step
```

**Implementation Tasks**:
- [ ] Create TalkTrackOverlay.tsx component
- [ ] Add narrative stage progression
- [ ] Include timing guidance (Hook 15s, Pain 20s, etc.)
- [ ] Implement hotkey handler for "~"
- [ ] Add stage highlighting and next step preview

---

#### **Week 7: Completion & Artifacts**

**Epic 3.3: Post-Call Artifacts (G12)**
```typescript
Feature: Follow-up materials generation
  As a prospect
  I want demo materials after the call
  So that I can review and share with team

Scenario: Send materials functionality
  Given demo is complete
  When I click "Send me this"
  Then email is requested
  And ROI PDF is attached
  And one-pager mirrors deck promises
```

**Implementation Tasks**:
- [ ] Create email capture form
- [ ] Build one-pager template with deck promises
- [ ] Implement email service integration
- [ ] Add contact information and next steps
- [ ] Include references and payback timeline

**Epic 3.4: Offline Grace (G8)**
```typescript
Feature: Graceful connectivity handling
  As a presenter
  I want demo to work during network issues
  So that Wi-Fi problems don't ruin presentation

Scenario: WebSocket disconnection handling
  Given demo runs with WebSocket
  When connection drops
  Then demo continues with buffered data
  And latency badge shows status
```

**Implementation Tasks**:
- [ ] Add WebSocket disconnection detection
- [ ] Implement buffered data streams
- [ ] Create latency monitoring badge
- [ ] Add automatic reconnection logic
- [ ] Ensure no frozen UI elements

---

## ⚡ **LAZYFLOW VISION TRACK: Long-term UX Excellence**

### **🎯 LazyFlow Sprint 2: One-Tap Magic (4-6 weeks)**
*[Detailed planning deferred until Factory-Ready track complete]*

**High-Level Goals**:
- Transform TopBar → AmbientStatusStrip (invisible intelligence)
- Create ContextualActionPanel (smart navigation)
- Build MagicWand crisis resolution (one-click fixes)
- Implement smart report generation (<10 seconds)

**Target**: 9/10 LazyFlow Score (One-tap steel mastery)

### **🧠 LazyFlow Sprint 3: Mind-Reading Interface (4-6 weeks)**
**High-Level Goals**:
- Predictive loading engine (overnight preparation)
- Context memory system (learn user patterns)
- Smart defaults (95%+ accurate predictions)
- Anticipatory workflows

**Target**: 9.5/10 LazyFlow Score (Mind-reading capabilities)

### **🔮 LazyFlow Sprint 4: Invisible Intelligence (4-6 weeks)**
**High-Level Goals**:
- Background optimization processes
- Ambient problem detection
- Smart handover systems
- Predictive maintenance integration

**Target**: 10/10 LazyFlow Score (Telepathic steel mastery)

---

## 📋 **Sprint Execution Framework**

### **Daily Standups (15 min)**
- **What did I accomplish yesterday?**
- **What will I work on today?** 
- **What blockers do I have?**
- **Which ATDD tests are passing/failing?**

### **Sprint Planning (2 hours)**
- Review previous sprint retrospective
- Break epics into detailed user stories
- Estimate story points and capacity
- Identify dependencies and risks
- Plan ATDD test implementation

### **Sprint Review (1 hour)**
- Demo working features to stakeholders
- Run ATDD test suite live
- Collect feedback on Go/No-Go gates
- Update roadmap based on learnings

### **Sprint Retrospective (1 hour)**
- **What went well?**
- **What could be improved?**
- **What will we commit to changing?**
- **Are we on track for factory readiness?**

---

## 🎯 **Success Metrics & Definition of Done**

### **Factory Sprint Success Criteria**
| Sprint | Gates Passed | Key Metrics | Demo Capability |
|--------|--------------|-------------|-----------------|
| **Sprint 1** | G1,G2,G3,G5 | No empty cards, Real PDF | Basic demo flow |
| **Sprint 2** | G4,G6,G9,G10 | WHY explanations, Security docs | Credible demo |
| **Sprint 3** | G7,G8,G11,G12 | Persona adapt, Presenter tools | Executive-ready |

### **LazyFlow Sprint Success Criteria**
| Sprint | LazyFlow Score | Key Capability | User Experience |
|--------|----------------|-----------------|-----------------|
| **Sprint 2** | 9/10 | One-tap operations | Magic buttons work |
| **Sprint 3** | 9.5/10 | Mind-reading defaults | System anticipates needs |
| **Sprint 4** | 10/10 | Invisible intelligence | Telepathic mastery |

---

## 🏁 **Implementation Timeline**

```
Factory-Ready Track (7 weeks)
├── Sprint 1: Critical Infrastructure (3 weeks)
│   ├── Week 1: Auto-start + Reset
│   ├── Week 2: Visual Impact + PDF ROI  
│   └── Week 3: Integration + Testing
├── Sprint 2: Trust & Explainability (2 weeks)
│   ├── Week 4: WHY explanations + LF/CC
│   └── Week 5: Security + Transparency
└── Sprint 3: Professional Polish (2 weeks)
    ├── Week 6: Persona + Presenter tools
    └── Week 7: Artifacts + Offline grace

LazyFlow Vision Track (12-18 weeks)
├── Sprint 2: One-Tap Magic (4-6 weeks)
├── Sprint 3: Mind-Reading Interface (4-6 weeks)  
└── Sprint 4: Invisible Intelligence (4-6 weeks)
```

---

## 🚀 **Next Steps**

### **Immediate Actions (Week 1)**
1. Set up ATDD testing infrastructure (Cypress + Jest)
2. Create Factory Sprint 1 project board
3. Begin Epic 1.1: Auto-start simulation implementation
4. Write first ATDD tests for G1 (Deterministic start)

### **Resource Requirements**
- **Development**: 1-2 full-stack developers
- **Testing**: ATDD test automation setup
- **Design**: UX consultation for LazyFlow sprints
- **Domain Expert**: Steel industry validation

### **Risk Mitigation**
- **PDF Generation**: Research PDFKit alternatives if issues
- **WebSocket Reliability**: Plan graceful degradation early
- **ATDD Coverage**: Write tests before implementation
- **Demo Consistency**: Deterministic data is non-negotiable

---

**Strategic Decision**: **Execute Factory-Ready track first (7 weeks)** to enable immediate steel industry demos, then **complete LazyFlow vision (12-18 weeks)** for long-term competitive advantage.

**Success Metric**: **Pass all 12 Go/No-Go gates with ATDD validation** before any client presentation.