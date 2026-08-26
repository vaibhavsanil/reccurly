import { isClerkAPIResponseError } from "@clerk/expo";

interface GenericClerkError {
  code?: string;
  message?: string;
  longMessage?: string;
  errors?: Array<{
    code?: string;
    message?: string;
    longMessage?: string;
  }>;
}

/**
 * Translates Clerk API errors or JavaScript errors into user-friendly, brand-native messages.
 */
export function getAuthErrorMessage(err: unknown): string {
  if (!err) return "An unexpected error occurred. Please try again.";

  let code: string | undefined;
  let message: string | undefined;
  let longMessage: string | undefined;

  if (isClerkAPIResponseError(err) && err.errors?.length) {
    code = err.errors[0]?.code;
    message = err.errors[0]?.message;
    longMessage = err.errors[0]?.longMessage;
  } else if (typeof err === "object" && err !== null) {
    const clerkErr = err as GenericClerkError;
    if (clerkErr.errors && clerkErr.errors.length > 0) {
      code = clerkErr.errors[0]?.code;
      message = clerkErr.errors[0]?.message;
      longMessage = clerkErr.errors[0]?.longMessage;
    } else {
      code = clerkErr.code;
      message = clerkErr.message;
      longMessage = clerkErr.longMessage;
    }
  }

  // If Clerk provides a detailed, specific message (e.g. password complexity or breach info), use it
  if (longMessage) return longMessage;

  if (code) {
    switch (code) {
      case "form_identifier_not_found":
        return "No account found with this email. Please check your email or sign up.";
      case "form_password_incorrect":
        return "Incorrect password. Please try again.";
      case "form_identifier_exists":
        return "An account with this email already exists. Please sign in.";
      case "form_password_pwned":
        return "This password has been found in a public data breach. Please choose a stronger, unique password.";
      case "form_password_length_too_short":
        return "Password must be at least 8 characters long.";
      case "form_password_validation_failed":
        return "Password does not meet the security requirements. Please choose a stronger password.";
      case "form_code_incorrect":
        return "The verification code is incorrect. Please check and try again.";
      case "verification_expired":
        return "The verification code has expired. Please request a new code.";
      case "verification_failed":
        return "Verification failed. Please request a new code.";
      case "form_param_format_invalid":
        return "Please enter a valid email address.";
      case "session_exists":
        return "You are already signed in.";
      case "too_many_requests":
        return "Too many attempts. Please wait a moment and try again.";
      default:
        break;
    }
  }

  if (message) return message;
  if (err instanceof Error) return err.message;

  return "An unexpected error occurred. Please try again.";
}

/**
 * Validates an email address format.
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates password requirements (at least 8 characters).
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}
