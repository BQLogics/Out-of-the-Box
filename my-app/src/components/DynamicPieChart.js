// src/components/DynamicPieChart.jsx
import React from 'react';

const DynamicPieChart = ({ data, title }) => (
  <div>
    <h3>{title}</h3>
    <p>Pie chart goes here (Data: {JSON.stringify(data)})</p>
  </div>
);

export default DynamicPieChart;


