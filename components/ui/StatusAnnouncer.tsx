export function StatusAnnouncer({ message, type = 'polite' }: { 
    message: string; 
    type?: 'polite' | 'assertive' 
  }) {
    return <div aria-live={type} className="sr-only">{message}</div>;
  }