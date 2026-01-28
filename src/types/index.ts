// Định nghĩa các types cơ bản cho autofill data

export interface UserProfile {
  id: string;
  name: string;
  data: FormData;
  createdAt: Date;
  lastUsed: Date;
}

export interface FormData {
  // Thông tin cá nhân cơ bản
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Địa chỉ
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Thông tin công việc
  company: string;
  jobTitle: string;
  workEmail: string;
  workPhone: string;
  
  // Thông tin khác
  dateOfBirth: string;
  gender: string;
  website: string;
  
  // Custom fields cho flexibility
  customFields: { [key: string]: string };
}

export interface AutofillSettings {
  autoDetectFields: boolean;
  confirmBeforeFill: boolean;
  saveFormTemplates: boolean;
  encryptData: boolean;
}

// Interface cho các loại field thường gặp
export interface FieldMapping {
  selector: string;
  dataKey: keyof FormData | string;
  fieldType: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'radio' | 'checkbox';
  confidence: number; // Độ tin cậy của việc mapping (0-1)
}

// Interface cho Google Forms specific
export interface GoogleFormField {
  element: HTMLElement;
  type: string;
  label: string;
  required: boolean;
  options?: string[]; // Cho select, radio, checkbox
}

export interface FormTemplate {
  id: string;
  name: string;
  url: string;
  fieldMappings: FieldMapping[];
  lastUsed: Date;
}