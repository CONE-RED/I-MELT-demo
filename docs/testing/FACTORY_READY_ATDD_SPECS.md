# 🏭 Factory-Ready ATDD Test Specifications
*Acceptance Test-Driven Development for Conny 4.0's Go/No-Go Gates*

---

## 🎯 **Overview: Brutal Pass/Fail Certification**

Based on **Conny 4.0's factory-ready assessment**, these ATDD specs ensure the I-MELT demo passes all 12 Go/No-Go gates with deterministic, measurable, and brutal precision.

**Philosophy**: *Determinism beats cleverness. Every test must pass before any client demo.*

---

## 📋 **Go/No-Go Gate Specifications**

### **G1. Deterministic Start (No Clicks)**

#### **Acceptance Criteria:**
```gherkin
Feature: Auto-start deterministic simulation
  As a presenter
  I want the demo to auto-start with consistent data
  So that I never see empty cards or waiting states

Scenario: Page loads with running simulation
  Given I navigate to the demo URL
  When the page loads
  Then the simulation should auto-start with seed=42
  And heat 93378 should be active
  And the timeline should show moving progress
  And no cards should display "waiting for data"
  And all metrics should show realistic values within 5 seconds

Scenario: Deep link with scenario
  Given I navigate to "/?seed=42&scenario=energy-spike"
  When the page loads
  Then energy spike scenario should be active
  And simulation should run with seed=42
  And energy metrics should reflect spike conditions
```

#### **API Test Implementation:**
```typescript
describe('G1: Deterministic Start', () => {
  beforeEach(() => {
    cy.visit('/?seed=42&heatId=93378');
  });

  it('auto-starts simulation with no empty states', () => {
    // Check simulation is running
    cy.contains(/Heat 93378/i).should('be.visible');
    cy.contains(/waiting|loading|no data/i).should('not.exist');
    
    // Verify timeline progress
    cy.get('[data-testid="heat-timeline"]').within(() => {
      cy.get('.progress-indicator').should('be.visible');
    });

    // Check all key metrics loaded
    cy.get('[data-testid="hero-insight"]').should('contain', /melt|energy|temperature|foam/i);
    cy.get('[data-testid="confidence-ring"]').should('be.visible');
  });

  it('loads scenario from URL parameters', () => {
    cy.visit('/?seed=42&scenario=energy-spike');
    cy.contains(/energy spike|power/i).should('be.visible');
    cy.get('[data-testid="scenario-active"]').should('contain', 'energy-spike');
  });
});
```

---

### **G2. One-Key Narrative Reset**

#### **Acceptance Criteria:**
```gherkin
Feature: Deterministic demo reset
  As a presenter
  I want to reset to identical starting conditions
  So that every demo run is predictable

Scenario: Reset button restores identical state
  Given the demo is running with modifications
  When I click "Reset & Seed" or press "0" hotkey
  Then the simulation should restart with seed=42
  And all metrics should return to baseline values
  And the timeline should reset to beginning
  And scenario should be cleared

Scenario: URL deep-link persistence
  Given I have custom URL parameters
  When I reset the demo
  Then URL parameters should be preserved
  And the same seed/scenario should reload
```

#### **Test Implementation:**
```typescript
describe('G2: One-Key Narrative Reset', () => {
  it('resets to identical baseline state', () => {
    // Start demo and make changes
    cy.visit('/?seed=42');
    cy.get('[data-testid="trigger-scenario"]').first().click();
    
    // Capture initial state after changes
    let modifiedValues: any = {};
    cy.get('[data-testid="key-metrics"]').then($metrics => {
      modifiedValues = $metrics.text();
    });

    // Reset demo
    cy.get('[data-testid="reset-demo"]').click();
    
    // Verify return to baseline
    cy.get('[data-testid="hero-insight"]').should('contain', /heat.*running/i);
    cy.get('[data-testid="confidence-ring"]').should('contain', '85'); // Baseline confidence
  });

  it('preserves URL parameters after reset', () => {
    cy.visit('/?seed=42&scenario=foam-collapse');
    cy.get('[data-testid="reset-demo"]').click();
    cy.url().should('include', 'seed=42');
  });
});
```

---

### **G3. Cause→Effect in <60s**

#### **Acceptance Criteria:**
```gherkin
Feature: Visible cause-effect relationships
  As a presenter
  I want to show measurable impact of actions
  So that value is visually obvious

Scenario: Energy spike trigger shows impact
  Given the demo is running normally
  When I trigger "Energy Spike" scenario
  Then kWh/t metric should increase within 10 seconds
  And power factor should decrease
  And visual indicators should show the change

Scenario: Recovery action shows improvement
  Given an energy spike is active
  When I click "Apply Recovery" or press "R"
  Then kWh/t should decrease within 30 seconds
  And time/heat should improve
  And confidence should increase
  And visual deltas should be clearly visible
```

#### **Test Implementation:**
```typescript
describe('G3: Cause→Effect Visibility', () => {
  it('shows energy spike impact within 60 seconds', () => {
    cy.visit('/?seed=42');
    
    // Capture baseline metrics
    cy.get('[data-testid="kwh-per-ton"]').then($baseline => {
      const baselineValue = parseFloat($baseline.text());
      
      // Trigger energy spike
      cy.get('[data-testid="scenario-energy-spike"]').click();
      
      // Verify impact within 60 seconds
      cy.get('[data-testid="kwh-per-ton"]', { timeout: 60000 }).should($current => {
        const currentValue = parseFloat($current.text());
        expect(currentValue).to.be.greaterThan(baselineValue);
      });
    });
  });

  it('shows recovery impact with visual deltas', () => {
    // Setup: trigger crisis
    cy.visit('/?seed=42&scenario=energy-spike');
    
    // Apply recovery
    cy.get('[data-testid="apply-recovery"]').click();
    
    // Check for visual improvement indicators
    cy.get('[data-testid="delta-indicator"]').should('contain', '↘'); // Decreasing arrow
    cy.get('[data-testid="improvement-badge"]').should('be.visible');
  });
});
```

---

### **G4. Explainability = "Why Now"**

#### **Acceptance Criteria:**
```gherkin
Feature: Explainable AI recommendations
  As an operator
  I want to understand why actions are recommended
  So that I can trust and verify decisions

Scenario: Every recommendation shows WHY bullets
  Given the system shows a recommendation
  When I view the recommendation card
  Then it should display "WHY" bullet points
  And each bullet should reference specific parameters (PF, THD, foam, etc.)
  And a confidence bar should be visible
  And confidence should be >50% for any recommendation

Scenario: Deterministic insights when LLM fails
  Given the LLM service is unavailable
  When the demo runs
  Then deterministic insights should still appear
  And WHY explanations should be physics-based
  And confidence should reflect deterministic nature
```

#### **Test Implementation:**
```typescript
describe('G4: Explainability', () => {
  it('shows WHY bullets for all recommendations', () => {
    cy.visit('/?seed=42');
    
    // Wait for recommendations to load
    cy.get('[data-testid="predictive-actions"]').should('be.visible');
    
    // Check each recommendation has WHY explanation
    cy.get('[data-testid="action-card"]').each($card => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="why-explanation"]').should('be.visible');
        cy.get('[data-testid="confidence-bar"]').should('be.visible');
        
        // Verify technical parameters mentioned
        cy.get('[data-testid="why-bullets"]').should('match', /PF|THD|foam|temperature|carbon/i);
      });
    });
  });

  it('provides deterministic insights when LLM unavailable', () => {
    // Mock LLM failure
    cy.intercept('POST', '/api/ai/**', { statusCode: 503 });
    
    cy.visit('/?seed=42&scenario=foam-collapse');
    
    // Should still show insights
    cy.get('[data-testid="hero-insight"]').should('contain', /foam/i);
    cy.get('[data-testid="why-explanation"]').should('contain', /physics|deterministic/i);
  });
});
```

---

### **G5. ROI in 1 Click (Real PDF)**

#### **Acceptance Criteria:**
```gherkin
Feature: One-click ROI PDF generation
  As a decision maker
  I want real financial analysis in PDF format
  So that I can share with stakeholders

Scenario: Generate real PDF with line items
  Given the demo shows cost savings
  When I click "Generate ROI Report"
  Then a PDF should download within 10 seconds
  And PDF should contain energy cost line items
  And PDF should show ≥€1000/month savings
  And prices should be editable before generation

Scenario: PDF contains accurate calculations
  Given current metrics show improvements
  When I generate ROI report
  Then PDF should reflect current vs baseline deltas
  And energy savings should match 8-12% range
  And payback period should be 2-4 months
```

#### **Test Implementation:**
```typescript
describe('G5: ROI PDF Generation', () => {
  it('downloads real PDF with financial line items', () => {
    cy.visit('/?seed=42&scenario=energy-spike');
    
    // Generate ROI report
    cy.get('[data-testid="generate-roi"]').click();
    
    // Verify PDF download
    cy.readFile('cypress/downloads/I-MELT_ROI_Report.pdf', { timeout: 10000 })
      .should('exist')
      .and('have.length.greaterThan', 5000); // >5KB file size

    // API test for content type
    cy.request('POST', '/api/roi/report', {
      current: { kwhPerT: 520, minPerHeat: 36.5, electrodeKgPerHeat: 3.2 }
    }).then(response => {
      expect(response.headers['content-type']).to.equal('application/pdf');
    });
  });

  it('shows editable prices before generation', () => {
    cy.get('[data-testid="generate-roi"]').click();
    
    // Should show price configuration modal
    cy.get('[data-testid="price-config-modal"]').should('be.visible');
    cy.get('[data-testid="energy-price-input"]').should('be.visible');
    cy.get('[data-testid="electrode-price-input"]').should('be.visible');
  });
});
```

---

### **G6. LF/CC "Sync Guard"**

#### **Acceptance Criteria:**
```gherkin
Feature: Ladle Furnace / Continuous Casting sync monitoring
  As a process manager
  I want to prevent temperature losses during caster delays
  So that I avoid >€1M/year losses from temp deviations

Scenario: Caster delay scenario shows temperature risk
  Given the demo is in tapping phase
  When I trigger "Caster Delay" scenario
  Then a banner should show "ΔT loss risk"
  And target superheat should be displayed
  And € loss per 10°C should be shown
  And recommended holding actions should appear

Scenario: Language aligns with deck promises
  Given LF/CC sync guard is active
  When viewing recommendations
  Then language should mention ">€1M/yr prevention"
  And temperature targets should show ±2°C precision
```

#### **Test Implementation:**
```typescript
describe('G6: LF/CC Sync Guard', () => {
  it('shows temperature loss risk during caster delay', () => {
    cy.visit('/?seed=42');
    
    // Advance to tapping phase
    cy.get('[data-testid="advance-to-tapping"]').click();
    
    // Trigger caster delay
    cy.get('[data-testid="scenario-caster-delay"]').click();
    
    // Check sync guard warnings
    cy.get('[data-testid="sync-guard-banner"]').should('be.visible');
    cy.get('[data-testid="temp-loss-warning"]').should('contain', 'ΔT loss risk');
    cy.get('[data-testid="loss-per-degree"]').should('contain', '€');
  });

  it('uses deck-aligned language for financial impact', () => {
    cy.visit('/?seed=42&scenario=caster-delay');
    
    cy.get('[data-testid="financial-impact"]').should('contain', />.*€1M.*yr|million.*year/i);
    cy.get('[data-testid="temp-precision"]').should('contain', '±2°C');
  });
});
```

---

### **G7. Persona Toggle**

#### **Acceptance Criteria:**
```gherkin
Feature: Role-based interface adaptation
  As different user types
  I want information relevant to my role
  So that I focus on what matters to me

Scenario: Operator sees signals and actions
  Given I select "Operator" persona
  When viewing the dashboard
  Then I should see process signals prominently
  And action buttons should be large and clear
  And technical parameters should be detailed

Scenario: Manager/CFO sees KPIs and financials
  Given I select "Manager" persona
  When viewing the dashboard
  Then I should see financial KPIs prominently
  And ROI information should be highlighted
  And technical details should be summarized

Scenario: Metallurgist sees chemistry and projections
  Given I select "Metallurgist" persona
  When viewing the dashboard
  Then I should see chemistry data prominently
  And temperature projections with confidence should be visible
  And material recommendations should be detailed
```

#### **Test Implementation:**
```typescript
describe('G7: Persona Toggle', () => {
  it('adapts interface for operator persona', () => {
    cy.visit('/?seed=42');
    cy.get('[data-testid="persona-selector"]').select('Operator');
    
    // Verify operator-focused content
    cy.get('[data-testid="action-buttons"]').should('be.visible');
    cy.get('[data-testid="process-signals"]').should('have.length.greaterThan', 3);
    cy.get('[data-testid="technical-details"]').should('be.visible');
  });

  it('emphasizes financials for manager persona', () => {
    cy.visit('/?seed=42');
    cy.get('[data-testid="persona-selector"]').select('Manager');
    
    // Verify manager-focused content
    cy.get('[data-testid="roi-highlight"]').should('be.visible');
    cy.get('[data-testid="kpi-dashboard"]').should('be.visible');
    cy.get('[data-testid="financial-metrics"]').should('have.length.greaterThan', 2);
  });
});
```

---

### **G8. Offline Grace**

#### **Acceptance Criteria:**
```gherkin
Feature: Graceful degradation during connectivity issues
  As a presenter
  I want the demo to continue working during network issues
  So that Wi-Fi problems don't ruin my presentation

Scenario: WebSocket disconnection handling
  Given the demo is running with WebSocket connection
  When WebSocket connection drops
  Then demo should continue with buffered data
  And latency badge should show disconnected state
  And reconnection should be automatic
  And no frozen UI elements should occur

Scenario: Latency monitoring
  Given WebSocket connection is active
  When connection becomes slow
  Then latency badge should show current delay
  And badge should be <300ms for green status
  And warning should appear for >300ms latency
```

#### **Test Implementation:**
```typescript
describe('G8: Offline Grace', () => {
  it('continues demo during WebSocket disconnection', () => {
    cy.visit('/?seed=42');
    
    // Wait for initial connection
    cy.get('[data-testid="connection-status"]').should('contain', 'connected');
    
    // Simulate WebSocket failure
    cy.window().then(win => {
      // @ts-ignore
      win.mockWebSocketFailure();
    });
    
    // Verify graceful degradation
    cy.get('[data-testid="connection-status"]').should('contain', 'buffered');
    cy.get('[data-testid="demo-content"]').should('not.be.frozen');
    cy.get('[data-testid="latency-badge"]').should('be.visible');
  });

  it('shows latency monitoring under 300ms', () => {
    cy.visit('/?seed=42');
    
    cy.get('[data-testid="latency-badge"]').should('be.visible');
    cy.get('[data-testid="latency-value"]').should($badge => {
      const latency = parseInt($badge.text());
      expect(latency).to.be.lessThan(300);
    });
  });
});
```

---

### **G9. Security Slide-in**

#### **Acceptance Criteria:**
```gherkin
Feature: Security and integration information
  As an IT decision maker
  I want to understand security and integration approach
  So that I can assess technical feasibility

Scenario: Security drawer with RBAC information
  Given I click "Security/Integration" tab
  When the drawer opens
  Then I should see RBAC overview
  And historian/OPC read-only path should be documented
  And air-gap option should be described
  And audit log capabilities should be mentioned
  And I should be able to answer IT questions in 30 seconds

Scenario: Integration pathway documentation
  Given the security drawer is open
  When I view integration options
  Then pilot approach should be clearly described
  And read-only historian connection should be detailed
  And OPC-UA integration path should be mapped
```

#### **Test Implementation:**
```typescript
describe('G9: Security Slide-in', () => {
  it('provides comprehensive security information', () => {
    cy.visit('/?seed=42');
    cy.get('[data-testid="security-tab"]').click();
    
    // Check security drawer content
    cy.get('[data-testid="security-drawer"]').should('be.visible');
    cy.get('[data-testid="rbac-section"]').should('contain', /role.*access/i);
    cy.get('[data-testid="historian-path"]').should('contain', /read-only|historian/i);
    cy.get('[data-testid="air-gap-option"]').should('be.visible');
    cy.get('[data-testid="audit-log"]').should('contain', /audit|log/i);
  });

  it('documents integration pathways clearly', () => {
    cy.get('[data-testid="security-tab"]').click();
    
    cy.get('[data-testid="integration-pathway"]').should('be.visible');
    cy.get('[data-testid="pilot-approach"]').should('contain', /pilot.*historian/i);
    cy.get('[data-testid="opc-ua-path"]').should('contain', 'OPC-UA');
  });
});
```

---

### **G10. Truth-in-Demo**

#### **Acceptance Criteria:**
```gherkin
Feature: Demo transparency and provenance
  As a prospect
  I want to understand what data is real vs simulated
  So that I can set appropriate expectations

Scenario: Provenance pills on all data
  Given I view any data card
  When I look for data source information
  Then each card should show provenance pill
  And pill should state "Data: Simulated from anonymized 1,574 heats (seed=42)"
  And confidence level should be displayed
  And ranges should match deck claims (8-12% energy, ±2°C)

Scenario: Confidence indicators everywhere
  Given I view recommendations or projections
  When I check confidence information
  Then confidence percentage should be visible
  And confidence should reflect deterministic vs AI-generated content
  And uncertainty ranges should be realistic
```

#### **Test Implementation:**
```typescript
describe('G10: Truth-in-Demo', () => {
  it('shows provenance pills on all data cards', () => {
    cy.visit('/?seed=42');
    
    // Check all cards have provenance information
    cy.get('[data-testid="data-card"]').each($card => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="provenance-pill"]').should('be.visible');
        cy.get('[data-testid="provenance-pill"]').should('contain', /simulated.*anonymized.*1,574/i);
      });
    });
  });

  it('displays confidence levels matching deck ranges', () => {
    cy.get('[data-testid="energy-savings"]').should('contain', /8.*12%|8-12%/);
    cy.get('[data-testid="temp-precision"]').should('contain', '±2°C');
    
    cy.get('[data-testid="confidence-indicator"]').should($indicators => {
      $indicators.each((i, el) => {
        const confidence = parseInt(el.textContent || '0');
        expect(confidence).to.be.within(50, 100);
      });
    });
  });
});
```

---

### **G11. Talk-track Overlay (Presenter-Only)**

#### **Acceptance Criteria:**
```gherkin
Feature: Presenter guidance overlay
  As a presenter
  I want guided talking points during demo
  So that I don't lose the narrative flow if interrupted

Scenario: Talk-track hotkey activation
  Given I am presenting the demo
  When I press "~" key
  Then talk-track overlay should appear
  And should show Hook → Pain → Spike → Win → ROI → Next step
  And should be visible only to presenter
  And should not interfere with demo interaction

Scenario: Narrative flow guidance
  Given talk-track overlay is active
  When I advance through demo stages
  Then current stage should be highlighted
  And next stage should be previewed
  And timing guidance should be shown
```

#### **Test Implementation:**
```typescript
describe('G11: Talk-track Overlay', () => {
  it('shows presenter guidance on hotkey', () => {
    cy.visit('/?seed=42');
    cy.get('body').type('~');
    
    cy.get('[data-testid="talk-track-overlay"]').should('be.visible');
    cy.get('[data-testid="narrative-stages"]').should('contain.text', 'Hook');
    cy.get('[data-testid="narrative-stages"]').should('contain.text', 'Pain');
    cy.get('[data-testid="narrative-stages"]').should('contain.text', 'ROI');
  });

  it('provides timing guidance for each stage', () => {
    cy.get('body').type('~');
    
    cy.get('[data-testid="stage-timing"]').should('be.visible');
    cy.get('[data-testid="current-stage"]').should('have.class', 'highlighted');
    cy.get('[data-testid="next-stage"]').should('be.visible');
  });
});
```

---

### **G12. Post-call Artifact**

#### **Acceptance Criteria:**
```gherkin
Feature: Post-demo follow-up materials
  As a prospect
  I want to receive demo materials after the call
  So that I can review and share with my team

Scenario: Send me this button functionality
  Given the demo is complete
  When I click "Send me this" button
  Then email should be requested
  And ROI PDF should be attached to email
  And one-pager should be included
  And one-pager should mirror deck promises (2-4 month payback, references)

Scenario: Follow-up materials content
  Given follow-up email is sent
  When recipient opens materials
  Then ROI PDF should match demo scenarios
  And one-pager should include contact information
  And references should be included
  And next steps should be clearly outlined
```

#### **Test Implementation:**
```typescript
describe('G12: Post-call Artifact', () => {
  it('enables follow-up material generation', () => {
    cy.visit('/?seed=42');
    
    cy.get('[data-testid="send-materials"]').click();
    
    // Check email form
    cy.get('[data-testid="email-form"]').should('be.visible');
    cy.get('[data-testid="email-input"]').type('test@company.com');
    cy.get('[data-testid="send-button"]').click();
    
    // Verify confirmation
    cy.get('[data-testid="send-confirmation"]').should('contain', 'Materials sent');
  });

  it('includes ROI PDF and one-pager in materials', () => {
    // Mock email sending
    cy.intercept('POST', '/api/send-materials', { fixture: 'email-sent.json' });
    
    cy.get('[data-testid="send-materials"]').click();
    cy.get('[data-testid="email-input"]').type('test@company.com');
    cy.get('[data-testid="send-button"]').click();
    
    // Verify API call includes expected attachments
    cy.wait('@sendMaterials').then(interception => {
      expect(interception.request.body).to.include.keys(['roiPdf', 'onePager']);
    });
  });
});
```

---

## 🏗️ **Implementation Priority Matrix**

| Gate | Criticality | Effort | Dependencies | Sprint |
|------|-------------|--------|--------------|---------|
| **G1** | CRITICAL | Medium | Auto-start service | 1 |
| **G5** | CRITICAL | High | PDF service, ROI calc | 1 |
| **G3** | HIGH | Medium | Visual delta components | 1 |
| **G2** | HIGH | Low | URL parameter handling | 1 |
| **G10** | HIGH | Low | Provenance UI components | 2 |
| **G4** | MEDIUM | Medium | WHY explanation engine | 2 |
| **G6** | MEDIUM | Medium | LF/CC scenario logic | 2 |
| **G9** | MEDIUM | Low | Security documentation | 2 |
| **G7** | LOW | High | Persona adaptation logic | 3 |
| **G8** | LOW | Medium | Offline handling | 3 |
| **G11** | LOW | Low | Presenter overlay | 3 |
| **G12** | LOW | Medium | Email service integration | 3 |

---

## 🚀 **ATDD Test Implementation Roadmap**

### **Sprint 1: Critical Gates (2-3 weeks)**
- Set up Cypress/Jest test infrastructure
- Implement G1: Auto-start deterministic simulation
- Implement G5: Real PDF ROI generation
- Implement G3: Visual cause→effect indicators
- Implement G2: One-key narrative reset

### **Sprint 2: Trust & Transparency (2 weeks)**
- Implement G10: Truth-in-demo provenance
- Implement G4: Explainability with WHY bullets
- Implement G6: LF/CC sync guard scenario
- Implement G9: Security integration drawer

### **Sprint 3: Polish & Presenter Tools (1-2 weeks)**
- Implement G7: Persona toggle adaptation
- Implement G8: Offline grace handling
- Implement G11: Talk-track overlay
- Implement G12: Post-call artifact generation

---

**Success Criteria**: All 12 Go/No-Go gates must pass their ATDD tests before any client demo. **Determinism beats cleverness.**