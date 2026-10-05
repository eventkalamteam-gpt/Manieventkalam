import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { EventItem, EventRegistration } from '../types';
import { User, Calendar, Clock, MapPin, Ticket, AlertCircle, CheckCircle2, XCircle, LogOut, ArrowRight } from 'lucide-react';

interface UserDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectEvent: (event: EventItem) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  onNavigate,
  onSelectEvent
}) => {
  const { currentUser, logout, updateProfile } = useAuth();
  const { registrations, events, cancelRegistration } = useEvents();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'profile'>('upcoming');
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-600">Please log in to your account to view your registered events and passes.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Filter registrations belonging to this user
  const userRegs = registrations.filter(
    (r) => r.userId === currentUser.id || r.userEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const now = new Date().toISOString().split('T')[0];

  const upcomingRegistrations = userRegs.filter((r) => {
    const evt = events.find((e) => e.id === r.eventId);
    return evt ? evt.status !== 'completed' && evt.date >= now : true;
  });

  const pastRegistrations = userRegs.filter((r) => {
    const evt = events.find((e) => e.id === r.eventId);
    return evt ? evt.status === 'completed' || evt.date < now : false;
  });

  const handleCancelConfirm = async (regId: string) => {
    await cancelRegistration(regId);
    setCancelModalId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Dashboard Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xl shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {currentUser.name}
              </h1>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm font-semibold">
                ACTIVE ATTENDEE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.email} {currentUser.phone && `· ${currentUser.phone}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('events')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Browse More Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Upcoming Passes ({upcomingRegistrations.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'past'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Past Attended ({pastRegistrations.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          My Profile & Settings
        </button>
      </div>

      {/* TAB 1: Upcoming Passes */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Ticket className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No Upcoming Event Registrations</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't registered for any scheduled events yet. Explore upcoming robotics bootcamps and open mic sessions.
              </p>
              <button
                onClick={() => onNavigate('events')}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                Browse Upcoming Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingRegistrations.map((reg) => {
                const eventObj = events.find((e) => e.id === reg.eventId);

                return (
                  <div
                    key={reg.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono text-slate-400 text-[11px]">{reg.eventId}</span>
                        <span
                          className={`font-semibold text-[11px] px-2 py-0.5 rounded-sm uppercase ${
                            reg.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {reg.eventTitle}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="font-medium text-slate-800">{reg.eventDate}</span>
                          <span aria-hidden="true">·</span>
                          <span>{reg.eventTime}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{reg.eventVenue}</span>
                        </div>
                      </div>

                      {/* Ticket Code Box */}
                      <div className="mt-4 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Pass Ticket ID
                          </span>
                          <span className="font-mono font-bold text-xs text-indigo-950">
                            {reg.ticketCode}
                          </span>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {eventObj && (
                        <button
                          onClick={() => onSelectEvent(eventObj)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                        >
                          View Full Details →
                        </button>
                      )}

                      {reg.status !== 'cancelled' && (
                        <button
                          onClick={() => setCancelModalId(reg.id)}
                          className="text-slate-400 hover:text-red-600 font-medium cursor-pointer"
                        >
                          Cancel Pass
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Past Attended */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-sm font-semibold text-slate-800">No past attended events yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Completed events you participated in will be archived here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-400">{reg.eventId}</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                      COMPLETED
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{reg.eventTitle}</h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Date: {reg.eventDate}</p>
                    <p>Venue: {reg.eventVenue}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">Pass: {reg.ticketCode}</span>
                    <button
                      onClick={() => onNavigate('showcase', { selectedEventId: reg.eventId })}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      View Showcase Recap →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 max-w-2xl space-y-6 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Account Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={currentUser.name}
                onBlur={(e) => updateProfile({ name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">Primary login email cannot be changed</span>
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                defaultValue={currentUser.phone || ''}
                onBlur={(e) => updateProfile({ phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-medium mb-1">Account Role</label>
              <div className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-700 font-mono">
                {currentUser.role.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            Account created: {new Date(currentUser.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Cancel Pass Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-slate-200 text-center">
            <XCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Cancel Event Pass?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel this registration? Your seat will be released back to the open pool.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCancelModalId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Keep Pass
              </button>
              <button
                onClick={() => handleCancelConfirm(cancelModalId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Yes, Cancel Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
