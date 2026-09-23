-- Option B: Rename the redundant service slugs to something unique
-- We rename the service slugs to preserve the rich content (features, process, faqs) 
-- that is not present in the category overview.

-- 1. Update related_services arrays that reference the old slugs
UPDATE services
SET related_services = (
    SELECT jsonb_agg(
        CASE 
            WHEN value::text = '"business-banking"' THEN '"business-banking-setup"'::jsonb
            WHEN value::text = '"digital-technology"' THEN '"digital-technology-solutions"'::jsonb
            ELSE value
        END
    )
    FROM jsonb_array_elements(related_services) AS value
)
WHERE related_services ? 'business-banking' OR related_services ? 'digital-technology';

-- 2. Rename the slugs themselves
UPDATE services
SET slug = 'business-banking-setup'
WHERE slug = 'business-banking';

UPDATE services
SET slug = 'digital-technology-solutions'
WHERE slug = 'digital-technology';
