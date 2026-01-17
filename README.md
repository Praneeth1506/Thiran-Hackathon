# Civora

## Overview
Municipal public works complaints often involve multiple departments such as water, electricity, roads, and sanitation. Existing systems typically route complaints sequentially, leading to long resolution times, manual follow-ups, poor transparency, and lack of accountability.

This project implements an **Agentic AI system** that autonomously understands complaints, coordinates multiple departments in parallel, monitors progress using Service Level Agreements (SLAs), and escalates delays without human intervention.

---

## Problem Statement
Traditional municipal complaint systems suffer from:
- Sequential routing of complaints
- Manual inter-department coordination
- No real-time monitoring
- No automatic escalation
- Poor transparency for citizens

As a result, average complaint resolution times can extend to several weeks.

---

## Proposed Solution
We propose an **Agentic AI-based complaint resolution platform** where multiple AI agents collaborate to resolve complaints efficiently.

Instead of focusing only on complaint submission, the system automates:
- Inter-department coordination
- Priority determination
- SLA enforcement
- Delay detection and escalation

---

## What Makes This Agentic AI
This system follows a **Perceive → Decide → Act → Monitor** loop.

It qualifies as an Agentic AI system because:
- Agents perceive unstructured real-world input
- Agents make autonomous decisions
- Agents act by changing system state
- Agents monitor outcomes over time
- Agents escalate issues without human intervention

---

## Agentic Architecture

### Agents Used
1. **Perception Agent (LLM-based)** – Understands complaint text
2. **Priority Agent (Rule-based)** – Enforces urgency and safety rules
3. **SLA Agent (Policy-driven)** – Assigns and adjusts SLAs
4. **Coordination Agent** – Creates parallel department tasks
5. **Monitoring Agent** – Tracks SLAs and escalates delays autonomously

A central **Agent Controller** orchestrates the execution of all agents.

---

## Detailed Workflow

### Step 1: Complaint Submission
A citizen submits a free-text complaint such as:

“Water leaking near an electric pole on the main road.”

---

### Step 2: Perception Agent
The Perception Agent uses a Large Language Model (LLM) to:
- Extract structured issues
- Suggest an initial priority
- Generate explainable reasoning

Example output:
```json
{
  "issues_detected": ["water_leak", "electric_hazard"],
  "priority": "HIGH",
  "reason": "Safety risk near electric infrastructure"
}
````

---

### Step 3: Priority Agent

The Priority Agent validates and enforces urgency using deterministic safety rules.

Example rule:

* If an electric hazard is detected, priority is always set to HIGH.

This ensures reliable and safe decision-making.

---

### Step 4: SLA Agent

The SLA Agent assigns resolution deadlines using department-defined SLA policies and dynamically adjusts them based on priority.

Example:

* Electric hazard base SLA: 24 hours
* HIGH priority → SLA adjusted to 12 hours

---

### Step 5: Coordination Agent

The Coordination Agent:

* Identifies all responsible departments
* Creates department-specific tasks
* Assigns priority and SLA to each task
* Executes task assignment in parallel

Example tasks:

* Electricity Department: Inspect electric pole
* Water Department: Fix pipeline leak

Parallel execution eliminates sequential delays.

---

### Step 6: Monitoring Agent

The Monitoring Agent operates autonomously in the background to:

* Track task deadlines
* Detect SLA breaches
* Escalate delayed tasks automatically

This ensures accountability without manual follow-up.

---

## Technology Stack

### Backend

* Python
* FastAPI
* LangChain
* OpenAI API

### Database

* MongoDB

### Frontend

* React (Vite)

### Deployment

* Backend: Render / Railway
* Frontend: Vercel

---

## Database Schema

### complaints

Stores citizen-level complaint information.

```json
{
  "_id": "C101",
  "description": "Water leaking near electric pole",
  "location": "3rd Street, Ward 12",
  "status": "IN_PROGRESS",
  "issues_detected": ["water_leak", "electric_hazard"],
  "created_at": "2026-01-15T09:30:00"
}
```

---

### tasks

Each complaint can generate multiple department-specific tasks, enabling parallel execution.

```json
{
  "_id": "T401",
  "complaint_id": "C101",
  "department": "Electricity",
  "issue": "electric_hazard",
  "priority": "HIGH",
  "base_sla_hours": 24,
  "final_sla_hours": 12,
  "status": "IN_PROGRESS",
  "assigned_at": "2026-01-15T10:00:00"
}
```

---

### sla_policies

Stores department-defined baseline SLA policies.

```json
{
  "department": "Electricity",
  "issue_type": "electric_hazard",
  "base_sla_hours": 24
}
```

---

### agent_logs

Captures explainability and traceability of agent decisions.

```json
{
  "agent": "Monitoring Agent",
  "action": "ESCALATION",
  "message": "High priority task breached SLA",
  "timestamp": "2026-01-16T01:10:00"
}
```

---

## Expected Impact

* Faster complaint resolution through parallel execution
* Reduced manual coordination effort
* Improved transparency for citizens
* Stronger accountability for departments
* Scalable architecture for city-wide deployment

---

## Demo Notes

* Frontend visualizes agent decisions instead of raw API responses
* Priority, SLA, and escalation status are clearly shown in the UI
* Monitoring Agent actions are demonstrated through automatic status changes

---

## Future Enhancements

* Image and video-based complaint analysis
* Geo-location based risk prioritization
* Predictive delay detection using historical data
* Integration with smart city sensors and IoT systems
* Analytics dashboards for municipal authorities

---

## Final Summary

This project demonstrates how **Agentic AI** can be applied to real-world governance challenges by automating coordination, enforcing accountability, and reducing complaint resolution time through autonomous monitoring and escalation.

```


