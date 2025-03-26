import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/#services' },
    { name: 'About', href: '/#about' },
    { name: 'Resources', href: '/#resources' },
    { name: 'Contact', href: '/#contact' },
  ];

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'morgueAttendant':
        return '/dashboard/morgue';
      default:
        return '/dashboard/client';
    }
  };

  const handleDashboardClick = (e) => {
    e.preventDefault();
    const path = getDashboardPath();
    navigate(path);
  };

  return (
    <nav className={`fixed w-full z-50 ${isLandingPage ? 'bg-transparent' : 'bg-white shadow-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className={`text-2xl font-bold ${isLandingPage ? 'text-white' : 'text-primary-600'}`}>
                FHMS
              </h1>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {isLandingPage && navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-primary-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </a>
              ))}

              {isAuthenticated ? (
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleDashboardClick}
                      className={`${
                        isLandingPage
                          ? 'text-white hover:text-primary-200'
                          : 'text-primary-600 hover:text-primary-800'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={logout}
                      className={`${
                        isLandingPage
                          ? 'border-white text-white hover:bg-white hover:text-primary-600'
                          : 'border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
                      } px-4 py-2 text-sm font-medium border-2 rounded-md transition-colors`}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className={`${
                      isLandingPage
                        ? 'text-white hover:text-primary-200'
                        : 'text-primary-600 hover:text-primary-800'
                    } px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`${
                      isLandingPage
                        ? 'border-white text-white hover:bg-white hover:text-primary-600'
                        : 'border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
                    } px-4 py-2 text-sm font-medium border-2 rounded-md transition-colors`}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${
                isLandingPage ? 'text-white' : 'text-primary-600'
              } inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isLandingPage && navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-primary-600 hover:bg-primary-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}

          {isAuthenticated ? (
            <>
              <button
                onClick={(e) => {
                  handleDashboardClick(e);
                  setIsOpen(false);
                }}
                className="w-full text-left text-primary-600 hover:bg-primary-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full text-left text-primary-600 hover:bg-primary-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-primary-600 hover:bg-primary-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-primary-600 hover:bg-primary-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}