"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { submitContact } from "@/app/actions/contact";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { cn } from "@/lib/utils";
import { COUNTRY_CODES, getCountryName } from "@/lib/countries";

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
    return [...COUNTRY_CODES]
      .map((code) => ({
        code,
        name: getCountryName(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
        <Field label="Full Name" name="fullName" required placeholder="e.g. John Smith" autoComplete="name" error={state.fieldErrors?.["fullName"]} />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
          error={state.fieldErrors?.["email"]}
        />
        <Field label="Phone" name="phone" type="tel" placeholder="+1 555 000 0000" autoComplete="tel" error={state.fieldErrors?.["phone"]} />
        <CountrySelectField
          label="Country"
          name="country"
          options={countryOptions}
          error={state.fieldErrors?.["country"]}
        />
      </div>
      <SelectField
        label="Service Needed"
        name="serviceRequested"
        options={options}
        error={state.fieldErrors?.["serviceRequested"]}
      />

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
        {state.fieldErrors?.["message"] && (
          <span className="text-xs text-destructive">{state.fieldErrors["message"][0]}</span>
        )}
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
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string[] | undefined;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
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
  error,
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
  error,
}: {
  label: string;
  name: string;
  options: { code: string; name: string }[];
  error?: string[] | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="grid gap-2 text-sm font-semibold">
      <label>{label}</label>
      <input type="hidden" name={name} value={value} required autoComplete="country" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`h-12 w-full justify-between border bg-background px-4 font-normal rounded-none shadow-none focus:border-primary hover:bg-background ${error ? "border-destructive" : "border-input"} ${!value ? "text-muted-foreground" : ""}`}
          >
            {value
              ? options.find((opt) => opt.code === value)?.name
              : "Select country..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-none shadow-none border-input" align="start">
          <Command>
            <CommandInput placeholder="Search country..." className="border-none focus:ring-0" />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.code}
                    value={opt.name}
                    onSelect={() => {
                      setValue(opt.code);
                      setOpen(false);
                    }}
                    className="cursor-pointer rounded-none data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <span className="text-xs text-destructive">{error[0]}</span>}
    </div>
  );
}
