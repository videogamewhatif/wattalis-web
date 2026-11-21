import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { loadLegalDocument } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await loadLegalDocument("terminos");
  return pageMetadata({
    title: "Términos y condiciones",
    description: "Términos y condiciones de uso del sitio de Wattalis.",
    path: "/terminos",
    indexable: doc !== null,
  });
}

export default async function TermsPage() {
  const doc = await loadLegalDocument("terminos");
  return <LegalPage title="Términos y condiciones" document={doc} file="content/legal/terminos.md" />;
}
