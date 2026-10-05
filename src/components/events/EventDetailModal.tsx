import React, { useState } from 'react';
import { EventItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { ImageSlot } from '../common/ImageSlot';
import { X, Calendar, Clock, MapPin, Mail, Users, CheckCircle2, AlertCircle, Ticket, Share2 } from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToShowcase?: (eventId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onNavigateToShowcase
}) => {
  const { currentUser, isAuthenticated, isAdmin } = useAuth();
  const { registerForEvent, updateEvent } = useEvents();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{ success: boolean; ticketCode?: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setRegistrationResult({ success: false, error: 'Please provide your full name, email, and phone number.' });
      return;
    }

    const res = await registerForEvent(event.id, { name, email, phone });
    setRegistrationResult(res);
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompleted = event.status === 'completed';
  const isFull = event.registeredCount >= event.capacity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>ID: {event.id}</span>
            <span aria-hidden="true">·</span>
            <span>{event.category}</span>
            <span aria-hidden="true">·</span>
            <span className={isCompleted ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
              {event.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Share event link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Visual Frame */}
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <ImageSlot
              src={event.imageUrl}
              alt={event.title}
              aspectRatio="video"
              label={`Official Photo for ${event.title}`}
              allowUpload={isAdmin}
              onImageChange={(newUrl) => updateEvent(event.id, { imageUrl: newUrl })}
            />
          </div>

          {/* Title & Key Logistics */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug">
              {event.title}
            </h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span><strong>Date:</strong> {event.date}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span><strong>Time:</strong> {event.time}</span>
              </div>
              <div className="flex items-start gap-2.5 sm:col-span-2">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Venue:</strong> {event.venue}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <span><strong>Contact:</strong> {event.contactEmail || 'robokalam@gmail.com'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="tabular-nums">
                  <strong>Registered:</strong> {event.registeredCount} / {event.capacity} seats
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Event Overview
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Highlights */}
          {event.highlights && event.highlights.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Program Highlights & Inclusions
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {event.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Registration Block or Completed Notice */}
          <div className="pt-4 border-t border-slate-200">
            {isCompleted ? (
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-amber-900">Event Completed</h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    This event has concluded. View photo archives and recap highlights on the Showcase page.
                  </p>
                </div>
                {onNavigateToShowcase && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToShowcase(event.id);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    View in Showcase
                  </button>
                )}
              </div>
            ) : registrationResult?.success ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Registration Confirmed!</h4>
                <p className="text-xs text-emerald-800">
                  A confirmation email has been logged. Please save your ticket pass:
                </p>
                <div className="inline-block px-4 py-2 bg-white border border-emerald-300 rounded-md font-mono text-sm font-bold text-emerald-950 mt-1">
                  {registrationResult.ticketCode}
                </div>
                <p className="text-[11px] text-emerald-700">
                  Organizer contact: robokalam@gmail.com
                </p>
              </div>
            ) : isRegistering ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 bg-slate-50 p-5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Confirm Event Registration
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>

                {registrationResult?.error && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{registrationResult.error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    Complete Registration
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  <span>Seats: <strong className="text-slate-800">{event.capacity - event.registeredCount} remaining</strong></span>
                  <span className="mx-2">·</span>
                  <span>Free registration</span>
                </div>

                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => setIsRegistering(true)}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  {isFull ? 'Event Fully Booked' : 'Register for this Event'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
