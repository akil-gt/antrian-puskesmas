export default function StatsGrid({ stats }) {
  const items = [
    { label: 'Menunggu', value: stats.menunggu, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Dipanggil', value: stats.dipanggil, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Sedang Berobat', value: stats.sedangBerobat, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Selesai', value: stats.selesai, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
          <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
          <p className="text-sm text-gray-600 mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
