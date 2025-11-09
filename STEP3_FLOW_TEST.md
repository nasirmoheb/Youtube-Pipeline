# Step 3 - Flow Testing Guide

## ✅ Expected Flow

```
Stage 1: Hooks
├─ Generate hooks
├─ Select one hook
└─ Click "Continue to Outline →"
         ↓
Stage 2: Outline
├─ Generate outline
├─ Review/refine
└─ Click "Continue to Script →" or "← Back to Hooks"
         ↓
Stage 3: Script
├─ Generate full script
├─ Review/refine
└─ Click "← Back to Outline" to revise
```

## 🧪 Test Cases

### Test 1: Initial State

**Steps:**
1. Navigate to Step 3

**Expected:**
- ✅ Shows Stage 1: Hooks
- ✅ Progress bar shows: [1 Hooks] ━━ [2 Outline] ━━ [3 Script]
- ✅ "Generate Hooks" button visible
- ✅ Stage 2 and 3 are hidden

### Test 2: Generate Hooks

**Steps:**
1. Click "Generate Hooks"
2. Wait 3-5 seconds

**Expected:**
- ✅ Loading spinner appears
- ✅ After generation, 3 hooks appear
- ✅ Each hook is clickable
- ✅ Warning message: "Select a hook to continue"
- ✅ No "Continue" button yet

### Test 3: Select Hook

**Steps:**
1. Click on Hook #1

**Expected:**
- ✅ Hook #1 highlights (indigo background)
- ✅ Shows "✓ Selected" on Hook #1
- ✅ Warning message disappears
- ✅ "Continue to Outline →" button appears
- ✅ Progress bar shows: [✓ Hooks] ━━ [2 Outline] ━━ [3 Script]

### Test 4: Continue to Outline

**Steps:**
1. Click "Continue to Outline →"

**Expected:**
- ✅ Stage 1 (Hooks) disappears
- ✅ Stage 2 (Outline) appears
- ✅ Shows selected hook in info box
- ✅ "Generate Outline" button visible
- ✅ Progress bar shows: [✓ Hooks] ━━ [2 Outline] ━━ [3 Script]
- ✅ Outline indicator is highlighted (indigo)

### Test 5: Generate Outline

**Steps:**
1. Click "Generate Outline"
2. Wait 5-10 seconds

**Expected:**
- ✅ Loading spinner appears
- ✅ After generation, outline appears in Markdown
- ✅ "Regenerate" and chat interface appear
- ✅ "← Back to Hooks" button appears
- ✅ "Continue to Script →" button appears
- ✅ Progress bar shows: [✓ Hooks] ━━ [✓ Outline] ━━ [3 Script]

### Test 6: Back to Hooks

**Steps:**
1. Click "← Back to Hooks"

**Expected:**
- ✅ Stage 2 (Outline) disappears
- ✅ Stage 1 (Hooks) appears
- ✅ Previously selected hook still selected
- ✅ "Continue to Outline →" button visible
- ✅ Progress bar: [✓ Hooks] ━━ [✓ Outline] ━━ [3 Script]
- ✅ Can click "Continue to Outline →" again

### Test 7: Navigate via Progress Bar

**Steps:**
1. From Stage 1, click on "✓ Outline" in progress bar

**Expected:**
- ✅ Jumps to Stage 2 (Outline)
- ✅ Shows outline content
- ✅ Both navigation buttons visible

### Test 8: Continue to Script

**Steps:**
1. From Stage 2, click "Continue to Script →"

**Expected:**
- ✅ Stage 2 (Outline) disappears
- ✅ Stage 3 (Script) appears
- ✅ "Generate Full Script" button visible
- ✅ Progress bar shows: [✓ Hooks] ━━ [✓ Outline] ━━ [3 Script]
- ✅ Script indicator is highlighted (indigo)

### Test 9: Generate Full Script

**Steps:**
1. Click "Generate Full Script"
2. Wait 10-15 seconds

**Expected:**
- ✅ Loading spinner appears
- ✅ After generation, script appears in Markdown
- ✅ Success message: "Script Complete! Saved to script.md"
- ✅ "Regenerate" and chat interface appear
- ✅ "← Back to Outline" button appears
- ✅ Progress bar shows: [✓ Hooks] ━━ [✓ Outline] ━━ [✓ Script]

### Test 10: Back to Outline from Script

**Steps:**
1. Click "← Back to Outline"

**Expected:**
- ✅ Stage 3 (Script) disappears
- ✅ Stage 2 (Outline) appears
- ✅ Outline content still visible
- ✅ Both navigation buttons visible

### Test 11: Refine Content

**Steps:**
1. At any stage with generated content
2. Type in chat: "Make it better"
3. Click "Send"

**Expected:**
- ✅ Loading indicator appears
- ✅ Content updates after 3-5 seconds
- ✅ Stays on same stage
- ✅ Navigation buttons still work

### Test 12: Regenerate Content

**Steps:**
1. At any stage with generated content
2. Click "Regenerate"

**Expected:**
- ✅ Loading spinner appears
- ✅ New content generates
- ✅ Replaces previous content
- ✅ Stays on same stage

### Test 13: Progress Bar Disabled States

**Steps:**
1. Start fresh at Stage 1
2. Try clicking "2 Outline" in progress bar

**Expected:**
- ✅ Nothing happens (disabled)
- ✅ Cursor shows "not-allowed"
- ✅ Must complete Stage 1 first

### Test 14: Complete Flow

**Steps:**
1. Generate hooks → Select hook → Continue
2. Generate outline → Continue
3. Generate script → Complete

**Expected:**
- ✅ All stages complete
- ✅ Progress bar: [✓ Hooks] ━━ [✓ Outline] ━━ [✓ Script]
- ✅ Can navigate to any stage via progress bar
- ✅ File script.md created
- ✅ Can proceed to Step 4

## 🎯 Success Criteria

All tests should pass with:
- ✅ Only one stage visible at a time
- ✅ Navigation buttons work correctly
- ✅ Progress bar updates correctly
- ✅ Can go back to previous stages
- ✅ Content persists when navigating
- ✅ Completion status tracked correctly

## 🐛 Common Issues to Check

### Issue 1: Multiple Stages Visible
**Symptom:** See more than one stage at once
**Fix:** Check conditional rendering logic

### Issue 2: Can't Navigate Back
**Symptom:** Back button doesn't work
**Fix:** Check navigation functions

### Issue 3: Progress Bar Not Updating
**Symptom:** Checkmarks don't appear
**Fix:** Check completion status logic

### Issue 4: Content Disappears
**Symptom:** Generated content lost when navigating
**Fix:** Check state management

### Issue 5: Can't Continue
**Symptom:** Continue button doesn't appear
**Fix:** Check completion conditions

## 📊 Visual Checklist

### Stage 1 (Hooks)
- [ ] Only Stage 1 visible
- [ ] Generate button works
- [ ] Hooks appear after generation
- [ ] Can select a hook
- [ ] Continue button appears after selection
- [ ] Progress bar shows [1 Hooks]

### Stage 2 (Outline)
- [ ] Only Stage 2 visible
- [ ] Shows selected hook
- [ ] Generate button works
- [ ] Outline appears after generation
- [ ] Back button works
- [ ] Continue button appears
- [ ] Progress bar shows [✓ Hooks] [2 Outline]

### Stage 3 (Script)
- [ ] Only Stage 3 visible
- [ ] Generate button works
- [ ] Script appears after generation
- [ ] Success message shows
- [ ] Back button works
- [ ] Progress bar shows [✓ Hooks] [✓ Outline] [3 Script]

## 🎨 Visual States

### Progress Bar States

**Initial:**
```
[1 Hooks] ━━━━━━ [2 Outline] ━━━━━━ [3 Script]
(indigo)  (gray)  (gray)      (gray)  (gray)
```

**After Hooks:**
```
[✓ Hooks] ━━━━━━ [2 Outline] ━━━━━━ [3 Script]
(green)   (green) (indigo)    (gray)  (gray)
```

**After Outline:**
```
[✓ Hooks] ━━━━━━ [✓ Outline] ━━━━━━ [3 Script]
(green)   (green) (green)     (green) (indigo)
```

**All Complete:**
```
[✓ Hooks] ━━━━━━ [✓ Outline] ━━━━━━ [✓ Script]
(green)   (green) (green)     (green) (green)
```

## 🚀 Quick Test Commands

### Start Servers
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Test Flow
```
1. Open http://localhost:3000
2. Complete Steps 1 & 2
3. Navigate to Step 3
4. Follow Test 14 (Complete Flow)
5. Verify all checkpoints pass
```

---

**Testing Status**: Ready for Testing ✅

**Expected Duration**: 10-15 minutes

**Critical Tests**: 1, 2, 3, 4, 5, 8, 9, 14
