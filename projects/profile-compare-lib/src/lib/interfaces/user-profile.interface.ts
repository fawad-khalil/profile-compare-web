/**
 * Interface representing a user profile for comparison
 */
export interface UserProfile {
  /** Unique identifier for the user */
  id: string;
  
  /** Display name of the user */
  name: string;
  
  /** URL to the user's profile image */
  imageUrl: string;
  
  /** List of user's interests/hobbies */
  interests: string[];
}

/**
 * Interface for similarity score between interests
 */
export interface InterestSimilarity {
  /** The interest text */
  interest: string;
  
  /** Similarity score (0-1) */
  score: number;
  
  /** Whether this interest has a match with the other profile */
  hasMatch: boolean;
  
  /** Index of the matching interest in the other profile, if any */
  matchIndex?: number;

  /** Similarity score from API (0-1) */
  similarity?: number;
}

/**
 * Interface for face detection API response
 */
export interface FaceDetection {
  /** X coordinate of the face bounding box */
  x: number;
  
  /** Y coordinate of the face bounding box */
  y: number;
  
  /** Width of the face bounding box */
  width: number;
  
  /** Height of the face bounding box */
  height: number;
  
  /** Confidence score of the detection */
  confidence: number;
}

/**
 * Interface for text similarity API response
 */
export interface TextSimilarityResponse {
  /** Similarity score between 0 and 1 */
  similarity: number;
}

/**
 * Configuration interface for the profile comparison component
 */
export interface ProfileCompareConfig {
  /** API key for API Ninjas services */
  apiKey: string;
  
  /** Enable face detection alignment */
  enableFaceDetection?: boolean;
  
  /** Enable text similarity sorting */
  enableTextSimilarity?: boolean;
  
  /** Similarity threshold for highlighting matches */
  similarityThreshold?: number;
}
