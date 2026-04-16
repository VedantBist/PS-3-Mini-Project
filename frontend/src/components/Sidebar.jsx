export default function Sidebar({ darkMode, onToggleMode }) {
  return (
    <aside className="w-full lg:w-72 bg-white/80 dark:bg-slate-900/70 backdrop-blur-lg border-r border-slate-200 dark:border-slate-700 p-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          Banking Segmentation
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Upload data, clean records, run clustering, and explore customer segments.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Sections</p>
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          Dashboard Overview
        </div>
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          Customer Operations
        </div>
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          Clustering Insights
        </div>
      </div>

      <button
        className="mt-10 w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 transition-colors"
        onClick={onToggleMode}
      >
        Switch to {darkMode ? 'Light' : 'Dark'} Mode
      </button>
    </aside>
  );
}
