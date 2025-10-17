import { useRef, useState } from "react";
import { api } from "../../services/api";

export default function PatientInfoCard({
  data = {},
  className = "",
  patientId,
  onAvatarChanged,
}) {
  const {
    name = "-",
    address = "-",
    phone = "-",
    email = "-",
    gender = "-",
    dob,
    avatarUrl,
  } = data || {};
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const age = dob
    ? new Date().getFullYear() - new Date(dob).getFullYear()
    : "-";

  // Construct full avatar URL
  const getFullAvatarUrl = (url) => {
    if (!url) return null;
    // If URL already includes http/https, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // Otherwise, construct full URL with backend base URL
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  const openPicker = () => inputRef.current?.click();

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const localURL = URL.createObjectURL(f);
    setPreview(localURL);
    // try upload
    try {
      const form = new FormData();
      form.append("avatar", f);
      const r = await api.post(`/patients/${patientId}/avatar`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Construct full URL for avatar
      const fullAvatarUrl = r.data?.url
        ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${
            r.data.url
          }`
        : null;
      setPreview(null); // Clear local preview
      onAvatarChanged?.(fullAvatarUrl);
      alert("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to upload avatar. Please try again."
      );
      setPreview(null);
    }
  };

  return (
    <div className={className}>
      <h3 className="font-semibold text-[#2f3e2d] mb-4">Patient Information</h3>
      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 md:col-span-7">
          <dl className="text-sm">
            <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-2">
              <dt className="font-semibold">Name :</dt>
              <dd>{name}</dd>
              <dt className="font-semibold">Address :</dt>
              <dd>{address}</dd>
              <dt className="font-semibold">Contact No :</dt>
              <dd>{phone}</dd>
              <dt className="font-semibold">Email :</dt>
              <dd>{email}</dd>
              <dt className="font-semibold">Gender :</dt>
              <dd>{gender}</dd>
              <dt className="font-semibold">Age :</dt>
              <dd>{age} years</dd>
            </div>
          </dl>
        </div>

        <div className="col-span-12 md:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[200px] aspect-square rounded-lg bg-[#c7d7c3] overflow-hidden mb-3">
            {preview || avatarUrl ? (
              <img
                src={preview || getFullAvatarUrl(avatarUrl)}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Failed to load avatar:", e.target.src);
                  e.target.style.display = "none";
                }}
              />
            ) : null}
          </div>
          <button
            onClick={openPicker}
            className="w-full max-w-[200px] rounded-lg bg-[#6e8a69] text-white py-2 hover:bg-[#5f7a5a]"
          >
            Edit Picture
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </div>
      </div>
    </div>
  );
}
