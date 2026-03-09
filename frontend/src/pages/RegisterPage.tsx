import { useState, useMemo, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, KeyRound, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import GoogleLoginButton from "../components/ui/GoogleLoginButton";

type Step = "email" | "code" | "credentials";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { checkEmail, register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const [resendDisabled, setResendDisabled] = useState(false);

  // Step 1: Check email availability and trigger verification code
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const exists = await checkEmail(email);
    if (exists) {
      useAuthStore.setState({
        error: "This email is already registered. Please sign in instead.",
      });
      return;
    }
    // Email is new — backend sent a verification code
    setStep("code");
  };

  // Step 2: User enters the 6-digit code
  const handleCodeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setStep("credentials");
  };

  // Step 3: Complete registration
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || password !== confirmPassword) return;

    await register({
      email,
      code: parseInt(code, 10),
      password,
      username,
    });

    if (useAuthStore.getState().isAuthenticated) {
      navigate("/");
    }
  };

  const goBack = () => {
    clearError();
    if (step === "code") setStep("email");
    else if (step === "credentials") setStep("code");
  };

  return (
    <div className="bg-surface-900 rounded-2xl border border-surface-700 p-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {step !== "email" && (
          <button
            onClick={goBack}
            className="p-1 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-100 transition-colors bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h2 className="text-xl font-semibold text-surface-100">
          {step === "email" && "Create your account"}
          {step === "code" && "Verify your email"}
          {step === "credentials" && "Set up your profile"}
        </h2>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        {(["email", "code", "credentials"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= ["email", "code", "credentials"].indexOf(step)
                ? "bg-primary-500"
                : "bg-surface-700"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-300 hover:text-red-100 bg-transparent border-none cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step 1: Email */}
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-surface-400 mb-2">
            <Mail size={16} />
            <span className="text-sm">We'll send a verification code to your email</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm cursor-pointer border-none"
          >
            {isLoading ? "Checking..." : "Continue"}
          </button>
        </form>
      )}

      {/* Google sign-up (only on email step) */}
      {step === "email" && (
        <>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-surface-700" />
            <span className="text-surface-500 text-xs">OR</span>
            <div className="flex-1 h-px bg-surface-700" />
          </div>
          <GoogleLoginButton />
        </>
      )}

      {/* Step 2: Verification code */}
      {step === "code" && (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-surface-400 mb-2">
            <KeyRound size={16} />
            <span className="text-sm">
              Enter the 6-digit code sent to{" "}
              <strong className="text-surface-200">{email}</strong>
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
              }}
              required
              maxLength={6}
              className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-center text-lg tracking-[0.5em] font-mono"
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={code.length !== 6}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm cursor-pointer border-none"
          >
            Verify Code
          </button>
          <button
            type="button"
            onClick={async () => {
              setResendDisabled(true);
              await checkEmail(email);
              // Disable for 30 seconds to prevent spam
              setTimeout(() => setResendDisabled(false), 30000);
            }}
            disabled={isLoading || resendDisabled}
            className="w-full py-2 bg-transparent hover:bg-surface-800 text-surface-400 hover:text-surface-200 text-sm rounded-lg transition-colors cursor-pointer border-none disabled:opacity-50"
          >
            {isLoading ? "Sending..." : resendDisabled ? "Code sent — wait 30s" : "Resend code"}
          </button>
        </form>
      )}

      {/* Step 3: Username + Password */}
      {step === "credentials" && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-surface-400 mb-2">
            <UserPlus size={16} />
            <span className="text-sm">Choose your username and password</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="Create a password"
              minLength={8}
            />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < passwordStrength.score ? passwordStrength.color : "bg-surface-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-surface-400 mt-1">
                  Password strength: <span className="text-surface-200">{passwordStrength.label}</span>
                  {password.length < 8 && " — must be at least 8 characters"}
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              placeholder="Confirm your password"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                Passwords do not match
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={
              isLoading || password.length < 8 || (!!confirmPassword && password !== confirmPassword)
            }
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm cursor-pointer border-none"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-surface-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary-400 hover:text-primary-300 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
