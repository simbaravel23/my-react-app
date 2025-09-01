import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F'];

const PapanicolauComparisonChart = ({ data, title }) => (
  <div className="bg-white rounded-xl shadow-xl p-6 w-full lg:w-1/2">
    <h2 className="text-lg font-bold text-gray-800 text-center mb-4">{title}</h2>
    <ResponsiveContainer width="100%" height={450}>
      <BarChart
        data={data}
        margin={{ top: 40, right: 30, left: 20, bottom: 100 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          interval={0}
          height={160}
          tick={{ fontSize: 10 }}
        />
        <YAxis tick={{ fontSize: 16 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default PapanicolauComparisonChart;
