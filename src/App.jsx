import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import Papa from 'papaparse';
import './index.css';
import PapanicolauComparisonChart from './componets/PapanicolauComparisonChart';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Componente para exibir o gráfico de barras
const ProcedureChart = ({ title, data }) => (
  <div className="bg-white rounded-xl shadow-xl p-4 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4">
    <h2 className="text-sm font-bold text-gray-800 text-center mb-4">{title}</h2>
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barCategoryGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 16 }} />
        <YAxis tick={{ fontSize: 16 }} />
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
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Dados Detalhados de los Procedimentos</h2>
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
const TotalProcedureBarChart = ({ data, title }) => (
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
          tick={{ fontSize: 8 }}
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


// Componente principal da aplicação
const App = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [allProceduresData, setAllProceduresData] = useState([]);
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
            
            // Passo 1: Identifica todas as colunas que contêm "PROCEDIMENTO" no cabeçalho
            const procedureHeaders = results.meta.fields.filter(field => 
              field.toUpperCase().includes('PROCEDIM')
            );
            
            // Passo 2: Coleta todos os nomes de procedimentos únicos do arquivo CSV, normalizando para maiúsculas
            const allUniqueProcedures = new Set();
            data.forEach(row => {
              procedureHeaders.forEach(header => {
                const procedure = row[header];
                if (procedure && procedure.trim() !== '') {
                  allUniqueProcedures.add(procedure.trim().toUpperCase());
                }
              });
            });

            // Passo 3: Inicializa a contagem de todos os procedimentos únicos
            const proceduresData = {};
            allUniqueProcedures.forEach(procedureName => {
              proceduresData[procedureName] = { total: 0, years: {} };
              years.forEach(y => proceduresData[procedureName].years[y] = 0);
            });

            // Passo 4: Conta os procedimentos por ano, normalizando o nome para maiúsculas
            let totalProceduresCount = 0;
            data.forEach(row => {
              const year = row['AÑO'];
              if (year && years.includes(year)) {
                procedureHeaders.forEach(header => {
                  const procedure = row[header];
                  if (procedure && procedure.trim() !== '') {
                    const trimmedUpperCaseProcedure = procedure.trim().toUpperCase();
                    if (proceduresData[trimmedUpperCaseProcedure]) {
                      proceduresData[trimmedUpperCaseProcedure].years[year]++;
                      proceduresData[trimmedUpperCaseProcedure].total++;
                      totalProceduresCount++;
                    }
                  }
                });
              }
            });

            // Passo 5: Formata os dados para os gráficos
            const formattedChartData = {};
            const formattedAllProceduresData = [];

            const procedureNames = Object.keys(proceduresData).sort();

            procedureNames.forEach(procedureName => {
              // Gráfico por ano para cada procedimento
              formattedChartData[procedureName] = years.map(year => ({
                name: year,
                conteo: proceduresData[procedureName].years[year]
              }));
              
              // Gráfico total
              const totalDataPoint = {
                name: procedureName,
                value: proceduresData[procedureName].total
              };
              formattedAllProceduresData.push(totalDataPoint);
            });
            
            setChartData(formattedChartData);
            setAllProceduresData(formattedAllProceduresData);
            setTotalCount(totalProceduresCount);
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 text-lg mb-4">No se encontraron dados de procedimiento para mostrar.</p>
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
      <main className="flex flex-wrap justify-center gap-8">
        {Object.keys(chartData).map((procedureName, index) => (
          <ProcedureChart
            key={index}
            title={`Conteo de ${procedureName} por Año`}
            data={chartData[procedureName]}
          />
          
        ))}
      </main>
      
      <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-8 mt-8">
        <TotalProcedureBarChart data={allProceduresData} title="Total de Todos os Procedimentos" />
        
      </div>
      <div className="flex justify-center">
        <ProcedureDataDisplay chartData={chartData} />
      </div>
      
    </div>
    
  );
};

export default App;
