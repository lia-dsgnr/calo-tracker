%%{init: {'theme': 'base', 'themeVariables': {
  'fontFamily': 'Inter, system-ui',
  'lineColor': '#64748B'
}}%%
```mermaid

flowchart TD

  %% === Class definitions ===
  classDef surface fill:#EEF2FF,stroke:#4F46E5,color:#111827
  classDef decision fill:#FEF3C7,stroke:#F59E0B,color:#92400E
  classDef browse fill:#F8FAFC,stroke:#CBD5E1,color:#0F172A
  classDef search fill:#F1F5F9,stroke:#94A3B8,color:#0F172A
  classDef action fill:#DCFCE7,stroke:#16A34A,color:#065F46
  classDef annotation fill:#ECFDF5,stroke:#22C55E,color:#065F46,stroke-dasharray: 4 4

  %% === Nodes ===
  A[Dashboard<br/><small>Progress ring · macros vs goals · today’s meals</small>]:::surface
  B[Quick Add header<br/><small>Title + search bar</small>]:::surface
  C{Query non-empty?}:::decision

  D[Favourites · Timeline · Recent items<br/><small>Browse mode</small>]:::browse
  E[Search results<br/><small>Grouped foods · favourites toggle</small>]:::search

  F[Portion Picker<br/><small>Choose portion → log entry</small>]:::action

  %% === Flow ===
  A --> B --> C
  C -->|No| D
  C -->|Yes| E
  D --> F
  E --> F
  F --> A

  %% === Annotation (Toast, not a real step) ===
  T["Toast: “Added food”<br/><small>Success feedback · Undo removes last entry</small>"]:::annotation
  F -.-> T
