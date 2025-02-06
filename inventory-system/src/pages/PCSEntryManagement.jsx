import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import Papa from 'papaparse';

const PCSEntryManagement = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
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
    filterEntriesByDate();
  }, [entries, dateRange]);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/pcs');
      setEntries(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const filterEntriesByDate = () => {
    const { startDate, endDate } = dateRange;
    if (!startDate && !endDate) {
      setFilteredEntries(entries);
      return;
    }

    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (!start || entryDate >= start) && 
             (!end || entryDate <= end);
    });

    setFilteredEntries(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        color: formData.color,
        size: formData.size,
        weight: parseFloat(formData.weight),
        serialNo: formData.serialNo,
        barcodeValue: formData.barcodeValue, 
        operatorName: formData.operatorName
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

  const downloadCSV = () => {
    const csv = Papa.unparse(filteredEntries.map(entry => ({
      'Color': entry.color,
      'Size': entry.size,
      'Weight': entry.weight,
      'Serial Number': entry.serial_no,
      'Barcode': entry.barcode_value,
      'Operator Name': entry.operator_name,
      'Created At': format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss')
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pcs_entries.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Print</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
            }
          </style>
        </head>
        <body>
          <h1>PCS Entries</h1>
          <table>
            <thead>
              <tr>
                <th>Color</th>
                <th>Size</th>
                <th>Weight</th>
                <th>Serial Number</th>
                <th>Barcode</th>
                <th>Operator Name</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.color}</td>
                  <td>${entry.size}</td>
                  <td>${entry.weight}</td>
                  <td>${entry.serial_no}</td>
                  <td>${entry.barcode_value}</td>
                  <td>${entry.operator_name}</td>
                  <td>${format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const newWindow = window.open('', '', 'width=800,height=600');
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
          placeholder="Serial Number" 
          value={formData.serialNo} 
          onChange={(e) => setFormData({...formData, serialNo: e.target.value})} 
          className="border p-2 rounded" 
          required
        />
        <input 
          type="text" 
          placeholder="Barcode" 
          value={formData.barcodeValue} 
          onChange={(e) => setFormData({...formData, barcodeValue: e.target.value})} 
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

      <div className="mb-4 flex gap-4">
        <div>
          <label className="mr-2">Start Date:</label>
          <input 
            type="date" 
            value={dateRange.startDate} 
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} 
            className="border p-2 rounded" 
          />
        </div>
        <div>
          <label className="mr-2">End Date:</label>
          <input 
            type="date" 
            value={dateRange.endDate} 
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} 
            className="border p-2 rounded" 
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button 
          onClick={handlePrint} 
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Print
        </button>
        <button 
          onClick={downloadCSV} 
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Download CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Color</th>
              <th className="border border-gray-300 p-2">Size</th>
              <th className="border border-gray-300 p-2">Weight</th>
              <th className="border border-gray-300 p-2">Serial Number</th>
              <th className="border border-gray-300 p-2">Barcode</th>
              <th className="border border-gray-300 p-2">Operator Name</th>
              <th className="border border-gray-300 p-2">Created At</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map(entry => (
              <tr key={entry.id}>
                <td className="border border-gray-300 p-2">{entry.color}</td>
                <td className="border border-gray-300 p-2">{entry.size}</td>
                <td className="border border-gray-300 p-2">{entry.weight}</td>
                <td className="border border-gray-300 p-2">{entry.serial_no}</td>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PCSEntryManagement;