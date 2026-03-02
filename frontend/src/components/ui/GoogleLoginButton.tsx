import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleLoginButton() {
  const { googleLogin } = useAuthStore();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      await googleLogin(response.credential);
      if (useAuthStore.getState().isAuthenticated) {
        navigate("/");
      }
    },
    [googleLogin, navigate]
  );

  useEffect(() => {
    if (initializedRef.current || !buttonRef.current) return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return false;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        buttonRef.current!,
        { theme: "outline", size: "large", type: "standard", text: "continue_with", width: "320" }
      );

      initializedRef.current = true;
      return true;
    };

    if (initGoogle()) return;

    const interval = setInterval(() => {
      if (initGoogle()) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [handleCredentialResponse]);

  return <div ref={buttonRef} className="flex justify-center" />;
}
