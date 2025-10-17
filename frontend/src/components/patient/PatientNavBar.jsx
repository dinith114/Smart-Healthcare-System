import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PatientNavBar({ patientName }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/patient") {
      return location.pathname === "/patient";
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) => 
    `hover:underline transition-all ${isActive(path) ? 'font-bold border-b-2 border-white' : ''}`;

  return (
    <header className="bg-[#7e957a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/patient" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-lg">
              Smart Healthcare System
            </span>
            <span className="block text-xs text-white/80">
              Patient Portal
            </span>
          </div>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link
            to="/patient"
            className={linkClass("/patient")}
          >
            Home
          </Link>
          <Link
            to="/appointments"
            className={linkClass("/appointments")}
          >
            Appointments
          </Link>
          <Link
            to="/patient/about"
            className={linkClass("/patient/about")}
          >
            About
          </Link>
          <Link
            to="/patient/contacts"
            className={linkClass("/patient/contacts")}
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium">
              {patientName || user?.username}
            </div>
            <div className="text-xs text-white/80">Patient</div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-[#5b6f59] hover:bg-[#4f614e] transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

