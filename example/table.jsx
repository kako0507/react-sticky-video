/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';

const Table = ({ children, ...props }) => (
  <div className="table-container">
    <table {...props}>
      {children}
    </table>
  </div>
);

export default Table;
