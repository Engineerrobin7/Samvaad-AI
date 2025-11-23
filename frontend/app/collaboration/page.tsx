'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Session {
  id: string;
  name: string;
  owner_id: string;
  source_language: string;
  target_language: string;
  created_at: string;
  participants: string[];
}

interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  user_id: string;
  status: 'draft' | 'review' | 'approved';
  v