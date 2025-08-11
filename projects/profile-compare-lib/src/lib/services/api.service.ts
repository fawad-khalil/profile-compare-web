import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { FaceDetection, TextSimilarityResponse, InterestSimilarity } from '../interfaces/user-profile.interface';

/**
 * Service for handling API integrations with API Ninjas
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly TEXT_SIMILARITY_URL = 'https://api.api-ninjas.com/v1/textsimilarity';
  private readonly FACE_DETECT_URL = 'https://api.api-ninjas.com/v1/facedetect';
  
  constructor(private http: HttpClient) {}

  /**
   * Get similarity score between two text strings
   * @param text1 First text to compare
   * @param text2 Second text to compare
   * @param apiKey API Ninjas API key
   * @returns Observable with similarity score
   */
  getTextSimilarity(text1: string, text2: string, apiKey: string): Observable<number> {
    const headers = new HttpHeaders({
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    });

    const body = {
      text_1: text1,
      text_2: text2
    };

    return this.http.post<TextSimilarityResponse>(this.TEXT_SIMILARITY_URL, body, { headers })
      .pipe(
        map(response => response.similarity),
        catchError(error => {
          console.warn('Text similarity API failed:', error);
          return of(0); // Return 0 similarity on error
        })
      );
  }

  /**
   * Compare interests between two users and calculate similarity scores
   * @param userInterests1 First user's interests
   * @param userInterests2 Second user's interests
   * @param referenceInterests Reference interests for comparison
   * @param apiKey API Ninjas API key
   * @returns Observable with processed similarity data
   */
  compareInterests(
    userInterests1: string[], 
    userInterests2: string[], 
    referenceInterests: string[], 
    apiKey: string
  ): Observable<{ user1: InterestSimilarity[], user2: InterestSimilarity[] }> {
    
    const allComparisons: Observable<any>[] = [];
    
    // Create comparison matrix
    userInterests1.forEach((interest1, i) => {
      userInterests2.forEach((interest2, j) => {
        allComparisons.push(
          this.getTextSimilarity(interest1, interest2, apiKey).pipe(
            map(similarity => ({ 
              user1Index: i, 
              user2Index: j, 
              similarity,
              interest1,
              interest2
            }))
          )
        );
      });
    });

    // Also compare with reference interests
    userInterests1.forEach((interest, i) => {
      referenceInterests.forEach(refInterest => {
        allComparisons.push(
          this.getTextSimilarity(interest, refInterest, apiKey).pipe(
            map(similarity => ({ 
              user1Index: i, 
              refInterest, 
              similarity,
              interest,
              type: 'reference'
            }))
          )
        );
      });
    });

    userInterests2.forEach((interest, i) => {
      referenceInterests.forEach(refInterest => {
        allComparisons.push(
          this.getTextSimilarity(interest, refInterest, apiKey).pipe(
            map(similarity => ({ 
              user2Index: i, 
              refInterest, 
              similarity,
              interest,
              type: 'reference'
            }))
          )
        );
      });
    });

    // Process all comparisons and return structured data
    return new Observable(observer => {
      Promise.all(allComparisons.map(obs => obs.toPromise())).then(results => {
        const user1Similarities: InterestSimilarity[] = userInterests1.map((interest, index) => ({
          interest,
          score: 0,
          hasMatch: false
        }));

        const user2Similarities: InterestSimilarity[] = userInterests2.map((interest, index) => ({
          interest,
          score: 0,
          hasMatch: false
        }));

        // Process results to find best matches
        results.forEach(result => {
          if (result.user1Index !== undefined && result.user2Index !== undefined) {
            // User-to-user comparison
            if (result.similarity > 0.7) { // Threshold for match
              user1Similarities[result.user1Index].hasMatch = true;
              user1Similarities[result.user1Index].matchIndex = result.user2Index;
              user1Similarities[result.user1Index].score = Math.max(
                user1Similarities[result.user1Index].score, 
                result.similarity
              );

              user2Similarities[result.user2Index].hasMatch = true;
              user2Similarities[result.user2Index].matchIndex = result.user1Index;
              user2Similarities[result.user2Index].score = Math.max(
                user2Similarities[result.user2Index].score, 
                result.similarity
              );
            }
          } else if (result.type === 'reference') {
            // Reference comparison
            if (result.user1Index !== undefined) {
              user1Similarities[result.user1Index].score = Math.max(
                user1Similarities[result.user1Index].score, 
                result.similarity
              );
            }
            if (result.user2Index !== undefined) {
              user2Similarities[result.user2Index].score = Math.max(
                user2Similarities[result.user2Index].score, 
                result.similarity
              );
            }
          }
        });

        // Sort by similarity score (highest first)
        user1Similarities.sort((a, b) => b.score - a.score);
        user2Similarities.sort((a, b) => b.score - a.score);

        observer.next({ user1: user1Similarities, user2: user2Similarities });
        observer.complete();
      }).catch(error => {
        console.warn('Interest comparison failed:', error);
        // Return original data without similarity scores on error
        const fallbackUser1 = userInterests1.map(interest => ({
          interest,
          score: 0,
          hasMatch: false
        }));
        const fallbackUser2 = userInterests2.map(interest => ({
          interest,
          score: 0,
          hasMatch: false
        }));
        
        observer.next({ user1: fallbackUser1, user2: fallbackUser2 });
        observer.complete();
      });
    });
  }

  /**
   * Detect faces in an image
   * @param imageUrl URL of the image to analyze
   * @param apiKey API Ninjas API key
   * @returns Observable with face detection results
   */
  detectFaces(imageUrl: string, apiKey: string): Observable<FaceDetection[]> {
    const headers = new HttpHeaders({
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    });

    const body = {
      image_url: imageUrl
    };

    return this.http.post<FaceDetection[]>(this.FACE_DETECT_URL, body, { headers })
      .pipe(
        catchError(error => {
          console.warn('Face detection API failed:', error);
          return of([]); // Return empty array on error
        })
      );
  }

  /**
   * Get face alignment styles for profile images
   * @param imageUrl1 First user's image URL
   * @param imageUrl2 Second user's image URL
   * @param apiKey API Ninjas API key
   * @returns Observable with CSS transform styles for alignment
   */
  getFaceAlignmentStyles(
    imageUrl1: string, 
    imageUrl2: string, 
    apiKey: string
  ): Observable<{ user1Style: any, user2Style: any }> {
    
    const face1$ = this.detectFaces(imageUrl1, apiKey);
    const face2$ = this.detectFaces(imageUrl2, apiKey);

    return new Observable(observer => {
      Promise.all([face1$.toPromise(), face2$.toPromise()]).then(([faces1, faces2]) => {
        let user1Style = {};
        let user2Style = {};

        if (faces1 && faces1.length > 0 && faces2 && faces2.length > 0) {
          const face1 = faces1[0]; // Use first detected face
          const face2 = faces2[0];

          // Calculate eye-level alignment
          const face1EyeY = face1.y + (face1.height * 0.3); // Approximate eye position
          const face2EyeY = face2.y + (face2.height * 0.3);

          const offsetDiff = face1EyeY - face2EyeY;

          if (Math.abs(offsetDiff) > 5) { // Only apply if significant difference
            if (offsetDiff > 0) {
              // Face1 is lower, move it up
              user1Style = { transform: `translateY(-${offsetDiff}px)` };
            } else {
              // Face2 is lower, move it up
              user2Style = { transform: `translateY(${Math.abs(offsetDiff)}px)` };
            }
          }
        }

        observer.next({ user1Style, user2Style });
        observer.complete();
      }).catch(error => {
        console.warn('Face alignment calculation failed:', error);
        observer.next({ user1Style: {}, user2Style: {} });
        observer.complete();
      });
    });
  }
}
