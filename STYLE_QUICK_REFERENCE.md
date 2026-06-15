# 🎨 Style Quick Reference Guide

Quick copy-paste guide for common styles in JK Taxi Customer App.

---

## 🎨 Colors

```typescript
import { Colors } from '../constants/theme';

// Primary
Colors.primary        // #8B5CF6 (Purple)
Colors.white          // #FFFFFF
Colors.black          // #000000

// Text
Colors.text           // #000000
Colors.textSecondary  // #666666
Colors.textMuted      // #999999

// Backgrounds
Colors.background     // #FFFFFF
Colors.surface        // #F8F9FA

// Status
Colors.success        // #10B981 (Green)
Colors.warning        // #F59E0B (Amber)
Colors.error          // #EF4444 (Red)
Colors.info           // #3B82F6 (Blue)

// UI
Colors.border         // #E0E0E0
Colors.divider        // #F0F0F0
```

---

## 📝 Typography

```typescript
import { FontSizes, FontWeights } from '../constants/theme';

// Sizes
FontSizes.xs    // 12px
FontSizes.sm    // 14px
FontSizes.md    // 16px
FontSizes.lg    // 18px
FontSizes.xl    // 20px
FontSizes.xxl   // 24px
FontSizes.xxxl  // 32px

// Weights
FontWeights.regular   // 400
FontWeights.medium    // 500
FontWeights.semibold  // 600
FontWeights.bold      // 700
```

---

## 📏 Spacing & Radius

```typescript
import { Spacing, BorderRadius } from '../constants/theme';

// Spacing
Spacing.xs   // 4px
Spacing.sm   // 8px
Spacing.md   // 16px
Spacing.lg   // 24px
Spacing.xl   // 32px
Spacing.xxl  // 40px

// Border Radius
BorderRadius.sm    // 8px
BorderRadius.md    // 12px
BorderRadius.lg    // 16px
BorderRadius.xl    // 24px
BorderRadius.full  // 9999
```

---

## 🔘 Common Buttons

### Primary Button
```typescript
{
  backgroundColor: Colors.primary,
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.xl,
  borderRadius: BorderRadius.md,
  alignItems: 'center',
  justifyContent: 'center',
}

// Text
{
  color: Colors.white,
  fontSize: FontSizes.md,
  fontWeight: FontWeights.semibold,
}
```

### Secondary Button
```typescript
{
  backgroundColor: Colors.white,
  borderWidth: 1,
  borderColor: Colors.primary,
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.xl,
  borderRadius: BorderRadius.md,
}

// Text
{
  color: Colors.primary,
  fontSize: FontSizes.md,
  fontWeight: FontWeights.semibold,
}
```

### Danger Button
```typescript
{
  backgroundColor: '#FEE2E2',
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.xl,
  borderRadius: BorderRadius.md,
}

// Text
{
  color: Colors.error,
  fontSize: FontSizes.md,
  fontWeight: FontWeights.semibold,
}
```

---

## 🃏 Common Cards

### Standard Card
```typescript
{
  backgroundColor: Colors.white,
  borderRadius: BorderRadius.lg,
  padding: Spacing.lg,
  marginBottom: Spacing.sm,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
}
```

### Info Card (Purple)
```typescript
{
  backgroundColor: '#F3E8FF',
  borderRadius: BorderRadius.lg,
  padding: Spacing.md,
  borderWidth: 2,
  borderColor: Colors.primary,
}
```

---

## 📝 Common Inputs

### Text Input
```typescript
{
  backgroundColor: Colors.surface,
  borderRadius: BorderRadius.md,
  padding: Spacing.md,
  fontSize: FontSizes.md,
  color: Colors.text,
  borderWidth: 1,
  borderColor: Colors.border,
}
```

### Search Box
```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.surface,
  borderRadius: BorderRadius.xl,
  padding: Spacing.md,
  borderWidth: 1,
  borderColor: Colors.border,
}
```

---

## 🏷️ Status Badge

```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: Spacing.md,
  paddingVertical: 6,
  borderRadius: BorderRadius.sm,
  backgroundColor: '#F3E8FF', // Light color
}

// Icon
<Ionicons name="icon-name" size={16} color="#8B5CF6" />

// Text
{
  fontSize: FontSizes.sm,
  fontWeight: FontWeights.semibold,
  color: '#8B5CF6',
  marginLeft: Spacing.xs,
}
```

---

## 👤 Avatar

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
}

// Text
{
  fontSize: 32,
  fontWeight: FontWeights.bold,
  color: Colors.white,
}
```

---

## 🎨 Status Colors

```typescript
const STATUS_COLORS = {
  pending: {
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  accepted: {
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  started: {
    color: '#8B5CF6',
    bg: '#F3E8FF',
  },
  completed: {
    color: '#10B981',
    bg: '#D1FAE5',
  },
  cancelled: {
    color: '#EF4444',
    bg: '#FEE2E2',
  },
};
```

---

## 🎯 Common Icons

```typescript
import { Ionicons } from '@expo/vector-icons';

// Navigation
<Ionicons name="arrow-back" size={24} color="#000" />
<Ionicons name="menu" size={24} color="#000" />
<Ionicons name="close" size={24} color="#000" />

// Status
<Ionicons name="checkmark-circle" size={24} color={Colors.success} />
<Ionicons name="close-circle" size={24} color={Colors.error} />
<Ionicons name="warning" size={24} color={Colors.warning} />
<Ionicons name="time" size={24} color={Colors.info} />

// Actions
<Ionicons name="call" size={24} color={Colors.primary} />
<Ionicons name="search" size={24} color="#000" />
<Ionicons name="location" size={24} color={Colors.primary} />
<Ionicons name="car-sport" size={24} color={Colors.primary} />
```

---

## 📐 Shadows

```typescript
// Standard shadow
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
}

// Strong shadow
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 5,
}
```

---

## 📱 Screen Header

```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.md,
  backgroundColor: Colors.white,
  borderBottomWidth: 1,
  borderBottomColor: Colors.border,
}

// Title
{
  fontSize: FontSizes.xl,
  fontWeight: FontWeights.bold,
  color: Colors.text,
}
```

---

## 🔄 Full Import Example

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Colors, 
  Spacing, 
  FontSizes, 
  FontWeights, 
  BorderRadius 
} from '../constants/theme';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
      <TouchableOpacity style={styles.button}>
        <Ionicons name="checkmark" size={20} color={Colors.white} />
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
});

export default MyComponent;
```

---

**Quick reference for consistent styling across the app!** 🎨
