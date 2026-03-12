import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, isLoading, error, changePassword, setPassword, clearError } = useAuthStore();

  const hasPassword = user?.has_password ?? true;

  const [form, setForm] = useState({
    old_password: "",
    password: "",
    confirm_password: "",
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    if (form.password !== form.confirm_password) {
      return;
    }

    try {
      if (hasPassword) {
        await changePassword(form);
      } else {
        await setPassword({
          password: form.password,
          confirm_password: form.confirm_password,
        });
      }
      setSuccess(true);
      setForm({ old_password: "", password: "", confirm_password: "" });
      setTimeout(() => navigate("/settings"), 1500);
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/settings")}
          className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-100">
            {hasPassword ? "Change Password" : "Set Password"}
          </h1>
          <p className="text-surface-400 mt-0.5">
            {hasPassword
              ? "Update your account password"
              : "Set a password for your account"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm">
          {hasPassword
            ? "Password changed successfully! Redirecting..."
            : "Password set successfully! Redirecting..."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current password - only shown for users who have a password */}
        {hasPassword && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">Current Password</label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                required
                value={form.old_password}
                onChange={(e) => setForm((prev) => ({ ...prev, old_password: e.target.value }))}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 cursor-pointer bg-transparent border-none"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* New password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">
            {hasPassword ? "New Password" : "Password"}
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder={hasPassword ? "Enter new password" : "Enter password"}
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 cursor-pointer bg-transparent border-none"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              required
              value={form.confirm_password}
              onChange={(e) => setForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
              placeholder="Confirm password"
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 cursor-pointer bg-transparent border-none"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.password && form.confirm_password && form.password !== form.confirm_password && (
            <p className="text-danger text-xs mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || (form.password !== form.confirm_password)}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-none"
          >
            {isLoading
              ? (hasPassword ? "Updating..." : "Setting...")
              : (hasPassword ? "Change Password" : "Set Password")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="px-6 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm font-medium rounded-lg transition-colors cursor-pointer border border-surface-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
