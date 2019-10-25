/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import _ from 'lodash';
import React from 'react';

const Table = ({ children, ...props }) => (
  <div className="table-container">
    <table
      {..._.omit(props, ['columnAlignment'])}
    >
      {children}
    </table>
  </div>
);

export default Table;
