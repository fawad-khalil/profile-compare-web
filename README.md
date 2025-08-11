# Profile Compare Library

A comprehensive Angular library for comparing two user profiles side-by-side with AI-powered similarity analysis and rich interactive features.

## Demo

![Demo Video](./demo.gif)

##  Features

- **Side-by-side Profile Comparison**: Clean, responsive layout for comparing two user profiles
- **Text Similarity Analysis**: Uses API Ninjas Text Similarity API to analyze and rank interests by similarity scores
- **Face Detection Alignment**: Automatically aligns profile pictures using face detection for better visual comparison
- **Interactive UI**: Rich animations, hover effects, and smooth transitions
- **Responsive Design**: Fully responsive layout that works on desktop and mobile
- **High Performance**: OnPush change detection strategy for optimal performance
- **Comprehensive Testing**: 80%+ test coverage with Jest
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Accessibility**: ARIA labels and keyboard navigation support

## 📦 Installation

```bash
npm install profile-compare-lib
```

## 🛠️ Quick Start

### 1. Import the Module

```typescript
import { ProfileCompareLibModule } from 'profile-compare-lib';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Required for animations
    HttpClientModule,       // Required for API calls
    ProfileCompareLibModule
  ],
  // ...
})
export class AppModule { }
```

### 2. Use in Your Component

```typescript
import { Component } from '@angular/core';
import { UserProfile, ProfileCompareConfig } from 'profile-compare-lib';

@Component({
  selector: 'app-example',
  template: `
    <pc-profile-comparison
      [user1]="user1"
      [user2]="user2"
      [referenceInterests]="referenceInterests"
      [config]="config"
      (viewProfile1)="onViewProfile1()"
      (viewProfile2)="onViewProfile2()">
    </pc-profile-comparison>
  `
})
export class ExampleComponent {
  user1: UserProfile = {
    id: '1',
    name: 'John Doe',
    imageUrl: 'https://example.com/john.jpg',
    interests: ['Programming', 'Music', 'Travel']
  };

  user2: UserProfile = {
    id: '2',
    name: 'Jane Smith',
    imageUrl: 'https://example.com/jane.jpg',
    interests: ['Coding', 'Guitar', 'Adventure']
  };

  referenceInterests = ['Technology', 'Arts', 'Lifestyle'];

  config: ProfileCompareConfig = {
    apiKey: 'your-api-ninjas-key',
    enableTextSimilarity: true,
    enableFaceDetection: true,
    similarityThreshold: 0.7
  };

  onViewProfile1() {
    console.log('User 1 profile clicked');
  }

  onViewProfile2() {
    console.log('User 2 profile clicked');
  }
}
```

## 🔧 Configuration

### ProfileCompareConfig

```typescript
interface ProfileCompareConfig {
  /** API key for API Ninjas services */
  apiKey: string;
  
  /** Enable text similarity sorting (default: true) */
  enableTextSimilarity?: boolean;
  
  /** Enable face detection alignment (default: true) */
  enableFaceDetection?: boolean;
  
  /** Similarity threshold for highlighting matches (default: 0.7) */
  similarityThreshold?: number;
}
```

### UserProfile Interface

```typescript
interface UserProfile {
  /** Unique identifier for the user */
  id: string;
  
  /** Display name of the user */
  name: string;
  
  /** URL to the user's profile image */
  imageUrl: string;
  
  /** List of user's interests/hobbies */
  interests: string[];
}
```

## 🎨 Customization

### Styling

The component uses CSS custom properties for easy theming:

```scss
pc-profile-comparison {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: #ffffff;
  --text-color: #2c3e50;
  --border-radius: 16px;
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### API Integration

#### Text Similarity API
The component uses API Ninjas Text Similarity API to compare interests. Get your API key from [API Ninjas](https://api.api-ninjas.com/).

#### Face Detection API  
Face detection uses API Ninjas Face Detection API to align profile pictures by detected face positions.

## 📱 Demo

Run the showcase application to see the library in action:

```bash
# Clone the repository
git clone <repository-url>
cd profile-compare-workspace

# Install dependencies
npm install

# Build the library
npm run build:lib

# Start the showcase app
npm run start:showcase
```

Visit `http://localhost:4200` to see the interactive demo.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📋 API Reference

### Component Inputs

| Input | Type | Description |
|-------|------|-------------|
| `user1` | `UserProfile` | First user profile data |
| `user2` | `UserProfile` | Second user profile data |
| `referenceInterests` | `string[]` | Reference interests for similarity comparison |
| `config` | `ProfileCompareConfig` | Configuration for API integrations and features |

### Component Outputs

| Output | Type | Description |
|--------|------|-------------|
| `viewProfile1` | `EventEmitter<boolean>` | Emitted when user 1's "View Profile" button is clicked |
| `viewProfile2` | `EventEmitter<boolean>` | Emitted when user 2's "View Profile" button is clicked |

## 🔄 Development

### Building the Library

```bash
# Build the library
npm run build:lib

# Build in watch mode
npm run build:lib -- --watch
```

### Development Server

```bash
# Start the main app
npm start

# Start the showcase app
npm run start:showcase
```



## 🏗️ Built With

- **Angular 16+** - The web framework used
- **TypeScript** - Programming language
- **SCSS** - Styling
- **Jest** - Testing framework
- **API Ninjas** - Text similarity and face detection APIs
- **Swiper.js** - Touch slider component

---
