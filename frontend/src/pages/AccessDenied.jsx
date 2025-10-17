export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[#8aa082]/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[#2d3b2b] mb-2">
          Access Denied
        </h1>
        <p className="text-slate-700 mb-4">
          You don’t have permission to view or modify this patient’s records.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/"
            className="px-4 py-2 rounded-lg border border-[#a8b9a3] bg-white"
          >
            Home
          </a>
          <a
            href="/login"
            className="px-4 py-2 rounded-lg bg-[#6e8a69] text-white hover:bg-[#5f7a5a]"
          >
            Sign in again
          </a>
        </div>
      </div>
    </div>
  );
}
