/**
 * Create Print Ad Page
 * Form for creating a new print advertisement
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrintAdForm } from "./PrintAdForm";

export default function CreatePrintAdPage() {
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
        <div>
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Create Print Ad
          </h2>
          <p className="text-sm text-gray-500">
            Design a new newspaper or magazine advertisement
          </p>
        </div>
      </div>

      {/* Form */}
      <PrintAdForm />
    </div>
  );
}
