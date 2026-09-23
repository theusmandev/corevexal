-- Seed initial site settings safely (do nothing if already exists)
INSERT INTO public.site_settings (key, value, is_public)
VALUES
  (
    'contact_info',
    '{"email": "", "phone": "", "address": ""}'::jsonb,
    true
  ),
  (
    'social_links',
    '{"linkedin": "", "twitter": "", "instagram": "", "facebook": ""}'::jsonb,
    true
  ),
  (
    'announcement_banner',
    '{"enabled": false, "text": "", "link_text": "", "link_url": ""}'::jsonb,
    true
  )
ON CONFLICT (key) DO NOTHING;
