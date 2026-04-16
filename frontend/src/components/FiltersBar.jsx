export default function FiltersBar({ filters, onChange, onApply, onReset }) {
  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <input
          type="number"
          placeholder="Age Min"
          value={filters.age_min}
          onChange={(e) => onChange('age_min', e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
        />
        <input
          type="number"
          placeholder="Age Max"
          value={filters.age_max}
          onChange={(e) => onChange('age_max', e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
        />
        <input
          type="number"
          placeholder="Income Min"
          value={filters.income_min}
          onChange={(e) => onChange('income_min', e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
        />
        <input
          type="number"
          placeholder="Income Max"
          value={filters.income_max}
          onChange={(e) => onChange('income_max', e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
        />
        <input
          type="number"
          placeholder="Spending Min"
          value={filters.spending_min}
          onChange={(e) => onChange('spending_min', e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
        />
        <input
          type="number"
          placeholder="Spending Max"
          value={filters.spending_max}
          onChange={(e) => onChange('spending_max', e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onApply}
          className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={onReset}
          className="rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 font-medium"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
