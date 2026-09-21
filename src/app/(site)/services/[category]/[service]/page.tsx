import { notFound, redirect } from "next/navigation";
import { getService } from "@/lib/services";
import { ServiceDetail } from "@/components/service-detail";
import type { Metadata } from "next";

type Props = {
 params: Promise<{ category: string; service: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const { service: slug } = await params;
 const service = getService(slug);
 
 if (!service) return { title: "Not Found" };

 return {
 title: service.seoTitle ?? "Service not found | Corevexal",
 description: service.seoDescription ?? "Corevexal service information.",
 openGraph: {
 title: service.seoTitle ?? "Corevexal",
 description: service.seoDescription ?? "Corevexal service information.",
 type: "website",
 },
 twitter: {
 card: "summary_large_image",
 },
 alternates: {
 canonical: `/services/${slug}`, // Canonical always points to the single-segment URL
 },
 };
}

export default async function CategoryServicePage({ params }: Props) {
 const { service: slug } = await params;
 const service = getService(slug);

 if (!service) {
 notFound();
 }

 return <ServiceDetail service={service} />;
}
