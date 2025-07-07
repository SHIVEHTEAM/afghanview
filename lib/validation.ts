// Input validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      field: "email",
      message: "Please enter a valid email address",
    };
  }
  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password || password.length < 6) {
    return {
      field: "password",
      message: "Password must be at least 6 characters long",
    };
  }
  return null;
}

export function validateSlideshowData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Slideshow name is required",
    });
  }

  if (data.name && data.name.length > 100) {
    errors.push({
      field: "name",
      message: "Slideshow name must be less than 100 characters",
    });
  }

  if (data.title && data.title.length > 200) {
    errors.push({
      field: "title",
      message: "Title must be less than 200 characters",
    });
  }

  if (data.duration && (data.duration < 1000 || data.duration > 60000)) {
    errors.push({
      field: "duration",
      message: "Duration must be between 1 and 60 seconds",
    });
  }

  return errors;
}

export function validateSlideData(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Slide name is required",
    });
  }

  if (!data.title || data.title.trim().length === 0) {
    errors.push({
      field: "title",
      message: "Slide title is required",
    });
  }

  if (data.name && data.name.length > 100) {
    errors.push({
      field: "name",
      message: "Slide name must be less than 100 characters",
    });
  }

  if (data.title && data.title.length > 200) {
    errors.push({
      field: "title",
      message: "Slide title must be less than 200 characters",
    });
  }

  return errors;
}

export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, "");
}

export function sanitizeObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj;

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
