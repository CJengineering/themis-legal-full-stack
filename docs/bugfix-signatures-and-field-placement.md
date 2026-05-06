# Bugfix: Signatures Not Appearing in PDF & Unable to Place Multiple Fields

**Date**: 2026-04-29  
**Status**: ✅ Fixed  
**Reported by**: Tim Spiridonov  

---

## Bug 1: Signatures not visible in the signed PDF on Google Drive

### Description
After all signers complete signing, a new signed PDF is created in Google Drive. However, the signatures are **not visible** in the generated file — the PDF appears identical to the unsigned original.

### Root Cause
The function `embedSignaturesInPdf` in `lib/pdf.ts` uses `pdfDoc.getPage(sig.page)` to access the target page. The issue is an **off-by-one index mismatch**:

- The place-fields UI stores pages as **1-indexed** (page 1, 2, 3…) in the database.
- The `pdf-lib` library's `getPage()` method is **0-indexed** (page 0, 1, 2…).

For a **single-page document**, `getPage(1)` throws an out-of-bounds error because only index `0` exists. The error is silently caught by the existing `try/catch` block (which logs and `continue`s), so **zero signatures are embedded** into the PDF.

### Affected File
- `lib/pdf.ts` — line 69

### Fix
Change the page access from:
```ts
const page = pdfDoc.getPage(sig.page)
```
to:
```ts
const page = pdfDoc.getPage(sig.page - 1)  // DB stores 1-indexed, pdf-lib is 0-indexed
```

---

## Bug 2: Cannot place more than one signature field on the document

### Description
On the "Place Fields" page (`/workflows/[id]/place-fields`), the user can click on the PDF to place a signature field. After placing the **first field**, subsequent clicks on the PDF **do nothing** — it becomes impossible to add more fields.

### Root Cause
In `app/workflows/[id]/place-fields/page.tsx`, the click-overlay div uses a conditional `pointerEvents` style:

```tsx
<div
  onClick={handlePageClick}
  className="absolute inset-0 cursor-crosshair"
  style={{ pointerEvents: placedFields.length === 0 ? "auto" : "none" }}
/>
```

Once `placedFields.length > 0` (i.e. after the first field is placed), `pointerEvents` is set to `"none"`, which **disables all click events** on the overlay. This was likely intended to let drag-and-drop work on existing fields, but it also kills the ability to place new fields.

### Affected File
- `app/workflows/[id]/place-fields/page.tsx` — lines 451–456

### Fix
Remove the separate click-overlay div and move `onClick={handlePageClick}` to the parent container div. This allows:
- Clicks on empty areas to place new fields (always)
- Drag events on existing fields to still work (fields sit above the container in z-order)

The overlay div:
```tsx
{/* Overlay for placing fields — REMOVE THIS */}
<div
  onClick={handlePageClick}
  className="absolute inset-0 cursor-crosshair"
  style={{ pointerEvents: placedFields.length === 0 ? "auto" : "none" }}
/>
```

Gets replaced by adding `onClick` and cursor styling to the parent wrapper:
```tsx
<div
  className="relative inline-block bg-white shadow-lg cursor-crosshair"
  onClick={handlePageClick}
>
```

---

## Verification Steps

1. Navigate to a workflow → click "Place Fields"
2. Select a signer and click on the PDF to place a signature field
3. Click again to place a **second** field — confirm it appears
4. Drag an existing field — confirm repositioning still works
5. Save & send the workflow
6. Sign with a test account
7. Open the signed PDF in Google Drive — confirm signatures are **visible** on the correct page
