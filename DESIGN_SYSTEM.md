# 🎨 JK Taxi Customer App - Design System

**Date:** May 22, 2026  
**Version:** 1.0  
**Platform:** React Native (Expo)

---

## 📋 Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Border Radius](#border-radius)
5. [Shadows & Elevation](#shadows--elevation)
6. [Component Styles](#component-styles)
7. [Screen-Specific Styles](#screen-specific-styles)
8. [Icons](#icons)
9. [Design Principles](#design-principles)

---

## 🎨 Color Palette

### Primary Colors

```typescript
// src/constants/theme.ts

export const Colors = {
  // Primary Brand Color
  primary: '#8B5CF6',        // Purple - Main brand color
  primaryLight: '#A78BFA',   // Light Purple
  primaryDark: '#7C3AED',    // Dark Purple
  
  // Background Colors
  background: '#FFFFFF',     // White - Main background
  surface: '#F8F9FA',        // Light Gray - Cards, sections
  
  // Text Colors
  text: '#000000',           // Black - Primary text
  textSecondary: '#666666',  // Dark Gray - Secondary text
  textMuted: '#999999',      // Light Gray - Muted text
  textDisabled: '#CCCCCC',   // Very Light Gray - Disabled
  
  // Semantic Colors
  success: '#10B981',        // Green - Success states
  warning: '#F59E0B',        // Amber - Warning states
  error: '#EF4444',          // Red - Error states
  info: '#3B82F6',           // Blue - Info states
  
  // UI Colors
  white: '#FFFFFF',
  black: '#000000',
  border: '#E0E0E0',         // Light Gray - Borders
  divider: '#F0F0F0',        // Very Light Gray - Dividers
  overlay: 'rgba(0,0,0,0.5)', // Semi-transparent black
};
```

### Status Colors

**Ride Status Colors:**
- **Pending:** `#F59E0B` (Amber) - Searching for driver
- **Accepted:** `#3B82F6` (Blue) - Driver assigned
- **Started:** `#8B5CF6` (Purple) - Trip in progress
- **Completed:** `#10B981` (Green) - Trip finished
- **Cancelled:** `#EF4444` (Red) - Trip cancelled

### Background Variations

```typescript
// Light backgrounds for sections
const backgrounds = {
  purpleLight: '#F3E8FF',   // For OTP cards, ride info
  blueLight: '#DBEAFE',     // For driver info, current location
  greenLight: '#D1FAE5',    // For success messages
  yellowLight: '#FEF3C7',   // For warnings, pending states
  redLight: '#FEE2E2',      // For errors, cancel actions
  grayLight: '#F8F9FA',     // For general sections
};
```

### Color Usage Examples

**Buttons:**
- Primary Action: Purple (#8B5CF6)
- Secondary Action: White with purple text
- Danger Action: Red (#EF4444)
- Success Action: Green (#10B981)

**Text:**
- Headings: Black (#000000)
- Body: Black (#000000)
- Captions: Gray (#666666)
- Hints: Light Gray (#999999)

**Status Badges:**
- Colored background (light variant)
- Colored text and icon (dark variant)
- Rounded corners (8px)

---

## 📝 Typography

### Font Sizes

```typescript
export const FontSizes = {
  xs: 12,    // Small captions, helper text
  sm: 14,    // Secondary text, buttons
  md: 16,    // Body text, inputs
  lg: 18,    // Subheadings, card titles
  xl: 20,    // Page titles, section headers
  xxl: 24,   // Large headings
  xxxl: 32,  // Hero text, OTP numbers
};
```

### Font Weights

```typescript
export const FontWeights = {
  regular: '400' as const,    // Normal text
  medium: '500' as const,     // Slightly emphasized
  semibold: '600' as const,   // Card titles, buttons
  bold: '700' as const,       // Headings, important text
};
```

### Font Usage

**Screen Headers:**
- Size: `FontSizes.xl` (20px)
- Weight: `FontWeights.bold`
- Color: `Colors.text` (#000000)

**Section Titles:**
- Size: `FontSizes.lg` (18px)
- Weight: `FontWeights.bold`
- Color: `Colors.text`

**Body Text:**
- Size: `FontSizes.md` (16px)
- Weight: `FontWeights.regular`
- Color: `Colors.text`

**Button Text:**
- Size: `FontSizes.md` (16px)
- Weight: `FontWeights.semibold`
- Color: White or Primary

**Captions:**
- Size: `FontSizes.sm` (14px)
- Weight: `FontWeights.regular`
- Color: `Colors.textSecondary`

**Helper Text:**
- Size: `FontSizes.xs` (12px)
- Weight: `FontWeights.regular`
- Color: `Colors.textMuted`

### Typography Examples

```typescript
// Page Title
{
  fontSize: FontSizes.xl,      // 20px
  fontWeight: FontWeights.bold, // 700
  color: Colors.text,          // #000000
}

// Card Title
{
  fontSize: FontSizes.lg,         // 18px
  fontWeight: FontWeights.semibold, // 600
  color: Colors.text,
}

// Body Text
{
  fontSize: FontSizes.md,      // 16px
  fontWeight: FontWeights.regular, // 400
  color: Colors.text,
}

// Helper Text
{
  fontSize: FontSizes.xs,      // 12px
  fontWeight: FontWeights.regular,
  color: Colors.textMuted,     // #999999
}
```

---

## 📏 Spacing System

### Spacing Scale

```typescript
export const Spacing = {
  xs: 4,     // Tiny gaps
  sm: 8,     // Small gaps
  md: 16,    // Standard gaps
  lg: 24,    // Large gaps
  xl: 32,    // Extra large gaps
  xxl: 40,   // Hero spacing
};
```

### Usage Guidelines

**Component Padding:**
- Cards: `Spacing.lg` (16px)
- Buttons: `Spacing.md` vertical, `Spacing.xl` horizontal
- Input fields: `Spacing.md` (16px)
- Sections: `Spacing.lg` (24px)

**Component Margins:**
- Between cards: `Spacing.sm` (8px)
- Between sections: `Spacing.lg` (24px)
- Screen edges: `Spacing.md` (16px)

**Gap (Flexbox):**
- Button groups: `Spacing.sm` (8px)
- Icon + Text: `Spacing.xs` (4px)
- List items: `Spacing.md` (16px)

### Spacing Examples

```typescript
// Card
{
  padding: Spacing.lg,           // 16px
  marginBottom: Spacing.sm,      // 8px
  marginHorizontal: Spacing.md,  // 16px
}

// Button
{
  paddingVertical: Spacing.md,      // 16px
  paddingHorizontal: Spacing.xl,    // 32px
  marginTop: Spacing.lg,            // 24px
}

// Section
{
  paddingHorizontal: Spacing.md,    // 16px
  marginBottom: Spacing.lg,         // 24px
}

// Icon + Text
{
  gap: Spacing.xs,                  // 4px
}
```

---

## ⭕ Border Radius

### Radius Scale

```typescript
export const BorderRadius = {
  sm: 8,      // Small elements, badges
  md: 12,     // Buttons, inputs
  lg: 16,     // Cards
  xl: 24,     // Modal tops, large cards
  full: 9999, // Circular elements
};
```

### Usage

**Cards:**
- Standard cards: `BorderRadius.lg` (16px)
- Modal/Sheet tops: `BorderRadius.xl` (24px)

**Buttons:**
- Primary buttons: `BorderRadius.md` (12px)
- Circular buttons: `BorderRadius.full`

**Badges:**
- Status badges: `BorderRadius.sm` (8px)
- Pill badges: `BorderRadius.full`

**Inputs:**
- Text fields: `BorderRadius.md` (12px)
- Search boxes: `BorderRadius.xl` (24px)

### Examples

```typescript
// Card
{
  borderRadius: BorderRadius.lg,    // 16px
}

// Button
{
  borderRadius: BorderRadius.md,    // 12px
}

// Status Badge
{
  borderRadius: BorderRadius.sm,    // 8px
}

// Circular Icon Button
{
  width: 48,
  height: 48,
  borderRadius: BorderRadius.full,  // 9999
}

// Search Box
{
  borderRadius: BorderRadius.xl,    // 24px
}
```

---

## 🌑 Shadows & Elevation

### Shadow System

**iOS Shadow:**
```typescript
const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
};
```

**Android Elevation:**
```typescript
const elevation = {
  elevation: 3,
};
```

### Elevation Levels

**Level 1 (Subtle):**
- Use for: List items, subtle cards
```typescript
{
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 1,
}
```

**Level 2 (Standard):**
- Use for: Cards, buttons
```typescript
{
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
}
```

**Level 3 (Elevated):**
- Use for: Floating action buttons
```typescript
{
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 5,
}
```

**Level 4 (Modal):**
- Use for: Modals, sheets, drawers
```typescript
{
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.2,
  shadowRadius: 16,
  elevation: 10,
}
```

---

## 🧩 Component Styles

### Buttons

**Primary Button:**
```typescript
{
  backgroundColor: Colors.primary,    // #8B5CF6
  paddingVertical: Spacing.md,       // 16px
  paddingHorizontal: Spacing.xl,     // 32px
  borderRadius: BorderRadius.md,     // 12px
  alignItems: 'center',
  justifyContent: 'center',
  
  // Text
  color: Colors.white,
  fontSize: FontSizes.md,            // 16px
  fontWeight: FontWeights.semibold,  // 600
}
```

**Secondary Button:**
```typescript
{
  backgroundColor: Colors.white,
  borderWidth: 1,
  borderColor: Colors.primary,
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.xl,
  borderRadius: BorderRadius.md,
  
  // Text
  color: Colors.primary,
  fontSize: FontSizes.md,
  fontWeight: FontWeights.semibold,
}
```

**Danger Button:**
```typescript
{
  backgroundColor: '#FEE2E2',        // Light red
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.xl,
  borderRadius: BorderRadius.md,
  
  // Text
  color: Colors.error,               // #EF4444
  fontSize: FontSizes.md,
  fontWeight: FontWeights.semibold,
}
```

### Cards

**Standard Card:**
```typescript
{
  backgroundColor: Colors.white,
  borderRadius: BorderRadius.lg,     // 16px
  padding: Spacing.lg,               // 16px
  marginBottom: Spacing.sm,          // 8px
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
}
```

**Info Card (Colored):**
```typescript
{
  backgroundColor: '#F3E8FF',        // Light purple
  borderRadius: BorderRadius.lg,
  padding: Spacing.md,
  borderWidth: 2,
  borderColor: Colors.primary,
  borderStyle: 'dashed',             // For OTP cards
}
```

### Input Fields

**Text Input:**
```typescript
{
  backgroundColor: Colors.surface,   // #F8F9FA
  borderRadius: BorderRadius.md,     // 12px
  padding: Spacing.md,               // 16px
  fontSize: FontSizes.md,            // 16px
  color: Colors.text,
  borderWidth: 1,
  borderColor: Colors.border,        // #E0E0E0
}
```

**Search Box:**
```typescript
{
  backgroundColor: Colors.surface,
  borderRadius: BorderRadius.xl,     // 24px
  padding: Spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: Colors.border,
}
```

### Status Badges

```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: Spacing.md,     // 16px
  paddingVertical: 6,
  borderRadius: BorderRadius.sm,     // 8px
  backgroundColor: statusConfig.bg,  // Light color
  
  // Icon
  size: 16,
  color: statusConfig.color,         // Dark color
  
  // Text
  fontSize: FontSizes.sm,            // 14px
  fontWeight: FontWeights.semibold,
  color: statusConfig.color,
  marginLeft: Spacing.xs,            // 4px
}
```

---

## 📱 Screen-Specific Styles

### Home Screen

**Map Container:**
```typescript
{
  flex: 1,
  backgroundColor: Colors.surface,
}
```

**Floating Location Card:**
```typescript
{
  position: 'absolute',
  top: Platform.OS === 'ios' ? 60 : 50,
  left: Spacing.md,
  right: Spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.white,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.sm,
  borderRadius: BorderRadius.xl,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 8,
}
```

**Bottom Card:**
```typescript
{
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: Colors.white,
  borderTopLeftRadius: BorderRadius.xl,
  borderTopRightRadius: BorderRadius.xl,
  padding: Spacing.md,
  paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.md,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 10,
}
```

### Booking Screen

**Step Indicator (Active):**
```typescript
{
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: Colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  
  // Number
  color: Colors.white,
  fontSize: FontSizes.sm,
  fontWeight: FontWeights.bold,
}
```

**Step Indicator (Completed):**
```typescript
{
  backgroundColor: '#10B981',        // Green
}
```

**Step Indicator (Inactive):**
```typescript
{
  backgroundColor: Colors.surface,
  borderWidth: 2,
  borderColor: Colors.border,
  
  // Number
  color: Colors.textMuted,
}
```

**Vehicle Card:**
```typescript
{
  flexDirection: 'row',
  backgroundColor: Colors.white,
  borderRadius: BorderRadius.lg,
  padding: Spacing.md,
  marginBottom: Spacing.sm,
  borderWidth: 2,
  borderColor: isSelected ? Colors.primary : Colors.border,
  backgroundColor: isSelected ? '#F3E8FF' : Colors.white,
}
```

### Rides Screen

**Ride Card:**
```typescript
{
  backgroundColor: Colors.white,
  borderRadius: BorderRadius.lg,
  padding: Spacing.md,
  marginBottom: Spacing.sm,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
}
```

**Location Dots:**
```typescript
// Pickup dot
{
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#4CAF50',      // Green
}

// Dropoff dot
{
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: '#F44336',      // Red
}

// Connecting line
{
  width: 2,
  flex: 1,
  backgroundColor: Colors.border,
  marginVertical: 4,
}
```

### Profile Screen

**Profile Card:**
```typescript
{
  backgroundColor: Colors.white,
  borderRadius: BorderRadius.xl,
  padding: Spacing.lg,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
}
```

**Avatar:**
```typescript
{
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: Colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 4,
  borderColor: Colors.white,
  
  // Text
  fontSize: 32,
  fontWeight: FontWeights.bold,
  color: Colors.white,
}
```

**Menu Item:**
```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  padding: Spacing.lg,
  backgroundColor: Colors.white,
  borderBottomWidth: 1,
  borderBottomColor: Colors.divider,
}

// Icon container
{
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: iconBg,          // Colored bg
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: Spacing.md,
}
```

### Bottom Sheet (Ride Tracking)

**Container:**
```typescript
{
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  top: Platform.OS === 'ios' ? 120 : 110,
  backgroundColor: Colors.white,
  borderTopLeftRadius: BorderRadius.xl,
  borderTopRightRadius: BorderRadius.xl,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 20,
}
```

**Drag Handle:**
```typescript
{
  width: 40,
  height: 4,
  backgroundColor: '#D0D0D0',
  borderRadius: 2,
  alignSelf: 'center',
  marginVertical: Spacing.sm,
}
```

---

## 🎯 Icons

### Icon Library
**Using:** `@expo/vector-icons` (Ionicons)

### Icon Sizes

```typescript
const IconSizes = {
  xs: 14,    // Small icons in text
  sm: 18,    // Badge icons
  md: 24,    // Standard icons
  lg: 32,    // Large icons
  xl: 48,    // Hero icons
  xxl: 64,   // Empty state icons
};
```

### Common Icons

**Navigation:**
- Back: `arrow-back`
- Forward: `chevron-forward`
- Menu: `menu`
- Close: `close`

**Actions:**
- Search: `search`
- Add: `add`
- Remove: `remove`
- Edit: `create` or `pencil`
- Delete: `trash`

**Status:**
- Success: `checkmark-circle`
- Warning: `warning`
- Error: `close-circle`
- Info: `information-circle`
- Pending: `time`

**Ride Status:**
- Pending: `time-outline`
- Accepted: `checkmark-circle-outline`
- Started: `car-sport-outline`
- Completed: `checkmark-done-circle-outline`
- Cancelled: `close-circle-outline`

**Communication:**
- Call: `call` or `call-outline`
- Message: `chatbubble` or `chatbubble-outline`
- SOS: `warning` or `alert`

**Location:**
- Location pin: `location`
- Navigate: `navigate`
- Map: `map`

**User:**
- Profile: `person` or `person-outline`
- People: `people` or `people-outline`

### Icon Usage

```typescript
// Standard icon
<Ionicons 
  name="checkmark-circle" 
  size={24} 
  color={Colors.primary} 
/>

// Icon with text
<View style={{ flexDirection: 'row', gap: Spacing.xs }}>
  <Ionicons name="location" size={16} color={Colors.primary} />
  <Text>Location</Text>
</View>

// Icon button
<TouchableOpacity style={styles.iconButton}>
  <Ionicons name="menu" size={24} color="#000" />
</TouchableOpacity>
```

---

## 🎯 Design Principles

### 1. **Consistency**
- Use theme constants throughout the app
- Never hardcode colors, sizes, or spacing
- Maintain consistent patterns across screens

### 2. **Hierarchy**
- Use size, weight, and color to establish hierarchy
- Important elements: Larger, bolder, colored
- Secondary elements: Smaller, lighter, gray

### 3. **Whitespace**
- Don't overcrowd elements
- Use consistent spacing
- Let content breathe

### 4. **Accessibility**
- Minimum touch target: 44x44px
- Sufficient color contrast
- Clear visual feedback
- Descriptive labels

### 5. **Platform Guidelines**
- iOS: Safe area insets, subtle shadows
- Android: Elevation, material ripples
- Use `Platform.OS` for platform-specific styles

### 6. **Status Colors**
- Use semantic colors consistently
- Green = success/completed
- Red = error/cancelled
- Amber = warning/pending
- Blue = info/accepted
- Purple = primary/in-progress

### 7. **Visual Feedback**
- Active states for buttons
- Loading indicators
- Error messages
- Success confirmations

---

## 📦 Theme File Structure

```
src/constants/
  └── theme.ts
      ├── Colors
      ├── FontSizes
      ├── FontWeights
      ├── Spacing
      └── BorderRadius
```

### Usage in Components

```typescript
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
});
```

---

## 🎨 Color System Summary

### Brand Colors
- **Primary:** #8B5CF6 (Purple)
- **White:** #FFFFFF
- **Black:** #000000

### Semantic Colors
- **Success:** #10B981 (Green)
- **Warning:** #F59E0B (Amber)
- **Error:** #EF4444 (Red)
- **Info:** #3B82F6 (Blue)

### Neutral Colors
- **Text:** #000000, #666666, #999999
- **Background:** #FFFFFF, #F8F9FA
- **Border:** #E0E0E0, #F0F0F0

### Status Colors
- **Pending:** #F59E0B (Amber)
- **Accepted:** #3B82F6 (Blue)
- **Started:** #8B5CF6 (Purple)
- **Completed:** #10B981 (Green)
- **Cancelled:** #EF4444 (Red)

---

## ✅ Best Practices

1. **Always use theme constants** - Never hardcode values
2. **Test on both platforms** - iOS and Android
3. **Check accessibility** - Color contrast, touch targets
4. **Maintain consistency** - Patterns across screens
5. **Use semantic colors** - Colors with meaning
6. **Respect safe areas** - Use SafeAreaView
7. **Optimize performance** - Use StyleSheet.create
8. **Document changes** - Update this file when adding styles

---

**Design System Version 1.0 - Complete and Production Ready!** 🎨✨
