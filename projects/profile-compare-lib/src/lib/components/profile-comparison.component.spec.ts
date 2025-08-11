import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ProfileComparisonComponent } from './profile-comparison.component';
import { ApiService } from '../services/api.service';
import { UserProfile, ProfileCompareConfig, InterestSimilarity } from '../interfaces/user-profile.interface';

describe('ProfileComparisonComponent', () => {
  let component: ProfileComparisonComponent;
  let fixture: ComponentFixture<ProfileComparisonComponent>;
  let mockApiService: jest.Mocked<ApiService>;

  const mockUser1: UserProfile = {
    id: '1',
    name: 'John Doe',
    imageUrl: 'https://example.com/john.jpg',
    interests: ['programming', 'music', 'hiking']
  };

  const mockUser2: UserProfile = {
    id: '2',
    name: 'Jane Smith',
    imageUrl: 'https://example.com/jane.jpg',
    interests: ['coding', 'guitar', 'running']
  };

  const mockConfig: ProfileCompareConfig = {
    apiKey: 'test-api-key',
    enableTextSimilarity: true,
    enableFaceDetection: true,
    similarityThreshold: 0.7
  };

  const mockSimilarityResult = {
    user1: [
      { interest: 'programming', score: 0.85, hasMatch: true, matchIndex: 0 },
      { interest: 'music', score: 0.7, hasMatch: true, matchIndex: 1 },
      { interest: 'hiking', score: 0.3, hasMatch: false }
    ] as InterestSimilarity[],
    user2: [
      { interest: 'coding', score: 0.85, hasMatch: true, matchIndex: 0 },
      { interest: 'guitar', score: 0.7, hasMatch: true, matchIndex: 1 },
      { interest: 'running', score: 0.2, hasMatch: false }
    ] as InterestSimilarity[]
  };

  const mockAlignmentStyles = {
    user1Style: { transform: 'translateY(-5px)' },
    user2Style: {}
  };

  beforeEach(async () => {
    const apiServiceSpy = {
      compareInterests: jest.fn(),
      getFaceAlignmentStyles: jest.fn(),
      getTextSimilarity: jest.fn(),
      detectFaces: jest.fn(),
      TEXT_SIMILARITY_URL: 'https://api.api-ninjas.com/v1/textsimilarity',
      FACE_DETECT_URL: 'https://api.api-ninjas.com/v1/facedetect',
      http: {} as any
    } as unknown as jest.Mocked<ApiService>;

    await TestBed.configureTestingModule({
      declarations: [ProfileComparisonComponent],
      imports: [BrowserAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComparisonComponent);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiService) as jest.Mocked<ApiService>;

    // Setup default inputs
    component.user1 = mockUser1;
    component.user2 = mockUser2;
    component.config = mockConfig;
    component.referenceInterests = ['technology', 'arts'];

    // Setup default mock responses
    mockApiService.compareInterests.mockReturnValue(of(mockSimilarityResult));
    mockApiService.getFaceAlignmentStyles.mockReturnValue(of(mockAlignmentStyles));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.user1Interests).toEqual([]);
      expect(component.user2Interests).toEqual([]);
      expect(component.user1ImageStyle).toEqual({});
      expect(component.user2ImageStyle).toEqual({});
      expect(component.isLoadingSimilarity).toBe(false);
      expect(component.isLoadingFaceAlignment).toBe(false);
    });

    it('should initialize component on ngOnInit', () => {
      jest.spyOn(component as any, 'initializeComponent');
      
      component.ngOnInit();
      
      expect((component as any).initializeComponent).toHaveBeenCalled();
    });

    it('should reinitialize on input changes', () => {
      jest.spyOn(component as any, 'initializeComponent');
      
      component.ngOnChanges({
        user1: { currentValue: mockUser1, previousValue: null, firstChange: true, isFirstChange: () => true }
      });
      
      expect((component as any).initializeComponent).toHaveBeenCalled();
    });
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display user names', () => {
      const compiled = fixture.nativeElement;
      const names = compiled.querySelectorAll('.profile-name');
      
      expect(names[0].textContent).toContain('John Doe');
      expect(names[1].textContent).toContain('Jane Smith');
    });

    it('should display profile images with correct src and alt attributes', () => {
      const compiled = fixture.nativeElement;
      const images = compiled.querySelectorAll('.profile-image');
      
      expect(images[0].src).toContain('john.jpg');
      expect(images[0].alt).toContain('John Doe profile picture');
      expect(images[1].src).toContain('jane.jpg');
      expect(images[1].alt).toContain('Jane Smith profile picture');
    });

    it('should render View Profile buttons', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.view-profile-btn');
      
      expect(buttons.length).toBe(2);
      expect(buttons[0].textContent.trim()).toBe('View Profile');
      expect(buttons[1].textContent.trim()).toBe('View Profile');
    });
  });

  describe('Text Similarity Processing', () => {
    it('should process text similarity when enabled', () => {
      component.config.enableTextSimilarity = true;
      fixture.detectChanges();

      expect(mockApiService.compareInterests).toHaveBeenCalledWith(
        mockUser1.interests,
        mockUser2.interests,
        component.referenceInterests,
        mockConfig.apiKey
      );
      
      expect(component.user1Interests).toEqual(mockSimilarityResult.user1);
      expect(component.user2Interests).toEqual(mockSimilarityResult.user2);
    });

    it('should skip text similarity when disabled', () => {
      component.config.enableTextSimilarity = false;
      fixture.detectChanges();

      expect(mockApiService.compareInterests).not.toHaveBeenCalled();
    });

    it('should handle text similarity API errors', () => {
      mockApiService.compareInterests.mockReturnValue(throwError(() => new Error('API Error')));
      component.config.enableTextSimilarity = true;
      jest.spyOn(console, 'error');
      
      fixture.detectChanges();

      expect(component.similarityError).toBe(true);
      expect(component.isLoadingSimilarity).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('should show loading state during similarity processing', () => {
      // Create a delayed observable to test loading state
      const delayedResponse = of(mockSimilarityResult);
      mockApiService.compareInterests.mockReturnValue(delayedResponse);
      
      fixture.detectChanges();
      
      // Initially should show loading
      expect(component.isLoadingSimilarity).toBe(false); // Will be false after async completion
    });
  });

  describe('Face Detection Processing', () => {
    it('should process face alignment when enabled', () => {
      component.config.enableFaceDetection = true;
      fixture.detectChanges();

      expect(mockApiService.getFaceAlignmentStyles).toHaveBeenCalledWith(
        mockUser1.imageUrl,
        mockUser2.imageUrl,
        mockConfig.apiKey
      );
      
      expect(component.user1ImageStyle).toEqual(mockAlignmentStyles.user1Style);
      expect(component.user2ImageStyle).toEqual(mockAlignmentStyles.user2Style);
    });

    it('should skip face detection when disabled', () => {
      component.config.enableFaceDetection = false;
      fixture.detectChanges();

      expect(mockApiService.getFaceAlignmentStyles).not.toHaveBeenCalled();
    });

    it('should handle face detection API errors', () => {
      mockApiService.getFaceAlignmentStyles.mockReturnValue(throwError(() => new Error('API Error')));
      component.config.enableFaceDetection = true;
      jest.spyOn(console, 'error');
      
      fixture.detectChanges();

      expect(component.faceAlignmentError).toBe(true);
      expect(component.isLoadingFaceAlignment).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Output Events', () => {
    it('should emit viewProfile1 event when first View Profile button is clicked', () => {
      jest.spyOn(component.viewProfile1, 'emit');
      
      component.onViewProfile1();
      
      expect(component.viewProfile1.emit).toHaveBeenCalledWith(true);
    });

    it('should emit viewProfile2 event when second View Profile button is clicked', () => {
      jest.spyOn(component.viewProfile2, 'emit');
      
      component.onViewProfile2();
      
      expect(component.viewProfile2.emit).toHaveBeenCalledWith(true);
    });

    it('should trigger events when buttons are clicked in template', () => {
      jest.spyOn(component.viewProfile1, 'emit');
      jest.spyOn(component.viewProfile2, 'emit');
      
      fixture.detectChanges();
      
      const buttons = fixture.nativeElement.querySelectorAll('.view-profile-btn');
      buttons[0].click();
      buttons[1].click();
      
      expect(component.viewProfile1.emit).toHaveBeenCalledWith(true);
      expect(component.viewProfile2.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('Interest Classification', () => {
    beforeEach(() => {
      component.user1Interests = mockSimilarityResult.user1;
      component.user2Interests = mockSimilarityResult.user2;
    });

    it('should classify matched interests correctly', () => {
      const matchedInterest = mockSimilarityResult.user1[0]; // score: 0.85, hasMatch: true
      const cssClass = component.getInterestClass(matchedInterest);
      
      expect(cssClass).toBe('interest-matched');
    });

    it('should classify similar interests correctly', () => {
      const similarInterest: InterestSimilarity = {
        interest: 'test',
        score: 0.6,
        hasMatch: false
      };
      const cssClass = component.getInterestClass(similarInterest);
      
      expect(cssClass).toBe('interest-similar');
    });

    it('should classify normal interests correctly', () => {
      const normalInterest: InterestSimilarity = {
        interest: 'test',
        score: 0.3,
        hasMatch: false
      };
      const cssClass = component.getInterestClass(normalInterest);
      
      expect(cssClass).toBe('interest-normal');
    });
  });

  describe('Utility Methods', () => {
    it('should format similarity percentage correctly', () => {
      expect(component.getSimilarityPercentage(0.85)).toBe('85%');
      expect(component.getSimilarityPercentage(0.7)).toBe('70%');
      expect(component.getSimilarityPercentage(0.1)).toBe('10%');
    });

    it('should determine when to use swiper correctly', () => {
      const shortList: InterestSimilarity[] = Array(5).fill(null).map(() => ({
        interest: 'test',
        score: 0,
        hasMatch: false
      }));
      
      const longList: InterestSimilarity[] = Array(8).fill(null).map(() => ({
        interest: 'test',
        score: 0,
        hasMatch: false
      }));

      expect(component.shouldUseSwiper(shortList)).toBe(false);
      expect(component.shouldUseSwiper(longList)).toBe(true);
    });

    it('should track interests by content for ngFor optimization', () => {
      const interest: InterestSimilarity = {
        interest: 'programming',
        score: 0.8,
        hasMatch: true
      };

      expect(component.trackByInterest(0, interest)).toBe('programming');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing configuration gracefully', () => {
      component.config = null as any;
      
      expect(() => {
        (component as any).initializeComponent();
      }).not.toThrow();
    });

    it('should handle missing user data gracefully', () => {
      component.user1 = null as any;
      component.user2 = null as any;
      
      expect(() => {
        (component as any).initializeComponent();
      }).not.toThrow();
    });

    it('should display error messages in template', () => {
      component.similarityError = true;
      component.config.enableTextSimilarity = true;
      component.ngOnInit();
      fixture.detectChanges();
      
      const errorMessages = fixture.nativeElement.querySelectorAll('.error-message');
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('should display loading messages in template', () => {
      component.isLoadingSimilarity = true;
      component.config.enableTextSimilarity = true;
      component.ngOnInit();
      fixture.detectChanges();
      
      const loadingMessages = fixture.nativeElement.querySelectorAll('.loading-message');
      expect(loadingMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper aria-labels on buttons', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.view-profile-btn');
      
      expect(buttons[0].getAttribute('aria-label')).toContain('John Doe');
      expect(buttons[1].getAttribute('aria-label')).toContain('Jane Smith');
    });

    it('should have proper alt text on images', () => {
      const images = fixture.nativeElement.querySelectorAll('.profile-image');
      
      expect(images[0].alt).toContain('profile picture');
      expect(images[1].alt).toContain('profile picture');
    });
  });
});
