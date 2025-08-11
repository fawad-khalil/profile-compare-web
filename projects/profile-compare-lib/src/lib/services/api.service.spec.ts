import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { FaceDetection, TextSimilarityResponse } from '../interfaces/user-profile.interface';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  const mockApiKey = 'test-api-key';
  const textSimilarityUrl = 'https://api.api-ninjas.com/v1/textsimilarity';
  const faceDetectUrl = 'https://api.api-ninjas.com/v1/facedetect';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTextSimilarity', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should return similarity score for valid texts', () => {
      const text1 = 'programming';
      const text2 = 'coding';
      const expectedResponse: TextSimilarityResponse = { similarity: 0.85 };

      service.getTextSimilarity(text1, text2, mockApiKey).subscribe(similarity => {
        expect(similarity).toBe(0.85);
      });

      const req = httpMock.expectOne(textSimilarityUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('X-Api-Key')).toBe(mockApiKey);
      expect(req.request.body).toEqual({
        text_1: text1,
        text_2: text2
      });

      req.flush(expectedResponse);
    });

    it('should return 0 similarity on API error', () => {
      const text1 = 'test1';
      const text2 = 'test2';

      service.getTextSimilarity(text1, text2, mockApiKey).subscribe(similarity => {
        expect(similarity).toBe(0);
      });

      const req = httpMock.expectOne(textSimilarityUrl);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle empty texts', () => {
      const text1 = '';
      const text2 = '';
      const expectedResponse: TextSimilarityResponse = { similarity: 0 };

      service.getTextSimilarity(text1, text2, mockApiKey).subscribe(similarity => {
        expect(similarity).toBe(0);
      });

      const req = httpMock.expectOne(textSimilarityUrl);
      req.flush(expectedResponse);
    });
  });

  describe('compareInterests', () => {
    it('should process interest comparisons and return structured data', (done) => {
      const user1Interests = ['programming', 'music'];
      const user2Interests = ['coding', 'guitar'];
      const referenceInterests = ['technology', 'arts'];

      // Mock multiple API calls
      const mockSimilarityResponses = [
        { similarity: 0.85 }, // programming vs coding
        { similarity: 0.2 },  // programming vs guitar
        { similarity: 0.3 },  // music vs coding
        { similarity: 0.7 },  // music vs guitar
        { similarity: 0.8 },  // programming vs technology
        { similarity: 0.1 },  // programming vs arts
        { similarity: 0.2 },  // music vs technology
        { similarity: 0.9 },  // music vs arts
        { similarity: 0.6 },  // coding vs technology
        { similarity: 0.1 },  // coding vs arts
        { similarity: 0.15 }, // guitar vs technology
        { similarity: 0.8 }   // guitar vs arts
      ];

      service.compareInterests(user1Interests, user2Interests, referenceInterests, mockApiKey)
        .subscribe(result => {
          expect(result).toBeDefined();
          expect(result.user1.length).toBe(2);
          expect(result.user2.length).toBe(2);
          
          // Check that interests are sorted by score
          expect(result.user1[0].score).toBeGreaterThanOrEqual(result.user1[1].score);
          expect(result.user2[0].score).toBeGreaterThanOrEqual(result.user2[1].score);
          
          // Check that matches are detected
          const hasMatches = result.user1.some(i => i.hasMatch) || result.user2.some(i => i.hasMatch);
          expect(hasMatches).toBeTruthy();
          
          done();
        });

      // Handle all the HTTP requests
      const totalRequests = 12; // 4 user-to-user + 8 reference comparisons

      // Handle all requests synchronously
      const reqs = httpMock.match(textSimilarityUrl);
      expect(reqs.length).toBe(totalRequests);
      reqs.forEach((req, i) => {
        req.flush(mockSimilarityResponses[i]);
      });
    });

    it('should handle API errors gracefully and return fallback data', (done) => {
      const user1Interests = ['test1'];
      const user2Interests = ['test2'];
      const referenceInterests: string[] = [];

      service.compareInterests(user1Interests, user2Interests, referenceInterests, mockApiKey)
        .subscribe(result => {
          expect(result).toBeDefined();
          expect(result.user1.length).toBe(1);
          expect(result.user2.length).toBe(1);
          expect(result.user1[0].score).toBe(0);
          expect(result.user2[0].score).toBe(0);
          expect(result.user1[0].hasMatch).toBe(false);
          expect(result.user2[0].hasMatch).toBe(false);
          done();
        });

      // Simulate API error
      const req = httpMock.expectOne(textSimilarityUrl);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('detectFaces', () => {
    it('should return face detection results', () => {
      const imageUrl = 'https://example.com/image.jpg';
      const expectedFaces: FaceDetection[] = [
        { x: 100, y: 50, width: 80, height: 100, confidence: 0.95 }
      ];

      service.detectFaces(imageUrl, mockApiKey).subscribe(faces => {
        expect(faces).toEqual(expectedFaces);
      });

      const req = httpMock.expectOne(faceDetectUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('X-Api-Key')).toBe(mockApiKey);
      expect(req.request.body).toEqual({
        image_url: imageUrl
      });

      req.flush(expectedFaces);
    });

    it('should return empty array on API error', () => {
      const imageUrl = 'https://example.com/image.jpg';

      service.detectFaces(imageUrl, mockApiKey).subscribe(faces => {
        expect(faces).toEqual([]);
      });

      const req = httpMock.expectOne(faceDetectUrl);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getFaceAlignmentStyles', () => {
    it('should calculate alignment styles for face positioning', (done) => {
      const imageUrl1 = 'https://example.com/image1.jpg';
      const imageUrl2 = 'https://example.com/image2.jpg';
      
      const faces1: FaceDetection[] = [
        { x: 100, y: 60, width: 80, height: 100, confidence: 0.95 }
      ];
      const faces2: FaceDetection[] = [
        { x: 120, y: 40, width: 75, height: 95, confidence: 0.90 }
      ];

      service.getFaceAlignmentStyles(imageUrl1, imageUrl2, mockApiKey)
        .subscribe(styles => {
          expect(styles).toBeDefined();
          expect(styles.user1Style).toBeDefined();
          expect(styles.user2Style).toBeDefined();
          done();
        });

      // Handle face detection requests one at a time
      const reqs = httpMock.match(faceDetectUrl);
      expect(reqs.length).toBe(2);

      // First request
      expect(reqs[0].request.body.image_url).toBe(imageUrl1);
      reqs[0].flush(faces1);

      // Second request
      expect(reqs[1].request.body.image_url).toBe(imageUrl2);
      reqs[1].flush(faces2);
    });

    it('should return empty styles when no faces detected', (done) => {
      const imageUrl1 = 'https://example.com/image1.jpg';
      const imageUrl2 = 'https://example.com/image2.jpg';

      service.getFaceAlignmentStyles(imageUrl1, imageUrl2, mockApiKey)
        .subscribe(styles => {
          expect(styles.user1Style).toEqual({});
          expect(styles.user2Style).toEqual({});
          done();
        });

      const reqs = httpMock.match(faceDetectUrl);
      expect(reqs.length).toBe(2);
      reqs[0].flush([]);
      reqs[1].flush([]);
    });

    it('should handle API errors gracefully', (done) => {
      const imageUrl1 = 'https://example.com/image1.jpg';
      const imageUrl2 = 'https://example.com/image2.jpg';

      service.getFaceAlignmentStyles(imageUrl1, imageUrl2, mockApiKey)
        .subscribe(styles => {
          expect(styles.user1Style).toEqual({});
          expect(styles.user2Style).toEqual({});
          done();
        });

      const reqs = httpMock.match(faceDetectUrl);
      expect(reqs.length).toBe(2);
      reqs[0].error(new ErrorEvent('Network error'));
      reqs[1].error(new ErrorEvent('Network error'));
    });
  });
});
