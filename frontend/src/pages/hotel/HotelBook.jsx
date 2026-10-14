import React from "react";
import { FaLock } from "react-icons/fa";

const HotelBook = () => (
  <main className="mx-auto max-w-3xl px-4 py-16">
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
      <div className="flex items-center gap-3 text-amber-900">
        <FaLock aria-hidden="true" />
        <h1 className="text-2xl font-bold">Secure checkout is not enabled yet</h1>
      </div>
      <p className="mt-4 leading-7 text-slate-700">
        Travelco is not currently connected to a verified payment provider for this checkout. No payment has been taken, and this page will not ask you to enter or store card numbers or security codes.
      </p>
      <p className="mt-3 leading-7 text-slate-700">
        A booking should only be paid for after a supported payment provider, server-side amount verification, currency handling, and payment confirmation webhooks have been configured and tested.
      </p>
      <p className="mt-5 text-sm text-slate-600">
        Please return to the listing and contact the provider to confirm availability and final price before paying through their official checkout.
      </p>
    </section>
  </main>
);

export default HotelBook;
