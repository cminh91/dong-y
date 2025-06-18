export type UserRole = "CUSTOMER" | "STAFF" | "COLLABORATOR" | "AGENT";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: UserRole;
  isActive: boolean;
  idCardNumber: string;
  bankName?: string;
  accountNumber?: string;
  branch?: string;
  cardNumber?: string;
  accountName?: string;
  frontIdImage?: string;
  backIdImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
} 