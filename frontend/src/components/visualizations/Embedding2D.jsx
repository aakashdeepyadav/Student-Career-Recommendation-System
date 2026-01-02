import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function Embedding2D({ visualization }) {
  const data = useMemo(() => {
    if (!visualization) return null;

    const traces = [];

    // Career points
    if (visualization.careers_2d && visualization.careers_2d.length > 0) {
      traces.push({
        x: visualization.careers_2d.map(c => c[0]),
        y: visualization.careers_2d.map(c => c[1]),
        mode: 'markers',
        type: 'scatter',
        name: 'Careers',
        marker: {
          size: 8,
          color: 'rgba(156, 163, 175, 0.6)',
        },
        text: Array(visualization.careers_2d.length).fill('Career'),
        hovertemplate: '<b>Career</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>',
      });
    }

    // Cluster centers
    if (visualization.clusters_2d && visualization.clusters_2d.length > 0) {
      traces.push({
        x: visualization.clusters_2d.map(c => c[0]),
        y: visualization.clusters_2d.map(c => c[1]),
        mode: 'markers',
        type: 'scatter',
        name: 'Cluster Centers',
        marker: {
          size: 12,
          color: 'rgba(239, 68, 68, 0.8)',
          symbol: 'diamond',
        },
        text: Array(visualization.clusters_2d.length).fill('Cluster'),
        hovertemplate: '<b>Cluster Center</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>',
      });
    }

    // User point
    if (visualization.user_2d) {
      traces.push({
        x: [visualization.user_2d[0]],
        y: [visualization.user_2d[1]],
        mode: 'markers',
        type: 'scatter',
        name: 'You',
        marker: {
          size: 15,
          color: 'rgb(99, 102, 241)',
          symbol: 'star',
        },
        text: ['You'],
        hovertemplate: '<b>Your Profile</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>',
      });
    }

    return traces;
  }, [visualization]);

  if (!data || data.length === 0) return null;

  return (
    <Plot
      data={data}
      layout={{
        title: '2D Profile Embedding (PCA)',
        xaxis: { title: 'PC1' },
        yaxis: { title: 'PC2' },
        height: 500,
        hovermode: 'closest',
      }}
      config={{ displayModeBar: false }}
    />
  );
}

export default Embedding2D;




