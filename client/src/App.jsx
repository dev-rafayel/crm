import {
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import './App.css';
import './crmInteractions.css';
import Dashboard from './components/dashboard/board.jsx';
import Clients from './components/clients/customers.jsx';
import ClientDetail from './components/clients/ClientDetail.jsx';
import DealDetail from './components/deals/dealDetail.jsx';
import Deals from './components/deals/deal.jsx';
import AuthPage from './components/auth/AuthPage.jsx';
import ForgotPassword from './components/auth/ForgotPassword.jsx';
import ForgotPasswordVerify from './components/auth/ForgotPasswordVerify.jsx';
import ResetPassword from './components/auth/ResetPassword.jsx';
import RegisterByInvite from './components/auth/RegisterByInvite.jsx';
import Profile from './components/user/Profile.jsx';
import Team from './components/team/Team.jsx';
import UserDetail from './components/team/UserDetail.jsx';
import { useAuth } from './context/AuthContext.jsx';
import styles from './styles.js';

const baseNavItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
        <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'clients',
    label: 'Clients',
    path: '/clients',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'deals',
    label: 'Deals',
    path: '/deals',
    icon: (
      <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
        <rect
          x="1"
          y="4"
          width="4"
          height="10"
          rx="1"
          fill="currentColor"
          opacity=".4"
        />
        <rect
          x="6"
          y="7"
          width="4"
          height="7"
          rx="1"
          fill="currentColor"
          opacity=".7"
        />
        <rect x="11" y="2" width="4" height="12" rx="1" fill="currentColor" />
      </svg>
    ),
  },
];

const teamNavItem = {
  id: 'team',
  label: 'Team',
  path: '/team',
  icon: (
    <svg viewBox="0 0 16 16" fill="none" width="15" height="15">
      <circle cx="5.5" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.2" />
      <circle
        cx="10.5"
        cy="5"
        r="2.2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M1.5 13.5c0-2.2 1.8-4 4-4M10.5 9.5c2.2 0 4 1.8 4 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function SidebarContent() {
  const { user, logout, getDisplayName, getInitials, formatRole } = useAuth();
  const location = useLocation();

  const navItems = [...baseNavItems, teamNavItem];

  const getActiveId = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/clients')) return 'clients';
    if (path === '/deals') return 'deals';
    if (path.startsWith('/team')) return 'team';
    return 'dashboard';
  };

  const active = getActiveId();

  return (
    <>
      <div style={styles.logo}>
        <span style={styles.logoDot}>●</span> SaleCRM
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            style={{
              ...styles.navItem,
              background: active === item.id ? '#EFF6FF' : 'transparent',
              color: active === item.id ? '#3B82F6' : '#64748B',
              fontWeight: active === item.id ? 600 : 400,
              textDecoration: 'none',
            }}
          >
            <span style={{ opacity: active === item.id ? 1 : 0.6 }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={styles.sidebarBottom}>
        <Link
          to="/profile"
          style={{
            ...styles.userRow,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          <div style={styles.userAvatar}>{getInitials(user)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.userName}>{getDisplayName(user)}</p>
            <p style={styles.userRole}>{formatRole(user.role)}</p>
          </div>
        </Link>
        <button type="button" className="crm-btn-signout" onClick={logout}>
          Sign out
        </button>
      </div>
    </>
  );
}

function DealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <DealDetail
      dealId={id}
      onBack={() => navigate(-1)}
      onUpdate={() => {}}
      onDelete={() => navigate('/deals')}
    />
  );
}

function AuthenticatedLayout() {
  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <SidebarContent />
      </aside>

      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/deals/:id" element={<DealDetailPage />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:id" element={<UserDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8F9FB',
          color: '#64748B',
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/register-by-invite" element={<RegisterByInvite />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/forgot-password/verify"
        element={<ForgotPasswordVerify />}
      />
      <Route path="/forgot-password/reset" element={<ResetPassword />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />
      {user ? (
        <Route path="*" element={<AuthenticatedLayout />} />
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}
