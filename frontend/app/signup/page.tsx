"use client"

import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
      <SignUp appearance={{
        elements: {
          button: {
            backgroundColor: "#0057B7", // Example: Samvaad AI blue
            color: "#fff",
            borderRadius: "8px",
            fontWeight: "bold"
          }
        }
      }} />
    </div>
  );
}