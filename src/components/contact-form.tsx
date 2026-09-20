import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead } from "@/lib/leads.functions";
import { Button } from "./ui/button";

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
  const send = useServerFn(submitLead);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await send({
        data: {
          fullName: String(form.get("fullName") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          country: String(form.get("country") ?? ""),
          companyStatus: String(form.get("companyStatus") ?? ""),
          companyName: String(form.get("companyName") ?? ""),
          serviceRequested: String(form.get("serviceRequested") ?? ""),
          businessType: String(form.get("businessType") ?? ""),
          message: String(form.get("message") ?? ""),
          website: String(form.get("website") ?? ""),
        },
      });
      setState("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setState("error");
    }
  }
  if (state === "success")
    return (
      <div className="border border-border bg-surface p-8" role="status">
        <CheckCircle2 className="size-10 text-primary" />
        <h2 className="mt-6 font-display text-2xl font-bold">Request received.</h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          Thank you. Corevexal will review your requirements and follow up using the details
          provided.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => setState("idle")}>
          Submit another request
        </Button>
      </div>
    );
  return (
    <form onSubmit={submit} className="grid gap-5" aria-label="Service request form">
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" name="fullName" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" />
        <Field label="Country" name="country" required />
        <Field label="Company Name" name="companyName" />
        <Field label="Business Type" name="businessType" required />
      </div>
      <SelectField label="Company Status" name="companyStatus" options={statuses} />
      <SelectField label="Service Needed" name="serviceRequested" options={options} />
      <label className="grid gap-2 text-sm font-semibold">
        Message
        <textarea
          name="message"
          required
          minLength={10}
          rows={6}
          className="border border-input bg-background px-4 py-3 font-normal focus:border-primary"
          placeholder="Tell us what you are building and where you need guidance."
        />
      </label>
      {state === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button disabled={state === "loading"} size="lg" className="w-full sm:w-fit">
        {state === "loading" ? (
          <>
            <Loader2 className="animate-spin" />
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="h-12 border border-input bg-background px-4 font-normal focus:border-primary"
      />
    </label>
  );
}
function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select
        name={name}
        required
        defaultValue=""
        className="h-12 border border-input bg-background px-4 font-normal focus:border-primary"
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </label>
  );
}
