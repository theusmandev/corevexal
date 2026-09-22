const fs = require("fs");

let content = fs.readFileSync("src/app/(site)/page.tsx", "utf8");

// Imports
content = content.replace(
  /import \{\s*formationServices,\s*paymentPlatforms,\s*platformContent,\s*serviceGroups,\s*\} from "@\/lib\/services";/g,
  `import { getPublishedCategories } from "@/lib/data/services";\nimport { getIcon, getCategoryIcon } from "@/lib/icon-registry";`,
);

// Add revalidate
content = content.replace(
  /export const metadata = \{/,
  `export const revalidate = 60;\n\nexport const metadata = {`,
);

// Async Home
content = content.replace(
  /export default function Home\(\) \{/,
  "export default async function Home() {",
);

// Data fetching
content = content.replace(
  /const journey = \[/,
  `const categories = await getPublishedCategories();
  const businessFormation = categories.find(c => c.slug === "business-formation");
  const formationServices = businessFormation?.services || [];
  const paymentPlatformsCat = categories.find(c => c.slug === "payment-platforms");
  const paymentPlatforms = paymentPlatformsCat?.services || [];

  const journey = [`,
);

// serviceGroups map
content = content.replace(
  /\{serviceGroups\.map\(\(\{ title, icon: Icon \}\) => \(/g,
  `{categories.map((c) => {
    const Icon = getCategoryIcon(c.slug);
    return (`,
);
content = content.replace(/key=\{title\}/g, `key={c.slug || c.name}`);
content = content.replace(/>\{title\}<\/span>/g, `>{c.name}</span>`);
content = content.replace(
  / \)\)\}/g,
  `);
          })}`,
); // Closing of categories.map

// formationServices map
content = content.replace(
  /\{formationServices\.map\(\(\{ title, icon: Icon \}\) => \(/g,
  `{formationServices.map((service) => {
    const Icon = getIcon(service.icon);
    return (`,
);
content = content.replace(
  /key=\{title\}>\s*<Icon className="text-primary-text" \/>\s*<h3 className="mt-8 font-display text-lg font-bold">\{title\}<\/h3>\s*<\/div>\s*\)\)\}/g,
  `key={service.slug}>
                <Icon className="text-primary-text" />
                <h3 className="mt-8 font-display text-lg font-bold">{service.title}</h3>
              </div>
            );
          })}`,
);

// Payment platforms
content = content.replace(
  /\{paymentPlatforms\.map\(\(p\) => \(/g,
  `{paymentPlatforms.map((p) => (`,
);
content = content.replace(
  /href=\{`\/services\/payment-platforms\/\$\{p\}`\}/g,
  `href={\`/services/\${p.slug}\`}`,
);
content = content.replace(/key=\{p\}/g, `key={p.slug}`);
content = content.replace(
  /\{platformContent\[p\]\.name\.replace\(" Business", ""\)\}/g,
  `{p.title.replace(" Business", "")}`,
);

fs.writeFileSync("src/app/(site)/page.tsx", content);
