import type { AutofillSettings, UserProfile } from "../types";


// Constants
const STORAGE_KEYS = {
  PROFILES: 'autofill_profiles',
  SETTINGS: 'autofill_settings',
  TEMPLATES: 'autofill_templates'
} as const;

// Default settings
const DEFAULT_SETTINGS: AutofillSettings = {
  autoDetectFields: true,
  confirmBeforeFill: true,
  saveFormTemplates: true,
  encryptData: false
};

/**
 * Local Storage operations
 * Tại sao sử dụng localStorage:
 * - Dữ liệu persist giữa các sessions
 * - Không cần server, hoạt động offline
 * - Đơn giản cho phase đầu
 */
export class StorageService {
  
  // Profiles management
  static getProfiles(): UserProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading profiles:', error);
      return [];
    }
  }

  static saveProfile(profile: UserProfile): void {
    try {
      const profiles = this.getProfiles();
      const existingIndex = profiles.findIndex(p => p.id === profile.id);
      
      if (existingIndex >= 0) {
        profiles[existingIndex] = profile;
      } else {
        profiles.push(profile);
      }
      
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving profile:', error);
      throw new Error('Failed to save profile');
    }
  }

  static deleteProfile(profileId: string): void {
    try {
      const profiles = this.getProfiles().filter(p => p.id !== profileId);
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw new Error('Failed to delete profile');
    }
  }

  static getProfile(profileId: string): UserProfile | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === profileId) || null;
  }

  // Settings management
  static getSettings(): AutofillSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AutofillSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  // Utility functions
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static exportData(): string {
    const data = {
      profiles: this.getProfiles(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.profiles) {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(data.profiles));
      }
      
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

/**
 * Utility để tạo ID unique
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Validation utilities
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};