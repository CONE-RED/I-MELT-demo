# I-MELT Customer Demo Script: Executive Steel Production AI Showcase

## Overview
This demo script provides a complete 15-20 minute presentation flow for showcasing I-MELT's AI-powered steel production optimization to steel industry executives, plant managers, and technical decision makers.

---

## Pre-Demo Setup (2 minutes before customers arrive)

### 1. **Environment Preparation**
```bash
# Start the demo server
npm run dev

# Verify system is running at http://localhost:5000
# Ensure all overlays and buttons are functional
```

### 2. **Demo Configuration**
- **Browser**: Use Chrome/Edge in fullscreen mode (F11)
- **Persona**: Start with "Operator" view for broad appeal
- **Heat**: Default Heat 93378 (13KhFA/9 steel grade)
- **Seed**: 42 (deterministic, reliable results)

### 3. **Talking Points Preparation**
- Have customer's current monthly steel production volume ready
- Know their approximate energy costs per heat
- Understand their quality control challenges

---

## Demo Script: "From Crisis to Optimization in 15 Minutes"

### **Opening: The Steel Industry Challenge** (2 minutes)

**Setup**: Open I-MELT dashboard, Heat 93378 loaded

> "Welcome to I-MELT - our AI-powered steel production optimization platform. Today I'll show you how AI can transform your electric arc furnace operations from reactive crisis management to predictive optimization.
> 
> We're looking at a live simulation of Heat 93378 - a typical 13KhFA/9 steel grade production. This represents exactly the kind of data your furnaces generate every day."

**Key Visual**: Point to the dynamic System Overview showing live temperature, power, and efficiency metrics.

---

### **Act 1: Real-Time Process Monitoring** (3 minutes)

**Action**: Switch between personas to show different viewpoints

> "Let me show you how I-MELT adapts to different roles in your organization."

1. **Operator View** (Current): 
   - Point to 🔧Controls, ⚠️Alerts, 📊Graphs buttons
   - "Your operators get immediate access to process controls and alerts"
   
2. **Switch to Metallurgist**: 
   - Click persona switch → Metallurgist
   - "Your metallurgists see detailed chemistry analysis"
   - **Demo**: Click 🧪Chemistry button → Show chemistry overlay
   - Point to real-time C, Si, Mn, P, S values with target comparisons
   
3. **Switch to Manager**: 
   - "Plant managers see KPI dashboards and production metrics"
   
4. **Switch to CFO**: 
   - "Executives see direct financial impact - €8,247 monthly savings potential"

**Key Message**: "One platform, four perspectives, all working from the same real-time data."

---

### **Act 2: Crisis Detection & AI Response** (4 minutes)

**Action**: Trigger a controlled crisis scenario

**Setup**: Switch back to Operator persona

> "Now let me show you I-MELT's real competitive advantage - intelligent crisis management."

1. **Trigger Crisis**: Press hotkey `2` (Foam Collapse scenario)
   - **Expected Result**: Hero Insight changes to "Foam Collapse Risk"
   - Alert appears: "Foaming index critical - immediate action required"

> "See how the system immediately detected the foam collapse risk? This kind of early warning can save entire heats. In traditional operations, operators might not notice this until it's too late."

2. **AI Recommendation**: Point to predictive actions
   - "The AI doesn't just detect problems - it recommends specific solutions"
   - Show action: "⚫ Increase Carbon Content" with confidence %

3. **Execute AI Solution**: Click "Execute" button
   - **Expected Result**: System shows chemistry changes, confidence improves
   - Point to updated carbon levels in chemistry display

> "Notice how executing the AI recommendation immediately updated our chemistry values and process confidence. This is predictive action, not reactive response."

---

### **Act 3: Financial Impact & ROI** (3 minutes)

**Action**: Switch to CFO persona and show financial benefits

> "Let's talk numbers - the language executives understand best."

1. **Switch to CFO Persona**:
   - Point to Financial Overview metrics
   - "€8,247 potential monthly savings"
   - "This is based on actual steel industry benchmarks"

2. **Show ROI Calculator**: 
   - Click 📊Reports → Generate → ROI Analysis
   - "Professional PDF reports for board presentations"

3. **Break Down Savings**:
   - Energy optimization: €850/heat
   - Electrode savings: €320/heat  
   - Time optimization: €180/heat
   - Quality improvements: €240/heat

> "With your production volume of [customer's volume], you're looking at approximately €[calculated savings] annually. The system typically pays for itself in 8-12 months."

---

### **Act 4: Process Optimization & Continuous Improvement** (3 minutes)

**Action**: Show optimization capabilities

**Switch back to Operator persona**

> "Beyond crisis management, I-MELT continuously optimizes your processes."

1. **Show Process Timeline**:
   - Point to dynamic stage progression (Charge → Melt → Refine → Tap)
   - "See how the system tracks progress through each stage"

2. **Demonstrate Controls**:
   - Click 🔧Controls button
   - Show Arc Power, Electrode Position controls
   - "Operators can implement AI recommendations with one click"

3. **Historical Analysis**:
   - Click 📊Graphs button
   - Show process visualization charts
   - "Historical data analysis identifies long-term optimization opportunities"

> "This isn't just monitoring - it's active optimization. Every heat learns from previous heats."

---

### **Closing: Implementation & Next Steps** (2 minutes)

**Action**: Return to main dashboard view

> "What you've seen today is a fully functional system ready for deployment in your plant.

**Key Benefits Summary**:
- **Immediate**: 5-10% energy reduction from day one
- **Short-term**: 15-20% reduction in electrode consumption
- **Long-term**: Improved quality consistency, reduced downtime
- **ROI**: Complete payback in 8-12 months

**Implementation Path**:
1. **Week 1-2**: Data integration with your existing systems
2. **Week 3-4**: Operator training and system calibration  
3. **Month 2**: Full deployment with live optimization
4. **Month 3+**: Continuous improvement and advanced features"

**Call to Action**: 
> "Would you like to discuss integrating I-MELT with your specific furnace configurations? We can have a technical assessment completed within two weeks."

---

## Demo Hotkeys Reference

**Always keep handy during demo**:
- **`1`** → Energy Spike scenario (alternative crisis)
- **`2`** → Foam Collapse scenario (main crisis demo)
- **`3`** → Temperature Risk scenario  
- **`R`** → Apply AI-guided recovery
- **`?`** → Show cheat sheet (for practice)

---

## Troubleshooting Guide

### **If buttons don't work**:
- Refresh browser page
- Check console (F12) for errors
- All overlay buttons now have functional onClick handlers

### **If data looks static**:
- Use Reset & Seed controls in Settings
- Try different seed values (42, 32, 85, 127)
- Verify real-time updates are working

### **If scenarios don't trigger**:
- Check hotkeys are working
- Use manual scenario controls if needed
- Have backup talking points ready

---

## Customer Follow-Up Materials

**Immediately after demo**:
- Email ROI calculation based on their production volume
- Schedule technical assessment meeting
- Provide case study examples from similar steel plants

**Within 24 hours**:
- Send detailed proposal with implementation timeline
- Include references from existing customers
- Provide technical integration requirements document

---

## Demo Success Metrics

**Strong Interest Indicators**:
- Questions about specific technical integration
- Requests for detailed ROI calculations
- Discussion of implementation timelines
- Interest in pilot programs

**Follow-up Opportunities**:
- Request for plant visit and assessment
- Introduction to technical decision makers
- Budget and procurement discussions

---

*This demo script is designed for flexibility - adapt timing and technical depth based on your audience. The key is demonstrating immediate value while building confidence in the technology.*