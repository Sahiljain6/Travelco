import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];

const statusStyles = {
  new: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-800",
  resolved: "bg-emerald-50 text-emerald-700",
};

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter === "all" ? {} : { status: filter };
      const response = await axios.get("/contact-messages", { params });
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.response?.status === 403
        ? "Administrator access is required to view contact messages."
        : requestError.response?.data?.message || "Could not load contact messages. Check the backend connection and sign-in status.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const changeStatus = async (id, status) => {
    setSavingId(id);
    setError("");
    setNotice("");
    try {
      await axios.patch(`/contact-messages/${id}`, { status });
      setNotice("Message status updated.");
      await loadMessages();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update the message status.");
    } finally {
      setSavingId("");
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    setError("");
    setNotice("");
    try {
      await axios.delete(`/contact-messages/${message._id}`);
      setMessages((current) => current.filter((item) => item._id !== message._id));
      setNotice("Message deleted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete this message.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Admin inbox</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Contact messages</h1>
            <p className="mt-2 text-slate-600">Messages submitted through the public Contact us form.</p>
          </div>
          <label className="text-sm font-semibold text-slate-700">
            Filter
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="all">All messages</option>
              {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </label>
        </div>

        {error && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
        {notice && <p role="status" className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{notice}</p>}

        {loading ? (
          <p className="mt-8 rounded-xl border bg-white p-8 text-slate-600">Loading contact messages…</p>
        ) : messages.length === 0 ? (
          <section className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-slate-900">No contact messages found</h2>
            <p className="mt-2 text-slate-600">New submissions will appear here once a visitor sends the Contact us form.</p>
            <button type="button" onClick={loadMessages} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Refresh inbox</button>
          </section>
        ) : (
          <section className="mt-8 space-y-4">
            <p className="text-sm text-slate-500">{messages.length} message(s)</p>
            {messages.map((message) => (
              <article key={message._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-bold text-slate-950">{message.subject}</h2>
                    <p className="mt-1 text-sm text-slate-600">{message.name} · <a className="text-blue-700 underline" href={`mailto:${message.email}`}>{message.email}</a></p>
                    <p className="mt-1 text-xs text-slate-400">{message.createdAt ? new Date(message.createdAt).toLocaleString() : "Date unavailable"}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusStyles[message.status] || "bg-slate-100 text-slate-700"}`}>
                    {STATUS_OPTIONS.find((item) => item.value === message.status)?.label || message.status}
                  </span>
                </div>
                <p className="mt-5 whitespace-pre-wrap break-words leading-7 text-slate-700">{message.message}</p>
                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Update status
                    <select value={message.status} disabled={savingId === message._id} onChange={(event) => changeStatus(message._id, event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
                      {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Reply by email</a>
                    <button type="button" onClick={() => deleteMessage(message)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default ContactMessages;
