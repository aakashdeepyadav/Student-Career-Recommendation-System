import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function RIASECComparisonMatrix({ riasecProfile }) {
  const data = useMemo(() => {
    if (!riasecProfile) return null;

    const dimensions = ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'];
    const values = [
      riasecProfile.R || 0,
      riasecProfile.I || 0,
      riasecProfile.A || 0,
      riasecProfile.S || 0,
      riasecProfile.E || 0,
      riasecProfile.C || 0,
    ];

    // Create heatmap data
    const z = [];
    const colors = [];
    
    // Create a 6x6 matrix comparing each dimension
    for (let i = 0; i < 6; i++) {
      const row = [];
      const colorRow = [];
      for (let j = 0; j < 6; j++) {
        if (i === j) {
          row.push(values[i]);
          colorRow.push(values[i]);
        } else {
          // Compare dimension i with dimension j
          const diff = Math.abs(values[i] - values[j]);
          row.push(diff);
          colorRow.push(1 - diff); // Inverse for color scale
        }
      }
      z.push(row);
      colors.push(colorRow);
    }

    return [
      {
        z: z,
        x: dimensions,
        y: dimensions,
        type: 'heatmap',
        colorscale: [
          [0, 'rgb(220, 220, 220)'],
          [0.2, 'rgb(173, 216, 230)'],
          [0.4, 'rgb(135, 206, 250)'],
          [0.6, 'rgb(70, 130, 180)'],
          [0.8, 'rgb(30, 144, 255)'],
          [1, 'rgb(0, 100, 200)']
        ],
        showscale: true,
        colorbar: {
          title: 'Score',
          titleside: 'right'
        },
        text: z.map((row, i) => 
          row.map((val, j) => 
            i === j ? `${dimensions[i]}: ${(val * 100).toFixed(0)}%` : 
            `Diff: ${(val * 100).toFixed(0)}%`
          )
        ),
        hovertemplate: '<b>%{y} vs %{x}</b><br>Value: %{z:.2f}<extra></extra>',
      },
    ];
  }, [riasecProfile]);

  if (!data) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={{
          title: {
            text: 'RIASEC Dimension Comparison Matrix',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { title: 'Dimension', side: 'bottom' },
          yaxis: { title: 'Dimension', autorange: 'reversed' },
          margin: { l: 80, r: 50, t: 60, b: 80 },
          height: 500,
          autosize: true,
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default RIASECComparisonMatrix;

