import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, ImageIcon, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import ImageCropper from "../components/ui/ImageCropper";

const PROFILE_IMAGE_ASPECT = 1; // 400x400
const BANNER_ASPECT = 3; // 1200x400

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading, error, updateProfile, clearError } = useAuthStore();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    bio: "",
    birth_date: "",
  });

  const [profileImgFile, setProfileImgFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [profileImgPreview, setProfileImgPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [cropTarget, setCropTarget] = useState<"profile_img" | "banner" | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  const profileImgInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        bio: user.bio || "",
        birth_date: user.birth_date || "",
      });
      if (user.profile_img) setProfileImgPreview(user.profile_img);
      if (user.banner) setBannerPreview(user.banner);
    }
  }, [user]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "profile_img" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCropTarget(target);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = (blob: Blob) => {
    const file = new File([blob], `${cropTarget}.webp`, { type: "image/webp" });
    const previewUrl = URL.createObjectURL(blob);

    if (cropTarget === "profile_img") {
      setProfileImgFile(file);
      setProfileImgPreview(previewUrl);
    } else if (cropTarget === "banner") {
      setBannerFile(file);
      setBannerPreview(previewUrl);
    }

    setCropSrc(null);
    setCropTarget(null);
  };

  const removeImage = (target: "profile_img" | "banner") => {
    if (target === "profile_img") {
      setProfileImgFile(null);
      setProfileImgPreview(null);
    } else {
      setBannerFile(null);
      setBannerPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    const fd = new FormData();
    if (form.first_name) fd.append("first_name", form.first_name);
    if (form.last_name) fd.append("last_name", form.last_name);
    if (form.username) fd.append("username", form.username);
    fd.append("bio", form.bio);
    if (form.birth_date) fd.append("birth_date", form.birth_date);
    if (profileImgFile) fd.append("profile_img", profileImgFile);
    if (bannerFile) fd.append("banner", bannerFile);

    try {
      await updateProfile(fd);
      setSuccess(true);
      setTimeout(() => navigate("/profile"), 1000);
    } catch {
      // error is set in store
    }
  };

  const displayName = user?.username || user?.first_name || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Edit Profile</h1>
          <p className="text-surface-400 mt-0.5">Update your personal information</p>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">Banner</label>
          {bannerPreview ? (
            <div className="relative group">
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-48 object-cover rounded-xl border border-surface-700"
              />
              <button
                type="button"
                onClick={() => removeImage("banner")}
                className="absolute top-2 right-2 p-1.5 bg-surface-900/80 hover:bg-surface-800 rounded-lg text-surface-300 hover:text-danger transition-colors cursor-pointer border-none opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1.5 bg-surface-900/80 hover:bg-surface-800 text-surface-300 text-xs font-medium rounded-lg transition-colors cursor-pointer border-none opacity-0 group-hover:opacity-100"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="w-full h-48 bg-surface-800 hover:bg-surface-750 border-2 border-dashed border-surface-600 hover:border-primary-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-surface-400 hover:text-surface-300 transition-colors cursor-pointer"
            >
              <Upload size={24} />
              <span className="text-sm">Upload banner (3:1 ratio)</span>
            </button>
          )}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, "banner")}
            className="hidden"
          />
        </div>

        {/* Profile image upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">Profile Image</label>
          <div className="flex items-center gap-4">
            {profileImgPreview ? (
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-surface-700">
                  <img
                    src={profileImgPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage("profile_img")}
                  className="absolute -top-1 -right-1 p-1 bg-surface-800 hover:bg-surface-700 rounded-full text-surface-300 hover:text-danger transition-colors cursor-pointer border border-surface-600 opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => profileImgInputRef.current?.click()}
                  className="absolute -bottom-1 right-0 px-2 py-0.5 bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs rounded-lg transition-colors cursor-pointer border border-surface-600 opacity-0 group-hover:opacity-100"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => profileImgInputRef.current?.click()}
                className="w-24 h-24 bg-surface-800 hover:bg-surface-750 border-2 border-dashed border-surface-600 hover:border-primary-500/50 rounded-full flex flex-col items-center justify-center gap-1 text-surface-400 hover:text-surface-300 transition-colors cursor-pointer"
              >
                {user?.profile_img ? (
                  <img
                    src={user.profile_img}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <>
                    <ImageIcon size={20} />
                    <span className="text-xs">1:1</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={profileImgInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "profile_img")}
              className="hidden"
            />
            <p className="text-xs text-surface-500">
              Upload a square image. It will be cropped and converted to WebP.
            </p>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="username"
            className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
          />
        </div>

        {/* First + Last name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">First Name</label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))}
              placeholder="First name"
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">Last Name</label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))}
              placeholder="Last name"
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 resize-none"
          />
        </div>

        {/* Birth date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">Birth Date</label>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => setForm((prev) => ({ ...prev, birth_date: e.target.value }))}
            className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-none"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-6 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm font-medium rounded-lg transition-colors cursor-pointer border border-surface-600"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Image cropper modal */}
      {cropSrc && cropTarget && (
        <ImageCropper
          imageSrc={cropSrc}
          aspect={cropTarget === "banner" ? BANNER_ASPECT : PROFILE_IMAGE_ASPECT}
          title={
            cropTarget === "banner" ? "Crop Banner Image" : "Crop Profile Image"
          }
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropSrc(null);
            setCropTarget(null);
          }}
        />
      )}
    </div>
  );
}
