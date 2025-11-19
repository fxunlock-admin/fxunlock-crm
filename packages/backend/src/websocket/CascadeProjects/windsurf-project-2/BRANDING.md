# FX Unlocked CRM - Branding Guide

## Brand Colors

The CRM now uses FX Unlocked's official brand colors throughout the interface:

### Primary Gradient
- **Blue:** `#4169E1` (RGB: 65, 105, 225)
- **Purple:** `#8B5CF6` (RGB: 139, 92, 246)
- **Gradient:** Linear gradient from blue to purple

### CSS Variables
```css
--primary: 217 91% 60%; /* Blue #4169E1 */
--secondary: 258 90% 66%; /* Purple #8B5CF6 */
```

## Logo

The FX Unlocked logo features a hexagonal design with the brand gradient:

### Logo Component
Located at: `frontend/src/components/FXUnlockedLogo.tsx`

**Usage:**
```tsx
import FXUnlockedLogo from '@/components/FXUnlockedLogo';

// With text
<FXUnlockedLogo size="md" showText={true} />

// Icon only
<FXUnlockedLogo size="lg" showText={false} />
```

**Sizes:**
- `sm` - Small (h-8)
- `md` - Medium (h-10) - Default
- `lg` - Large (h-16)

## Where the Branding is Applied

### 1. **Navigation Sidebar**
- Logo in header
- Active menu items use gradient background
- User avatar uses gradient background

### 2. **Login Page**
- Hexagonal logo
- Gradient text for "FX Unlocked CRM"
- Gradient background (blue to purple)

### 3. **Buttons**
- Primary buttons use gradient (blue to purple)
- Hover effects darken the gradient
- Shadow effects for depth

### 4. **Dashboard**
- Stat cards can use gradient accents
- Charts use brand colors
- Headers and titles

### 5. **Typography**
- Headings can use gradient text effect
- `bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`

## Customization

### To Update Brand Colors

Edit `frontend/src/index.css`:

```css
:root {
  --primary: 217 91% 60%; /* Your blue color */
  --secondary: 258 90% 66%; /* Your purple color */
}
```

### To Update Logo

Edit `frontend/src/components/FXUnlockedLogo.tsx`:

```tsx
<linearGradient id="fxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" style={{ stopColor: '#YourBlue', stopOpacity: 1 }} />
  <stop offset="100%" style={{ stopColor: '#YourPurple', stopOpacity: 1 }} />
</linearGradient>
```

## Gradient Classes

Common Tailwind classes used throughout:

```css
/* Background Gradient */
bg-gradient-to-r from-blue-600 to-purple-600

/* Background Gradient (Hover) */
hover:from-blue-700 hover:to-purple-700

/* Text Gradient */
bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent

/* Background Gradient (Radial) */
bg-gradient-to-br from-blue-600 to-purple-600
```

## Design Principles

1. **Consistency:** Use the gradient for primary actions and branding elements
2. **Hierarchy:** Reserve gradient for important UI elements
3. **Accessibility:** Ensure text contrast meets WCAG standards
4. **Performance:** Use CSS gradients instead of images when possible

## Files Modified

- `frontend/src/index.css` - Brand color variables
- `frontend/src/components/FXUnlockedLogo.tsx` - Logo component
- `frontend/src/components/Layout.tsx` - Sidebar and navigation
- `frontend/src/components/ui/button.tsx` - Button gradient styles
- `frontend/src/pages/Login.tsx` - Login page branding

---

**Last Updated:** November 5, 2025  
**Brand:** FX Unlocked  
**Website:** www.fxunlock.com
