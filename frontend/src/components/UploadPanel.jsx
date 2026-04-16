import { useRef } from 'react';

export default function UploadPanel({
  onUpload,
  onPreprocess,
  onExport,
  onRunClustering,
  clusters,
  setClusters,
  busy
}) {
  const inputRef = useRef(null);

  const handleFilePick = () => {
    const file = inputRef.current?.files?.[0];
    if (file) {
      onUpload(file);
      inputRef.current.value = '';
    }
  };

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
      <div className="flex flex-col xl:flex-row gap-4 xl:items-end justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Upload CSV Dataset
          </label>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-100 p-2"
            onChange={handleFilePick}
            disabled={busy}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onPreprocess}
            disabled={busy}
            className="rounded-xl px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium disabled:opacity-50"
          >
            Preprocess Data
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 dark:text-slate-300">Clusters</label>
            <select
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 px-2 py-2"
              value={clusters}
              onChange={(e) => setClusters(Number(e.target.value))}
              disabled={busy}
            >
              {[3, 4, 5].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRunClustering}
            disabled={busy}
            className="rounded-xl px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium disabled:opacity-50"
          >
            Run Clustering
          </button>

          <button
            onClick={onExport}
            disabled={busy}
            className="rounded-xl px-4 py-2 border border-brand-600 text-brand-600 dark:text-brand-100 dark:border-brand-300 font-medium disabled:opacity-50"
          >
            Export Data
          </button>
        </div>
      </div>
    </section>
  );
}
