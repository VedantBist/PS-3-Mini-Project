import { useEffect, useState } from 'react';

const initialState = {
  CustomerID: '',
  Age: '',
  Gender: 'Male',
  AnnualIncome: '',
  SpendingScore: '',
  Balance: ''
};

export default function CustomerFormModal({ open, mode, customer, onClose, onSubmit }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (open && customer) {
      setFormData({
        CustomerID: customer.CustomerID ?? '',
        Age: customer.Age ?? '',
        Gender: customer.Gender ?? 'Male',
        AnnualIncome: customer.AnnualIncome ?? '',
        SpendingScore: customer.SpendingScore ?? '',
        Balance: customer.Balance ?? ''
      });
    } else if (open) {
      setFormData(initialState);
    }
  }, [open, customer]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      Age: Number(formData.Age),
      AnnualIncome: Number(formData.AnnualIncome),
      SpendingScore: Number(formData.SpendingScore),
      Balance: Number(formData.Balance)
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {mode === 'edit' ? 'Edit Customer' : 'Add Customer'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Customer ID"
            value={formData.CustomerID}
            onChange={(e) => handleChange('CustomerID', e.target.value)}
            disabled={mode === 'edit'}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={formData.Age}
            onChange={(e) => handleChange('Age', e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
            required
          />
          <select
            value={formData.Gender}
            onChange={(e) => handleChange('Gender', e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="number"
            placeholder="Annual Income"
            value={formData.AnnualIncome}
            onChange={(e) => handleChange('AnnualIncome', e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
            required
          />
          <input
            type="number"
            placeholder="Spending Score"
            value={formData.SpendingScore}
            onChange={(e) => handleChange('SpendingScore', e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
            required
          />
          <input
            type="number"
            placeholder="Balance"
            value={formData.Balance}
            onChange={(e) => handleChange('Balance', e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-700 dark:text-slate-100"
            required
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 font-medium"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
