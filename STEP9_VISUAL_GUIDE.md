# Step 9 Visual Guide - Image Selection Interface

## Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                 9. Select Best Image per Beat                   │
│                         Beat 1 / 10                             │
└─────────────────────────────────────────────────────────────────┘

┌────┐  ┌──────────────────────────────────────────────────┐  ┌────┐
│ ◄  │  │                                                  │  │  ► │
│    │  │  Beat 1: "Opening scene with sunrise"           │  │    │
│PREV│  │                                                  │  │NEXT│
│    │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │    │
│    │  │  │ ☐🚩      │  │ ☑🚩      │  │ ☐🚩      │      │  │    │
│    │  │  │          │  │          │  │          │      │  │    │
│    │  │  │  IMAGE   │  │  IMAGE   │  │  IMAGE   │      │  │    │
│    │  │  │          │  │ [FLAGGED]│  │          │      │  │    │
│    │  │  │          │  │          │  │          │      │  │    │
│    │  │  │          │  │        ✓ │  │          │      │  │    │
│    │  │  └──────────┘  └──────────┘  └──────────┘      │  │    │
│    │  │ Illustration      Clear      Consistent        │  │    │
└────┘  └──────────────────────────────────────────────────┘  └────┘
```

## Image States

### 1. Unselected Image
```
┌──────────────┐
│ ☐🚩          │  ← Flag checkbox (gray, top-left)
│              │
│    IMAGE     │
│              │
│              │
└──────────────┘
   Style Name
```
- Gray border on hover
- Click to select
- Click flag to mark for review

### 2. Selected Image (Unflagged)
```
┌══════════════┐  ← Blue border (4px)
║ ☐🚩          ║
║              ║
║    IMAGE     ║
║              ║
║          ✓   ║  ← Checkmark (bottom-right)
└══════════════┘
   Style Name
```
- Blue border indicates selection
- Large checkmark in bottom-right
- Will be saved as `Beat_X.png`

### 3. Selected Image (Flagged)
```
┌══════════════┐  ← Blue border (4px)
║ ☑🚩          ║  ← Red flag checkbox
║              ║
║    IMAGE     ║
║              ║
║          ✓   ║  ← Checkmark (bottom-right)
└══════════════┘
   Style Name
```
- Blue border + red flag checkbox
- Will be saved as `Beat_X_flagged.png`

### 4. Unselected Image (Flagged)
```
┌──────────────┐
│ ☑🚩          │  ← Red flag checkbox
│              │
│    IMAGE     │
│              │
│              │
└──────────────┘
   Style Name
```
- Flagged but not selected
- Won't be saved until selected
- Flag state remembered

## User Interactions

### Selecting an Image
```
1. Click on image
   ┌──────────┐      ┌══════════┐
   │  IMAGE   │  →   ║  IMAGE   ║
   └──────────┘      ║        ✓ ║
                     └══════════┘

2. Blue border appears
3. Checkmark shows in bottom-right
4. This style is now selected for this beat
```

### Flagging an Image
```
1. Click flag checkbox (top-left)
   ☐🚩  →  ☑🚩
   
2. Checkbox turns red
3. Flag icon highlights
4. Can flag any image (selected or not)
5. Click again to unflag
```

### Navigation with Auto-Save
```
Beat 1 (Selected: Clear, Flagged)
   ↓ Click "Next"
   ↓ Auto-saves: Beat_1_flagged.png
   ↓
Beat 2 (No selection yet)
   ↓ Select: Illustration
   ↓ Click "Next"
   ↓ Auto-saves: Beat_2.png
   ↓
Beat 3 ...
```

## Workflow Example

### Scenario: Selecting images for 3 beats

**Beat 1**:
```
Illustration  Clear       Consistent
┌─────────┐  ┌─────────┐  ┌─────────┐
│ ☐🚩     │  │ ☐🚩     │  │ ☐🚩     │
│ Sunrise │  │ Sunrise │  │ Sunrise │
│ (warm)  │  │ (sharp) │  │ (style) │
└─────────┘  └─────────┘  └─────────┘

Action: Click "Clear" → Select it
Result: 
┌─────────┐  ┌═════════┐  ┌─────────┐
│ ☐🚩     │  ║ ☐🚩     ║  │ ☐🚩     │
│ Sunrise │  ║ Sunrise ║  │ Sunrise │
│ (warm)  │  ║ (sharp)✓║  │ (style) │
└─────────┘  └═════════┘  └─────────┘

Click "Next" → Saves: Beat_1.png
```

**Beat 2**:
```
Illustration  Clear       Consistent
┌─────────┐  ┌─────────┐  ┌─────────┐
│ ☐🚩     │  │ ☐🚩     │  │ ☐🚩     │
│ Person  │  │ Person  │  │ Person  │
│ walking │  │ walking │  │ walking │
└─────────┘  └─────────┘  └─────────┘

Action 1: Click "Illustration" → Select it
Action 2: Click flag on "Illustration" → Flag it

Result:
┌═════════┐  ┌─────────┐  ┌─────────┐
║ ☑🚩     ║  │ ☐🚩     │  │ ☐🚩     │
║ Person  ║  │ Person  │  │ Person  │
║ walking✓║  │ walking │  │ walking │
└═════════┘  └─────────┘  └─────────┘

Click "Next" → Saves: Beat_2_flagged.png
```

**Beat 3**:
```
Action: Select "Consistent" (no flag)
Click "Next" → Saves: Beat_3.png
```

## File System Result

```
selected_images/
├── Beat_1.png           ← Clear style, not flagged
├── Beat_2_flagged.png   ← Illustration style, flagged
└── Beat_3.png           ← Consistent style, not flagged

image_selections.json:
{
  "Beat 1": {
    "style": "clear",
    "isFlagged": false,
    "selectedAt": "2025-11-10T10:30:00Z"
  },
  "Beat 2": {
    "style": "illustration",
    "isFlagged": true,
    "selectedAt": "2025-11-10T10:31:00Z"
  },
  "Beat 3": {
    "style": "consistent",
    "isFlagged": false,
    "selectedAt": "2025-11-10T10:32:00Z"
  }
}
```

## Multiple Beats Per Shot

### Shot 1 with 3 beats:

**Beat 1** (Main action):
```
Select: Clear
Flag: No
→ Beat_1.png
```

**Beat 1.1** (Detail shot):
```
Select: Illustration
Flag: Yes (needs review)
→ Beat_1.1_flagged.png
```

**Beat 1.2** (Reaction shot):
```
Select: Consistent
Flag: No
→ Beat_1.2.png
```

### Navigation:
```
Beat 1 → Beat 1.1 → Beat 1.2 → Beat 2 → Beat 2.1 → ...
  ↓        ↓          ↓          ↓         ↓
Save     Save       Save       Save      Save
```

## Tips

### Efficient Workflow
1. **Quick Review**: Navigate through all beats first
2. **Select**: Go back and select best images
3. **Flag**: Mark any that need review
4. **Auto-Save**: Just click Next, no manual save needed

### Flag Usage
- 🚩 **Flag** = "Needs review" or "Unsure"
- Use flags to mark images you want to revisit
- Flagged images are still saved and usable
- Easy to find later with `_flagged` suffix

### Keyboard Shortcuts (Future)
- `←` Previous beat
- `→` Next beat
- `1` Select illustration
- `2` Select clear
- `3` Select consistent
- `F` Toggle flag on selected

## Visual Indicators Summary

| Element | Meaning |
|---------|---------|
| Blue border (4px) | Selected image |
| Gray border (hover) | Hovering over image |
| ✓ Checkmark | Selected image indicator |
| ☐🚩 Gray flag | Unflagged |
| ☑🚩 Red flag | Flagged for review |
| "No Image" | Image not generated yet |

## Common Patterns

### Pattern 1: Quick Selection
```
For each beat:
1. Click best image
2. Click Next
3. Repeat
```

### Pattern 2: Review and Flag
```
For each beat:
1. Review all 3 options
2. Click best image
3. If unsure, click flag
4. Click Next
```

### Pattern 3: Multiple Passes
```
Pass 1: Select all images quickly
Pass 2: Go back and flag uncertain ones
Pass 3: Review flagged images
```

---

**Interface Status**: ✅ Complete and Functional
**User Experience**: Intuitive and efficient
**Auto-Save**: Seamless workflow
