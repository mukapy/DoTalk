import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white font-bold text-2xl mb-4">
            D
          </div>
          <h1 className="text-2xl font-bold text-surface-100">DoTalk</h1>
          <p className="text-surface-400 text-sm mt-1">
            Connect through conversations
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
