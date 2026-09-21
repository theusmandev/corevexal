-- Length and format limits (apply to new and updated rows only)
alter table public.leads
  drop constraint if exists leads_full_name_len,
  drop constraint if exists leads_email_fmt,
  drop constraint if exists leads_phone_len,
  drop constraint if exists leads_country_len,
  drop constraint if exists leads_company_status_len,
  drop constraint if exists leads_company_name_len,
  drop constraint if exists leads_service_len,
  drop constraint if exists leads_business_type_len,
  drop constraint if exists leads_message_len;

alter table public.leads
  add constraint leads_full_name_len check (char_length(btrim(full_name)) between 1 and 200) not valid,
  add constraint leads_email_fmt check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') not valid,
  add constraint leads_phone_len check (phone is null or char_length(phone) <= 50) not valid,
  add constraint leads_country_len check (char_length(country) <= 100) not valid,
  add constraint leads_company_status_len check (char_length(company_status) <= 100) not valid,
  add constraint leads_company_name_len check (company_name is null or char_length(company_name) <= 200) not valid,
  add constraint leads_service_len check (char_length(btrim(service_requested)) between 1 and 200) not valid,
  add constraint leads_business_type_len check (char_length(business_type) <= 200) not valid,
  add constraint leads_message_len check (char_length(btrim(message)) between 1 and 5000) not valid;

-- The anon role may only write the fields the contact form sends;
-- id, status, source and timestamps come from column defaults.
revoke insert on public.leads from anon;
grant insert (full_name, email, phone, country, company_status, company_name,
              service_requested, business_type, message)
  on public.leads to anon;

-- contact_submissions is unused by the application; remove the open insert.
drop policy if exists "Anyone can submit contact form" on public.contact_submissions;
