import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const BagEntryManagement = () => {
  const [pcsEntries, setPcsEntries] = useState([]);
  const [bagEntries, setBagEntries] = useState([]);
  const [forms, setForms] = useState([{
    id: Date.now(),
    data: {
      serial_no: '',
      quality: '',
      color: '',
      shading: '',
      length: '',
      width: '',
      operator_name: '',
      weight: '',
      size: '',
      sqr_mtr: ''
    }
  }]);

  useEffect(() => {
    fetchPcsEntries();
    fetchBagEntries();
  }, []);

  const fetchPcsEntries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pcs');
      if (!response.ok) {
        throw new Error('Failed to fetch PCS entries');
      }
      const data = await response.json();
      setPcsEntries(data);
    } catch (error) {
      console.error('Fetch PCS entries error:', error);
      alert('Failed to fetch PCS entries');
    }
  };

  const fetchBagEntries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bag');
      if (!response.ok) {
        throw new Error('Failed to fetch bag entries');
      }
      const data = await response.json();
      setBagEntries(data);
    } catch (error) {
      console.error('Fetch bag entries error:', error);
      alert('Failed to fetch bag entries');
    }
  };

  const handleFieldSelection = (formId, field, value) => {
    setForms(prevForms => 
      prevForms.map(form => 
        form.id === formId
          ? { 
              ...form, 
              data: { 
                ...form.data, 
                [field === 'operatorName' ? 'operator_name' : field]: value 
              } 
            }
          : form
      )
    );
  };

  const calculateSqMtr = (formData) => {
    const length = parseFloat(formData.length);
    const width = parseFloat(formData.width);
    const size = parseFloat(formData.size) || 1;
    
    if (length && width && size) {
      return (length * width * size).toFixed(2);
    }
    return '0';
  };

  const addForm = () => {
    setForms(prevForms => [...prevForms, {
      id: Date.now(),
      data: {
        serial_no: '',
        quality: '',
        color: '',
        shading: '',
        length: '',
        width: '',
        operator_name: '',
        weight: '',
        size: '',
        sqr_mtr: ''
      }
    }]);
  };

  const removeForm = (formId) => {
    if (forms.length > 1) {
      setForms(prevForms => prevForms.filter(form => form.id !== formId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formValidation = forms.every(form => {
      const { data } = form;
      return data.serial_no && data.color && data.operator_name && 
             data.length && data.width && data.size;
    });

    if (!formValidation) {
      alert('Please fill in all required fields in all forms');
      return;
    }

    try {
      const promises = forms.map(async ({ data }) => {
        const sqr_mtr = calculateSqMtr(data);
        const payload = {
          ...data,
          length: parseFloat(data.length),
          width: parseFloat(data.width),
          size: parseFloat(data.size),
          sqr_mtr: parseFloat(sqr_mtr)
        };

        const response = await fetch('http://localhost:5000/api/bag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`Failed to submit bag entry: ${errorDetails}`);
        }

        const result = await response.json();
        return result;
      });

      const results = await Promise.all(promises);
      
      setForms([{
        id: Date.now(),
        data: {
          serial_no: '',
          quality: '',
          color: '',
          shading: '',
          length: '',
          width: '',
          operator_name: '',
          weight: '',
          size: '',
          sqr_mtr: ''
        }
      }]);

      fetchBagEntries();
      alert('All entries created successfully!');
      
      results.forEach(result => {
        if (result.qrCode) {
          console.log('QR Code generated:', result.qrCode);
        }
      });
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEdit = async (entry) => {
    try {
      setForms([{
        id: Date.now(),
        data: {
          serial_no: entry.serial_no,
          quality: entry.quality,
          color: entry.color,
          shading: entry.shading,
          length: entry.length.toString(),
          width: entry.width.toString(),
          operator_name: entry.operator_name,
          weight: entry.weight,
          size: entry.size.toString(),
          sqr_mtr: entry.sqr_mtr?.toString() || '0'
        }
      }]);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Edit error:', error);
      alert('Failed to load entry for editing');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/bag/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete bag entry');
        }

        fetchBagEntries();
        alert('Entry deleted successfully!');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete entry');
      }
    }
  };

  const downloadCSV = () => {
    const csvRows = [
      ['SR No', 'Quality', 'Color', 'Length', 'Width', 'Size', 'Sq. Mtr', 'Weight', 'Operator Name', 'Created At']
    ];

    bagEntries.forEach(entry => {
      csvRows.push([
        entry.serial_no,
        entry.quality,
        entry.color,
        entry.length,
        entry.width,
        entry.size,
        entry.sqr_mtr,
        entry.weight,
        entry.operator_name,
        new Date(entry.created_at).toLocaleString()
      ]);
    });

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bag_entries.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Multiple Bag Entries</h1>

      <form onSubmit={handleSubmit} className="space-y-6 mb-6">
        {forms.map((form, index) => (
          <div key={form.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Form {index + 1}</h2>
              <div className="flex gap-2">
                {index === forms.length - 1 && (
                  <button
                    type="button"
                    onClick={addForm}
                    className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Form
                  </button>
                )}
                {forms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeForm(form.id)}
                    className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select 
                onChange={(e) => handleFieldSelection(form.id, 'serial_no', e.target.value)} 
                className="border p-2 rounded"
                value={form.data.serial_no}
                required
              >
                <option value="">Select Serial No</option>
                {pcsEntries.map((pcs) => (
                  <option key={pcs.id} value={pcs.serial_no}>
                    {pcs.serial_no}
                  </option>
                ))}
              </select>

              <select 
                onChange={(e) => handleFieldSelection(form.id, 'color', e.target.value)} 
                className="border p-2 rounded"
                value={form.data.color}
                required
              >
                <option value="">Select Color</option>
                {pcsEntries.map((pcs) => (
                  <option key={pcs.id} value={pcs.color}>
                    {pcs.color}
                  </option>
                ))}
              </select>

              <select 
                onChange={(e) => handleFieldSelection(form.id, 'weight', e.target.value)} 
                className="border p-2 rounded"
                value={form.data.weight}
              >
                <option value="">Select Weight</option>
                {pcsEntries.map((pcs) => (
                  <option key={pcs.id} value={pcs.weight}>
                    {pcs.weight} kg
                  </option>
                ))}
              </select>

              <select 
                onChange={(e) => handleFieldSelection(form.id, 'size', e.target.value)} 
                className="border p-2 rounded"
                value={form.data.size}
                required
              >
                <option value="">Select Size</option>
                {pcsEntries.map((pcs) => (
                  <option key={pcs.id} value={pcs.size}>
                    {pcs.size}
                  </option>
                ))}
              </select>

              <input 
                type="text" 
                placeholder="Quality" 
                value={form.data.quality} 
                onChange={(e) => handleFieldSelection(form.id, 'quality', e.target.value)} 
                className="border p-2 rounded"
                required
              />
              
              <input 
                type="text" 
                placeholder="Shading" 
                value={form.data.shading} 
                onChange={(e) => handleFieldSelection(form.id, 'shading', e.target.value)} 
                className="border p-2 rounded"
              />
              
              <input 
                type="number" 
                step="0.01"
                placeholder="Length" 
                value={form.data.length} 
                onChange={(e) => handleFieldSelection(form.id, 'length', e.target.value)} 
                className="border p-2 rounded"
                required
              />
              
              <input 
                type="number" 
                step="0.01"
                placeholder="Width" 
                value={form.data.width} 
                onChange={(e) => handleFieldSelection(form.id, 'width', e.target.value)} 
                className="border p-2 rounded"
                required
              />

              <div className="col-span-2 bg-gray-100 p-3 rounded">
                <p className="font-semibold">Square Meters Calculation:</p>
                <p>Length: {form.data.length || '0'} × Width: {form.data.width || '0'} × Size: {form.data.size || '0'}</p>
                <p className="text-lg font-bold">Total Sq. Mtr: {calculateSqMtr(form.data)}</p>
              </div>

              <input 
                type="text" 
                placeholder="Operator Name" 
                value={form.data.operator_name} 
                onChange={(e) => handleFieldSelection(form.id, 'operator_name', e.target.value)} 
                className="border p-2 rounded"
                required
              />
            </div>
          </div>
        ))}

        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 font-semibold"
        >
          Submit All Forms
        </button>
      </form>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bag Entries</h2>
          <button 
            onClick={downloadCSV} 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Download CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2">SR No</th>
                <th className="border px-4 py-2">Quality</th>
                <th className="border px-4 py-2">Color</th>
                <th className="border px-4 py-2">Length</th>
                <th className="border px-4 py-2">Width</th>
                <th className="border px-4 py-2">Size</th>
                <th className="border px-4 py-2">Sq. Mtr</th>
                <th className="border px-4 py-2">Weight</th>
                <th className="border px-4 py-2">Operator Name</th>
                <th className="border px-4 py-2">Created At</th>
                </tr>
            </thead>
            <tbody>
              {bagEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{entry.serial_no}</td>
                  <td className="border px-4 py-2">{entry.quality}</td>
                  <td className="border px-4 py-2">{entry.color}</td>
                  <td className="border px-4 py-2">{entry.length}</td>
                  <td className="border px-4 py-2">{entry.width}</td>
                  <td className="border px-4 py-2">{entry.size}</td>
                  <td className="border px-4 py-2">{entry.sqr_mtr}</td>
                  <td className="border px-4 py-2">{entry.weight}</td>
                  <td className="border px-4 py-2">{entry.operator_name}</td>
                  <td className="border px-4 py-2">{formatDate(entry.created_at)}</td>
                  <td className="border px-4 py-2">
                    <button 
                      onClick={() => handleEdit(entry)} 
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)} 
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BagEntryManagement;