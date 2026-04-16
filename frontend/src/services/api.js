import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL
});

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const preprocessDataset = async () => {
  const { data } = await client.post('/api/preprocess');
  return data;
};

export const fetchCustomers = async (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
  const { data } = await client.get('/api/customers', { params });
  return data;
};

export const addCustomer = async (payload) => {
  const { data } = await client.post('/api/customers', payload);
  return data;
};

export const updateCustomer = async (customerId, payload) => {
  const { data } = await client.put(`/api/customers/${customerId}`, payload);
  return data;
};

export const deleteCustomer = async (customerId) => {
  const { data } = await client.delete(`/api/customers/${customerId}`);
  return data;
};

export const fetchStatistics = async () => {
  const { data } = await client.get('/api/statistics');
  return data;
};

export const fetchAggregations = async () => {
  const { data } = await client.get('/api/operations/aggregations');
  return data;
};

export const fetchQuantiles = async (column = 'AnnualIncome', q = '0.25,0.5,0.75') => {
  const { data } = await client.get('/api/operations/quantiles', {
    params: { column, q }
  });
  return data;
};

export const runClustering = async (clusters = 3) => {
  const { data } = await client.post('/api/cluster', null, {
    params: { clusters }
  });
  return data;
};

export const exportDataset = async () => {
  const response = await client.get('/api/export', {
    responseType: 'blob'
  });
  return response.data;
};
