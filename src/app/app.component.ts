import { Component } from '@angular/core';
import { UserProfile, ProfileCompareConfig } from '../../projects/profile-compare-lib/src/lib/interfaces/user-profile.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'profile-compare-workspace';

  // Sample user data for the profile comparison
  user1: UserProfile = {
    id: '1',
    name: 'John Doe',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    interests: [
      'Photography',
      'Travel',
      'Cooking',
      'Gaming',
      'Music'
    ]
  };

  user2: UserProfile = {
    id: '2',
    name: 'Jane Smith',
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    interests: [
      'Photography',
      'Travel',
      'Cooking',
      'Reading',
      'Music'
    ]
  };

  config: ProfileCompareConfig = {
    apiKey: 'your-api-key-here',
    enableFaceDetection: true,
    enableTextSimilarity: true,
    similarityThreshold: 0.7
  };

  onViewProfile1(): void {
    console.log('Viewing profile 1');
  }

  onViewProfile2(): void {
    console.log('Viewing profile 2');
  }
}
