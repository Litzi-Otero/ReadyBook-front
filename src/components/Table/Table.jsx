// src/components/Table.jsx
import React from "react";
import "./Table.css";

const Table = ({ headers, data, renderRow, isLoading }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={headers.length}>No hay datos disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;