const formatNumber = (value) => {
  if (value === undefined || value === null || Number.isNaN(value)) return 'N/A';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export default function StatsCards({ stats, aggregations, quantiles, totalCustomers }) {
  const incomeAgg = aggregations?.summary?.AnnualIncome;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Customers</p>
        <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">{totalCustomers}</h3>
      </article>

      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Avg Income</p>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
          {formatNumber(incomeAgg?.avg)}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Max: {formatNumber(incomeAgg?.max)}</p>
      </article>

      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Mean Spending</p>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
          {formatNumber(stats?.mean?.SpendingScore)}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Std: {formatNumber(stats?.std?.SpendingScore)}</p>
      </article>

      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Income Quantiles</p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">
          Q1 {formatNumber(quantiles?.quantiles?.['0.25'])}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Median: {formatNumber(quantiles?.quantiles?.['0.5'])}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Q3: {formatNumber(quantiles?.quantiles?.['0.75'])}</p>
      </article>
    </section>
  );
}
