// src/app/widget/page.tsx
"use client"

import WebWidget from '@/components/web-widget';

export default function WidgetPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <WebWidget />
    </div>
  );
}
