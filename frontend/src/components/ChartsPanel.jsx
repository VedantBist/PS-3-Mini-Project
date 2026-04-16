import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const CLUSTER_COLORS = ['#1d4ed8', '#0891b2', '#16a34a', '#d97706', '#dc2626'];

export default function ChartsPanel({ customers }) {
  const clusteredCustomers = customers.filter(
    (customer) => customer.Cluster !== undefined && customer.Cluster !== null
  );

  const groupedScatter = clusteredCustomers.reduce((acc, customer) => {
    const key = Number(customer.Cluster);
    if (!acc[key]) acc[key] = [];
    acc[key].push(customer);
    return acc;
  }, {});

  const segmentData = Object.entries(groupedScatter).map(([cluster, values]) => ({
    name: `Cluster ${cluster}`,
    value: values.length
  }));

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Income vs Spending (Scatter)
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="AnnualIncome" name="Income" />
              <YAxis dataKey="SpendingScore" name="Spending" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              {Object.entries(groupedScatter).map(([cluster, data], index) => (
                <Scatter
                  key={cluster}
                  name={`Cluster ${cluster}`}
                  data={data}
                  fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Cluster Distribution</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={segmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5 xl:col-span-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Segment Share (Pie)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={segmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}>
                {segmentData.map((entry, index) => (
                  <Cell key={entry.name} fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
