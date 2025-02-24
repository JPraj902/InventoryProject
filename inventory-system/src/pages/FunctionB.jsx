import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const FunctionB = () => {
  const [activeForm, setActiveForm] = useState(null);
  const [packingNetForm, setPackingNetForm] = useState({
    length: '',
    width: '',
    roll: '',
    mtr: ''
  });
  
  const [softPackingForm, setSoftPackingForm] = useState({
    size: '',
    color: '',
    noOfRoll: '',
    wtKg: '',
    srNo: ''
  });

  const calculateMTR = () => {
    const length = parseFloat(packingNetForm.length);
    const roll = parseFloat(packingNetForm.roll);
    if (!isNaN(length) && !isNaN(roll)) {
      setPackingNetForm({
        ...packingNetForm,
        mtr: (length * roll).toFixed(2)
      });
    }
  };

  const handlePackingNetSubmit = (e) => {
    e.preventDefault();
    calculateMTR();
  };

  const handleSoftPackingSubmit = (e) => {
    e.preventDefault();
    // Add any additional processing here
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Packing Net</h1>
      
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveForm('packingNet')}
          className={`px-6 py-3 rounded-lg ${
            activeForm === 'packingNet' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Packing Net
        </button>
        <button
          onClick={() => setActiveForm('softPacking')}
          className={`px-6 py-3 rounded-lg ${
            activeForm === 'softPacking' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Soft Packing Net
        </button>
      </div>

      {activeForm === 'packingNet' && (
        <Card>
          <CardHeader>
            <CardTitle>Packing Net Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePackingNetSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Length</label>
                  <input
                    type="number"
                    value={packingNetForm.length}
                    onChange={(e) => setPackingNetForm({
                      ...packingNetForm,
                      length: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Width</label>
                  <input
                    type="number"
                    value={packingNetForm.width}
                    onChange={(e) => setPackingNetForm({
                      ...packingNetForm,
                      width: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Roll</label>
                  <input
                    type="number"
                    value={packingNetForm.roll}
                    onChange={(e) => setPackingNetForm({
                      ...packingNetForm,
                      roll: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">MTR (Length × Roll)</label>
                  <input
                    type="text"
                    value={packingNetForm.mtr}
                    className="w-full p-2 border rounded bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Calculate
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeForm === 'softPacking' && (
        <Card>
          <CardHeader>
            <CardTitle>Soft Packing Net</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSoftPackingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <input
                    type="text"
                    value={softPackingForm.size}
                    onChange={(e) => setSoftPackingForm({
                      ...softPackingForm,
                      size: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    type="text"
                    value={softPackingForm.color}
                    onChange={(e) => setSoftPackingForm({
                      ...softPackingForm,
                      color: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No. of Roll</label>
                  <input
                    type="number"
                    value={softPackingForm.noOfRoll}
                    onChange={(e) => setSoftPackingForm({
                      ...softPackingForm,
                      noOfRoll: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WT. KG</label>
                  <input
                    type="number"
                    step="0.01"
                    value={softPackingForm.wtKg}
                    onChange={(e) => setSoftPackingForm({
                      ...softPackingForm,
                      wtKg: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Sr. No</label>
                  <input
                    type="text"
                    value={softPackingForm.srNo}
                    onChange={(e) => setSoftPackingForm({
                      ...softPackingForm,
                      srNo: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FunctionB;