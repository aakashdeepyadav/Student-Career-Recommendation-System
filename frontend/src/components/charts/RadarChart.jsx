import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function RadarChart({ riasecProfile }) {
  const data = useMemo(() => {
    if (!riasecProfile) return null;

    const values = [
      riasecProfile.R || 0,
      riasecProfile.I || 0,
      riasecProfile.A || 0,
      riasecProfile.S || 0,
      riasecProfile.E || 0,
      riasecProfile.C || 0,
    ];

    return [
      {
        type: 'scatterpolar',
        r: [...values, values[0]], // Close the loop
        theta: ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional', 'Realistic'],
        fill: 'toself',
        name: 'RIASEC Profile',
        line: { color: 'rgb(99, 102, 241)' },
        fillcolor: 'rgba(99, 102, 241, 0.3)',
      },
    ];
  }, [riasecProfile]);

  if (!data) return null;

  return (
    <div className="w-full overflow-auto" style={{ height: '400px', maxHeight: '400px' }}>
      <Plot
        data={data}
        layout={{
          polar: {
            radialaxis: {
              visible: true,
              range: [0, 1],
              tickmode: 'linear',
              tick0: 0,
              dtick: 0.2,
              ticklen: 5,
              tickwidth: 1,
              tickcolor: '#666',
              showline: true,
              linecolor: '#ccc',
              gridcolor: '#e5e7eb',
              showgrid: true
            },
            angularaxis: {
              tickmode: 'linear',
              tick0: 0,
              direction: 'counterclockwise',
              rotation: 90
            },
            bgcolor: 'transparent',
            domain: {
              x: [0, 1],
              y: [0, 1]
            }
          },
          showlegend: false,
          autosize: true,
          height: 400,
          margin: { l: 80, r: 80, t: 60, b: 80 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent'
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default RadarChart;

