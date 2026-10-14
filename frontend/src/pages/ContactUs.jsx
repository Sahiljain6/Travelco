import React, { useState } from "react";
import axios from "axios";

const INITIAL_FORM = { name: "", email: "", subject: "", message: "" };

const ContactUs = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("Please complete all fields before sending your message.");
      return;
    }
    setSending(true);
    try {
      const response = await axios.post("/contact-messages", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSuccess(response.data?.message || "Your message has been sent to Travelco support.");
      setForm(INITIAL_FORM);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "We couldn't send your message. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-8">
      <section className="mx-auto grid max-w-6xl gap-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">We're here to help</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Contact Travelco</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Send our support team a question about a destination, a reservation request, a property listing, or your Travelco account. Your message will be saved securely and made available to our administrators.
          </p>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-blue-50 p-5">
              <h2 className="font-bold text-slate-900">What happens next?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">After you submit the form, you'll see a confirmation. The Travelco admin team can review your message in the Contact messages inbox and reply to the email address you provide.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-bold text-slate-900">Booking and payment note</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Travelco reservation requests do not currently collect payment. Never email card numbers or security codes.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-950">Send us a message</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-sm font-semibold text-slate-700">Your name</label>
              <input id="contact-name" name="name" type="text" required maxLength={100} value={form.name} onChange={handleChange} autoComplete="name" placeholder="Jane Smith" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block text-sm font-semibold text-slate-700">Email address</label>
              <input id="contact-email" name="email" type="email" required maxLength={254} value={form.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="contact-subject" className="mb-1 block text-sm font-semibold text-slate-700">Subject</label>
              <input id="contact-subject" name="subject" type="text" required maxLength={160} value={form.subject} onChange={handleChange} placeholder="How can we help?" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1 block text-sm font-semibold text-slate-700">Message</label>
              <textarea id="contact-message" name="message" rows={5} required maxLength={5000} value={form.message} onChange={handleChange} placeholder="Write your message here…" className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              <p className="mt-1 text-right text-xs text-slate-400">{form.message.length}/5000</p>
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {success && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</p>}
            <button type="submit" disabled={sending} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default ContactUs;
