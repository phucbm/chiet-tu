# Edit & Contribute — Temporarily Hidden

## What's hidden

### 1. Toolbar buttons — `app/char/[char]/CharPageClient.tsx` line 167–174
Edit button (non-local chars) and Contribute button (local chars) in the top toolbar.
Uncomment the spread inside `useToolBarSlot([...])` to restore.

### 2. "Của tôi" section — `app/HomeClient.tsx` line 36–51
Local chars grid on home screen. Hidden because clicking them navigates to char page
with `isLocal=true`, exposing inline section editing even without toolbar buttons.
Uncomment the JSX block to restore.

## How to restore
1. `app/char/[char]/CharPageClient.tsx`: uncomment lines ~170–173
2. `app/HomeClient.tsx`: uncomment lines ~36–51
