import React from 'react';
import { EventItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { ImageSlot } from '../components/common/ImageSlot';
import { FOUNDERS_DATA } from '../data/initialData';
import { Calendar, MapPin, ArrowRight, CheckCircle, Sparkles, Award, Cpu, Mic, Users } from 'lucide-react';

interface HomePageProps {
  events: EventItem[];
  onNavigate: (page: string, params?: any) => void;
  onSelectEvent: (event: EventItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  events,
  onNavigate,
  onSelectEvent
}) => {
  const { isAdmin } = useAuth();
  const upcomingEvents = events.filter(e => e.status === 'upcoming').slice(0, 3);
  const completedHighlights = events.filter(e => e.status === 'completed').slice(0, 2);

  return (
    <div className="space-y-20 pb-16">
      {/* ========================================================================= */}
      {/* HERO SECTION — Strong, stylish, human-crafted design                      */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-800">
        {/* Subtle geometric pattern & gradient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>By Robokalam Technologies · Hanumkonda</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-balance">
                Empowering Youth & Innovators Through Purpose-Driven Events.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                EventKalam is the unified event platform connecting technical bootcamps, open-mic ideathons, and community robotics workshops. Browse live sessions, secure your registration pass, and explore completed milestones.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onNavigate('events')}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Register Free Account</span>
                </button>
                <button
                  onClick={() => onNavigate('showcase')}
                  className="px-4 py-3.5 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  Past Showcase
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
                <div>
                  <span className="text-lg font-bold text-white block tabular-nums">10,000+</span>
                  <span className="text-[11px] text-slate-400">Target Skilling Reach</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-white block">Robokalam</span>
                  <span className="text-[11px] text-slate-400">Innovation Hub</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-white block">Verified</span>
                  <span className="text-[11px] text-slate-400">Event Certifications</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/80 rounded-xl border border-slate-700/80 p-5 shadow-2xl backdrop-blur-xs space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700/60 pb-3">
                  <span className="font-semibold text-slate-200">Featured Milestone</span>
                  <span className="text-indigo-400 font-medium">Showcase Event</span>
                </div>

                <div className="rounded-lg overflow-hidden border border-slate-700">
                  <ImageSlot
                    src=""
                    alt="Warangal Open Mic Showcase"
                    aspectRatio="video"
                    label="Warangal Open Mic — Rooftop Arena"
                    allowUpload={isAdmin}
                  />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    Warangal Open Mic — Great Ideas Build Tomorrow
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      Sep 30, 2026
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      Hanumkonda
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-2">
                    Young engineers, innovators, and creators gathered on the open rooftop to exchange startup pitches and community stories.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-700/60">
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Conducted Successfully
                  </span>
                  <button
                    onClick={() => onNavigate('showcase')}
                    className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    View Photos & Media →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* UPCOMING EVENTS SECTION                                                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
              Live & Scheduled Sessions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Upcoming Events
            </h2>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Events ({events.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative">
                  <ImageSlot
                    src={evt.imageUrl}
                    alt={evt.title}
                    aspectRatio="video"
                    label={evt.title}
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-sm">
                    {evt.category}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="tabular-nums font-medium">{evt.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{evt.time}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  <strong className="text-slate-800">{evt.capacity - evt.registeredCount}</strong> spots open
                </span>
                <button
                  onClick={() => onSelectEvent(evt)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* WHY EVENTKALAM? — Concrete Platform Pillars                                */}
      {/* ========================================================================= */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
              Purpose & Mission
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Why EventKalam?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Built by Robokalam Technologies to bridge practical technical training, youth entrepreneurship, and community learning in one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                01. Hands-on Robotics & IoT
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Direct access to laboratory hardware, sensor kits, microcontroller programming, and industrial automation workshops guided by Robokalam engineers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                02. Open Mic & Community Ideas
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Open stage arenas where students, startup founders, and thinkers present early concepts, spoken stories, and creative tech collaborations without barriers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                03. Verified Certification
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Every event participant receives official verification, ticket codes, and authenticated workshop certificates recognizing skills and attendance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* EVENT HIGHLIGHTS & SHOWCASE PREVIEW                                      */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
              Past Accomplishments
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Completed Event Highlights
            </h2>
          </div>
          <button
            onClick={() => onNavigate('showcase')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Explore Full Showcase Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {completedHighlights.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-colors flex flex-col"
            >
              <ImageSlot
                src={evt.imageUrl}
                alt={evt.title}
                aspectRatio="video"
                label={evt.title}
              />
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-mono">
                    <span>{evt.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{evt.venue.split(',')[0]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-600 font-semibold uppercase">{evt.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    {evt.highlights?.length || 3} verified program highlights
                  </span>
                  <button
                    onClick={() => onNavigate('showcase', { selectedEventId: evt.id })}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    View Photos & Media →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CALL TO ACTION                                                           */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">
              Join The Community
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ready to participate in the next Hanumkonda tech event?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create your EventKalam account today to reserve seats, view your tickets, and stay notified about upcoming Robokalam workshops.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors cursor-pointer text-center"
            >
              Sign Up For Free
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-6 py-3 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors cursor-pointer text-center"
            >
              Contact Robokalam
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
