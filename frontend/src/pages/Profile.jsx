import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import countries from "../data/countries";

const interests = ["Beaches", "Adventure", "Culture", "Food", "Nature", "Shopping", "History", "Wildlife", "Wellness", "Nightlife", "Road trips", "Photography"];
const currencies = ["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "JPY", "AED", "CHF", "NZD", "ZAR", "THB", "MYR", "IDR", "LKR", "NPR", "SAR", "CNY", "HKD"];
const languages = [
  { value: "en", label: "English" }, { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" }, { value: "fr", label: "French" },
  { value: "de", label: "German" }, { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" }, { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" }, { value: "ar", label: "Arabic" },
];
const initialForm = {
  name: "", country: "", mobile: "", preferredCurrency: "INR", preferredLanguage: "en",
  travelInterests: [], budgetRange: "flexible", travelStyle: "flexible",
  notificationPreferences: { bookingUpdates: true, tripReminders: true, productNews: false },
};
const toForm = (user) => ({
  ...initialForm,
  name: user.name || "",
  country: user.country || "",
  mobile: user.mobile || "",
  preferredCurrency: user.preferredCurrency || "INR",
  preferredLanguage: user.preferredLanguage || "en",
  travelInterests: Array.isArray(user.travelInterests) ? user.travelInterests : [],
  budgetRange: user.budgetRange || "flexible",
  travelStyle: user.travelStyle || "flexible",
  notificationPreferences: {
    ...initialForm.notificationPreferences,
    ...(user.notificationPreferences || {}),
  },
});

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
    {children}
  </label>
);
const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const Profile = () => {
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const suggestedDestination = useMemo(
    () => new URLSearchParams(location.search).get("destination") || "",
    [location.search]
  );
  const [form, setForm] = useState(initialForm);
  const [savedText, setSavedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true, state: { from: location.pathname + location.search } });
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    axios.get("auth/me")
      .then((response) => {
        if (cancelled) return;
        const data = response.data;
        dispatch({ type: "LOGIN_SUCCESS", payload: data });
        const nextForm = toForm(data);
        if (suggestedDestination && !nextForm.savedDestinations.includes(suggestedDestination)) {
          nextForm.savedDestinations = [...nextForm.savedDestinations, suggestedDestination];
          setNotice(`“${suggestedDestination}” is ready to save. Press Save profile to keep it in your list.`);
        }
        setForm(nextForm);
        setSavedText(nextForm.savedDestinations.join(", "));
        setPageError("");
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.response?.status === 401) {
          setPageError("Your sign-in session has expired. Please sign in again to manage your profile.");
        } else {
          setPageError(error.response?.data?.message || "We could not load your account details. Please refresh and try again.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?._id, navigate, location.pathname, location.search, dispatch, suggestedDestination]);

  if (!user) return <div className="min-h-[50vh] bg-slate-50" />;

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleInterest = (interest) => {
    setForm((current) => {
      const chosen = current.travelInterests.includes(interest);
      if (!chosen && current.travelInterests.length >= 10) {
        setNotice("Choose up to 10 travel interests.");
        return current;
      }
      return {
        ...current,
        travelInterests: chosen
          ? current.travelInterests.filter((item) => item !== interest)
          : [...current.travelInterests, interest],
      };
    });
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setPageError("");
    setNotice("");
    try {
      const savedDestinations = [...new Set(savedText.split(",").map((value) => value.trim()).filter(Boolean))].slice(0, 20);
      const response = await axios.patch("auth/profile", {
        ...form,
        savedDestinations,
      });
      dispatch({ type: "LOGIN_SUCCESS", payload: response.data });
      setForm(toForm(response.data));
      setSavedText((response.data.savedDestinations || []).join(", "));
      setNotice("Your profile and travel preferences have been saved.");
    } catch (error) {
      setPageError(error.response?.data?.message || "We could not save those changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("The new password and confirmation do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage("Use at least 8 characters for your new password.");
      return;
    }
    setPasswordSaving(true);
    try {
      const response = await axios.post("auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage(response.data.message || "Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || "We could not change your password. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const memberSince = user.createdAt && !Number.isNaN(new Date(user.createdAt).getTime())
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "Travelco member";
  const roleLabel = (user.type || "traveler").replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <section className="bg-slate-950 px-4 py-10 text-white sm:px-8 sm:py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <img src={user.img || user.pic || "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"} alt="" className="h-20 w-20 rounded-2xl border border-white/20 object-cover" />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Your Travelco</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome, {user.name || "traveler"}</h1>
              <p className="mt-2 text-slate-300">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={"rounded-full px-3 py-2 text-sm font-semibold " + (user.emailVerified ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200")}>
              {user.emailVerified ? "✓ Email verified" : "Email verification needed"}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-slate-200">{roleLabel}</span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 pt-8 sm:px-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Account overview</p>
          <div className="mt-4 space-y-4">
            <div><p className="text-sm text-slate-500">Member since</p><p className="mt-1 font-semibold text-slate-900">{memberSince}</p></div>
            <div><p className="text-sm text-slate-500">Home country</p><p className="mt-1 font-semibold text-slate-900">{user.country || "Not set"}</p></div>
            <div><p className="text-sm text-slate-500">Preferred currency</p><p className="mt-1 font-semibold text-slate-900">{form.preferredCurrency}</p></div>
            <div><p className="text-sm text-slate-500">Saved destinations</p><p className="mt-1 font-semibold text-slate-900">{savedText.split(",").map((item) => item.trim()).filter(Boolean).length}</p></div>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <Link to="/explore" className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-100">
              Explore destinations <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Trip shortcuts</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/my-reservations" className="text-slate-700 hover:text-blue-700 hover:underline">My activity reservations</Link>
              <Link to="/train/MyTickets" className="text-slate-700 hover:text-blue-700 hover:underline">My train tickets</Link>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm">
            <Link to="/terms" className="text-slate-600 hover:text-blue-700 hover:underline">Terms &amp; Conditions</Link>
            <Link to="/privacy" className="text-slate-600 hover:text-blue-700 hover:underline">Privacy Policy</Link>
          </div>
        </aside>

        <div className="min-w-0 space-y-7">
          {pageError && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{pageError}</div>}
          {notice && <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
          {loading ? (
            <div className="space-y-4"><div className="h-48 animate-pulse rounded-3xl bg-slate-200" /><div className="h-64 animate-pulse rounded-3xl bg-slate-200" /></div>
          ) : (
            <>
              <form onSubmit={saveProfile} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">Personal details</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">Your profile &amp; travel preferences</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Choose your home country and the preferences Travelco should use to personalize discovery.</p>
                  </div>
                  <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Saving…" : "Save profile"}</button>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <Field label="Full name">
                    <input autoComplete="name" required minLength={2} maxLength={80} value={form.name} onChange={(event) => updateField("name", event.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Email address">
                    <input type="email" value={user.email || ""} readOnly className={inputClass + " bg-slate-100 text-slate-500"} />
                    <span className="mt-1 block text-xs text-slate-500">Email changes require a separate verification workflow.</span>
                  </Field>
                  <Field label="Country of residence">
                    <select required value={form.country} onChange={(event) => updateField("country", event.target.value)} className={inputClass}>
                      <option value="">Select your country</option>
                      {countries.map((country) => <option key={country} value={country}>{country}</option>)}
                      {form.country && !countries.includes(form.country) && <option value={form.country}>{form.country}</option>}
                    </select>
                  </Field>
                  <Field label="Phone number">
                    <input type="tel" autoComplete="tel" minLength={7} maxLength={25} value={form.mobile} onChange={(event) => updateField("mobile", event.target.value)} className={inputClass} placeholder="+91 98765 43210" />
                  </Field>
                  <Field label="Preferred currency">
                    <select value={form.preferredCurrency} onChange={(event) => updateField("preferredCurrency", event.target.value)} className={inputClass}>
                      {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                    </select>
                  </Field>
                  <Field label="Preferred language">
                    <select value={form.preferredLanguage} onChange={(event) => updateField("preferredLanguage", event.target.value)} className={inputClass}>
                      {languages.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Travel style">
                    <select value={form.travelStyle} onChange={(event) => updateField("travelStyle", event.target.value)} className={inputClass}>
                      <option value="flexible">Open to anything</option><option value="solo">Solo</option><option value="couple">Couple</option><option value="family">Family</option><option value="friends">Friends</option><option value="group">Group tour</option>
                    </select>
                  </Field>
                  <Field label="Typical budget">
                    <select value={form.budgetRange} onChange={(event) => updateField("budgetRange", event.target.value)} className={inputClass}>
                      <option value="flexible">Flexible</option><option value="budget">Budget-friendly</option><option value="mid-range">Mid-range</option><option value="luxury">Luxury</option>
                    </select>
                  </Field>
                </div>

                <section className="mt-8 border-t border-slate-100 pt-7">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div><h3 className="text-lg font-bold text-slate-900">What do you enjoy?</h3><p className="mt-1 text-sm text-slate-500">Select up to 10 interests to shape destination suggestions.</p></div>
                    <span className="text-sm font-semibold text-slate-500">{form.travelInterests.length}/10 selected</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {interests.map((interest) => {
                      const checked = form.travelInterests.includes(interest);
                      return <button key={interest} type="button" aria-pressed={checked} onClick={() => toggleInterest(interest)} className={"rounded-full border px-4 py-2 text-sm font-semibold transition " + (checked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-400")}>{interest}</button>;
                    })}
                  </div>
                </section>

                <section className="mt-8 border-t border-slate-100 pt-7">
                  <Field label="Saved destinations (separate names with commas)">
                    <textarea rows={3} value={savedText} onChange={(event) => setSavedText(event.target.value)} placeholder="Japan, Italy, New Zealand…" className={inputClass + " resize-y"} />
                    <span className="mt-1 block text-xs text-slate-500">Save up to 20 destinations. Avoid adding booking references or sensitive information here.</span>
                  </Field>
                </section>

                <section className="mt-8 border-t border-slate-100 pt-7">
                  <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
                  <p className="mt-1 text-sm text-slate-500">Choose which optional email updates you want to receive.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ["bookingUpdates", "Booking and reservation updates"],
                      ["tripReminders", "Trip reminders"],
                      ["productNews", "Travelco news and recommendations"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                        <input type="checkbox" checked={Boolean(form.notificationPreferences[key])} onChange={(event) => setForm((current) => ({ ...current, notificationPreferences: { ...current.notificationPreferences, [key]: event.target.checked } }))} className="mt-1 h-4 w-4 accent-blue-600" />
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </section>
                <div className="mt-8 flex justify-end">
                  <button type="submit" disabled={saving} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">{saving ? "Saving changes…" : "Save profile and preferences"}</button>
                </div>
              </form>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl">✉</div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-slate-950">Email verification</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{user.emailVerified ? "Your email address is verified and can be used for account-related messages." : "Verify your email to help protect your account and receive account-related messages."}</p>
                    <p className="mt-2 break-all text-sm font-semibold text-slate-800">{user.email}</p>
                    {!user.emailVerified && <Link to={"/verify-email?email=" + encodeURIComponent(user.email || "")} className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 font-semibold text-white hover:bg-blue-700">Verify email address</Link>}
                  </div>
                  <span className={"rounded-full px-3 py-1 text-xs font-bold " + (user.emailVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>{user.emailVerified ? "Verified" : "Pending"}</span>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-slate-950">Change password</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Confirm your current password before setting a new one. Use at least 8 characters and avoid reusing another site's password.</p>
                <form onSubmit={changePassword} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2"><Field label="Current password"><input type="password" required autoComplete="current-password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} className={inputClass} /></Field></div>
                  <Field label="New password"><input type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} className={inputClass} /></Field>
                  <Field label="Confirm new password"><input type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} className={inputClass} /></Field>
                  {passwordMessage && <p role="status" className="sm:col-span-2 text-sm text-slate-700">{passwordMessage}</p>}
                  <div className="sm:col-span-2"><button type="submit" disabled={passwordSaving} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60">{passwordSaving ? "Updating password…" : "Update password"}</button></div>
                </form>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Profile;
