## Input

**Required:** Folder path containing visual outputs (e.g., `artifacts/CR1/`)
**Optional:** Output filename (default: `gallery.html`), Page title

📎 Specify folder path below

---

## Command

Scan the specified folder for visual output files and generate a single self-contained HTML gallery.

### Supported file types
| Extension | Treatment |
|-----------|-----------|
| `.html` | Embed content directly |
| `.mmd`, `.mermaid` | Wrap in `<pre class="mermaid">` for CDN rendering |
| `.svg` | Embed inline |
| `.txt`, `.ascii` | Wrap in `<pre><code>` blocks |

### Processing steps
1. List all supported files in the folder
2. Sort by filename (numeric prefix: `1-xxx`, `2-xxx`, etc.)
3. Extract section title from filename (e.g., `1-problem-framings.html` → "Problem Framings")
4. Generate HTML with sidebar navigation linking to each section

### Output structure
```
┌──────────────────────────────────────────────────────┐
│  ┌─────────┐  ┌────────────────────────────────────┐ │
│  │ Sidebar │  │ Main Content                       │ │
│  │         │  │                                    │ │
│  │ 1. xxx  │  │  ┌──────────────────────────────┐  │ │
│  │ 2. xxx  │  │  │ Section 1                    │  │ │
│  │ 3. xxx  │  │  │ [embedded visual]            │  │ │
│  │ ...     │  │  └──────────────────────────────┘  │ │
│  │         │  │                                    │ │
│  │         │  │  ┌──────────────────────────────┐  │ │
│  │         │  │  │ Section 2                    │  │ │
│  │         │  │  │ [embedded visual]            │  │ │
│  │         │  │  └──────────────────────────────┘  │ │
│  └─────────┘  └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## Output

Generate a single self-contained HTML file with:

1. **Sticky left sidebar** (200px width) with navigation links
2. **Main content area** with embedded visuals in order
3. **Smooth scroll** behavior between sections
4. **Mermaid.js CDN** script for diagram rendering
5. **Responsive design** (sidebar collapses on mobile)
6. **No external CSS dependencies** (all styles inline)

### HTML template to use

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PAGE_TITLE}}</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; display: flex; min-height: 100vh; }

    .sidebar {
      width: 220px;
      background: #1a1a2e;
      color: #eee;
      padding: 1.5rem 1rem;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }
    .sidebar h2 { font-size: 1rem; margin-bottom: 1rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    .sidebar ul { list-style: none; }
    .sidebar li { margin-bottom: 0.5rem; }
    .sidebar a { color: #ccc; text-decoration: none; font-size: 0.9rem; display: block; padding: 0.4rem 0.6rem; border-radius: 4px; }
    .sidebar a:hover, .sidebar a.active { background: #16213e; color: #fff; }

    main {
      margin-left: 220px;
      flex: 1;
      padding: 2rem;
      background: #f5f5f5;
    }

    section {
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    section h3 { margin-bottom: 1rem; color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }

    pre.mermaid { background: transparent; }
    pre code { display: block; background: #f8f8f8; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }

    .svg-container svg { max-width: 100%; height: auto; }

    @media (max-width: 768px) {
      .sidebar { width: 100%; height: auto; position: relative; }
      main { margin-left: 0; }
      body { flex-direction: column; }
    }

    html { scroll-behavior: smooth; }
  </style>
</head>
<body>
  <nav class="sidebar">
    <h2>{{PAGE_TITLE}}</h2>
    <ul>
      {{NAV_ITEMS}}
    </ul>
  </nav>
  <main>
    {{SECTIONS}}
  </main>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'neutral' });</script>
</body>
</html>
```

### Placeholders to replace
- `{{PAGE_TITLE}}` → User-provided title or "Design Workflow Gallery"
- `{{NAV_ITEMS}}` → `<li><a href="#section-N">N. Title</a></li>` for each file
- `{{SECTIONS}}` → `<section id="section-N"><h3>N. Title</h3>{{CONTENT}}</section>` for each file

Write the generated HTML to the specified output path (default: same folder as inputs).
