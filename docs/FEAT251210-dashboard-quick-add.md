---
description: "implementation brief for the two most critical features: Daily Dashboard and Quick Add"
---

# **FEATURE 1 — QUICK ADD (Vietnamese Street Food)**

This is the heart of the “log in 10 seconds” promise.  
Below is the full behaviour spec, ready for design + engineering.

---

# **1. Quick Add — Full Behaviour Spec**

## **1.1 Core Interaction Flow**

1. User opens home (Daily Dashboard).
    
2. Quick Add module is visible above the fold.
    
3. User taps a food tile (e.g., “Phở bò”).
    
4. Portion picker sheet slides up from bottom.
    
5. User selects portion (S/M/L).
    
6. Toast confirms: “Đã thêm Phở bò • 480 kcal”.
    
7. Item appears instantly in Daily Dashboard + History.
    

Total steps: **2 taps**.

---

# **1.2 Interaction States**

### **Food Tile States**

|State|Description|
|---|---|
|**Default**|Visible tile with name + kcal (M portion)|
|**Pressed**|Slight scale-down (95%), highlight border|
|**Disabled**|Only used if data failed to load (greyed, non-tappable)|

### **Portion Picker States**

- **Default:** S/M/L visible with kcal under each
    
- **Selected:** highlight + checkmark
    
- **Disabled:** only when food item lacks that portion size
    
- **Error:** show fallback text (“Không tìm thấy dữ liệu phần ăn”)
    

### **Toast States**

|Variant|Example|
|---|---|
|**Success**|“Đã thêm Bún bò Huế • 520 kcal”|
|**Undo**|“Đã thêm Cơm tấm. Hoàn tác?”|
|**Error**|“Không thể ghi lại món này.”|

Undo only reverses the **last logged item**, stored temporarily in memory.

---

# **1.3 Data Logic (Mocked)**

### **Portion Size Defaults**

If S/M/L missing → fallback to “Regular only”.

### **Recent Items Logic**

Stored in localStorage:

- list length: max **8 items**
    
- sorted by: last logged timestamp
    
- duplicates removed by name_vi
    

### **Most Used Logic**

- Count logs in rolling 7-day window
    
- Top 5 items displayed
    
- If fewer than 5 items logged → hide this section
    

### **Kcal Calculation**

- kcal pulled directly from mocked JSON
    
- no calculation, no adjustments
    
- rounding: whole numbers only (no decimals)
    

---

# **1.4 Edge Cases**

### **Case 1: User logs same dish 3 times in 1 minute**

- Should show 3 separate logs with timestamps
    
- Recent list updates only once (no duplicates)
    

### **Case 2: JSON fails to load**

Fallback UI:

- Quick Add section shows skeleton loaders
    
- Tap actions disabled
    
- Error banner: “Không tải được danh sách món ăn.”
    

### **Case 3: Dish has missing fields**

If missing:

- kcal → show “— kcal”, disable logging
    
- portion size → hide unavailable portions
    
- protein → default to 0
    

### **Case 4: Offline**

- Quick Add works (JSON and logs cached)
    
- If JSON missing offline → show error state
    
- Toast appears but with subtle “Offline” tag
    

### **Case 5: User taps too fast (double tap)**

- Log only once
    
- Second tap ignored with 200ms debounce
    

---

# **1.5 Testing Scenarios**

### **Usability Tests**

- User must successfully log food in ≤ 10 seconds.
    
- They should understand portion sizes without explanation.
    

### **Functional Tests**

- Check that log updates instantly on dashboard
    
- Verify recent items update correctly
    
- Check undo functionality
    
- Ensure no duplicates in recent list
    
- Skeleton loaders appear when needed
    

### **Edge Case Checks**

- Slow 3G network
    
- First-time user with empty logs
    
- Corrupted localStorage
    
- Missing JSON fields
    

---

# **1.6 Design Acceptance Criteria**

- Tiles: at least 2 columns on mobile, consistent gutter.
    
- Tiles must show: name, regular kcal, optional icon.
    
- Portion picker is a **bottom sheet**, not a new page.
    
- Portion buttons: pill-shaped, 16px padding, readable at 12px.
    
- Toast: bottom, semi-transparent background, auto-hide 2s.
    
- Undo button must be tap-friendly and high-contrast.
    
- Never use red for calorie numbers (avoid guilt triggers).
    

---

---

# **FEATURE 2 — DAILY DASHBOARD**

Complete functional and visual spec, including edge cases.

---

# **2. Daily Dashboard — Full Behaviour Spec**

## **2.1 Core Components**

1. **Progress Ring** — calories consumed vs daily goal
    
2. **Protein Bar** — visual of protein progress
    
3. **Daily Summary Numbers** — kcal consumed + remaining
    
4. **Meal List** — chronological items logged today
    
5. **Quick Add Section**
    
6. **Add Food CTA** — always visible on mobile
    
7. **Encouraging microcopy**
    

---

# **2.2 Interaction States**

### **Dashboard States**

|State|Behaviour|
|---|---|
|**Default (normal day)**|Shows consumed + remaining|
|**Goal Exceeded**|Ring completes; remaining shows “+xxx kcal” in neutral colour|
|**Empty day**|Placeholder message “Hôm nay bạn chưa ghi món nào.”|
|**Offline**|Small badge “Đang offline” next to date|
|**First-time user**|Guided prompt: “Bắt đầu với món đầu tiên của bạn!”|

### **Meal List States**

|State|Description|
|---|---|
|**Empty**|Show placeholder card with illustration|
|**Filled**|Show food log cards|
|**Overflow**|Collapsible after 6 items|
|**Edit mode**|Slide left → “Edit” + “Delete”|

### **CTA States**

|State|Description|
|---|---|
|**Default**|Blue primary button|
|**Pressed**|Darker blue|
|**Disabled**|Only if JSON failed to load|

---

# **2.3 Data Logic**

### **Daily Goal**

Mocked: **1800 kcal**, **75g protein**  
Editable only in later features.

### **Remaining Calories Calculation**

`remaining = daily_goal - consumed`  
If negative: display `+200 kcal`  
Never use red text.

### **Meal Grouping**

- Logs shown by chronological time
    
- No breakfast/lunch/dinner grouping in MVP
    

### **Caching**

- Dashboard reads from `logs_today` in localStorage
    
- Recalculates instantly on each change
    

### **Time Zones**

- Use device local time
    
- “Today” resets at midnight local time
    

---

# **2.4 Edge Cases**

### **Case 1: A user deletes the last item of the day**

Dashboard resets to the empty state  
Quick Add still available.

### **Case 2: User logs 30+ items in one day (stress eating lol)**

- List collapses after 6 items
    
- “Xem thêm 24 món…” button appears
    
- Tapping expands
    

### **Case 3: User logs item with missing calories**

- Show kcal as “—”
    
- Exclude from total
    
- Show tooltip: “Dữ liệu không đầy đủ”
    

### **Case 4: LocalStorage limit reached (rare but possible on some browsers)**

Fallback:

- Show banner: “Không thể lưu dữ liệu. Hãy xóa bớt lịch sử.”
    
- Prevent new logs temporarily.
    

### **Case 5: User logs at 23:59 & 00:01**

They appear on separate days because time-based grouping uses local midnight.

---

# **2.5 Loading, Empty, and Error States**

### **Loading (on first visit)**

- Skeleton: circular ring + bars
    
- Quick Add skeleton tiles
    

### **Empty State**

If no logs:

- Illustration (simple bowl icon)
    
- Copy: “Hãy thêm món đầu tiên của bạn để bắt đầu ngày mới.”
    

### **Error State**

If JSON fails to load:

- Banner: “Không thể hiển thị dữ liệu món ăn.”
    
- Dashboard remains interactive (using cached logs only).
    

---

# **2.6 Testing Scenarios**

### **Functional Tests**

- Log appears instantly
    
- Totals update correctly
    
- Delete item updates totals
    
- Exceeding daily goal updates ring UI
    
- Undo button from Quick Add also updates dashboard
    

### **Usability Tests**

- Can a user understand where they stand in the day?
    
- Do they interpret colours as neutral, not guilt-inducing?
    
- Do they find the ring intuitive?
    

### **Edge Case Tests**

- Logging offline
    
- Refreshing mid-log
    
- iOS Safari viewport resizing
    
- Very long food names (Vietnamese can be verbose)
    

---

# **2.7 Design Acceptance Criteria**

### **Progress Ring**

- Must animate from 0 to current value in <700ms
    
- Should never turn red or alarming
    
- Text inside ring:
    
    - consumed kcal
        
    - “/ 1800”
        

### **Protein Bar**

- Bar uses soft blue gradient
    
- Labels 12px
    
- Must not clip on small screens (360px)
    

### **Meal Cards**

- Must show: dish name, kcal, time
    
- Tap area ≥44px
    
- Swipe-to-edit uses standard iOS-like gesture
    

### **Overall Visual Rules**

- Neutral, friendly colour palette
    
- No red unless indicating actual error
    
- White background with soft shadows
    
- Always mobile-first layout
    

---

# **Next Steps (optional)**

If you want, I can also generate:

✓ **Low-fidelity wireframes for these interactions**  
✓ **High-fidelity UI guidelines (spacing, colours, typography)**  
✓ **Usability testing script (VN)**  
✓ **LocalStorage schema**  
✓ **Component specs for devs (React)**

Just tell me what you need.