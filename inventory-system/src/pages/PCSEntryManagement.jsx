import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import Papa from 'papaparse';

const PCSEntryManagement = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    color: '', 
    size: '', 
    weight: '', 
    serialNo: '', 
    barcodeValue: '', 
    operatorName: ''
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [mode, setMode] = useState('add');

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, dateRange, searchTerm]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pcs');
      setEntries(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const generateSerialAndBarcode = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pcs/generate-serial');
      return response.data;
    } catch (error) {
      console.error('Error generating serial number:', error);
      return null;
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    const { startDate, endDate } = dateRange;
    if (startDate || endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        return (!start || entryDate >= start) && (!end || entryDate <= end);
      });
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.color.toLowerCase().includes(searchLower) ||
        entry.size.toLowerCase().includes(searchLower) ||
        entry.weight.toString().includes(searchLower) ||
        entry.serial_no.toLowerCase().includes(searchLower) ||
        entry.barcode_value.toLowerCase().includes(searchLower) ||
        entry.operator_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEntries(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let serialData;
      if (mode === 'add') {
        serialData = await generateSerialAndBarcode();
        if (!serialData) {
          throw new Error('Failed to generate serial number and barcode');
        }
      }

      const payload = {
        color: formData.color,
        size: formData.size,
        weight: parseFloat(formData.weight),
        serial_no: mode === 'add' ? serialData.serialNo : formData.serialNo,
        barcode_value: mode === 'add' ? serialData.barcodeValue : formData.barcodeValue,
        operator_name: formData.operatorName
      };
  
      if (mode === 'add') {
        await axios.post('http://localhost:5000/api/pcs', payload);
      } else {
        await axios.put(`http://localhost:5000/api/pcs/${selectedEntry.id}`, payload);
      }
  
      fetchEntries();
      resetForm();
    } catch (error) {
      console.error('Submit error:', error.response ? error.response.data : error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/pcs/${id}`);
      fetchEntries();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setMode('edit');
    setFormData({
      color: entry.color,
      size: entry.size,
      weight: entry.weight,
      serialNo: entry.serial_no,
      barcodeValue: entry.barcode_value,
      operatorName: entry.operator_name
    });
  };

  const resetForm = () => {
    setFormData({
      color: '', 
      size: '', 
      weight: '', 
      serialNo: '', 
      barcodeValue: '', 
      operatorName: ''
    });
    setMode('add');
    setSelectedEntry(null);
  };

  const downloadCSV = (entries) => {
    const dataToDownload = Array.isArray(entries) ? entries : [entries];
    const csv = Papa.unparse(dataToDownload.map(entry => ({
      'Serial Number': entry.serial_no,
      'Color': entry.color,
      'Size': entry.size,
      'Weight': entry.weight,
      'Barcode': entry.barcode_value,
      'Operator Name': entry.operator_name,
      'Created At': format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss')
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pcs_entries_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (entry) => {
    const entriesToPrint = Array.isArray(entry) ? entry : [entry];
    const printContent = `
      <html>
        <head>
          <title>Print</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
            }
            @media print {
              body { margin: 0.5cm; }
              h1 { margin-bottom: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>PCS Entries</h1>
          <table>
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Color</th>
                <th>Size</th>
                <th>Weight</th>
                <th>Barcode</th>
                <th>Operator Name</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              ${entriesToPrint.map(entry => `
                <tr>
                  <td>${entry.serial_no}</td>
                  <td>${entry.color}</td>
                  <td>${entry.size}</td>
                  <td>${entry.weight}</td>
                  <td>${entry.barcode_value}</td>
                  <td>${entry.operator_name}</td>
                  <td>${format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div>
            <p>Printed on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
          </div>
        </body>
      </html>
    `;

    const newWindow = window.open('', '', 'width=800,height=600'); // define the size of the window
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">PCS Entry Management</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Color" 
          value={formData.color} 
          onChange={(e) => setFormData({...formData, color: e.target.value})} 
          className="border p-2 rounded" 
          required
        />
        <input 
          type="text" 
          placeholder="Size" 
          value={formData.size} 
          onChange={(e) => setFormData({...formData, size: e.target.value})} 
          className="border p-2 rounded" 
          required
        />
        <input 
          type="number" 
          placeholder="Weight" 
          value={formData.weight} 
          onChange={(e) => setFormData({...formData, weight: e.target.value})} 
          className="border p-2 rounded" 
          required
        />
        <input 
          type="text" 
          placeholder="Operator Name" 
          value={formData.operatorName} 
          onChange={(e) => setFormData({...formData, operatorName: e.target.value})} 
          className="border p-2 rounded" 
          required
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white p-2 rounded col-span-2 hover:bg-blue-600"
        >
          {mode === 'add' ? 'Add Entry' : 'Update Entry'}
        </button>
      </form>

      <div className="mb-6">
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              value={dateRange.startDate} 
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} 
              className="w-full border p-2 rounded" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              value={dateRange.endDate} 
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} 
              className="w-full border p-2 rounded" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input 
              type="text" 
              placeholder="Search by any field..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <button 
          onClick={() => handlePrint(filteredEntries)} 
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Print All
        </button>
        <button 
          onClick={() => downloadCSV(filteredEntries)} 
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Download All CSV
        </button>
        {(searchTerm || dateRange.startDate || dateRange.endDate) && (
          <div className="ml-4 text-sm text-gray-600">
            Showing {filteredEntries.length} of {entries.length} entries
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Serial Number</th>
              <th className="border border-gray-300 p-2">Color</th>
              <th className="border border-gray-300 p-2">Size</th>
              <th className="border border-gray-300 p-2">Weight</th>
              <th className="border border-gray-300 p-2">Barcode</th>
              <th className="border border-gray-300 p-2">Operator Name</th>
              <th className="border border-gray-300 p-2">Created At</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(entry => (
              <tr key={entry.id}>
                <td className="border border-gray-300 p-2">{entry.serial_no}</td>
                <td className="border border-gray-300 p-2">{entry.color}</td>
                <td className="border border-gray-300 p-2">{entry.size}</td>
                <td className="border border-gray-300 p-2">{entry.weight}</td>
                <td className="border border-gray-300 p-2">{entry.barcode_value}</td>
                <td className="border border-gray-300 p-2">{entry.operator_name}</td>
                <td className="border border-gray-300 p-2">
                  {format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </td>
                <td className="border border-gray-300 p-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(entry)} 
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)} 
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => handlePrint(entry)} 
                      className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      Print
                    </button>
                    <button 
                      onClick={() => downloadCSV(entry)} 
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      CSV
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No entries found. Add your first entry using the form above.
        </div>
      )}

      {entries.length > 0 && filteredEntries.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No entries match your search criteria.
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Total Entries: {entries.length}
        {filteredEntries.length !== entries.length && (
          <span> | Filtered Entries: {filteredEntries.length}</span>
        )}
      </div>
    </div>
  );
};

export default PCSEntryManagement;
                      