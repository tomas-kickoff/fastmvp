import { useState } from "react";

import { useSession } from "../../../../app/providers/AppProviders";
import { saveSession, type Session } from "../../../../entities/user";

const getUserNameFromEmail = (email: string): string => {
  const [name] = email.split("@");
  return name || "user";
};

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setSession } = useSession();

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const nextSession: Session = {
      token: `mock-token-${Date.now()}`,
      user: {
        id: "mock-user-id",
        email: email.trim().toLowerCase(),
        name: getUserNameFromEmail(email.trim().toLowerCase()),
      },
    };

    try {
      await saveSession(nextSession);
      setSession(nextSession);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    password,
    error,
    isSubmitting,
    setEmail,
    setPassword,
    submit,
  };
}
