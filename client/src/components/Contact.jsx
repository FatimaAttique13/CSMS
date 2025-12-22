'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Factory, Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: integrate API later
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="pt-32 pb-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Get In <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Touch</span></h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">We're here to help with orders, partnerships, and platform support. Reach out anytime.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><Factory className="h-6 w-6 text-blue-600"/> CSMS HQ</h2>
              <p className="flex items-start gap-3 text-gray-600 mb-3"><MapPin className="h-5 w-5 text-blue-600 mt-1"/> King Abdullah Road, Jeddah 21589, Saudi Arabia</p>
              <p className="flex items-center gap-3 text-gray-600 mb-2"><Phone className="h-5 w-5 text-blue-600"/> +966 55 123 4567</p>
              <p className="flex items-center gap-3 text-gray-600 mb-6"><Mail className="h-5 w-5 text-blue-600"/> support@csms.io</p>
              <p className="flex items-center gap-3 text-gray-600 text-sm"><Clock className="h-5 w-5 text-blue-600"/> Mon - Sat: 8:00 AM - 8:00 PM</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-black mb-2">Become a Partner</h3>
              <p className="text-blue-100 text-sm mb-5">Are you a supplier or logistics provider? Join our growth network.</p>
              <Link href="/about" className="bg-white text-blue-700 font-bold px-6 py-3 rounded-2xl shadow hover:shadow-lg hover:scale-105 transition-all inline-block">Learn More</Link>
            </div>
          </div>

          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 space-y-6">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Send a Message</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={5} required className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
                <Send className="h-5 w-5" /> {submitted ? 'Message Sent!' : 'Send Message'}
              </button>
              {submitted && <p className="text-green-600 font-medium text-center">Thanks! We'll get back to you shortly.</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
