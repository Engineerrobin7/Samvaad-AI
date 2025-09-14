import { SignIn } from "@clerk/nextjs";
export default function LoginPage() {
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100vh"}}>
      <SignIn appearance={{ elements: { button: { backgroundColor: "#0057B7", color: "#fff", borderRadius: "8px", fontWeight: "bold" }}}} />
    </div>
  );
}