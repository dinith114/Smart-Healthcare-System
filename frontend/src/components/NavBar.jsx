import { Link, NavLink } from "react-router-dom";
import { currentUser, logout } from "../services/auth";

export default function NavBar() {
  const user = currentUser();
  return (
    <nav className="w-full bg-[var(--bg)] border-b border-black/5">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="font-semibold">🏥 Smart Healthcare</Link>
        <div className="flex items-center gap-6">
          <NavLink to="/appointments" className="hover:underline">Appointments</NavLink>
          <NavLink to="/appointments/new" className="hover:underline">Make Appointment</NavLink>
          {user ? (
            <button onClick={() => { logout(); location.reload(); }} className="text-sm underline">
              {user.username} · Logout
            </button>
          ) : (
            <NavLink to="/login" className="hover:underline">Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
