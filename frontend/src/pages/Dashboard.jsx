import { useEffect, useState } from 'react';

import ChartsPanel from '../components/ChartsPanel';
import CustomerFormModal from '../components/CustomerFormModal';
import CustomerTable from '../components/CustomerTable';
import FiltersBar from '../components/FiltersBar';
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards';
import UploadPanel from '../components/UploadPanel';
import {
  addCustomer,
  deleteCustomer,
  exportDataset,
  fetchAggregations,
  fetchCustomers,
  fetchQuantiles,
  fetchStatistics,
  preprocessDataset,
  runClustering,
  updateCustomer,
  uploadDataset
} from '../services/api';

const defaultFilters = {
  age_min: '',
  age_max: '',
  income_min: '',
  income_max: '',
  spending_min: '',
  spending_max: ''
};

function parseError(error) {
  return error?.response?.data?.detail || error?.message || 'Something went wrong.';
}

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Upload a CSV file to start exploring customer segments.');
  const [error, setError] = useState('');

  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [stats, setStats] = useState(null);
  const [aggregations, setAggregations] = useState(null);
  const [quantiles, setQuantiles] = useState(null);

  const [filters, setFilters] = useState(defaultFilters);
  const [clusters, setClusters] = useState(3);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const refreshDashboard = async (activeFilters = filters, silent = false) => {
    try {
      const customerData = await fetchCustomers(activeFilters);
      setCustomers(customerData.data);
      setTotalCustomers(customerData.total);

      const [statisticsData, aggregationData, quantileData] = await Promise.all([
        fetchStatistics(),
        fetchAggregations(),
        fetchQuantiles('AnnualIncome', '0.25,0.5,0.75')
      ]);

      setStats(statisticsData);
      setAggregations(aggregationData);
      setQuantiles(quantileData);
      setError('');
    } catch (err) {
      if (!silent) {
        setError(parseError(err));
      }
      setCustomers([]);
      setTotalCustomers(0);
      setStats(null);
      setAggregations(null);
      setQuantiles(null);
    }
  };

  useEffect(() => {
    refreshDashboard(defaultFilters, true);
  }, []);

  const handleUpload = async (file) => {
    setBusy(true);
    setError('');

    try {
      const uploadData = await uploadDataset(file);
      const preprocessingData = await preprocessDataset();
      await refreshDashboard(defaultFilters);
      setMessage(
        `${uploadData.message} ${preprocessingData.message} Rows: ${preprocessingData.rows_after_preprocessing}.`
      );
    } catch (err) {
      setError(parseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handlePreprocess = async () => {
    setBusy(true);
    setError('');

    try {
      const data = await preprocessDataset();
      await refreshDashboard(filters);
      setMessage(`Preprocessing complete. Duplicates removed: ${data.duplicates_removed}.`);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = async () => {
    setBusy(true);
    setError('');
    await refreshDashboard(filters);
    setBusy(false);
  };

  const handleResetFilters = async () => {
    setBusy(true);
    setFilters(defaultFilters);
    setError('');
    await refreshDashboard(defaultFilters);
    setBusy(false);
  };

  const openAddCustomerModal = () => {
    setModalMode('add');
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const openEditCustomerModal = (customer) => {
    setModalMode('edit');
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleCustomerSubmit = async (payload) => {
    setBusy(true);
    setError('');

    try {
      if (modalMode === 'edit' && selectedCustomer?.CustomerID) {
        const { CustomerID, ...updates } = payload;
        await updateCustomer(selectedCustomer.CustomerID, updates);
        setMessage(`Customer ${selectedCustomer.CustomerID} updated successfully.`);
      } else {
        await addCustomer(payload);
        setMessage(`Customer ${payload.CustomerID} added successfully.`);
      }

      closeModal();
      await refreshDashboard(filters);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    setBusy(true);
    setError('');

    try {
      await deleteCustomer(customerId);
      await refreshDashboard(filters);
      setMessage(`Customer ${customerId} deleted successfully.`);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRunClustering = async () => {
    setBusy(true);
    setError('');

    try {
      await runClustering(clusters);
      await refreshDashboard(filters);
      setMessage(`KMeans clustering completed with ${clusters} clusters.`);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async () => {
    setBusy(true);
    setError('');

    try {
      const blob = await exportDataset();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'processed_customers.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage('Processed dataset exported successfully.');
    } catch (err) {
      setError(parseError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-surface-light to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto lg:flex">
        <Sidebar darkMode={darkMode} onToggleMode={() => setDarkMode((prev) => !prev)} />

        <main className="flex-1 p-4 md:p-8 space-y-4">
          <header className="rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-panel p-5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Banking Customer Segmentation Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>
            {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
          </header>

          <UploadPanel
            onUpload={handleUpload}
            onPreprocess={handlePreprocess}
            onExport={handleExport}
            onRunClustering={handleRunClustering}
            clusters={clusters}
            setClusters={setClusters}
            busy={busy}
          />

          <StatsCards
            stats={stats}
            aggregations={aggregations}
            quantiles={quantiles}
            totalCustomers={totalCustomers}
          />

          <FiltersBar
            filters={filters}
            onChange={handleFilterChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          <CustomerTable
            customers={customers}
            onAdd={openAddCustomerModal}
            onEdit={openEditCustomerModal}
            onDelete={handleDeleteCustomer}
          />

          <ChartsPanel customers={customers} />
        </main>
      </div>

      <CustomerFormModal
        open={isModalOpen}
        mode={modalMode}
        customer={selectedCustomer}
        onClose={closeModal}
        onSubmit={handleCustomerSubmit}
      />
    </div>
  );
}
