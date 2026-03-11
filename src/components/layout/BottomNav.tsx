import { NavLink } from 'react-router-dom';
import { Home, Search, Flame, Bell, User } from 'lucide-react';

const items = [
  { to: '/', icon: Home },
  { to: '/explore', icon: Search },
  { to: '/streaks', icon: Flame },
  { to: '/notifications', icon: Bell },
  { to: '/profile/me', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/5
                    flex justify-around py-2 z-50 md:hidden">
      {items.map(({ to, icon: Icon }) => (
        <NavLink key={to} to={to}
          className={({ isActive }) =>
            `p-2 rounded-lg ${isActive ? 'text-[#FF5C00]' : 'text-gray-500'}`}>
          <Icon size={22} />
        </NavLink>
      ))}
    </nav>
  );
}
