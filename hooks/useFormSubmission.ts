import { useState } from "react";

export function useFormSubmission<T>() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
  
    const submitForm = async (url: string, data: T) => {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit form');
        }
        
        setSubmitSuccess(true);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
        
        return true;
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return {
      isSubmitting,
      submitSuccess,
      submitError,
      submitForm,
      clearSubmitStatus: () => {
        setSubmitSuccess(false);
        setSubmitError(null);
      }
    };
  }