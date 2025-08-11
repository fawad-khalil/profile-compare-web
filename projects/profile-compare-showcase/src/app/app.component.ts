import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { UserProfile, ProfileCompareConfig } from '../../../profile-compare-lib/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-in')
      ]),
      transition('* => void', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class AppComponent {
  title = 'Profile Compare Showcase';

  // Demo user profiles matching the design description
  user1: UserProfile = {
    id: '1',
    name: 'Marcus Rivera',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face',
    interests: ['Pina Coladas', 'Subway', 'Japanese', 'Gardening', 'Baseball', 'Motocross', 'Bears', 'MMA', 'Biology', 'Masters Degree', 'Sushi', 'University']
  };

  user2: UserProfile = {
    id: '2', 
    name: 'Jessica Martinez',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b6d2c7b4?w=300&h=400&fit=crop&crop=face',
    interests: ['Pizza', 'Volleyball', 'Albany NY', 'Sushi', 'University', 'Fitness', 'Movies', 'Travel', 'Photography', 'Music']
  };

  // Reference interests for similarity comparison
  referenceInterests: string[] = [
    'Technology', 'Outdoor Activities', 'Creative Arts', 'Beverages', 'Entertainment', 'Sports'
  ];

  // Configuration for the profile comparison component
  config: ProfileCompareConfig = {
    apiKey: 'YOUR_API_NINJAS_KEY_HERE', // Replace with your actual API Ninjas key
    enableTextSimilarity: true,
    enableFaceDetection: true,
    similarityThreshold: 0.7
  };

  // Message to show when profile buttons are clicked
  profileMessage = '';

  /**
   * Handle when user 1's profile is viewed
   */
  onViewProfile1(): void {
    this.profileMessage = `You have been routed to ${this.user1.name}'s profile page.`;
    setTimeout(() => {
      this.profileMessage = '';
    }, 3000);
  }

  /**
   * Handle when user 2's profile is viewed  
   */
  onViewProfile2(): void {
    this.profileMessage = `You have been routed to ${this.user2.name}'s profile page.`;
    setTimeout(() => {
      this.profileMessage = '';
    }, 3000);
  }

  /**
   * Toggle API features for demonstration
   */
  toggleTextSimilarity(): void {
    this.config = {
      ...this.config,
      enableTextSimilarity: !this.config.enableTextSimilarity
    };
  }

  /**
   * Toggle face detection for demonstration
   */
  toggleFaceDetection(): void {
    this.config = {
      ...this.config,
      enableFaceDetection: !this.config.enableFaceDetection
    };
  }

  // Angular version for footer display
  angularVersion = '16';

  // Usage example code for display
  usageExample = `// Install the library
npm install profile-compare-lib

// Import in your module
import { ProfileCompareLibModule } from 'profile-compare-lib';

@NgModule({
  imports: [ProfileCompareLibModule],
})
export class YourModule { }

// Use in your component
<pc-profile-comparison
  [user1]="user1"
  [user2]="user2"
  [referenceInterests]="referenceInterests"
  [config]="config"
  (viewProfile1)="onViewProfile1()"
  (viewProfile2)="onViewProfile2()">
</pc-profile-comparison>`;
}
