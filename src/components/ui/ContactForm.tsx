import React, { useState } from 'react';

const PURPOSES = [
  'Project collaboration',
  'Internship opportunity',
  'Open-source collaboration',
  'General enquiry',
  'Other',
] as const;

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    purpose: 'Project collaboration',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedViaMailto, setSubmittedViaMailto] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Please select a purpose.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please include a message.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Prepare mailto fallback URL
    const subject = encodeURIComponent(`[Portfolio] ${formData.purpose} — from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPurpose: ${formData.purpose}\n\nMessage:\n${formData.message}`
    );
    const mailtoUrl = `mailto:sanchitmarwah03@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      // Trigger the prefilled mailto client
      window.location.href = mailtoUrl;
      setIsSubmitting(false);
      setSubmittedViaMailto(true);
    }, 400);
  };

  return (
    <div className="mt-8 border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 bg-[var(--color-surface)] shadow-xs">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-normal tracking-tight text-[var(--color-primary)]">
          Send a Direct Message
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-secondary)]">
          Fill out the details below. This will prepare a prefilled message directly addressed to Sanchit.
        </p>
      </div>

      {submittedViaMailto && (
        <div className="mb-6 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] text-xs space-y-1.5 animate-fade-in">
          <div className="flex items-center gap-2 font-medium text-[var(--color-primary)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Prefilled email dispatched to your email client</span>
          </div>
          <p className="text-[var(--color-secondary)] leading-relaxed">
            Your default email application has opened with your message pre-populated. Send it from your mail client to deliver it directly to{' '}
            <strong className="text-[var(--color-primary)]">sanchitmarwah03@gmail.com</strong>.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-medium text-[var(--color-primary)]">
            Your Name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Alex Doe"
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--bg-page)] text-[var(--color-primary)] placeholder-[var(--color-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all ${
              errors.name ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-[11px] text-red-500 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium text-[var(--color-primary)]">
            Email Address <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            placeholder="alex@example.com"
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--bg-page)] text-[var(--color-primary)] placeholder-[var(--color-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all ${
              errors.email ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-[11px] text-red-500 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Purpose of Contact */}
        <div className="space-y-1.5">
          <label htmlFor="purpose" className="block text-xs font-medium text-[var(--color-primary)]">
            Purpose of Contact <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="purpose"
            value={formData.purpose}
            onChange={(e) => {
              setFormData({ ...formData, purpose: e.target.value });
              if (errors.purpose) setErrors({ ...errors, purpose: '' });
            }}
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--bg-page)] text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all ${
              errors.purpose ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
          >
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.purpose && (
            <p id="purpose-error" className="text-[11px] text-red-500 font-medium">
              {errors.purpose}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label htmlFor="message" className="block text-xs font-medium text-[var(--color-primary)]">
            Message <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => {
              setFormData({ ...formData, message: e.target.value });
              if (errors.message) setErrors({ ...errors, message: '' });
            }}
            placeholder="Write your note, proposal or enquiry here..."
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--bg-page)] text-[var(--color-primary)] placeholder-[var(--color-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all resize-y ${
              errors.message ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <p id="message-error" className="text-[11px] text-red-500 font-medium">
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-current" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Preparing Message...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span>Send Message</span>
                <span className="text-xs">↗</span>
              </span>
            )}
          </button>

          <span className="text-[11px] font-mono text-[var(--color-secondary)]">
            Direct Email Fallback
          </span>
        </div>
      </form>
    </div>
  );
}
