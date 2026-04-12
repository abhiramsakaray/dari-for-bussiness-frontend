# Dari for Business Design System - React/TypeScript Implementation

## Overview
This design system maintains complete visual and interaction consistency with the Dari for Business website. All components follow the professional, minimalist, and trust-focused aesthetic.

## Typography

### Font Families
- **Primary**: 'Sora' (weights: 300, 400, 500, 600, 700, 800)
- **Monospace**: 'DM Mono' (weights: 300, 400, 500)

### Typography Classes
```tsx
// Page Titles
<h1 className="text-page-title">Dashboard Overview</h1>

// Section Titles
<h2 className="text-section-title">Recent Transactions</h2>

// Card Titles
<h3 className="text-card-title">Payment Details</h3>

// Body Text
<p className="text-body">Description text goes here</p>

// Labels/Badges
<span className="text-label">ACTIVE</span>

// Metadata
<span className="text-metadata font-mono">2024-04-11</span>
```

## Color Palette

### Neutrals
- `bg-background` - #FFFFFF (white)
- `bg-background-secondary` - #FAFAFA (very light gray)
- `text-foreground` - #09090B (near-black)
- `text-foreground-secondary` - #71717A (medium gray)
- `text-foreground-tertiary` - #52525B (darker gray)

### Borders
- `border-border` - #E4E4E7 (light gray)
- `border-border-hover` - #D1D1D6 (slightly darker)

### Status Colors
- `text-success` / `bg-success` - #22c55e (green)
- `text-destructive` / `bg-destructive` - #ef4444 (red)
- `text-pending` / `bg-pending` - #f59e0b (orange)
- `text-info` / `bg-info` - #3b82f6 (blue)

## Components

### Data Cards
```tsx
<div className="bg-card border border-border rounded-xl p-6 card-hover">
  <h3 className="text-card-title mb-2">Card Title</h3>
  <p className="text-body text-muted-foreground">Card content</p>
</div>
```

### Primary Button
```tsx
<button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold btn-hover">
  Primary Action
</button>
```

### Secondary Button
```tsx
<button className="bg-transparent border border-border-light text-secondary-foreground px-6 py-3 rounded-md font-medium hover:border-border-hover hover:text-foreground transition-dari">
  Secondary Action
</button>
```

### Ghost Button
```tsx
<button className="bg-transparent text-muted-foreground p-2 rounded-lg hover:bg-muted hover:text-foreground transition-dari">
  <Icon className="h-5 w-5" />
</button>
```

### Status Badges
```tsx
// Success
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-label bg-success-bg text-success-fg border-0">
  ACTIVE
</span>

// Pending
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-label bg-pending-bg text-pending-fg border-0">
  PENDING
</span>

// Error
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-label bg-destructive-bg text-destructive-fg border-0">
  FAILED
</span>

// Default
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-label border border-border text-muted-foreground">
  DEFAULT
</span>
```

### Input Fields
```tsx
<input
  type="text"
  className="w-full bg-input-background border border-border rounded-md px-3.5 py-2.5 text-sm text-foreground placeholder:text-input-placeholder hover:border-border-hover focus:border-primary focus:outline-none disabled:bg-input-disabled disabled:opacity-50"
  placeholder="Enter text..."
/>
```

### Data Tables
```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-border">
      <th className="px-4 py-4 text-left text-label font-mono text-muted-foreground">
        HEADER
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-muted/40 transition-dari">
      <td className="px-4 py-4 text-sm text-foreground">Data</td>
    </tr>
  </tbody>
</table>
```

### Metrics Display
```tsx
<div className="space-y-2">
  <div className="text-5xl font-bold tracking-tight text-foreground">
    $12,345
  </div>
  <div className="text-label font-mono text-muted-foreground">
    TOTAL REVENUE
  </div>
  <div className="flex items-center gap-1 text-sm text-success">
    <ArrowUp className="h-3 w-3" />
    <span>12.5%</span>
  </div>
</div>
```

### Empty States
```tsx
<div className="flex flex-col items-center justify-center py-12">
  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
    <Icon className="h-6 w-6 text-border" />
  </div>
  <h3 className="text-card-title mb-2">No data found</h3>
  <p className="text-body text-muted-foreground mb-5">
    Get started by creating your first item
  </p>
  <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold btn-hover">
    Create New
  </button>
</div>
```

## Layout

### Container
```tsx
<div className="container-dari">
  {/* Content */}
</div>
```

### Grid Layouts
```tsx
// 2 Column
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Cards */}
</div>

// 3 Column
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {/* Cards */}
</div>

// 4 Column
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>

// Responsive Auto-fit
<div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
  {/* Cards */}
</div>
```

## Animations & Transitions

### Standard Transitions
```tsx
// Fast (0.2s) - color, opacity changes
className="transition-dari"

// Medium (0.25s) - transforms
className="transition-dari-medium"

// Slow (0.3s) - shadows, complex changes
className="transition-dari-slow"
```

### Hover Effects
```tsx
// Cards
className="card-hover"

// Buttons
className="btn-hover"

// Links
className="text-muted-foreground hover:text-foreground transition-dari"
```

### Loading States
```tsx
// Skeleton Loader
<div className="h-4 w-32 bg-border rounded skeleton" />

// Spinner (use lucide-react Loader2)
<Loader2 className="h-6 w-6 animate-spin text-primary" />
```

## Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 768px
- **Desktop**: 1200px
- **Large Desktop**: 1440px

### Usage
```tsx
<div className="p-3 md:p-6 lg:p-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
    {/* Responsive grid */}
  </div>
</div>
```

## Accessibility

- All text meets WCAG AA contrast ratio (4.5:1 minimum)
- Focus states are visible with `focus:outline-none focus:ring-2 focus:ring-ring`
- Touch targets minimum 44x44px
- Semantic HTML with proper ARIA labels
- Keyboard navigation support

## Best Practices

1. **Use exact color palette** - Don't introduce custom colors
2. **Maintain spacing** - Use multiples of 4px (Tailwind's default)
3. **Border radius** - Use `rounded-lg` (12px), `rounded-xl` (16px), `rounded-2xl` (20px)
4. **Shadows** - Keep subtle: `shadow-sm`, `shadow-md`
5. **Transitions** - Use defined transition utilities
6. **Typography** - Use Sora for body, DM Mono for labels/metadata
7. **Icons** - Use lucide-react, size 16-20px typically

## Example Component

```tsx
import { CreditCard, TrendingUp } from 'lucide-react';

export function PaymentCard({ amount, status, date }: PaymentCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-foreground" />
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-label ${
          status === 'completed' 
            ? 'bg-success-bg text-success-fg' 
            : 'bg-pending-bg text-pending-fg'
        }`}>
          {status.toUpperCase()}
        </span>
      </div>
      
      <div className="space-y-1 mb-3">
        <div className="text-3xl font-bold tracking-tight text-foreground">
          ${amount.toLocaleString()}
        </div>
        <div className="text-metadata font-mono text-muted-foreground">
          {date}
        </div>
      </div>
      
      <div className="flex items-center gap-1 text-sm text-success">
        <TrendingUp className="h-3 w-3" />
        <span>+12.5% from last month</span>
      </div>
    </div>
  );
}
```

## Version
**Version**: 1.0  
**Date**: April 2026  
**Tech Stack**: React 18 + TypeScript + Tailwind CSS 4
