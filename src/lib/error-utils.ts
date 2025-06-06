/**
 * Utility functions for handling and formatting user-friendly error messages
 */

export const getLaymanErrorMessage = (error: any): string => {
  // Check for common Puter-specific errors first
  if (typeof error === 'object' && error !== null) {
    const errObj = error as any;
    
    // Usage limited chat error
    if (errObj.success === false && errObj.error && typeof errObj.error === 'object' && errObj.error.message) {
      const puterErrorDetails = errObj.error;
      if (puterErrorDetails.delegate === 'usage-limited-chat' || 
          puterErrorDetails.message.toLowerCase().includes('usage limit') ||
          puterErrorDetails.message.toLowerCase().includes('permission denied')) {
        return "An error occurred. Try again or Create a New Puter Account.";
      }
    }
    
    // Other permission denied errors
    if (errObj.error && errObj.error.message && 
        errObj.error.message.toLowerCase().includes('permission denied')) {
      return "An error occurred. Try again or Create a New Puter Account.";
    }
    
    // Empty object error
    if (Object.keys(errObj).length === 0 && errObj.constructor === Object) {
      return "An error occurred. Try again or Create a New Puter Account.";
    }
  }
  
  // Check for common error patterns in strings
  if (typeof error === 'string') {
    const lowerError = error.toLowerCase();
    if (lowerError.includes('usage limit') || 
        lowerError.includes('permission denied') ||
        lowerError.includes('authentication') ||
        lowerError.includes('unauthorized')) {
      return "An error occurred. Try again or Create a New Puter Account.";
    }
  }
  
  // Check for Error objects
  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();
    if (lowerMessage.includes('usage limit') || 
        lowerMessage.includes('permission denied') ||
        lowerMessage.includes('authentication') ||
        lowerMessage.includes('unauthorized')) {
      return "An error occurred. Try again or Create a New Puter Account.";
    }
    
    // For other errors, still show a friendly message but keep some context
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return "Network error occurred. Please check your connection and try again.";
    }
    
    if (lowerMessage.includes('timeout')) {
      return "Request timed out. Please try again.";
    }
    
    if (lowerMessage.includes('invalid') || lowerMessage.includes('malformed')) {
      return "Invalid request. Please check your input and try again.";
    }
  }
  
  // Default friendly error message
  return "An error occurred. Try again or Create a New Puter Account.";
};