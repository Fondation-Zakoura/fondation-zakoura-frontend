// src/types/common.ts or src/types/users.ts (create if it doesn't exist)

export interface User {
  id: number;
  name: string;
  email: string;
  // Add other properties if they exist and are relevant
}

// Define the specific API response shape for users
export interface UserApiResponse {
  users: User[]; // The array of users is under the 'users' key
  meta?: { // Assuming you have pagination or other metadata
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
  };
  message?: string; // If your API sends a success message
  // Add any other top-level properties your user API response might have
}