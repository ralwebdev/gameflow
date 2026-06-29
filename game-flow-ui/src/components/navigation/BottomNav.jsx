import { NavLink } from 'react-router-dom';
import { HomeIcon, ExploreIcon, BellIcon, ProfileIcon, PlusIcon } from '../icons/Icons';
import './BottomNav.css';

const BottomNav = () => {
  const items = [
    { key: 'home',          label: 'Home',          Icon: HomeIcon,        target: '/app/home' },
    { key: 'explore',       label: 'Explore',       Icon: ExploreIcon,     target: '/app/explore' },
    { key: 'notifications', label: 'Alerts',        Icon: BellIcon,        target: '/app/notifications' },
    { key: 'profile',       label: 'Profile',       Icon: ProfileIcon,     target: '/app/profile' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item, idx) => {
        // Insert FAB between Explore and Notifications
        const fab = idx === 2 ? (
          <NavLink
            key="fab"
            to="/app/upload"
            className={({ isActive }) => `fab-btn ${isActive ? 'fab-btn--active' : ''}`}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <PlusIcon size={22} />
          </NavLink>
        ) : null;

        return (
          <div key={item.key} style={{ display: 'contents' }}>
            {idx === 2 && fab}
            <NavLink
              to={item.target}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <item.Icon size={22} />
            </NavLink>
          </div>
        );
      })}
    </nav>
  );
};

export default BottomNav;
