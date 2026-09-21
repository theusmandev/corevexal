"use client";

import { useActionState, useMemo } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitContact } from "@/app/actions/contact";
import { Button } from "./ui/button";
import { COUNTRY_CODES, getCountryName } from "@/lib/countries";

const statuses = [
  "I haven't formed my company yet",
  "I already have a company",
  "I am expanding an existing business",
  "I'm not sure",
];
const options = [
  "UK LTD Formation",
  "US LLC Formation",
  "Business Banking",
  "Wise",
  "Payoneer",
  "PayPal",
  "Stripe",
  "TapTap",
  "Digital Services",
  "Other",
];

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, { success: false });

  const countryOptions = useMemo(() => {
    return [...COUNTRY_CODES].map(code => ({
      code,
      name: getCountryName(code)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  if (state.success)
    return (
      <div className="border border-border bg-surface p-8" role="status">
        <CheckCircle2 className="size-10 text-primary-text" />
        <h2 className="mt-6 font-display text-2xl font-bold">Request received.</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          Thank you. Corevexal will review your requirements and follow up using the details
          provided.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => window.location.reload()}>
          Submit another request
        </Button>
      </div>
    );

  return (
    <form action={formAction} className="grid gap-5" aria-label="Service request form">
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" name="fullName" required error={state.fieldErrors?.["fullName"]} />
        <Field label="Email" name="email" type="email" required error={state.fieldErrors?.["email"]} />
        <Field label="Phone" name="phone" type="tel" error={state.fieldErrors?.["phone"]} />
        <CountrySelectField label="Country" name="country" options={countryOptions} error={state.fieldErrors?.["country"]} />
        <Field label="Company Name" name="companyName" error={state.fieldErrors?.["companyName"]} />
        <Field label="Business Type" name="businessType" required error={state.fieldErrors?.["businessType"]} />
      </div>
      <SelectField label="Company Status" name="companyStatus" options={statuses} error={state.fieldErrors?.["companyStatus"]} />
      <SelectField label="Service Needed" name="serviceRequested" options={options} error={state.fieldErrors?.["serviceRequested"]} />
      
      <label className="grid gap-2 text-sm font-semibold">
        Message
        <textarea
          name="message"
          required
          minLength={10}
          rows={6}
          className={`border bg-background px-4 py-3 font-normal focus:border-primary ${state.fieldErrors?.["message"] ? "border-destructive" : "border-input"}`}
          placeholder="Tell us what you are building and where you need guidance."
        />
        {state.fieldErrors?.["message"] && <span className="text-xs text-destructive">{state.fieldErrors["message"][0]}</span>}
      </label>
      
      {state.error && (
        <p role="alert" className="text-sm text-destructive font-medium">
          {state.error}
        </p>
      )}
      
      <Button disabled={isPending} size="lg" className="w-full sm:w-fit">
        {isPending ? (
          <>
            <Loader2 className="mr-2 animate-spin size-4" />
            Submitting
          </>
        ) : (
          "Submit Request"
        )}
      </Button>
      
      <p className="text-xs leading-5 text-muted-foreground">
        Protected by a hidden spam trap. By submitting, you agree to our privacy policy.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string[] | undefined;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className={`h-12 border bg-background px-4 font-normal focus:border-primary ${error ? "border-destructive" : "border-input"}`}
      />
      {error && <span className="text-xs text-destructive">{error[0]}</span>}
    </label>
  );
}

function SelectField({ 
  label, 
  name, 
  options, 
  error 
}: { 
  label: string; 
  name: string; 
  options: string[]; 
  error?: string[] | undefined;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select
        name={name}
        required
        defaultValue=""
        className={`h-12 border bg-background px-4 font-normal focus:border-primary ${error ? "border-destructive" : "border-input"}`}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
      {error && <span className="text-xs text-destructive">{error[0]}</span>}
    </label>
  );
}

export function CountrySelectField({ 
  label, 
  name, 
  options, 
  error 
}: { 
  label: string; 
  name: string; 
  options: { code: string; name: string }[]; 
  error?: string[] | undefined;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select
        name={name}
        required
        autoComplete="country"
        defaultValue=""
        className={`h-12 border bg-background px-4 font-normal focus:border-primary ${error ? "border-destructive" : "border-input"}`}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>{opt.name}</option>
        ))}
      </select>
      {error && <span className="text-xs text-destructive">{error[0]}</span>}
    </label>
  );
}
