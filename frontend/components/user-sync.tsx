"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function UserSync() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const syncUserWithBackend = async () => {
        try {
          await fetch(`${API_URL}/auth/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              name: user.fullName || user.username || "New User",
              preferred_language: 'en', // default language
            }),
          });
          console.log("User synced with backend.");
        } catch (error) {
          console.error("Failed to sync user with backend:", error);
        }
      };
      
      syncUserWithBackend();
    }
  }, [isSignedIn, user]);

  return null; // This component does not render anything
}