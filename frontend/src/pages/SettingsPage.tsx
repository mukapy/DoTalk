import { Bell, Shield, Palette, Globe, HelpCircle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const hasPassword = user?.has_password ?? true;

  const settingSections = [
    {
      icon: Lock,
      title: hasPassword ? "Change Password" : "Set Password",
      description: hasPassword
        ? "Update your account password"
        : "Set a password for your account",
      link: "/settings/change-password",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage notification preferences",
      link: null,
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Control who can see your profile and invite you",
      link: null,
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Theme and display settings",
      link: null,
    },
    {
      icon: Globe,
      title: "Language",
      description: "Change your preferred language",
      link: null,
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "FAQ, contact us, and report issues",
      link: null,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Settings</h1>
        <p className="text-surface-400 mt-1">Manage your account preferences</p>
      </div>

      <div className="space-y-3">
        {settingSections.map(({ icon: Icon, title, description, link }) => (
          <div
            key={title}
            onClick={() => link && navigate(link)}
            className={`bg-surface-900 border border-surface-700 rounded-xl p-4 hover:border-surface-600 transition-colors flex items-center gap-4 ${link ? "cursor-pointer" : "cursor-default opacity-60"}`}
          >
            <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center text-surface-300">
              <Icon size={20} />
            </div>
            <div>
              <h3 className="text-surface-100 font-medium">{title}</h3>
              <p className="text-surface-500 text-sm">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-surface-900 border border-red-500/20 rounded-xl p-6 mt-8">
        <h3 className="text-red-400 font-medium">Danger Zone</h3>
        <p className="text-surface-500 text-sm mt-1">
          Irreversible and destructive actions
        </p>
        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors cursor-pointer border border-red-500/20">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
