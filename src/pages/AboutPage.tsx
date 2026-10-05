import React, { useState } from 'react';
import { FOUNDERS_DATA } from '../data/initialData';
import { ImageSlot } from '../components/common/ImageSlot';
import { useAuth } from '../context/AuthContext';
import { Building2, MapPin, Mail, Award, CheckCircle, ExternalLink, Edit3, Save } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { isAdmin } = useAuth();

  // Founder and Co-founder data state (with edit capability for admin)
  const [founderData, setFounderData] = useState(FOUNDERS_DATA.founder);
  const [coFounderData, setCoFounderData] = useState(FOUNDERS_DATA.coFounder);
  const [editingFounder, setEditingFounder] = useState(false);
  const [editingCoFounder, setEditingCoFounder] = useState(false);

  // Team placeholders ready for real team information
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'tm-1',
      name: 'Technical Operations Lead',
      role: 'Hardware & IoT Lead',
      bio: 'Coordinates laboratory apparatus, robotics kits, and technical mentorship sessions during student bootcamps.',
      photoUrl: ''
    },
    {
      id: 'tm-2',
      name: 'Event Coordinator',
      role: 'Community & Event Outreach',
      bio: 'Manages venue arrangements, registration workflows, and speaker hospitality for EventKalam sessions.',
      photoUrl: ''
    },
    {
      id: 'tm-3',
      name: 'Training & Outreach Specialist',
      role: 'Student Engagement',
      bio: 'Liaises with colleges, engineering institutions, and partner organizations for skill development programs.',
      photoUrl: ''
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. Header & What EventKalam Is */}
      <div className="border-b border-slate-200 pb-8 space-y-3">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
          Platform Identity & Purpose
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          About EventKalam
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          EventKalam is a dedicated event-management and showcase platform created to organize, document, and manage technology workshops, community ideations, and youth skill-enablement programs.
        </p>
      </div>

      {/* 2. Problem Solved & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            The Purpose
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Bridging Real-World Practical Learning
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Engineering students, young professionals, and innovators often lack direct exposure to practical laboratory hardware, open-mic speaking platforms, and authenticated workshops in regional hubs.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            EventKalam provides a streamlined system where participants can discover genuine hands-on sessions, secure verified passes, and access transparent archives of past events with real photographs and outcomes.
          </p>
        </div>

        <div className="bg-slate-50 p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Associated Organization
          </span>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Robokalam Technologies
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            EventKalam is proudly established and powered by <strong>Robokalam Technologies</strong>, an innovation and training initiative based in Hanumkonda, Telangana.
          </p>
          <div className="pt-2 text-xs text-slate-700 space-y-1.5 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Hanumkonda, Telangana – PIN: 506001</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
              <a href="mailto:robokalam@gmail.com" className="text-indigo-600 underline">
                robokalam@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Leadership: Founder & Co-Founder */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
              Organizational Leadership
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Founders of Robokalam
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified leadership profiles. Photographs and biographies provided directly by founders.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Founder: Mohammed Sajeed */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-36 h-44 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-xs">
                <ImageSlot
                  src={founderData.photoUrl}
                  alt="Mohammed Sajeed — Founder"
                  aspectRatio="portrait"
                  variant="person"
                  label="Mohammed Sajeed Photo"
                  allowUpload={isAdmin}
                  onImageChange={(newUrl) => setFounderData({ ...founderData, photoUrl: newUrl })}
                />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-indigo-700 font-semibold uppercase">
                    Founder
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingFounder(!editingFounder)}
                      className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      {editingFounder ? 'Done' : 'Edit Bio'}
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {founderData.name}
                </h3>
                <p className="text-xs font-medium text-slate-600">
                  {founderData.role}
                </p>

                {editingFounder ? (
                  <textarea
                    rows={4}
                    value={founderData.bio}
                    onChange={(e) => setFounderData({ ...founderData, bio: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {founderData.bio}
                  </p>
                )}

                <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>robokalam@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Co-Founder: Rajashekhar Kota */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-36 h-44 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-xs">
                <ImageSlot
                  src={coFounderData.photoUrl}
                  alt="Rajashekhar Kota — Co-Founder"
                  aspectRatio="portrait"
                  variant="person"
                  label="Rajashekhar Kota Photo"
                  allowUpload={isAdmin}
                  onImageChange={(newUrl) => setCoFounderData({ ...coFounderData, photoUrl: newUrl })}
                />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-indigo-700 font-semibold uppercase">
                    Co-Founder
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingCoFounder(!editingCoFounder)}
                      className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      {editingCoFounder ? 'Done' : 'Edit Bio'}
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  {coFounderData.name}
                </h3>
                <p className="text-xs font-medium text-slate-600">
                  {coFounderData.role}
                </p>

                {editingCoFounder ? (
                  <textarea
                    rows={4}
                    value={coFounderData.bio}
                    onChange={(e) => setCoFounderData({ ...coFounderData, bio: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {coFounderData.bio}
                  </p>
                )}

                <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>robokalam@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Team Section (Real editable team cards) */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
            Operations & Mentorship
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Our Team
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Photographs and information for team members can be updated directly with real photos provided by the organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member, idx) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs"
            >
              <div className="w-full h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <ImageSlot
                  src={member.photoUrl}
                  alt={member.name}
                  aspectRatio="auto"
                  variant="person"
                  label={`${member.role} Photo`}
                  allowUpload={isAdmin}
                  onImageChange={(url) => {
                    const updated = [...teamMembers];
                    updated[idx].photoUrl = url;
                    setTeamMembers(updated);
                  }}
                />
              </div>

              <div>
                <span className="text-[11px] font-mono text-indigo-600 uppercase font-semibold">
                  {member.role}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  {member.name}
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
