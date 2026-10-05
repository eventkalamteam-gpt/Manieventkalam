import React, { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { Mail, MapPin, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { FOUNDERS_DATA } from '../data/initialData';

export const ContactPage: React.FC = () => {
  const { submitContactMessage } = useEvents();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await submitContactMessage(name, email, subject, message);
      if (res.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setStatus('error');
        setErrorMsg(res.error || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Unexpected network error. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
          Direct Inquiries & Support
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Contact EventKalam & Robokalam
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          Get in touch with the Robokalam organizing team regarding event registrations, institutional workshop partnerships, or general inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Contact Information Dossier */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="text-[11px] font-mono text-indigo-600 font-semibold uppercase block mb-1">
                Main Organization
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Robokalam Technologies
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Technology training, robotics initiatives, and event management.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-semibold">Location Address</strong>
                  <span className="text-slate-600">Hanumkonda, Telangana</span>
                  <span className="block text-slate-500 font-mono">PIN: 506001</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-semibold">Official Email</strong>
                  <a
                    href="mailto:robokalam@gmail.com"
                    className="text-indigo-600 hover:text-indigo-800 underline font-medium"
                  >
                    robokalam@gmail.com
                  </a>
                  <span className="block text-[11px] text-slate-400">Response within 24 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-slate-900 font-semibold">Telephone</strong>
                  <span className="font-mono text-slate-700">+91 98765 43210</span>
                  <span className="block text-[11px] text-amber-600 font-medium">
                    (Temporary placeholder number — official phone will be updated)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-800 mb-2">Social Channels</h4>
              <div className="flex gap-4 text-xs text-indigo-600">
                <a href={FOUNDERS_DATA.company.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Twitter / X
                </a>
                <span className="text-slate-300">·</span>
                <a href={FOUNDERS_DATA.company.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Facebook
                </a>
                <span className="text-slate-300">·</span>
                <a href={FOUNDERS_DATA.company.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-7 bg-white p-7 sm:p-8 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Send an Inquiry to Robokalam
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Fill in your details below. Your message will be routed directly to the organizing team.
          </p>

          {status === 'success' ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">Message Received</h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Thank you for contacting Robokalam. We have logged your inquiry and sent an acknowledgment to your email. Our team will review and reply promptly.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Workshop Registration / Institutional Partnership"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your query or proposal in detail..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {status === 'submitting' ? 'Submitting Message...' : 'Submit Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
