# Legatura Mobile App Assets

This folder contains all media assets for the Legatura mobile application.

## Folder Structure

### 📁 Images (`/images`)
- **`/icons`** - UI icons, navigation icons, action buttons
- **`/logos`** - Legatura branding logos, company logos
- **`/backgrounds`** - Background images, patterns, textures  
- **`/pictures`** - Onboarding slides, UI illustrations, feature images

### 🎬 Videos (`/videos`)
- **`/tutorials`** - How-to videos, feature demonstrations
- **`/onboarding`** - Welcome videos, app introduction clips

### 🔊 Audio (`/audio`)
- **`/sounds`** - Notification sounds, UI feedback sounds, alerts

### 🔤 Fonts (`/fonts`)
- Custom fonts for the Legatura brand
- Typography files (.ttf, .otf)

### 📄 Documents (`/documents`)
- **`/templates`** - Contract templates, forms, document templates
- **`/guides`** - User guides, help documents, PDFs

## File Naming Conventions

### Images
- Use lowercase with dashes: `company-logo.png`
- Include size for icons: `home-icon-24px.png`
- Use descriptive names: `onboarding-construction.jpg`

### Videos
- Use descriptive names: `how-to-create-contract.mp4`
- Include duration if helpful: `welcome-intro-30s.mp4`

### Audio
- Use descriptive names: `notification-sound.mp3`
- Include type: `success-chime.wav`

## Supported Formats

### Images
- PNG (recommended for icons, logos)
- JPG/JPEG (photos, backgrounds)
- SVG (scalable icons)

### Videos
- MP4 (recommended)
- MOV
- AVI

### Audio
- MP3 (recommended)
- WAV
- AAC

### Fonts
- TTF (TrueType)
- OTF (OpenType)

## Usage in React Native

```typescript
// Importing images
import logo from './assets/images/logos/legatura-logo.png';
import homeIcon from './assets/images/icons/home-icon.png';

// Using in components
<Image source={logo} />
<Image source={homeIcon} />

// For Expo, you can also use require()
<Image source={require('./assets/images/logos/legatura-logo.png')} />
```

## Tips
- Keep file sizes optimized for mobile
- Use @2x, @3x naming for different screen densities
- Test assets on different screen sizes
- Compress images to reduce app bundle size
