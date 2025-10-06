import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Settings } from 'lucide-react';
import { dataAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DataUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [columnMappings, setColumnMappings] = useState({});

  React.useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await dataAPI.getDatasets();
      setDatasets(response.data.datasets);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('dataFile', file);

      const response = await dataAPI.upload(formData);
      
      setUploadedFile({
        name: file.name,
        size: file.size,
        data: response.data
      });
      
      toast.success('File uploaded successfully!');
      fetchDatasets(); // Refresh datasets list
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleColumnMappingChange = (columnName, mapping) => {
    setColumnMappings(prev => ({
      ...prev,
      [columnName]: mapping
    }));
  };

  const saveColumnMappings = async () => {
    if (!selectedDataset) return;

    try {
      await dataAPI.updateMappings(selectedDataset._id, columnMappings);
      toast.success('Column mappings updated successfully!');
      fetchDatasets();
      setSelectedDataset(null);
      setColumnMappings({});
    } catch (error) {
      console.error('Failed to update mappings:', error);
      toast.error('Failed to update column mappings');
    }
  };

  const mappingOptions = [
    { value: 'revenue', label: 'Revenue/Sales Amount' },
    { value: 'date', label: 'Date/Timestamp' },
    { value: 'customer_id', label: 'Customer ID' },
    { value: 'product_id', label: 'Product ID' },
    { value: 'quantity', label: 'Quantity' },
    { value: 'price', label: 'Price' },
    { value: 'category', label: 'Category' },
    { value: 'other', label: 'Other' }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Upload</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Upload your business data files (CSV, Excel) to start analyzing your metrics.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload New Dataset</h2>
          
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
              }
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 dark:text-gray-400">Uploading and processing your file...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Drop your files here, or <span className="text-primary-600">browse</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Supports CSV, XLSX files up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Success */}
          {uploadedFile && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    File uploaded successfully!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    {uploadedFile.name} ({formatFileSize(uploadedFile.size)}) - {uploadedFile.data.businessData.totalRows} rows processed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Datasets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Datasets</h2>
          
          {datasets.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No datasets uploaded yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Upload your first dataset to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {datasets.map((dataset) => (
                <div key={dataset._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${dataset.isProcessed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'}`}>
                        {dataset.isProcessed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{dataset.fileName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{dataset.totalRows.toLocaleString()} rows</span>
                          <span>{dataset.columns.length} columns</span>
                          <span>{new Date(dataset.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDataset(dataset);
                          const mappings = {};
                          dataset.columns.forEach(col => {
                            mappings[col.name] = col.mappedTo;
                          });
                          setColumnMappings(mappings);
                        }}
                        className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </button>
                      
                      <button className="flex items-center px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-md hover:bg-primary-200 dark:hover:bg-primary-900/40 transition-colors">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </button>
                    </div>
                  </div>
                  
                  {/* Dataset metadata */}
                  {dataset.metadata && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {dataset.metadata.totalRevenue && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Total Revenue:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            ${dataset.metadata.totalRevenue.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {dataset.metadata.uniqueCustomers && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Customers:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {dataset.metadata.uniqueCustomers.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {dataset.metadata.avgOrderValue && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Avg Order:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            ${dataset.metadata.avgOrderValue.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {dataset.metadata.dateRange && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Date Range:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {new Date(dataset.metadata.dateRange.start).toLocaleDateString()} - {new Date(dataset.metadata.dateRange.end).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column Mapping Modal */}
      {selectedDataset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configure Column Mappings - {selectedDataset.fileName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Map your data columns to standard business metrics for better analytics.
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                {selectedDataset.columns.map((column, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{column.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Type: {column.type}</p>
                    </div>
                    
                    <select
                      value={columnMappings[column.name] || column.mappedTo}
                      onChange={(e) => handleColumnMappingChange(column.name, e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      {mappingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedDataset(null);
                  setColumnMappings({});
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveColumnMappings}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Save Mappings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataUpload;