import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, User, Menu, X, Mic, Phone, Home as HomeIcon, Mail, Users } from 'lucide-react';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Portal from './pages/Portal';
import AdminCMS from './pages/AdminCMS';
import ChatBot from './components/ChatBot';
import LiveVoiceAgent from './components/LiveVoiceAgent';
import { DataProvider, useData } from './context/DataContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, siteSettings } = useData();
  const location = useLocation();

  const isActive = (path: string) => {
    // Exact match for home, startsWith for others to handle sub-routes
    const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    return active 
      ? "bg-blue-600 text-white font-bold shadow-md transform -translate-y-0.5" 
      : "text-slate-300 hover:bg-slate-800 hover:text-white font-medium hover:-translate-y-0.5";
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <Shield className="h-8 w-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-50 transition-colors">{siteSettings.brandName}</span>
                <span className="text-xs text-blue-200 uppercase tracking-widest">{siteSettings.brandSubtitle}</span>
              </div>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${isActive('/')}`}>Home</Link>
              <Link to="/courses" className={`px-4 py-2 rounded-md text-sm transition-all duration-200 ${isActive('/courses')}`}>Courses</Link>
              <Link 
                to="/portal" 
                state={{ initialTab: 'groups' }}
                className={`px-4 py-2 rounded-md text-sm transition-all duration-200 flex items-center ${location.state?.initialTab === 'groups' ? "bg-blue-600 text-white font-bold shadow-md transform -translate-y-0.5" : "text-slate-300 hover:bg-slate-800 hover:text-white font-medium hover:-translate-y-0.5"}`}
              >
                <Users className="w-4 h-4 mr-1.5" />
                Groups
              </Link>
              <Link to="/portal" className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center shadow-md transform hover:scale-105 ${location.pathname === '/portal' && !location.state?.initialTab ? "bg-blue-700 text-white ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                <User className="w-4 h-4 mr-2" />
                {user ? (user.role === 'admin' ? 'Admin Panel' : 'Student Portal') : 'Login'}
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/')}`}>Home</Link>
            <Link to="/courses" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base ${isActive('/courses')}`}>Courses</Link>
            <Link 
                to="/portal" 
                state={{ initialTab: 'groups' }}
                onClick={() => setIsOpen(false)} 
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white flex items-center"
            >
                <Users className="w-4 h-4 mr-2" /> Groups
            </Link>
            <Link to="/portal" onClick={() => setIsOpen(false)} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-md text-base font-bold mt-4 shadow-lg">
                {user ? (user.role === 'admin' ? 'Admin Panel' : 'Student Portal') : 'Portal Login'}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const { siteSettings } = useData();
  
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-white text-xl font-bold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-500" />
                {siteSettings.brandName}
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              {siteSettings.footerDescription}
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/courses" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Safety Officer Courses</Link></li>
              <li><Link to="/courses" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>School of Excellence</Link></li>
              <li><Link to="/portal" state={{ initialTab: 'groups' }} className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Join Community Groups</Link></li>
              <li><Link to="/portal" className="hover:text-blue-400 transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>Member Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start"><Phone className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" /> <span className="text-slate-400">{siteSettings.contactPhone}</span></li>
              <li className="flex items-start"><Mail className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" /> <span className="text-slate-400">{siteSettings.contactEmail}</span></li>
              <li className="flex items-start"><HomeIcon className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" /> <span className="text-slate-400">{siteSettings.address}</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {siteSettings.brandName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

const AppRoutes: React.FC = () => {
    const { user } = useData();
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminCMS /> : <Portal adminMode={true} />} />
        </Routes>
    );
};

const App: React.FC = () => {
  const [showVoice, setShowVoice] = React.useState(false);

  return (
    <DataProvider>
        <HashRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans">
            <Header />
            <main className="flex-grow">
            <AppRoutes />
            </main>
            
            {/* Floating AI Buttons */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-4 items-end">
            {/* Voice Agent Toggle */}
            <button
                onClick={() => setShowVoice(!showVoice)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-105 flex items-center justify-center border-2 border-white/20"
                title="Talk to AI Tutor"
            >
                {showVoice ? <X className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <ChatBot />
            </div>

            {/* Voice Agent Overlay */}
            {showVoice && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                <button 
                    onClick={() => setShowVoice(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
                >
                    <X className="w-6 h-6" />
                </button>
                <LiveVoiceAgent onClose={() => setShowVoice(false)} />
                </div>
            </div>
            )}

            <Footer />
        </div>
        </HashRouter>
    </DataProvider>
  );
};

export default App;