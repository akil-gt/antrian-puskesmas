import type { QueueStatus } from "@/types";

interface StatusBadgeProps {
  status: QueueStatus;
}

const styles: Record<QueueStatus, string> = {
  menunggu: "bg-blue-100 text-blue-800",
  dipanggil: "bg-amber-100 text-amber-800 animate-pulse-slow",
  sedang_berobat: "bg-purple-100 text-purple-800",
  selesai: "bg-emerald-100 text-emerald-800",
  hangus: "bg-red-100 text-red-800",
};

const labels: Record<QueueStatus, string> = {
  menunggu: "Menunggu",
  dipanggil: "Dipanggil",
  sedang_berobat: "Sedang Berobat",
  selesai: "Selesai",
  hangus: "Hangus",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
