import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module 'lucide-react' {
  export const X: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Send: React.FC<React.SVGProps<SVGSVGElement>>;
  export const Loader2: React.FC<React.SVGProps<SVGSVGElement>>;
} 