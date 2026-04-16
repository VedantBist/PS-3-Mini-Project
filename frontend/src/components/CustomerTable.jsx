export default function CustomerTable({ customers, onAdd, onEdit, onDelete }) {
  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Customers</h2>
        <button
          onClick={onAdd}
          className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium"
        >
          Add Customer
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="text-left border-b border-slate-200 dark:border-slate-700">
              <th className="py-2">CustomerID</th>
              <th className="py-2">Age</th>
              <th className="py-2">Gender</th>
              <th className="py-2">Income</th>
              <th className="py-2">Spending</th>
              <th className="py-2">Balance</th>
              <th className="py-2">Cluster</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.CustomerID}
                className="border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200"
              >
                <td className="py-2">{customer.CustomerID}</td>
                <td className="py-2">{customer.Age}</td>
                <td className="py-2">{customer.Gender}</td>
                <td className="py-2">{customer.AnnualIncome}</td>
                <td className="py-2">{customer.SpendingScore}</td>
                <td className="py-2">{customer.Balance}</td>
                <td className="py-2">{customer.Cluster ?? 'N/A'}</td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1"
                      onClick={() => onEdit(customer)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg border border-red-400 text-red-500 px-3 py-1"
                      onClick={() => onDelete(customer.CustomerID)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">No customers to display.</p>
      ) : null}
    </section>
  );
}
