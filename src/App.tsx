import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventProvider, useEvents } from './context/EventContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { ShowcasePage } from './pages/ShowcasePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { UserLoginPage } from './pages/UserLoginPage';
import { UserRegisterPage } from './pages/UserRegisterPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { EventDetailModal } from './components/events/EventDetailModal';
import { EventItem } from './types';

function MainApp() {
  const { isAdmin, isAuthenticated } = useAuth();
  const { events } = useEvents();

  // Page routing state
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedEventForModal, setSelectedEventForModal] = useState<EventItem | null>(null);
  const [showcaseTargetEventId, setShowcaseTargetEventId] = useState<string | undefined>(undefined);

  // Helper to check admin status from both React state and stored session to prevent race conditions on immediate post-login redirects
  const checkIsAdmin = () => {
    if (isAdmin) return true;
    try {
      const sessionRaw = localStorage.getItem('eventkalam_session_v2');
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (parsed?.role === 'admin') return true;
      }
    } catch (e) {}
    return false;
  };

  // Sync hash routing for direct URLs
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        if (hash === 'admin-login') {
          setCurrentPage('login');
        } else if (hash === 'admin-dashboard' && !checkIsAdmin()) {
          setCurrentPage(isAuthenticated ? 'user-dashboard' : 'login');
        } else if (hash.startsWith('event/')) {
          const evtId = hash.replace('event/', '');
          const found = events.find((e) => e.id === evtId);
          if (found) {
            setSelectedEventForModal(found);
          }
        } else {
          setCurrentPage(hash);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [events, isAdmin, isAuthenticated]);

  // Keep page in sync when admin status is verified
  useEffect(() => {
    const hash = window.location.hash.replace('#', '').trim();
    if (isAdmin && hash === 'admin-dashboard' && currentPage !== 'admin-dashboard') {
      console.log('[App Sync] Synchronizing view to admin-dashboard for verified admin');
      setCurrentPage('admin-dashboard');
    }
  }, [isAdmin, currentPage]);

  const handleNavigate = (page: string, params?: any) => {
    let targetPage = page;
    if (page === 'admin-login') {
      targetPage = 'login';
    } else if (page === 'admin-dashboard' && !checkIsAdmin()) {
      console.warn('[App Access Guard] Access to admin-dashboard denied: Not an administrator');
      targetPage = isAuthenticated ? 'user-dashboard' : 'login';
    }

    console.log('[App handleNavigate] Navigating to:', targetPage, '(Requested:', page, ', checkIsAdmin():', checkIsAdmin(), ')');
    console.log('FINAL ROUTE:', targetPage === 'admin-dashboard' ? 'Admin Dashboard' : targetPage === 'user-dashboard' ? 'User Dashboard' : targetPage);
    setCurrentPage(targetPage);
    window.location.hash = targetPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (params?.selectedEventId) {
      setShowcaseTargetEventId(params.selectedEventId);
    }
  };

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEventForModal(event);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Top Bar Header */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            events={events}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {currentPage === 'events' && (
          <EventsPage
            events={events}
            onSelectEvent={handleSelectEvent}
            onNavigateToShowcase={(evtId) => handleNavigate('showcase', { selectedEventId: evtId })}
          />
        )}

        {currentPage === 'showcase' && (
          <ShowcasePage
            events={events}
            selectedEventId={showcaseTargetEventId}
            onNavigateToAdmin={() => handleNavigate('admin-dashboard')}
          />
        )}

        {currentPage === 'about' && <AboutPage />}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'login' && <UserLoginPage onNavigate={handleNavigate} />}

        {currentPage === 'register' && <UserRegisterPage onNavigate={handleNavigate} />}

        {currentPage === 'user-dashboard' && (
          <UserDashboardPage
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboardPage
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
          />
        )}
      </main>

      {/* Reusable Event Detail & Registration Modal */}
      <EventDetailModal
        event={selectedEventForModal}
        isOpen={Boolean(selectedEventForModal)}
        onClose={() => setSelectedEventForModal(null)}
        onNavigateToShowcase={(eventId) => {
          setSelectedEventForModal(null);
          handleNavigate('showcase', { selectedEventId: eventId });
        }}
      />

      {/* Global Professional Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <MainApp />
      </EventProvider>
    </AuthProvider>
  );
}
