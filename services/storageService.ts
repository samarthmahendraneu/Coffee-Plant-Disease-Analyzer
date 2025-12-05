import { HistoryRecord, AnalysisResult, GeoLocation } from "../types";

const STORAGE_KEY = 'coffeeai_history';

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Declare global exifr
declare var exifr: any;

export interface ExifMetadata {
  location?: GeoLocation;
  timestamp?: number;
}

export const getHistory = (): HistoryRecord[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  return JSON.parse(stored);
};

export const saveRecord = (result: AnalysisResult, location: GeoLocation, imageBase64: string, dateOverride?: number) => {
  const history = getHistory();
  const newRecord: HistoryRecord = {
    ...result,
    id: generateId(),
    // Use EXIF timestamp if provided, otherwise current time (Live capture)
    timestamp: dateOverride || Date.now(),
    location,
    thumbnail: imageBase64 // In prod, compress this or store in IndexedDB
  };
  
  // Keep last 50 records to prevent localStorage overflow
  const updatedHistory = [newRecord, ...history].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return newRecord;
};

export const getExifMetadata = async (file: File): Promise<ExifMetadata> => {
  // Check if library is loaded
  if (typeof exifr === 'undefined') {
    console.warn("exifr library not loaded.");
    return {};
  }

  try {
    // exifr.parse returns a promise with all extracted tags.
    // We explicitly request GPS and other tags to ensure robust parsing for PNG/JPEG.
    const output = await exifr.parse(file, { 
      gps: true, 
      tiff: true, 
      ifd0: true, 
      exif: true 
    });

    if (!output) {
      console.log("No EXIF data found in image.");
      return {};
    }
    
    // Debug log to check raw library output
    console.log("exifr raw output:", output);

    const metadata: ExifMetadata = {};

    // 1. Extract Location
    // exifr automatically converts DMS to decimal (latitude, longitude)
    // We check against null/undefined specifically because 0 is a valid coordinate.
    if (output.latitude != null && output.longitude != null && !isNaN(output.latitude) && !isNaN(output.longitude)) {
       metadata.location = {
         lat: output.latitude,
         lng: output.longitude,
         regionName: "Image Metadata"
       };
    }

    // 2. Extract Timestamp
    // exifr tries to parse DateTimeOriginal into a JS Date object
    let dateObj: Date | undefined;

    if (output.DateTimeOriginal) {
      dateObj = output.DateTimeOriginal;
    } else if (output.CreateDate) {
      dateObj = output.CreateDate;
    } else if (output.DateTime) {
      dateObj = output.DateTime;
    }

    // Ensure it's a valid date object
    if (dateObj && dateObj instanceof Date && !isNaN(dateObj.getTime())) {
      metadata.timestamp = dateObj.getTime();
    }

    return metadata;

  } catch (e) {
    console.warn("Error parsing metadata with exifr:", e);
    return {};
  }
};

export const getCurrentLocation = (): Promise<GeoLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          regionName: "Detected Location"
        });
      },
      (error) => {
        console.warn("Location access denied, defaulting to Chikmagalur");
        // Default to Chikmagalur Center if denied
        resolve({
          lat: 13.3153,
          lng: 75.7754,
          regionName: "Chikmagalur (Default)"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};