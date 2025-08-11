import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnChanges, 
  AfterViewInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { UserProfile, InterestSimilarity, ProfileCompareConfig } from '../interfaces/user-profile.interface';
import { ApiService } from '../services/api.service';

/**
 * Profile comparison component that displays two user profiles side-by-side
 * with similarity analysis and interactive features
 */
@Component({
  selector: 'pc-profile-comparison',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="profile-comparison-container">
      <!-- Background Images -->
      <div class="background-images">
        <div class="bg-image bg-image-left" [style.backgroundImage]="'url(' + user1.imageUrl + ')'"></div>
        <div class="bg-image bg-image-right" [style.backgroundImage]="'url(' + user2.imageUrl + ')'"></div>
      </div>

      <h1 class="comparison-title">Profile Comparison</h1>
      
      <div class="comparison-layout">
        <!-- Left Profile -->
        <div class="profile-rectangle left-rectangle">
          <div class="profile-header">
            <img [src]="user1.imageUrl" [alt]="user1.name + ' profile picture'" class="profile-image" [ngStyle]="user1ImageStyle">
            <h2 class="profile-name">{{ user1.name }}</h2>
          </div>

          <div class="interests-list">
            <div 
              *ngFor="let interest of getNonMatchingInterests(user1Interests)"
              class="interest-item"
            >
              <span class="interest-text">{{ interest.interest }}</span>
            </div>
          </div>

          <button class="view-profile-btn" (click)="onViewProfile1()">
            View Profile
          </button>
        </div>

        <!-- Right Profile -->
        <div class="profile-rectangle right-rectangle">
          <div class="profile-header">
            <img [src]="user2.imageUrl" [alt]="user2.name + ' profile picture'" class="profile-image" [ngStyle]="user2ImageStyle">
            <h2 class="profile-name">{{ user2.name }}</h2>
          </div>

          <div class="interests-list right-interests">
            <div 
              *ngFor="let interest of getNonMatchingInterests(user2Interests)"
              class="interest-item right-interest-item"
            >
              <div class="compatibility-meter">
                <div class="meter-bar" [style.width.%]="getInterestCompatibility(interest)"></div>
              </div>
              <span class="interest-text">{{ interest.interest }}</span>
            </div>
          </div>

          <button class="view-profile-btn" (click)="onViewProfile2()">
            View Profile
          </button>
        </div>

        <!-- Central Intersection -->
        <div class="intersection-area">
          <div class="intersection-glow-left"></div>
          <div class="intersection-glow-right"></div>
          
          <div class="match-percentage">{{ getMatchPercentage() }}% Match</div>
          <div class="shared-interests">
            <div 
              *ngFor="let interest of getSharedInterests()"
              class="shared-interest-item"
            >
              {{ interest }}
            </div>
          </div>

          <!-- Loading State -->
          <div class="loading-overlay" *ngIf="isLoadingSimilarity || isLoadingFaceAlignment">
            <div class="spinner"></div>
            <span class="loading-text">Finding Similarities...</span>
          </div>

          <!-- Error State -->
          <div class="error-overlay" *ngIf="similarityError || faceAlignmentError">
            <span class="error-icon">⚠️</span>
            <span class="error-text">Analysis Failed</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
         /* Container */
     .profile-comparison-container {
       position: relative;
       width: 1200px;
       height: 800px;
       display: flex;
       flex-direction: column;
       align-items: center;
       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
       padding: 48px 24px;
       background: #000000;
       border-radius: 20px;
       overflow: hidden;
       perspective: 2000px;
       transform-style: preserve-3d;
       margin: 0 auto;
       min-width: 1200px;
       max-width: 1200px;
       min-height: 800px;
       max-height: 800px;
     }

    /* Background Images */
    .background-images {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      overflow: hidden;
    }

    .bg-image {
      flex: 1;
      background-size: cover;
      background-position: center;
      opacity: 0.15;
      filter: blur(10px);
      transform: scale(1.1);
    }

    .bg-image-left {
      background-position: right center;
    }

    .bg-image-right {
      background-position: left center;
    }

    /* Title */
    .comparison-title {
      font-size: 36px;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 48px;
      text-align: center;
      text-shadow: 0 0 20px rgba(156, 39, 176, 0.5);
      position: relative;
      z-index: 1;
    }

         /* Layout */
     .comparison-layout {
       position: relative;
       width: 100%;
       height: 600px;
       display: flex;
       align-items: center;
       justify-content: center;
       transform-style: preserve-3d;
     }

         /* Rectangles */
     .profile-rectangle {
       position: absolute;
       width: 450px;
       height: 600px;
       background: rgba(20, 20, 20, 0.6);
       border: 2px solid;
       backdrop-filter: blur(12px);
       -webkit-backdrop-filter: blur(12px);
       padding: 40px;
       display: flex;
       flex-direction: column;
       transform-style: preserve-3d;
       transition: all 0.4s ease;
       border-radius: 24px;
     }

         .left-rectangle {
       left: calc(50% - 550px);
       border-color: #673ab7;
       box-shadow: 0 0 30px rgba(103, 58, 183, 0.4),
                 inset 0 0 20px rgba(103, 58, 183, 0.2);
       transform: perspective(2000px) rotateY(25deg) translateZ(-100px);
       z-index: 5;
       position: relative;
     }

     .right-rectangle {
       right: calc(50% - 500px);
       border-color: #9c27b0;
       box-shadow: 0 0 30px rgba(156, 39, 176, 0.4),
                 inset 0 0 20px rgba(156, 39, 176, 0.2);
       transform: perspective(2000px) rotateY(-25deg) translateZ(-100px);
       z-index: 5;
       position: relative;
     }

    .left-rectangle:hover {
      transform: perspective(2000px) rotateY(20deg) translateZ(-50px);
      box-shadow: 0 0 40px rgba(103, 58, 183, 0.6),
                inset 0 0 25px rgba(103, 58, 183, 0.3);
    }

         .right-rectangle:hover {
       transform: perspective(2000px) rotateY(-20deg) translateZ(-50px);
       box-shadow: 0 0 40px rgba(156, 39, 176, 0.6),
                 inset 0 0 25px rgba(156, 39, 176, 0.3);
     }

     /* Intersection Area */
     .intersection-area {
       position: absolute;
       top: 40%;
       left: 50%;
       transform: translate(-50%, -50%) translateZ(50px);
       width: 360px;
       min-height: 240px;
       background: rgba(30, 30, 30, 0.8);
       border: 2px solid #ba68c8;
       box-shadow: 0 0 40px rgba(186, 104, 200, 0.6),
                 inset 0 0 25px rgba(186, 104, 200, 0.4);
       backdrop-filter: blur(16px);
       -webkit-backdrop-filter: blur(16px);
       padding: 32px;
       z-index: 10;
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       border-radius: 32px;
     }

     .match-percentage {
       font-size: 32px;
       font-weight: 700;
       color: #ffffff;
       margin-bottom: 24px;
       text-align: center;
       background: linear-gradient(135deg, #9c27b0, #673ab7);
       -webkit-background-clip: text;
       -webkit-text-fill-color: transparent;
       text-shadow: 0 0 20px rgba(156, 39, 176, 0.5);
     }

     .shared-interests {
       width: 100%;
       display: flex;
       flex-direction: column;
       gap: 12px;
       align-items: center;
     }

     .shared-interest-item {
       width: 100%;
       padding: 12px 24px;
       background: linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(103, 58, 183, 0.2));
       border: 1px solid rgba(186, 104, 200, 0.3);
       border-radius: 12px;
       font-size: 16px;
       color: #ffffff;
       text-align: center;
       box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
       transition: all 0.3s ease;
     }

          .shared-interest-item:hover {
       background: linear-gradient(135deg, rgba(156, 39, 176, 0.3), rgba(103, 58, 183, 0.3));
       transform: translateY(-2px);
       box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
     }

     /* Loading States */
     .loading-overlay {
       position: absolute;
       top: 0;
       left: 0;
       right: 0;
       bottom: 0;
       background: rgba(0, 0, 0, 0.85);
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       z-index: 20;
       border-radius: 32px;
       backdrop-filter: blur(8px);
       -webkit-backdrop-filter: blur(8px);
     }

     .spinner {
       width: 40px;
       height: 40px;
       border: 3px solid rgba(156, 39, 176, 0.2);
       border-top: 3px solid #9c27b0;
       border-radius: 50%;
       animation: spin 1s linear infinite;
       margin-bottom: 16px;
       box-shadow: 0 0 20px rgba(156, 39, 176, 0.4),
                 inset 0 0 10px rgba(156, 39, 176, 0.2);
     }

     .loading-text {
       color: #ffffff;
       font-size: 16px;
       font-weight: 500;
       text-shadow: 0 0 15px rgba(156, 39, 176, 0.6);
       background: linear-gradient(135deg, #9c27b0, #673ab7);
       -webkit-background-clip: text;
       -webkit-text-fill-color: transparent;
     }

     /* Error States */
     .error-overlay {
       position: absolute;
       top: 0;
       left: 0;
       right: 0;
       bottom: 0;
       background: rgba(0, 0, 0, 0.85);
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       z-index: 20;
       border-radius: 32px;
       backdrop-filter: blur(8px);
       -webkit-backdrop-filter: blur(8px);
     }

     .error-text {
       color: #ff1744;
       font-size: 16px;
       font-weight: 500;
       margin-top: 16px;
       background: rgba(255, 23, 68, 0.1);
       padding: 12px 24px;
       border-radius: 12px;
       border: 1px solid rgba(255, 23, 68, 0.3);
       text-shadow: 0 0 15px rgba(255, 23, 68, 0.6);
       box-shadow: 0 0 30px rgba(255, 23, 68, 0.2),
                 inset 0 0 15px rgba(255, 23, 68, 0.1);
     }

     .error-icon {
       font-size: 32px;
       color: #ff1744;
       text-shadow: 0 0 20px rgba(255, 23, 68, 0.7);
       animation: pulse 2s ease-in-out infinite;
     }

     @keyframes pulse {
       0% { transform: scale(1); opacity: 1; }
       50% { transform: scale(1.1); opacity: 0.8; }
       100% { transform: scale(1); opacity: 1; }
     }

     /* Animations */
     @keyframes spin {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
     }

     /* Profile Headers */
    .profile-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .profile-image {
      width: 120px;
      height: 120px;
      border-radius: 60px;
      object-fit: cover;
      border: 3px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      margin-bottom: 16px;
      transition: transform 0.3s ease;
    }

    .profile-name {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    /* Interest Lists */
    .interests-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow-y: auto;
      padding-right: 12px;
      margin: 24px 0;
    }

    .interests-list::-webkit-scrollbar {
      width: 4px;
    }

    .interests-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .interests-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

         /* Interest Items */
     .interest-item {
       display: flex;
       align-items: center;
       gap: 12px;
       padding: 8px 0;
       background: transparent;
       border: none;
       border-radius: 0;
       font-size: 14px;
       color: #ffffff;
       transition: all 0.3s ease;
       text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
     }

              .interest-text {
       flex: 1;
     }

     /* Right rectangle specific styles */
     .right-interests {
       align-items: flex-end;
     }

     .right-interest-item {
       flex-direction: row-reverse;
       text-align: right;
       justify-content: flex-end;
     }

     .right-interest-item .interest-text {
       text-align: right;
       margin-left: 12px;
       margin-right: 0;
     }

     .right-interest-item .compatibility-meter {
       margin-left: 0;
       margin-right: 0;
     }

     .compatibility-meter {
       display: none; /* Hide the compatibility meter line */
     }

     .meter-bar {
       display: none; /* Hide the meter bar */
     }

         .interest-item:hover {
       transform: translateY(-2px);
       text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
     }

    /* View Profile Button */
    .view-profile-btn {
      padding: 12px 32px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: auto;
      position: relative;
      z-index: 15;
      pointer-events: auto;
    }

    .view-profile-btn:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1));
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

         /* Intersection Area */
     .intersection-area {
       position: absolute;
       top: 60%;
       left: 50%;
       transform: translate(-50%, -50%) translateZ(50px);
       width: 250px;
       min-height: 200px;
       background: rgba(30, 30, 30, 0.8);
       border: 2px solid #ba68c8;
       box-shadow: 0 0 40px rgba(186, 104, 200, 0.6),
       inset 0 0 25px rgba(186, 104, 200, 0.4);
       backdrop-filter: blur(16px);
       -webkit-backdrop-filter: blur(16px);
       padding: 16px;
       z-index: 10;
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       border-radius: 16px;
       overflow: hidden;
     }

     /* Intersection glow effects for smooth merging */
     .intersection-glow-left {
       position: absolute;
       top: 0;
       left: -20px;
       width: 40px;
       height: 100%;
       background: linear-gradient(90deg, 
         rgba(103, 58, 183, 0.3) 0%, 
         rgba(103, 58, 183, 0.1) 50%, 
         transparent 100%);
       border-radius: 20px 0 0 20px;
       z-index: -1;
     }

     .intersection-glow-right {
       position: absolute;
       top: 0;
       right: -20px;
       width: 40px;
       height: 100%;
       background: linear-gradient(90deg, 
         transparent 0%, 
         rgba(156, 39, 176, 0.1) 50%, 
         rgba(156, 39, 176, 0.3) 100%);
       border-radius: 0 20px 20px 0;
       z-index: -1;
     }

        .match-percentage {
        font-size: 35px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 12px;
        text-align: center;
        background: linear-gradient(135deg, #9c27b0, #673ab7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 20px rgba(156, 39, 176, 0.5);
      }

         .shared-interests {
       width: 100%;
       display: flex;
       flex-direction: column;
       gap: 12px;
       align-items: center;
     }

        .shared-interest-item {
        width: 100%;
        padding: 3px 0;
        background: transparent;
        border: none;
        border-radius: 0;
        font-size: 11px;
        color: #ffffff;
        text-align: center;
        box-shadow: none;
        transition: all 0.3s ease;
        text-shadow: 0 0 15px rgba(186, 104, 200, 0.6);
      }

         .shared-interest-item:hover {
       transform: translateY(-2px);
       text-shadow: 0 0 20px rgba(186, 104, 200, 0.8);
     }

    /* Loading States */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 20;
      border-radius: 32px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(156, 39, 176, 0.2);
      border-top: 3px solid #9c27b0;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
      box-shadow: 0 0 20px rgba(156, 39, 176, 0.4),
                inset 0 0 10px rgba(156, 39, 176, 0.2);
    }

    .loading-text {
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
      text-shadow: 0 0 15px rgba(156, 39, 176, 0.6);
      background: linear-gradient(135deg, #9c27b0, #673ab7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Error States */
    .error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 20;
      border-radius: 32px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .error-text {
      color: #ff1744;
      font-size: 16px;
      font-weight: 500;
      margin-top: 16px;
      background: rgba(255, 23, 68, 0.1);
      padding: 12px 24px;
      border-radius: 12px;
      border: 1px solid rgba(255, 23, 68, 0.3);
      text-shadow: 0 0 15px rgba(255, 23, 68, 0.6);
      box-shadow: 0 0 30px rgba(255, 23, 68, 0.2),
                inset 0 0 15px rgba(255, 23, 68, 0.1);
    }

    .error-icon {
      font-size: 32px;
      color: #ff1744;
      text-shadow: 0 0 20px rgba(255, 23, 68, 0.7);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }

    /* Animations */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

         /* Persistent Layout - Fixed Dimensions for All Screen Sizes */

     /* Accessibility Support */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        transform: none !important;
      }

      .profile-rectangle,
      .interest-item,
      .shared-interest-item {
        transform: none !important;
        box-shadow: none !important;
      }

      .spinner {
        animation: none !important;
      }
    }

    @media (prefers-contrast: high) {
      .profile-rectangle,
      .intersection-area,
      .interest-item,
      .shared-interest-item {
        border-width: 3px;
        background: #000000 !important;
      }

      .interest-item,
      .shared-interest-item {
        border-color: #ffffff !important;
        color: #ffffff !important;
      }

      .intersection-area {
        border-color: #ffffff !important;
      }

      .loading-overlay,
      .error-overlay {
        background: #000000 !important;
      }

      .loading-text,
      .error-text {
        color: #ffffff !important;
        background: #000000 !important;
        border-color: #ffffff !important;
      }
    }
    `
  ]
})
export class ProfileComparisonComponent implements OnInit, OnChanges, AfterViewInit {
  /** First user profile data */
  @Input({ required: true }) user1!: UserProfile;
  
  /** Second user profile data */
  @Input({ required: true }) user2!: UserProfile;
  
  /** Reference interests for similarity comparison */
  @Input() referenceInterests: string[] = [];
  
  /** Configuration for API integrations and features */
  @Input({ required: true }) config!: ProfileCompareConfig;
  
  /** Event emitted when user 1's "View Profile" button is clicked */
  @Output() viewProfile1 = new EventEmitter<boolean>();
  
  /** Event emitted when user 2's "View Profile" button is clicked */
  @Output() viewProfile2 = new EventEmitter<boolean>();

  /** Processed interests with similarity data for user 1 */
  user1Interests: InterestSimilarity[] = [];
  
  /** Processed interests with similarity data for user 2 */
  user2Interests: InterestSimilarity[] = [];
  
  /** Loading states */
  isLoadingSimilarity = false;
  isLoadingFaceAlignment = false;
  
  /** Error states */
  similarityError = false;
  faceAlignmentError = false;

  /** Image styles for face alignment */
  user1ImageStyle: { [key: string]: string } = {};
  user2ImageStyle: { [key: string]: string } = {};

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user1'] || changes['user2'] || changes['referenceInterests'] || changes['config']) {
      this.initializeComponent();
    }
  }

  /**
   * Initialize component with API calls and data processing
   */
  private initializeComponent(): void {
    if (!this.user1 || !this.user2 || !this.config) {
      return;
    }

    // Initialize interests without similarity data first
    this.user1Interests = this.user1.interests.map(interest => ({
      interest,
      score: 0,
      hasMatch: false
    }));

    this.user2Interests = this.user2.interests.map(interest => ({
      interest,
      score: 0,
      hasMatch: false
    }));

    this.cdr.markForCheck();

    // Check if API key is valid (not demo or placeholder)
    const hasValidApiKey = this.config.apiKey && 
                          this.config.apiKey !== 'demo-api-key' && 
                          this.config.apiKey !== 'YOUR_API_NINJAS_KEY_HERE' &&
                          this.config.apiKey.length > 10;

    // Process text similarity if enabled and API key is valid
    if (this.config.enableTextSimilarity && hasValidApiKey) {
      this.processTextSimilarity();
    } else if (this.config.enableTextSimilarity) {
      // Fallback: Use basic string matching when API is not available
      this.processBasicSimilarity();
    }

    // Process face alignment if enabled and API key is valid
    if (this.config.enableFaceDetection && hasValidApiKey) {
      this.processFaceAlignment();
    }
  }

  /**
   * Process text similarity for interests
   */
  private processTextSimilarity(): void {
    this.isLoadingSimilarity = true;
    this.similarityError = false;
    this.cdr.markForCheck();

    this.apiService.compareInterests(
      this.user1.interests,
      this.user2.interests,
      this.referenceInterests,
      this.config.apiKey
    ).subscribe({
      next: (result) => {
        this.user1Interests = result.user1;
        this.user2Interests = result.user2;
        this.isLoadingSimilarity = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Text similarity processing failed:', error);
        this.similarityError = true;
        this.isLoadingSimilarity = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Process basic similarity using string matching when API is not available
   */
  private processBasicSimilarity(): void {
    this.isLoadingSimilarity = true;
    this.cdr.markForCheck();

    // Simulate API delay
    setTimeout(() => {
      // Find exact matches between interests
      this.user1Interests.forEach(interest1 => {
        const matchingInterest = this.user2Interests.find(interest2 => 
          interest1.interest.toLowerCase() === interest2.interest.toLowerCase()
        );
        
        if (matchingInterest) {
          interest1.hasMatch = true;
          interest1.similarity = 1.0;
          interest1.score = 1.0;
          matchingInterest.hasMatch = true;
          matchingInterest.similarity = 1.0;
          matchingInterest.score = 1.0;
        }
      });

      // Find partial matches (words that contain similar terms)
      this.user1Interests.forEach(interest1 => {
        if (!interest1.hasMatch) {
          const words1 = interest1.interest.toLowerCase().split(/\s+/);
          
          this.user2Interests.forEach(interest2 => {
            if (!interest2.hasMatch) {
              const words2 = interest2.interest.toLowerCase().split(/\s+/);
              
              // Check for common words
              const commonWords = words1.filter(word => words2.includes(word));
              if (commonWords.length > 0) {
                const similarity = commonWords.length / Math.max(words1.length, words2.length);
                if (similarity > 0.3) { // Threshold for partial match
                  interest1.hasMatch = true;
                  interest1.similarity = similarity;
                  interest1.score = similarity;
                  interest2.hasMatch = true;
                  interest2.similarity = similarity;
                  interest2.score = similarity;
                }
              }
            }
          });
        }
      });

      this.isLoadingSimilarity = false;
      this.cdr.markForCheck();
    }, 1000);
  }

  /**
   * Process face alignment for profile images
   */
  private processFaceAlignment(): void {
    this.isLoadingFaceAlignment = true;
    this.faceAlignmentError = false;
    this.cdr.markForCheck();

    this.apiService.getFaceAlignmentStyles(
      this.user1.imageUrl,
      this.user2.imageUrl,
      this.config.apiKey
    ).subscribe({
      next: (styles) => {
        this.user1ImageStyle = styles.user1Style;
        this.user2ImageStyle = styles.user2Style;
        this.isLoadingFaceAlignment = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Face alignment processing failed:', error);
        this.faceAlignmentError = true;
        this.isLoadingFaceAlignment = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Get non-matching interests for a user
   * @param interests Array of interests to filter
   * @returns Array of non-matching interests
   */
  getNonMatchingInterests(interests: InterestSimilarity[]): InterestSimilarity[] {
    return interests.filter(interest => !interest.hasMatch);
  }

  /**
   * Get all shared interests between users for the intersection area
   * @returns Array of shared interest names
   */
  getSharedInterests(): string[] {
    const shared: string[] = [];
    
    this.user1Interests.forEach(interest1 => {
      if (interest1.hasMatch) {
        const matchingInterest = this.user2Interests.find(interest2 => 
          interest2.hasMatch && 
          interest1.interest.toLowerCase() === interest2.interest.toLowerCase()
        );
        
        if (matchingInterest && !shared.includes(interest1.interest)) {
          shared.push(interest1.interest);
        }
      }
    });
    
    // If no matches found from similarity analysis, find basic string matches
    if (shared.length === 0) {
      this.user1Interests.forEach(interest1 => {
        const matchingInterest = this.user2Interests.find(interest2 => 
          interest1.interest.toLowerCase() === interest2.interest.toLowerCase()
        );
        
        if (matchingInterest && !shared.includes(interest1.interest)) {
          shared.push(interest1.interest);
        }
      });
    }
    
    return shared.slice(0, 3); // Limit to top 3 for display
  }

  /**
   * Handles click event for viewing profile 1
   */
  onViewProfile1(): void {
    console.log('View Profile 1 clicked!');
    this.viewProfile1.emit(true);
  }

  /**
   * Handles click event for viewing profile 2
   */
  onViewProfile2(): void {
    console.log('View Profile 2 clicked!');
    this.viewProfile2.emit(true);
  }

  /**
   * Calculates the compatibility percentage for a given interest
   * @param interest The interest to calculate compatibility for
   * @returns A number between 0 and 100 representing compatibility
   */
  getInterestCompatibility(interest: InterestSimilarity): number {
    return interest.similarity ? Math.round(interest.similarity * 100) : 0;
  }

  /**
   * Calculates the overall match percentage between the two profiles
   * @returns A number between 0 and 100 representing overall match
   */
  getMatchPercentage(): number {
    if (!this.user1Interests.length || !this.user2Interests.length) {
      return 0;
    }

    const sharedInterests = this.getSharedInterests();
    const totalInterests = new Set([
      ...this.user1Interests.map(i => i.interest),
      ...this.user2Interests.map(i => i.interest)
    ]).size;

    return Math.round((sharedInterests.length / totalInterests) * 100);
  }
}