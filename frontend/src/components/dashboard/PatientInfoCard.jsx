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

  const openPicker = () => inputRef.current?.click();

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const localURL = URL.createObjectURL(f);
    setPreview(localURL);
    // try upload (optional backend)
    try {
      const form = new FormData();
      form.append("avatar", f);
      const r = await api.post(`/patients/${patientId}/avatar`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onAvatarChanged?.(r.data?.url);
    } catch {
      // backend not implemented? still show preview
      onAvatarChanged?.(localURL);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 md:col-span-8">
          <dl className="text-sm">
            <div className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-2">
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

        <div className="col-span-12 md:col-span-4">
          <div className="w-full aspect-square rounded-lg bg-[#c7d7c3] overflow-hidden">
            {preview || avatarUrl ? (
              <img
                src={preview || avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <button
            onClick={openPicker}
            className="mt-3 w-full rounded-lg bg-[#6e8a69] text-white py-2 hover:bg-[#5f7a5a]"
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
