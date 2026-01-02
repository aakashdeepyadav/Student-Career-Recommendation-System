import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function SkillBarChart({ skills }) {
  const data = useMemo(() => {
    if (!skills) return null;

    const skillNames = Object.keys(skills);
    const values = Object.values(skills).map(v => (v - 1) / 4); // Normalize 1-5 to 0-1

    return [
      {
        type: 'bar',
        x: skillNames.map(s => s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
        y: values,
        marker: {
          color: 'rgb(99, 102, 241)',
        },
      },
    ];
  }, [skills]);

  if (!data) return null;

  return (
    <div className="w-full overflow-auto" style={{ height: '400px', maxHeight: '400px' }}>
      <Plot
        data={data}
        layout={{
          autosize: true,
          xaxis: { 
            title: 'Skills',
            tickangle: -45
          },
          yaxis: { 
            title: 'Proficiency (0-1)', 
            range: [0, 1] 
          },
          height: 400,
          margin: { l: 60, r: 30, t: 30, b: 80 },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default SkillBarChart;

