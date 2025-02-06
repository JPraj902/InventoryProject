import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className="overflow-x-auto">
    <table className={`w-full ${className}`}>{children}</table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="bg-gray-50">{children}</thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-gray-200">{children}</tbody>
);

export const TableRow = ({ children, className = '' }) => (
  <tr className={`hover:bg-gray-50 ${className}`}>{children}</tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-left text-sm font-semibold text-gray-600 ${className}`}>{children}</th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
);
