---
title: "Vault Triage & Editorial Command Center"
date: 2026-10-31
draft: true
type: dashboard
---

# Vault Triage & Editorial Command Center

> [!tip] The Active Drafting Bench (Top Priority Ship List)
> **Public Digital Garden Pillars (`01_Seed/` -> `bytarunrawat.com`):**
> 1. **[[MOC_01_Cognitive_Hygiene_and_Craft]]** — Merge *[[Writing_To_Know_What_I_Think]]*, *[[The_Five_Filters_of_Knowledge]]*, and *[[Yielding_as_Red_Ball_Batting]]* into Flagship Essay #1.
> 2. **[[MOC_02_Escaping_The_Script_Autonomy]]** — Synthesize *[[The_Looking_Glass_Trap_and_Creative_Validation]]*, *[[The_Persistence_Tornado_and_the_Bombay_Illusion]]*, and *[[The_Pretend_Doctrine_and_Grandmothers_Test_Cricket]]*.
> 3. **[[MOC_03_Cultural_and_Epistemic_Critique]]** — Pair *[[The_Beyonce_Sheeran_Fallacy]]* and *[[Sensory_Latency_and_the_Starlight_Past]]*.
>
> **90% Polish-Ready Fiction & Satire (`Stories_In_Progress/`):**
> 4. **[[The_Bangalore_FIFA_PlayStation_Heist]]** — Complete slacker moral-boomerang caper; ready for line polish.
> 5. **[[One_Year_After_Triptych]]** — Rewrite Act I (mother's tea scene) in close 3rd-person limited to match Acts II & III.
> 6. **[[The_Appraisal_Riots_Sudhir_Kumar_Sketch]]** & **[[The_Hundred_Dicks_Flower_Monologue]]** — High-concept satire & stage monologue ready for tight formatting.

---

## 0. Intake Airlock (`00_Archive_Triage/Raw_Imports`)
*Unprocessed raw files remaining in the queue:*

```dataview
LIST
FROM "00_Archive_Triage/Raw_Imports"
SORT file.name ASC
```

---

## 1. Master Synthesis Pillars (`01_Seed` MOCs)

```dataview
TABLE WITHOUT ID
  file.link AS "Synthesis Pillar (MOC)",
  core_theme AS "Master Thesis"
FROM "01_Seed"
WHERE type = "moc_pillar"
SORT file.name ASC
```

---

## 2. Digital Garden Essay Seeds (`01_Seed` Grouped by Pillar)

```dataview
TABLE WITHOUT ID
  file.link AS "Essay Seed",
  parent_pillar AS "Parent Pillar",
  era AS "Era",
  core_theme AS "Core Thesis",
  next_action AS "Next Editorial Step"
FROM "01_Seed"
WHERE type != "moc_pillar"
SORT parent_pillar ASC, file.name ASC
```

---

## 3. Active Fiction Projects & Anthologies (`Stories_In_Progress`)

### A. Multi-Part Worlds (`The_God_Hypothesis` & `The_Surrogacy_Duology`)
```dataview
TABLE WITHOUT ID
  file.link AS "Project File",
  medium AS "Medium",
  location AS "Project Space",
  core_theme AS "Premise / Engine",
  next_action AS "Next Step"
FROM "Fiction_Vault/Stories_In_Progress/The_God_Hypothesis" OR "Fiction_Vault/Stories_In_Progress/The_Surrogacy_Duology"
SORT location ASC, file.name ASC
```

### B. Standalone Stories, Scripts & Standup (`Stories_In_Progress` Root)
```dataview
TABLE WITHOUT ID
  file.link AS "Story / Sketch",
  medium AS "Medium",
  era AS "Era",
  core_theme AS "Core Engine",
  next_action AS "Next Step"
FROM "Fiction_Vault/Stories_In_Progress"
WHERE !contains(location, "The_God_Hypothesis") AND !contains(location, "The_Surrogacy_Duology") AND !contains(location, "Verse_and_Lyrics")
SORT medium ASC, file.name ASC
```

### C. Verse & Songwriting Workbench (`Verse_and_Lyrics`)
```dataview
TABLE WITHOUT ID
  file.link AS "Piece",
  medium AS "Medium",
  core_theme AS "Emotional Core",
  next_action AS "Surgical Fix Required"
FROM "Fiction_Vault/Stories_In_Progress/Verse_and_Lyrics"
SORT file.name ASC
```

---

## 4. Modular Swipe Files (`Fiction_Vault/Modular_Assets`)

```dataview
TABLE WITHOUT ID
  file.link AS "Swipe File",
  status AS "Status",
  file.mtime AS "Last Updated"
FROM "Fiction_Vault/Modular_Assets"
SORT file.name ASC
```

---

## 5. Cold Storage Archive (`Fiction_Vault/Cold_Storage`)

```dataview
TABLE WITHOUT ID
  file.link AS "Archived Note",
  verdict AS "Triage Verdict",
  era AS "Era",
  harvested_to AS "Snippets Harvested To",
  core_theme AS "Summary"
FROM "Fiction_Vault/Cold_Storage"
SORT file.name ASC
```