# Profile Compare Library

A production-ready Angular library for comparing two user profiles side-by-side with AI-powered similarity analysis and rich interactive features.

## Features

- **Side-by-side Profile Comparison**: Clean, responsive layout
- **Text Similarity Analysis**: AI-powered interest comparison using API Ninjas
- **Face Detection Alignment**: Automatic profile picture alignment
- **Rich Animations**: Smooth Angular animations and transitions
- **Responsive Design**: Works on desktop and mobile
- **High Performance**: OnPush change detection strategy
- **Comprehensive Testing**: 80%+ test coverage with Jest
- **TypeScript Support**: Fully typed with comprehensive interfaces

## Installation

```bash
npm install profile-compare-lib
```

## Quick Start

```typescript
// Import the module
import { ProfileCompareLibModule } from 'profile-compare-lib';

@NgModule({
  imports: [ProfileCompareLibModule],
})
export class YourModule { }

// Use in component
<pc-profile-comparison
  [user1]="user1"
  [user2]="user2"
  [referenceInterests]="referenceInterests"
  [config]="config"
  (viewProfile1)="onViewProfile1()"
  (viewProfile2)="onViewProfile2()">
</pc-profile-comparison>
```

## API

### Interfaces

```typescript
interface UserProfile {
  id: string;
  name: string;
  imageUrl: string;
  interests: string[];
}

interface ProfileCompareConfig {
  apiKey: string;
  enableTextSimilarity?: boolean;
  enableFaceDetection?: boolean;
  similarityThreshold?: number;
}
```

### Component

#### Inputs
- `user1: UserProfile` - First user profile
- `user2: UserProfile` - Second user profile  
- `referenceInterests: string[]` - Reference interests for comparison
- `config: ProfileCompareConfig` - Configuration options

#### Outputs
- `viewProfile1: EventEmitter<boolean>` - User 1 profile button clicked
- `viewProfile2: EventEmitter<boolean>` - User 2 profile button clicked

## Development

```bash
# Build the library
ng build profile-compare-lib

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## License


