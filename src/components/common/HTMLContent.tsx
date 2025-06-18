import React from 'react';

interface HTMLContentProps {
  content: string;
  className?: string;
}

export default function HTMLContent({ content, className = '' }: HTMLContentProps) {
  return (
    <div 
      className={`prose prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
