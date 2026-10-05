import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { EventItem, EventStatus, EventMediaItem } from '../types';
import { ImageUploadModal } from '../components/common/ImageUploadModal';
import { ImageSlot } from '../components/common/ImageSlot';
import { supabaseConfig, updateSupabaseRuntimeCredentials, uploadEventAsset } from '../lib/supabase';
import {
  Shield, Calendar, Users, Ticket, CheckCircle2, AlertCircle, Plus, Edit,
  Trash2, Search, Download, Upload, Video, Mail, Database, Send, ExternalLink,
  Lock, RefreshCw, XCircle, FileText
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectEvent: (event: EventItem) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onSelectEvent
}) => {
  const { currentUser, isAdmin, allUsers, toggleUserStatus, logout } = useAuth();
  const {
    events,
    registrations,
    media,
    contactMessages,
    emailNotifications,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
    updateRegistrationStatus,
    addMediaItem,
    deleteMediaItem,
    markMessageRead,
    resendNotification,
    clearNotifications
  } = useEvents();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'events' | 'registrations' | 'showcase' | 'users' | 'messages' | 'emails' | 'database'
  >('overview');

  // Event modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states for Create/Edit
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formVenue, setFormVenue] = useState('Robokalam Innovation Centre, Hanumkonda, Telangana 506001');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState<EventItem['category']>('AI & Tech');
  const [formStatus, setFormStatus] = useState<EventStatus>('upcoming');
  const [formCapacity, setFormCapacity] = useState(100);
  const [formContactEmail, setFormContactEmail] = useState('robokalam@gmail.com');
  const [formHighlights, setFormHighlights] = useState('');
  const [formError, setFormError] = useState('');

  // Search & Filter in Registrations
  const [regSearch, setRegSearch] = useState('');
  const [regEventFilter, setRegEventFilter] = useState('all');

  // Media addition modal
  const [mediaModalEventId, setMediaModalEventId] = useState<string>('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaVideoUrl, setMediaVideoUrl] = useState('');
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);

  // Supabase runtime form
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.key || '');
  const [supabaseSavedMsg, setSupabaseSavedMsg] = useState(false);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Restricted Administrator Area</h2>
        <p className="text-xs text-slate-600">
          You must be logged in as an authorized administrator to view or manage EventKalam events.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          {currentUser ? (
            <button
              onClick={() => onNavigate('user-dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg cursor-pointer"
            >
              Return to My Dashboard
            </button>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  // Analytics Metrics
  const totalEvents = events.length;
  const upcomingCount = events.filter((e) => e.status === 'upcoming').length;
  const completedCount = events.filter((e) => e.status === 'completed').length;
  const ongoingCount = events.filter((e) => e.status === 'ongoing').length;
  const totalRegistrations = registrations.length;
  const totalUsers = allUsers.length;
  const unreadMessagesCount = contactMessages.filter((m) => m.status === 'unread').length;

  const openCreateModal = () => {
    const nextNum = totalEvents + 1;
    setFormId(`EK-2026-00${nextNum}`);
    setFormTitle('');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('10:00 AM - 1:00 PM');
    setFormVenue('Robokalam Innovation Centre, Hanumkonda, Telangana 506001');
    setFormImageUrl('');
    setFormCategory('AI & Tech');
    setFormStatus('upcoming');
    setFormCapacity(100);
    setFormContactEmail('robokalam@gmail.com');
    setFormHighlights('Hands-on laboratory access\nCertificate of participation by Robokalam');
    setFormError('');
    setEditingEvent(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setFormId(event.id);
    setFormTitle(event.title);
    setFormDescription(event.description);
    setFormDate(event.date);
    setFormTime(event.time);
    setFormVenue(event.venue);
    setFormImageUrl(event.imageUrl);
    setFormCategory(event.category);
    setFormStatus(event.status);
    setFormCapacity(event.capacity);
    setFormContactEmail(event.contactEmail || 'robokalam@gmail.com');
    setFormHighlights((event.highlights || []).join('\n'));
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const highlightsArr = formHighlights
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingEvent) {
      const res = await updateEvent(editingEvent.id, {
        title: formTitle,
        description: formDescription,
        date: formDate,
        time: formTime,
        venue: formVenue,
        imageUrl: formImageUrl,
        category: formCategory,
        status: formStatus,
        capacity: Number(formCapacity),
        contactEmail: formContactEmail || 'robokalam@gmail.com',
        highlights: highlightsArr
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to update event.');
        return;
      }
    } else {
      const res = await createEvent({
        id: formId.trim(),
        title: formTitle.trim(),
        description: formDescription.trim(),
        date: formDate,
        time: formTime,
        venue: formVenue.trim(),
        imageUrl: formImageUrl,
        category: formCategory,
        status: formStatus,
        capacity: Number(formCapacity),
        contactEmail: formContactEmail.trim() || 'robokalam@gmail.com',
        highlights: highlightsArr
      });

      if (!res.success) {
        setFormError(res.error || 'Failed to create event.');
        return;
      }
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteEventConfirm = async (id: string) => {
    await deleteEvent(id);
    setDeleteConfirmId(null);
  };

  // CSV Export for Registrations
  const exportRegistrationsCSV = () => {
    const headers = ['Registration ID', 'Event ID', 'Event Title', 'Attendee Name', 'Email', 'Phone', 'Ticket Code', 'Status', 'Date'];
    const rows = registrations.map((r) => [
      r.id,
      r.eventId,
      `"${r.eventTitle.replace(/"/g, '""')}"`,
      `"${r.userName.replace(/"/g, '""')}"`,
      r.userEmail,
      r.userPhone,
      r.ticketCode,
      r.status,
      r.registrationDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eventkalam_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered registrations
  const filteredRegs = registrations.filter((r) => {
    const matchSearch =
      r.userName.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.ticketCode.toLowerCase().includes(regSearch.toLowerCase()) ||
      r.eventId.toLowerCase().includes(regSearch.toLowerCase());
    const matchEvent = regEventFilter === 'all' || r.eventId === regEventFilter;
    return matchSearch && matchEvent;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">EventKalam Management Console</span>
            <span className="text-[10px] font-mono text-amber-400 border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 rounded-sm">
              ADMINISTRATOR
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Organization: Robokalam Technologies · Hanumkonda, Telangana · robokalam@gmail.com
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Event Management ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'registrations'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Registrations ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab('showcase')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'showcase'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Showcase Media ({media.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Users ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'messages'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Contact Inquiries</span>
          {unreadMessagesCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
              {unreadMessagesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'emails'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Email Automation ({emailNotifications.length})
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'database'
              ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase / Database</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW METRICS                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Events
              </span>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">{totalEvents}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Scheduled & past</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Upcoming Events
              </span>
              <p className="text-2xl font-extrabold text-indigo-600 tabular-nums mt-1">{upcomingCount}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Open for registration</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Completed Events
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 tabular-nums mt-1">{completedCount}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">In Showcase archive</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Registrations
              </span>
              <p className="text-2xl font-extrabold text-amber-700 tabular-nums mt-1">{totalRegistrations}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Issued attendee tickets</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Registered Users
              </span>
              <p className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">{totalUsers}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Active user profiles</span>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Registrations</h3>
                <button
                  onClick={() => setActiveTab('registrations')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {registrations.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50">
                    <div>
                      <strong className="text-slate-900 block">{r.userName}</strong>
                      <span className="text-slate-500">{r.eventTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-indigo-600 font-semibold">{r.ticketCode}</span>
                      <span className="text-[10px] text-slate-400 block">{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Showcase Milestones</h3>
                <button
                  onClick={() => setActiveTab('showcase')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Manage Showcase →
                </button>
              </div>

              <div className="space-y-3">
                {events.filter((e) => e.status === 'completed').map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50">
                    <div>
                      <strong className="text-slate-900 block">{e.title}</strong>
                      <span className="text-slate-500">{e.date} · {e.venue.split(',')[0]}</span>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs font-semibold">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EVENT MANAGEMENT (Create, Update, Delete)                          */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Event Directory</h3>
              <p className="text-xs text-slate-500">
                Manage, publish, update and archive events for EventKalam.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Event</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Event ID & Title</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {evt.imageUrl ? (
                              <img src={evt.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-mono">
                                Photo
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-mono text-indigo-700 font-bold block">{evt.id}</span>
                            <span className="font-semibold text-slate-900 block max-w-xs truncate">{evt.title}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {evt.date}
                        <span className="block text-[11px] text-slate-400">{evt.time}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {evt.venue}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {evt.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-sm ${
                            evt.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : evt.status === 'ongoing'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-slate-700">
                        {evt.registeredCount} / {evt.capacity}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(evt)}
                            title="Edit Event"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(evt.id)}
                            title="Delete Event"
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGISTRATIONS MANAGEMENT                                           */}
      {/* ========================================================================= */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registered Attendees</h3>
              <p className="text-xs text-slate-500">
                View all user registrations, search by pass code, or export roster to CSV.
              </p>
            </div>
            <button
              onClick={exportRegistrationsCSV}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Roster (CSV)</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by attendee name, email, ticket code..."
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <select
              value={regEventFilter}
              onChange={(e) => setRegEventFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} — {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Ticket Pass ID</th>
                    <th className="py-3 px-4">Attendee Name</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {reg.ticketCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {reg.userName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{reg.userEmail}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{reg.userPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                        <span className="font-mono text-slate-400 mr-1.5">{reg.eventId}</span>
                        {reg.eventTitle}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-sm ${
                            reg.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={reg.status}
                          onChange={(e) =>
                            updateRegistrationStatus(reg.id, e.target.value as any)
                          }
                          className="text-[11px] px-2 py-1 border border-slate-300 rounded-md bg-white"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SHOWCASE MEDIA MANAGEMENT                                          */}
      {/* ========================================================================= */}
      {activeTab === 'showcase' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Showcase Archive Media</h3>
              <p className="text-xs text-slate-500">
                Upload real photos and video links for completed events (Warangal Open Mic, AI for ALL initiative, etc.).
              </p>
            </div>
          </div>

          {/* Quick Upload Toolbar */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Attach Real Media to Completed Event
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Target Event</label>
                <select
                  value={mediaModalEventId}
                  onChange={(e) => setMediaModalEventId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Select completed event...</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.id} — {e.title} ({e.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Caption / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Rooftop stage session / Team launch"
                  value={mediaCaption}
                  onChange={(e) => setMediaCaption(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  disabled={!mediaModalEventId}
                  onClick={() => setIsPhotoUploadOpen(true)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </button>
              </div>
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="aspect-video bg-slate-100 relative">
                  {item.fileUrl ? (
                    <img src={item.fileUrl} alt={item.caption} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                      Photo Placeholder
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-[10px] px-2 py-0.5 rounded-sm">
                    {item.eventId}
                  </span>
                </div>
                <div className="p-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.caption}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{item.uploadedAt.split('T')[0]}</span>
                  </div>
                  <button
                    onClick={() => deleteMediaItem(item.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: USER MANAGEMENT (Privacy Protected - No Raw Passwords)             */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900">User Account Directory</h3>
            <p className="text-xs text-slate-500">
              In accordance with security requirements, passwords are encrypted and never visible to administrators.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">User ID & Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{u.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{u.id}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{u.email}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{u.phone || '—'}</td>
                    <td className="py-3 px-4 font-mono uppercase font-bold text-indigo-700">{u.role}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONTACT INQUIRIES                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Inbound Contact Messages</h3>
            <p className="text-xs text-slate-500">
              Direct inquiries submitted from the Contact Us page.
            </p>
          </div>

          <div className="space-y-3">
            {contactMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-5 rounded-xl border transition-colors ${
                  msg.status === 'unread'
                    ? 'bg-indigo-50/40 border-indigo-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">{msg.name}</span>
                      <span className="text-xs text-slate-500">({msg.email})</span>
                      {msg.status === 'unread' && (
                        <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-xs font-semibold">
                          NEW
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800">{msg.subject}</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                      {msg.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                      Received: {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {msg.status === 'unread' && (
                    <button
                      onClick={() => markMessageRead(msg.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 cursor-pointer"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: EMAIL AUTOMATION DISPATCH LOGS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Automated Notification Activity</h3>
              <p className="text-xs text-slate-500">
                Automated logs for: New Event Announcements, Event Details Updates, and Registration Confirmation Tickets.
              </p>
            </div>
            {emailNotifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-slate-500 hover:text-red-600 cursor-pointer"
              >
                Clear Log History
              </button>
            )}
          </div>

          <div className="space-y-3">
            {emailNotifications.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                No email notifications dispatched yet. As you create events or users register, logs will appear here.
              </div>
            ) : (
              emailNotifications.map((eml) => (
                <div key={eml.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600 font-bold uppercase text-[10px] bg-indigo-50 px-2 py-0.5 rounded-sm">
                        {eml.type}
                      </span>
                      <strong className="text-slate-900">{eml.subject}</strong>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(eml.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-600">
                    Recipient: <strong className="text-slate-800">{eml.recipientName}</strong> ({eml.recipientEmail})
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200/80 text-[11px] text-slate-700 font-mono whitespace-pre-line">
                    {eml.body}
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => resendNotification(eml.id)}
                      className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Resend Notification
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: DATABASE & SUPABASE CONFIGURATION                                  */}
      {/* ========================================================================= */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Database & Deployment Setup</h3>
            <p className="text-xs text-slate-500">
              EventKalam is architected to seamlessly connect with Supabase PostgreSQL and deploy to Hostinger or Render.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Supabase Connection Box */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Supabase Status: {supabaseConfig.isConfigured ? (
                    <span className="text-emerald-600 font-semibold text-xs">CONNECTED</span>
                  ) : (
                    <span className="text-amber-600 font-semibold text-xs">LOCAL PERSISTENCE STORE</span>
                  )}
                </h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                You can enter your Supabase project credentials below or set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Project URL</label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Anon Public Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      updateSupabaseRuntimeCredentials(supabaseUrlInput, supabaseKeyInput);
                      setSupabaseSavedMsg(true);
                      setTimeout(() => setSupabaseSavedMsg(false), 3000);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Save & Reconnect Supabase
                  </button>
                  {supabaseSavedMsg && (
                    <span className="text-xs text-emerald-600 font-medium">Saved! Refreshing...</span>
                  )}
                </div>
              </div>
            </div>

            {/* SQL Migration Script Box */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                SQL Migration & Row-Level Security (RLS) Ready
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The complete SQL migration script is stored at <code>/supabase/migrations/20261003_eventkalam_schema.sql</code>.
                If authenticated users are unable to read their assigned role, run the RLS policy from <code>/supabase/fix_profiles_rls.sql</code>:
              </p>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                <pre>{`ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);`}</pre>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li><code>public.profiles</code> with role validation ('user', 'admin')</li>
                <li><code>public.events</code> with UUIDs, status, and contact emails</li>
                <li><code>public.registrations</code> with ticket codes</li>
                <li><code>public.event_media</code> for Showcase photos/videos</li>
                <li>Row-Level Security (RLS) policies enforcing admin-only mutations</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT EVENT                                                */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h3 className="text-base font-bold text-slate-900">
                {editingEvent ? `Edit Event: ${editingEvent.id}` : 'Create New Event'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Event ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingEvent}
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="e.g. EK-2026-006"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono bg-slate-50 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Workshops">Workshops</option>
                    <option value="Open Mic">Open Mic</option>
                    <option value="AI & Tech">AI & Tech</option>
                    <option value="Hackathons">Hackathons</option>
                    <option value="Conferences">Conferences</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Robokalam 21st Century Robotics Bootcamp"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="10:00 AM - 1:00 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Seat Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Venue / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  placeholder="e.g. Robokalam Innovation Centre, Hanumkonda, Telangana 506001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formContactEmail}
                    onChange={(e) => setFormContactEmail(e.target.value)}
                    placeholder="robokalam@gmail.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Event Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed (Showcase)</option>
                  </select>
                </div>
              </div>

              {/* Event Image Attachment Slot */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-medium">Event Photograph</label>
                  <span className="text-[11px] text-slate-400">Real photo upload</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Upload real image or enter image URL..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPhotoUploadOpen(true)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                  >
                    Upload File
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide comprehensive details about this event..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-y"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Highlights (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  placeholder="Certificate of participation&#10;Hardware kit provided"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {editingEvent ? 'Save Event Changes' : 'Create & Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200">
            <Trash2 className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Delete Event Permanently?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete event <strong>{deleteConfirmId}</strong>? All associated attendee registrations will also be removed.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEventConfirm(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Yes, Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PHOTO UPLOAD FOR EVENTS OR SHOWCASE */}
      <ImageUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        onImageUploaded={(url) => {
          if (isCreateModalOpen) {
            setFormImageUrl(url);
          } else if (mediaModalEventId) {
            addMediaItem({
              eventId: mediaModalEventId,
              mediaType: 'photo',
              fileUrl: url,
              caption: mediaCaption || 'Event showcase photograph'
            });
            setMediaCaption('');
          }
        }}
        title="Upload Real Image"
        subtitle="Select the real event photo from your files."
      />
    </div>
  );
};
