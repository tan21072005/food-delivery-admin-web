import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Login | Food Delivery Admin",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
