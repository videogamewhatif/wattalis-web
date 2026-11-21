import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { loadLegalDocument } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await loadLegalDocument("privacidad");
  return pageMetadata({
    title: "Aviso de privacidad",
    description: "Aviso de privacidad de Wattalis.",
    path: "/privacidad",
    indexable: doc !== null,
  });
}

export default async function PrivacyPage() {
  const doc = await loadLegalDocument("privacidad");
  return <LegalPage title="Aviso de privacidad" document={doc} file="content/legal/privacidad.md" />;
}
