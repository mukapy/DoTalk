import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, ImageIcon } from "lucide-react";
import { useRoomStore } from "../store/roomStore";
import ImageCropper from "../components/ui/ImageCropper";
import type { RoomFormData } from "../types";

const ROOM_IMAGE_ASPECT = 1; // 400x400 = 1:1
const BANNER_ASPECT = 3; // 1200x400 = 3:1

export default function RoomFormPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const isEdit = Boolean(uuid);
  const navigate = useNavigate();

  const {
    currentRoom,
    categories,
    topics,
    isLoading,
    error,
    fetchRoom,
    fetchCategories,
    fetchTopics,
    createRoom,
    updateRoom,
    clearError,
  } = useRoomStore();

  const [form, setForm] = useState<RoomFormData>({
    name: "",
    description: "",
    category: "",
    topic: [],
    type: "CHAT",
    capacity: 2,
    visibility: true,
    status: "upcoming",
    image: null,
    banner: null,
  });

  // Image crop state
  const [cropTarget, setCropTarget] = useState<"image" | "banner" | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // Preview URLs
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
    fetchTopics();
    if (isEdit && uuid) {
      fetchRoom(uuid);
    }
  }, [uuid, isEdit, fetchRoom, fetchCategories, fetchTopics]);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && currentRoom) {
      setForm({
        name: currentRoom.name,
        description: currentRoom.description || "",
        category: currentRoom.category?.id ?? "",
        topic: currentRoom.topic?.map((t) => t.id) ?? [],
        type: currentRoom.type,
        capacity: currentRoom.capacity,
        visibility: currentRoom.visibility,
        status: currentRoom.status,
        image: null,
        banner: null,
      });
      if (currentRoom.image) setImagePreview(currentRoom.image);
      if (currentRoom.banner) setBannerPreview(currentRoom.banner);
    }
  }, [isEdit, currentRoom]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "image" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCropTarget(target);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleCropComplete = (blob: Blob) => {
    const file = new File(
      [blob],
      `${cropTarget}.webp`,
      { type: "image/webp" }
    );
    const previewUrl = URL.createObjectURL(blob);

    if (cropTarget === "image") {
      setForm((prev) => ({ ...prev, image: file }));
      setImagePreview(previewUrl);
    } else if (cropTarget === "banner") {
      setForm((prev) => ({ ...prev, banner: file }));
      setBannerPreview(previewUrl);
    }

    setCropSrc(null);
    setCropTarget(null);
  };

  const removeImage = (target: "image" | "banner") => {
    if (target === "image") {
      setForm((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
    } else {
      setForm((prev) => ({ ...prev, banner: null }));
      setBannerPreview(null);
    }
  };

  const handleTopicToggle = (topicId: number) => {
    setForm((prev) => ({
      ...prev,
      topic: prev.topic.includes(topicId)
        ? prev.topic.filter((id) => id !== topicId)
        : [...prev.topic, topicId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    if (form.category !== "") fd.append("category", String(form.category));
    form.topic.forEach((id) => fd.append("topic", String(id)));
    fd.append("type", form.type);
    fd.append("capacity", String(form.capacity));
    fd.append("visibility", String(form.visibility));
    fd.append("status", form.status);
    if (form.image) fd.append("image", form.image);
    if (form.banner) fd.append("banner", form.banner);

    try {
      if (isEdit && uuid) {
        await updateRoom(uuid, fd);
        navigate(`/rooms/${uuid}`);
      } else {
        const room = await createRoom(fd);
        navigate(`/rooms/${room.uuid}`);
      }
    } catch {
      // error is set in store
    }
  };

  const filteredTopics = form.category
    ? topics.filter((t) => t.category === form.category)
    : topics;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">
          {isEdit ? "Edit Room" : "Create Room"}
        </h1>
        <p className="text-surface-400 mt-1">
          {isEdit
            ? "Update your room settings"
            : "Set up a new room for conversations"}
        </p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
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

        {/* Room image upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">Room Image</label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Room image preview"
                  className="w-24 h-24 object-cover rounded-xl border border-surface-700"
                />
                <button
                  type="button"
                  onClick={() => removeImage("image")}
                  className="absolute -top-2 -right-2 p-1 bg-surface-800 hover:bg-surface-700 rounded-full text-surface-300 hover:text-danger transition-colors cursor-pointer border border-surface-600 opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-24 h-24 bg-surface-800 hover:bg-surface-750 border-2 border-dashed border-surface-600 hover:border-primary-500/50 rounded-xl flex flex-col items-center justify-center gap-1 text-surface-400 hover:text-surface-300 transition-colors cursor-pointer"
              >
                <ImageIcon size={20} />
                <span className="text-xs">1:1</span>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "image")}
              className="hidden"
            />
            <p className="text-xs text-surface-500">
              Upload a square image. It will be cropped and converted to WebP.
            </p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">
            Room Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="My awesome room"
            className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            placeholder="What is this room about?"
            className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 resize-none"
          />
        </div>

        {/* Type + Capacity row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">Type *</label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  type: e.target.value as RoomFormData["type"],
                }))
              }
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            >
              <option value="VIDEO">Video</option>
              <option value="VOICE">Voice</option>
              <option value="CHAT">Chat</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">
              Capacity (2-15) *
            </label>
            <input
              type="number"
              min={2}
              max={15}
              required
              value={form.capacity}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  capacity: Number(e.target.value),
                }))
              }
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            />
          </div>
        </div>

        {/* Status + Visibility row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as RoomFormData["status"],
                }))
              }
              className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">
              Visibility
            </label>
            <label className="flex items-center gap-3 px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={form.visibility}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    visibility: e.target.checked,
                  }))
                }
                className="form-checkbox h-4 w-4 text-primary-600 rounded border-surface-600 bg-surface-900"
              />
              <span className="text-sm text-surface-200">Public room</span>
            </label>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-surface-300">
            Category *
          </label>
          <select
            required
            value={form.category}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                category: e.target.value ? Number(e.target.value) : "",
                topic: [], // reset topics when category changes
              }))
            }
            className="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topics */}
        {filteredTopics.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-surface-300">
              Topics
            </label>
            <div className="flex flex-wrap gap-2">
              {filteredTopics.map((topic) => {
                const selected = form.topic.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicToggle(topic.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
                      selected
                        ? "bg-primary-600/20 text-primary-400 border-primary-500/30"
                        : "bg-surface-800 text-surface-400 border-surface-600 hover:text-surface-200 hover:border-surface-500"
                    }`}
                  >
                    {topic.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer border-none"
          >
            {isLoading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create Room"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
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
          aspect={cropTarget === "banner" ? BANNER_ASPECT : ROOM_IMAGE_ASPECT}
          title={
            cropTarget === "banner" ? "Crop Banner Image" : "Crop Room Image"
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
