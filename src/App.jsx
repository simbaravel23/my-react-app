import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import Papa from 'papaparse';
import './index.css';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Componente para exibir o gráfico de barras
const ProcedureChart = ({ title, data }) => (
  <div className="bg-white rounded-xl shadow-xl p-4 mb-8 w-full max-w-sm mx-auto">
    <h2 className="text-lg font-bold text-gray-800 text-center mb-4">{title}</h2>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barCategoryGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="conteo" fill="#60a5fa" radius={[10, 10, 0, 0]} barSize={10} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Componente para exibir os dados em formato de tabela
const ProcedureDataDisplay = ({ chartData }) => {
  if (Object.keys(chartData).length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Dados Detalhados de los Procedimientos</h2>
      {Object.keys(chartData).map((procedureName, index) => (
        <div key={index} className="mb-6 border-b border-gray-200 last:border-b-0 pb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">{`Procedimento: ${procedureName}`}</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                  Año
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                  Conteo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData[procedureName].map((dataPoint, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dataPoint.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dataPoint.conteo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

// Novo componente para exibir o gráfico de barras total
const TotalProcedureBarChart = ({ data }) => (
  <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-auto mt-8">
    <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Total de Procedimentos</h2>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          interval={0}
          height={150}
        />
        <YAxis />
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

// Componente principal da aplicação
const App = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [pieChartData, setPieChartData] = useState([]);
  const [error, setError] = useState(null);

  const filePath = '/dados.csv';
  
  useEffect(() => {
    const fetchAndParseCSV = async () => {
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`No se pudo cargar el archivo CSV. Por favor, verifique si el archivo "dados.csv" está en la carpeta 'public'. Estado: ${response.status}`);
        }
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data;
            const years = ['2022', '2023', '2024'];
            const proceduresByYear = {};
            const totalProcedures = {};
            let total = 0;
    
            data.forEach(row => {
              const year = row['AÑO'];
              Object.keys(row).forEach(key => {
                const trimmedKey = key.trim();
                // Verifica se o cabeçalho da coluna contém 'PROCEDIMENTO'
                if (trimmedKey.includes('PROCEDIMENTO')) {
                  const procedure = row[key];
                  if (procedure && procedure.trim() !== '') {
                    if (!proceduresByYear[procedure]) {
                      proceduresByYear[procedure] = {};
                      totalProcedures[procedure] = 0;
                    }
                    if (!proceduresByYear[procedure][year]) {
                      proceduresByYear[procedure][year] = 0;
                    }
                    proceduresByYear[procedure][year]++;
                    totalProcedures[procedure]++;
                    total++;
                  }
                }
              });
            });
    
            // Preenche com 0 os anos ausentes para cada procedimento
            const allProcedures = Object.keys(proceduresByYear);
            const formattedData = {};
            allProcedures.forEach(procedure => {
              formattedData[procedure] = years.map(year => ({
                name: year,
                'conteo': proceduresByYear[procedure][year] || 0
              }));
            });

            const formattedPieData = Object.keys(totalProcedures).map(procedure => ({
              name: procedure,
              value: totalProcedures[procedure]
            }));
    
            setChartData(formattedData);
            setPieChartData(formattedPieData);
            setTotalCount(total);
            setLoading(false);
          },
          error: (error) => {
            setError(error.message);
            setLoading(false);
          }
        });

      } catch (e) {
        console.error("Error al cargar o analizar el archivo CSV:", e);
        setError(e.message);
        setLoading(false);
      }
    };

    fetchAndParseCSV();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Cargando dados...</p>
      </div>
    );
  }
  
  if (error) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
              <p className="text-red-600 text-lg text-center font-semibold mb-4">Error al cargar los dados:</p>
              <p className="text-gray-700 text-center">{error}</p>
          </div>
      );
  }

  if (Object.keys(chartData).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">No se encontraron dados de procedimiento para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
          Análisis de Procedimientos por Año
        </h1>
        <p className="text-gray-600 text-lg">
          Gráficos detalhados de los procedimentos realizados, a partir de los dados do CSV.
        </p>
        <p className="mt-4 text-2xl font-bold text-gray-800">Total de Procedimentos: {totalCount}</p>
      </header>
      <main className="flex flex-wrap justify-center gap-4">
        {Object.keys(chartData).map((procedureName, index) => (
          <ProcedureChart
            key={index}
            title={`Conteo de ${procedureName} por Año`}
            data={chartData[procedureName]}
          />
        ))}
      </main>
      <div className="flex justify-center">
        <TotalProcedureBarChart data={pieChartData} />
      </div>
      <div className="flex justify-center">
        <ProcedureDataDisplay chartData={chartData} />
      </div>
    </div>
  );
};

export default App;
