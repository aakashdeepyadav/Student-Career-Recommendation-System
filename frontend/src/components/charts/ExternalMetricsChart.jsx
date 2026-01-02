import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function ExternalMetricsChart({ externalMetrics }) {
  const data = useMemo(() => {
    if (!externalMetrics) return null;

    const metrics = [
      {
        name: 'Adjusted Rand Index',
        value: externalMetrics.adjusted_rand_index?.value,
        range: externalMetrics.adjusted_rand_index?.range || '[-1, 1]',
        interpretation: externalMetrics.adjusted_rand_index?.interpretation,
        order: 1
      },
      {
        name: 'Normalized Mutual Info',
        value: externalMetrics.normalized_mutual_info?.value,
        range: externalMetrics.normalized_mutual_info?.range || '[0, 1]',
        interpretation: externalMetrics.normalized_mutual_info?.interpretation,
        order: 2
      },
      {
        name: 'Fowlkes-Mallows Index',
        value: externalMetrics.fowlkes_mallows_index?.value,
        range: externalMetrics.fowlkes_mallows_index?.range || '[0, 1]',
        interpretation: externalMetrics.fowlkes_mallows_index?.interpretation,
        order: 3
      }
    ]
    .filter(m => m.value !== null && m.value !== undefined)
    .sort((a, b) => (b.value || 0) - (a.value || 0)); // Sort by value descending (highest first)

    if (metrics.length === 0) return null;

    return [
      {
        x: metrics.map(m => m.name),
        y: metrics.map(m => m.value),
        type: 'bar',
        marker: {
          color: metrics.map(m => {
            const val = m.value;
            if (m.name === 'Adjusted Rand Index') {
              // ARI: -1 to 1, green for positive, red for negative
              return val > 0.5 ? '#10b981' : val > 0 ? '#34d399' : val > -0.5 ? '#fbbf24' : '#ef4444';
            } else {
              // NMI and FMI: 0 to 1, green gradient
              return val > 0.7 ? '#10b981' : val > 0.5 ? '#34d399' : val > 0.3 ? '#fbbf24' : '#ef4444';
            }
          }),
          line: { color: 'white', width: 1 }
        },
        text: metrics.map(m => m.value.toFixed(4)),
        textposition: 'inside',
        textfont: {
          color: 'white',
          size: 12,
          family: 'Arial, sans-serif'
        },
        hovertemplate: '<b>%{x}</b><br>Value: %{y:.4f}<br>Range: %{customdata[0]}<br>Interpretation: %{customdata[1]}<extra></extra>',
        customdata: metrics.map(m => [m.range, m.interpretation || 'N/A'])
      }
    ];
  }, [externalMetrics]);

  if (!data) return null;

  return (
    <div className="w-full h-full overflow-auto">
      <Plot
        data={data}
        layout={{
          title: {
            text: 'External Validation Metrics',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { 
            title: 'Metric',
            tickangle: -45
          },
          yaxis: { 
            title: 'Score',
            range: [-1.1, 1.1]
          },
          margin: { l: 60, r: 30, t: 50, b: 120 },
          height: 400,
          autosize: true,
          shapes: [
            {
              type: 'line',
              x0: -0.5,
              x1: 2.5,
              y0: 0,
              y1: 0,
              line: { color: 'gray', width: 1, dash: 'dash' }
            }
          ]
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default ExternalMetricsChart;

