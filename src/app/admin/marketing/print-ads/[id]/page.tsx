/**
 * Edit Print Ad Page
 * Form for editing an existing print advertisement
 */

import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PrintAdForm } from "../create/PrintAdForm";
import type { PrintAd } from "@/types/database";

export const dynamic = "force-dynamic";

interface EditPrintAdPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPrintAdPage({ params }: EditPrintAdPageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch the print ad
  const { data: printAd, error } = await supabase
    .from("print_ads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !printAd) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/marketing/print-ads"
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft
            className="h-5 w-5"
            style={{ color: "var(--craigies-dark-olive)" }}
          />
        </Link>
        <div className="flex-1">
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Edit Print Ad
          </h2>
          <p className="text-sm text-gray-500">{printAd.name}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            printAd.status === "final"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {printAd.status === "final" ? "Final" : "Draft"}
        </span>
      </div>

      {/* Form with initial data */}
      <PrintAdForm initialData={printAd as PrintAd} />
    </div>
  );
}
