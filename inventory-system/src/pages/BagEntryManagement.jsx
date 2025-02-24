import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Printer, Download, Edit } from 'lucide-react';

// Print Utility with Enhanced Styling
const PrintUtil = {
  getBaseStyles: () => `
    @media print {
      @page {
        size: 80mm auto;
        margin: 0;
        padding: 0;
      }
    }
    
    body {
      font-family: 'Courier New', monospace;
      width: 80mm;
      margin: 0;
      padding: 0;
      background-color: white;
    }
    
    .print-receipt {
      padding: 8mm 5mm;
    }
    
    .print-header {
      text-align: center;
      border-bottom: 1.5px dashed #000;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    
    .print-header h2 {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .print-header .company-name {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 2px 0;
    }
    
    .print-header p {
      margin: 3px 0;
      font-size: 12px;
    }
    
    .print-header .receipt-info {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 11px;
    }
    
    .entry-item {
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px dotted #ccc;
    }
    
    .entry-item-header {
      font-weight: bold;
      margin: 5px 0;
      font-size: 12px;
      border-bottom: 1px solid #eee;
      padding-bottom: 3px;
      display: flex;
      justify-content: space-between;
    }
    
    .entry-details {
      margin: 5px 0;
    }
    
    .entry-details p {
      margin: 3px 0;
      font-size: 11px;
      display: flex;
      justify-content: space-between;
    }
    
    .entry-label {
      font-weight: bold;
      flex: 1;
    }
    
    .entry-value {
      flex: 1;
      text-align: right;
    }
    
    .two-column {
      display: flex;
      justify-content: space-between;
    }
    
    .two-column > div {
      flex: 1;
    }
    
    .summary-section {
      margin-top: 15px;
      border-top: 2px solid #000;
      padding-top: 10px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 12px;
      margin: 5px 0;
    }
    
    .summary-total {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #000;
      font-size: 14px;
      font-weight: bold;
    }
    
    .print-footer {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1.5px dashed #000;
      text-align: center;
    }
    
    .print-footer .thank-you {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 3px;
    }
    
    .print-footer .additional-info {
      font-size: 10px;
      color: #555;
      margin: 3px 0;
    }
    
    .barcode {
      margin: 10px auto;
      text-align: center;
    }
    
    .barcode-text {
      font-size: 10px;
      letter-spacing: 3px;
      margin-top: 3px;
    }
  `,

  printSingleReceipt(entry) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }

    const formattedDate = new Date(entry.created_at).toLocaleDateString();
    const formattedTime = new Date(entry.created_at).toLocaleTimeString();
    const receiptId = 'R' + entry.id.toString().padStart(6, '0');

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Receipt</title>
          <style>${this.getBaseStyles()}</style>
        </head>
        <body>
          <div class="print-receipt">
            <div class="print-header">
              <p class="company-name">YOUR COMPANY NAME</p>
              <h2>BAG ENTRY RECEIPT</h2>
              <p>Receipt No: ${receiptId}</p>
              <div class="receipt-info">
                <span>Date: ${formattedDate}</span>
                <span>Time: ${formattedTime}</span>
              </div>
            </div>
            
            <div class="entry-details">
              <p>
                <span class="entry-label">Serial No:</span>
                <span class="entry-value">${entry.serial_no}</span>
              </p>
              <p>
                <span class="entry-label">Quality:</span>
                <span class="entry-value">${entry.quality || '-'}</span>
              </p>
              <p>
                <span class="entry-label">Color:</span>
                <span class="entry-value">${entry.color || '-'}</span>
              </p>
              <div class="two-column">
                <div>
                  <p>
                    <span class="entry-label">Size:</span>
                    <span class="entry-value">${entry.size || '-'}</span>
                  </p>
                </div>
                <div>
                  <p>
                    <span class="entry-label">Weight:</span>
                    <span class="entry-value">${entry.weight ? entry.weight + ' kg' : '-'}</span>
                  </p>
                </div>
              </div>
              <div class="two-column">
                <div>
                  <p>
                    <span class="entry-label">Length:</span>
                    <span class="entry-value">${entry.length || '-'}</span>
                  </p>
                </div>
                <div>
                  <p>
                    <span class="entry-label">Width:</span>
                    <span class="entry-value">${entry.width || '-'}</span>
                  </p>
                </div>
              </div>
              <p>
                <span class="entry-label">Sq. Mtr:</span>
                <span class="entry-value">${entry.sqr_mtr || '-'}</span>
              </p>
              <p>
                <span class="entry-label">Operator:</span>
                <span class="entry-value">${entry.operator_name || '-'}</span>
              </p>
            </div>
            
            <div class="barcode">
              <svg viewBox="0 0 150 40" width="150" height="40">
                <!-- Simple barcode representation -->
                ${Array.from({ length: 20 }).map((_, i) => 
                  `<rect x="${i * 6}" y="0" width="3" height="${Math.random() > 0.3 ? 30 : 15}" fill="black" />`
                ).join('')}
              </svg>
              <div class="barcode-text">${receiptId}</div>
            </div>
            
            <div class="print-footer">
              <p class="thank-you">*** Thank You ***</p>
              <p class="additional-info">For any inquiries call: (123) 456-7890</p>
              <p class="additional-info">www.yourcompany.com</p>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  },

  printAllReceipts(entries) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print');
      return;
    }
  
    const totalWeight = entries.reduce((sum, entry) => sum + (parseFloat(entry.weight) || 0), 0);
    
    const printDate = new Date().toLocaleDateString();
    const printTime = new Date().toLocaleTimeString();
    const batchId = 'B' + Date.now().toString().slice(-8);
  
    const entriesHTML = entries.map((entry, index) => `
      <div class="entry-item">
        <div class="two-column">
            <div>
              <p>
                <span class="entry-label">Serial No.:</span>
                <span class="entry-value">${entry.serial_no || '-'}</span>
              </p>
            </div>
          </div>
        <div class="entry-details">
          <div class="two-column">
            <div>
              <p>
                <span class="entry-label">Color:</span>
                <span class="entry-value">${entry.color || '-'}</span>
              </p>
            </div>
          </div>
          <div class="two-column">
            <div>
              <p>
                <span class="entry-label">Size:</span>
                <span class="entry-value">${entry.size || '-'}</span>
              </p>
            </div>
          </div>
          <div class="two-column">
            <div>
              <p>
                <span class="entry-label">Weight:</span>
                <span class="entry-value">${entry.weight ? entry.weight + ' kg' : '-'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print All Receipts</title>
          <style>${this.getBaseStyles()}</style>
        </head>
        <body>
          <div class="print-receipt">
            <div class="print-header">
              <p class="company-name">YOUR COMPANY NAME</p>
              <h2>BAG ENTRIES SUMMARY</h2>
              <p>Batch ID: ${batchId}</p>
              <div class="receipt-info">
                <span>Date: ${printDate}</span>
                <span>Time: ${printTime}</span>
              </div>
            </div>
            
            <div class="entry-details">
              ${entriesHTML}
            </div>
              <div class="summary-row">
                <span>Total Weight:</span>
                <span>${totalWeight.toFixed(2)} kg</span>
              </div>
            </div>
            
            <div class="barcode">
              <svg viewBox="0 0 150 40" width="150" height="40">
                <!-- Simple barcode representation -->
                ${Array.from({ length: 20 }).map((_, i) => 
                  `<rect x="${i * 6}" y="0" width="3" height="${Math.random() > 0.3 ? 30 : 15}" fill="black" />`
                ).join('')}
              </svg>
              <div class="barcode-text">${batchId}</div>
            </div>
            
            <div class="print-footer">
              <p class="thank-you">*** End of Summary ***</p>
              <p class="additional-info">Printed by: System Admin</p>
              <p class="additional-info">For any inquiries call: (123) 456-7890</p>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;
  
    printWindow.document.write(content);
    printWindow.document.close();
  }
};

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
      if (!response.ok) throw new Error('Failed to fetch PCS entries');
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
      if (!response.ok) throw new Error('Failed to fetch bag entries');
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
      return data.color && data.operator_name && 
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
          quality: data.quality,
          color: data.color,
          shading: data.shading,
          length: parseFloat(data.length),
          width: parseFloat(data.width),
          size: parseFloat(data.size),
          sqr_mtr: parseFloat(sqr_mtr),
          weight: data.weight,
          operator_name: data.operator_name
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

        return await response.json();
      });

      await Promise.all(promises);
      
      setForms([{
        id: Date.now(),
        data: {
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

  const downloadSingleEntry = (entry) => {
    const csvContent = [
        ['SR No', 'Quality', 'Color', 'Length', 'Width', 'Size', 'Sq. Mtr', 'Weight', 'Operator Name', 'Created At'],
        [
            entry.serial_no,
            entry.quality,
            entry.color,
            entry.length,
            entry.width,
            entry.size,
            entry.sqr_mtr,
            entry.weight,
            entry.operator_name,
            formatDate(entry.created_at)
        ]
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bag_entry_${entry.serial_no}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const downloadAllCSV = () => {
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
            formatDate(entry.created_at)
        ]);
    });

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'all_bag_entries.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
};

const triggerPrintSingle = (entry) => {
    if (!entry) {
        alert('No entry selected for printing');
        return;
    }
    PrintUtil.printSingleReceipt(entry);
};

const triggerPrintAll = () => {
    if (!bagEntries || bagEntries.length === 0) {
        alert('No entries to print');
        return;
    }
    PrintUtil.printAllReceipts(bagEntries);
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
                            <p className="text-lg font-bold">Sq. Mtr: {calculateSqMtr(form.data)}</p>
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
                <div className="flex gap-2">
                    <button 
                        onClick={downloadAllCSV}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        <Download className="w-4 h-4" />
                        Download All CSV
                    </button>
                    <button 
                        onClick={triggerPrintAll}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        <Printer className="w-4 h-4" />
                        Print All
                    </button>
                </div>
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
                            <th className="border px-4 py-2">Actions</th>
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
                                    <div className="flex gap-2 justify-center">
                                        <button 
                                            onClick={() => handleEdit(entry)} 
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4 text-yellow-500" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(entry.id)} 
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                        <button 
                                            onClick={() => triggerPrintSingle(entry)}
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            title="Print"
                                        >
                                            <Printer className="w-4 h-4 text-blue-500" />
                                        </button>
                                        <button 
                                            onClick={() => downloadSingleEntry(entry)} 
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            title="Download CSV"
                                        >
                                            <Download className="w-4 h-4 text-green-500" />
                                        </button>
                                    </div>
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