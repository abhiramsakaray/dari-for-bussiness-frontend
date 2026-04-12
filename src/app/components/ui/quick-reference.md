# Dari Design System - Quick Reference Card

## 🎨 Colors (Exact Hex Values)

```
Primary Background:    #FFFFFF
Secondary Background:  #FAFAFA
Text Primary:          #09090B
Text Secondary:        #71717A
Text Tertiary:         #52525B
Border:                #E4E4E7
Border Hover:          #D1D1D6
Success:               #22c55e
Error:                 #ef4444
Pending:               #f59e0b
Info:                  #3b82f6
```

## 📝 Typography

```tsx
<h1 className="text-page-title">        // 32-48px, weight 700
<h2 className="text-section-title">     // 20-26px, weight 700
<h3 className="text-card-title">        // 14-15px, weight 600
<p className="text-body">               // 13-14px, weight 400
<span className="text-label">          // 10-11px, DM Mono, uppercase
<span className="text-metadata">       // 11-12px, DM Mono
```

## 🔘 Buttons

```tsx
<Button variant="default">Primary</Button>      // Black bg, white text
<Button variant="outline">Secondary</Button>    // Transparent, border
<Button variant="ghost">Ghost</Button>          // Transparent, no border
<Button variant="destructive">Delete</Button>   // Red
<Button size="sm|default|lg|icon">Size</Button>
```

## 🏷️ Badges

```tsx
<Badge variant="success">ACTIVE</Badge>         // Green
<Badge variant="pending">PENDING</Badge>        // Yellow
<Badge variant="destructive">FAILED</Badge>     // Red
<Badge variant="info">INFO</Badge>              // Blue
<Badge variant="default">DEFAULT</Badge>        // Gray border
<Badge pulse>LIVE</Badge>                       // Animated
```

## 📦 Cards

```tsx
<DataCard hover={true}>                         // Border-radius: 16px
  <DataCardHeader>                              // Padding: 24-28px
    <DataCardTitle>Title</DataCardTitle>
  </DataCardHeader>
  <DataCardContent>Content</DataCardContent>
  <DataCardFooter>Footer</DataCardFooter>
</DataCard>
```

## 📊 Metrics

```tsx
<MetricDisplay
  value="$45,231"
  label="TOTAL REVENUE"
  trend={{ value: 12.5, direction: "up" }}
/>
```

## 📋 Tables

```tsx
<DataTable>
  <DataTableHeader>
    <DataTableRow>
      <DataTableHead>Header</DataTableHead>     // 12px, DM Mono, uppercase
    </DataTableRow>
  </DataTableHeader>
  <DataTableBody>
    <DataTableRow striped>                      // Optional striping
      <DataTableCell>Data</DataTableCell>       // 13px, weight 400
      <DataTableCell secondary>Meta</DataTableCell>
    </DataTableRow>
  </DataTableBody>
</DataTable>
```

## 📥 Inputs

```tsx
<Input 
  type="text" 
  placeholder="Enter text..."                   // Border-radius: 9px
  disabled                                       // Padding: 10px 14px
  aria-invalid                                   // Font-size: 13px
/>
```

## 🎭 Animations

```tsx
className="transition-dari"                     // 0.2s ease
className="transition-dari-medium"              // 0.25s ease
className="transition-dari-slow"                // 0.3s ease
className="card-hover"                          // Card hover effect
className="btn-hover"                           // Button hover effect
```

## 📐 Layout

```tsx
<div className="container-dari">               // Max-width: 1160px
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## 📏 Spacing (Multiples of 4px)

```
p-3  = 12px    gap-3  = 12px
p-4  = 16px    gap-4  = 16px
p-5  = 20px    gap-5  = 20px
p-6  = 24px    gap-6  = 24px
p-7  = 28px    gap-7  = 28px
p-8  = 32px    gap-8  = 32px
```

## 🔄 Border Radius

```
rounded-lg   = 12px    (general use)
rounded-xl   = 16px    (cards)
rounded-2xl  = 20px    (modals)
rounded-full = 100px   (badges, pills)
```

## 📱 Breakpoints

```
sm:  640px   (mobile landscape)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
2xl: 1536px  (extra large)
```

## ✅ Common Patterns

### KPI Card
```tsx
<DataCard>
  <DataCardHeader>
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
      <Icon className="h-5 w-5" />
    </div>
    <Badge variant="success">ACTIVE</Badge>
  </DataCardHeader>
  <DataCardContent>
    <MetricDisplay value="$45,231" label="REVENUE" />
  </DataCardContent>
</DataCard>
```

### Search Input
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input className="pl-10" placeholder="Search..." />
</div>
```

### Action Bar
```tsx
<div className="flex items-center justify-between">
  <h2 className="text-section-title">Title</h2>
  <div className="flex gap-2">
    <Button variant="outline">Filter</Button>
    <Button>Create</Button>
  </div>
</div>
```

## 🎯 Remember

- ✅ Use exact color palette (no custom colors)
- ✅ Sora for body, DM Mono for labels/metadata
- ✅ Spacing in multiples of 4px
- ✅ Border radius: 8px, 10px, 12px, 16px, 20px
- ✅ Transitions: 0.2s, 0.25s, 0.3s only
- ✅ Mobile-first responsive design
- ✅ Accessibility: focus states, ARIA labels
