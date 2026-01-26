

# Premium Visual Enhancements Plan

## Overview
This plan addresses four key improvements to enhance the professional appearance and user experience:
1. **Parallax scrolling effects** for hero backgrounds
2. **Video background** on the Hero Section
3. **Image background** on the "Ready to Ship Globally?" CTA section
4. **Fix counter number overlap** in the "Why Choose Us" section
5. **Remove the circular theme toggle button** from the Hero section area

---

## 1. Video Background for Hero Section

### Current State
- The hero currently uses a gradient background with animated dots pattern
- Video asset already exists: `src/assets/hero-logistics-video.mp4`

### Implementation
- Add a `<video>` element as the background layer with `autoPlay`, `muted`, `loop`, and `playsInline` attributes
- Apply a dark navy gradient overlay for text readability
- Implement smooth parallax effect using `transform: translateY()` based on scroll position
- Create a custom `useParallax` hook for reusable scroll-based transformations

### Code Changes
```text
File: src/hooks/useParallax.ts (NEW)
- Create a custom hook that tracks scroll position
- Return a transform value for parallax effect
- Use requestAnimationFrame for performance

File: src/components/home/HeroSection.tsx
- Import the video asset and useParallax hook
- Add video element with proper styling (object-fit: cover, absolute positioning)
- Apply parallax transform to the video container
- Add gradient overlay on top of video for text contrast
```

---

## 2. Image Background for CTA Section ("Ready to Ship Globally?")

### Current State
- Uses a solid gradient background with dot pattern overlay

### Implementation
- Add a high-quality logistics image as background (using existing `hero-logistics.jpg`)
- Apply dark overlay for text visibility
- Add subtle parallax scroll effect

### Code Changes
```text
File: src/components/home/CTASection.tsx
- Import the hero-logistics.jpg image
- Add background image layer with fixed positioning
- Apply dark navy overlay (rgba) for contrast
- Implement parallax transform on scroll
```

---

## 3. Fix Counter Number Overlap in "Why Choose Us" Section

### Current State
- Counter numbers use: `text-5xl sm:text-6xl md:text-6xl lg:text-7xl`
- On desktop, numbers can overlap when the grid columns are too narrow

### Root Cause
- The font size scales too large for the available column width
- No minimum width or proper scaling for the stats container

### Solution
- Reduce font sizes to prevent overflow
- Add proper responsive sizing: `text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl`
- Ensure container has `min-w-0` to allow text truncation if needed
- Add `whitespace-nowrap` to prevent line breaks in numbers
- Increase gap spacing between columns for better breathing room

### Code Changes
```text
File: src/components/home/WhyChooseSection.tsx
Line 35: Change StatsCounter font sizes
- From: text-5xl sm:text-6xl md:text-6xl lg:text-7xl
- To: text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl

Line 84: Increase grid gap
- From: gap-6 sm:gap-8
- To: gap-4 sm:gap-6 md:gap-8 lg:gap-10

Add min-w-0 and whitespace-nowrap to prevent overflow
```

---

## 4. Remove Circular Theme Toggle from Hero Area

### Current State
- The ThemeToggle in the Header uses a circular button that may appear as a "round cycle"
- Located in the navigation bar which overlays the hero section

### Clarification Needed
Based on the code, the ThemeToggle uses a ghost button variant with Sun/Moon icons. The user mentions "round cycle on switch mode on the hero section" - this appears to be the theme toggle button in the navigation.

### Solution
- Hide the ThemeToggle when scrolled to the top (hero visible)
- Or completely remove from the hero overlay area
- Keep functionality in other areas of the site if needed

### Code Changes
```text
File: src/components/layout/Header.tsx
- Add scroll detection to hide ThemeToggle when at top of page
- Or remove ThemeToggle from hero overlay entirely

Alternative: File: src/components/ThemeToggle.tsx
- Modify styling to be less prominent (remove circular appearance)
```

---

## 5. Parallax Scrolling Effects Implementation

### New Custom Hook
```text
File: src/hooks/useParallax.ts (NEW)

Creates a reusable parallax effect hook:
- Listens to scroll events with throttling for performance
- Returns a CSS transform value based on scroll position
- Configurable speed multiplier (default 0.5)
- Uses requestAnimationFrame for smooth 60fps updates
```

### Parallax Keyframes in CSS
```text
File: src/index.css
- Add parallax utility classes
- Add smooth transition for parallax elements
```

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useParallax.ts` | Custom hook for scroll-based parallax transformations |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Add video background with parallax effect |
| `src/components/home/CTASection.tsx` | Add image background with parallax effect |
| `src/components/home/WhyChooseSection.tsx` | Fix counter typography sizing |
| `src/components/layout/Header.tsx` | Hide/remove ThemeToggle from hero area |
| `src/index.css` | Add parallax utility classes |

### Performance Considerations
- Video uses `preload="metadata"` for faster initial load
- Parallax uses `transform` (GPU-accelerated) instead of `background-position`
- All scroll listeners are throttled using `requestAnimationFrame`
- Images use lazy loading where appropriate

---

## Expected Outcome
- Hero section displays the logistics video with a premium parallax scrolling effect
- CTA "Ready to Ship Globally?" section uses the logistics image with parallax
- Counter numbers in "Why Choose Us" display properly on all screen sizes without overlap
- Theme toggle is less intrusive in the hero area
- Overall premium, hand-crafted visual experience

