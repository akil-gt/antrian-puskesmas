import type { QueueEntry } from "@/types";

const borderMap: Record<string, string> = {
  menunggu: "border-blue-500",
  dipanggil: "border-amber-500",
  sedang_berobat: "border-purple-500",
  selesai: "border-emerald-500",
  hangus: "border-red-400",
};

interface QueueCardProps {
  queue: QueueEntry;
  showName?: boolean;
  large?: boolean;
}

export default function QueueCard({ queue, showName = true, large = false }: QueueCardProps) {
  if (!queue) return null;

  return (
    <div
      className={
        "flex items-center justify-between p-3 rounded-lg border-l-4 bg-white shadow-sm animate-slide-up " +
        (borderMap[queue.status] || "border-gray-300")
      }
    >
      <div className="flex items-center space-x-3">
        <span
          className={"font-bold " + (large ? "text-2xl" : "text-lg") + " text-gray-900"}
        >
          {queue.nomor}
        </span>
        {showName && <span className="text-sm text-gray-600">{queue.nama}</span>}
      </div>
    </div>
  );
}
