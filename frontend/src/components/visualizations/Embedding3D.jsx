import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function Embedding3D({ visualization }) {
  const data = useMemo(() => {
    if (!visualization) return null;

    const traces = [];

    // Career points
    if (visualization.careers_3d && visualization.careers_3d.length > 0) {
      traces.push({
        x: visualization.careers_3d.map(c => c[0]),
        y: visualization.careers_3d.map(c => c[1]),
        z: visualization.careers_3d.map(c => c[2]),
        mode: 'markers',
        type: 'scatter3d',
        name: 'Careers',
        marker: {
          size: 5,
          color: 'rgba(156, 163, 175, 0.6)',
        },
        text: Array(visualization.careers_3d.length).fill('Career'),
        hovertemplate: '<b>Career</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<extra></extra>',
      });
    }

    // Cluster centers
    if (visualization.clusters_3d && visualization.clusters_3d.length > 0) {
      traces.push({
        x: visualization.clusters_3d.map(c => c[0]),
        y: visualization.clusters_3d.map(c => c[1]),
        z: visualization.clusters_3d.map(c => c[2]),
        mode: 'markers',
        type: 'scatter3d',
        name: 'Cluster Centers',
        marker: {
          size: 8,
          color: 'rgba(239, 68, 68, 0.8)',
          symbol: 'diamond',
        },
        text: Array(visualization.clusters_3d.length).fill('Cluster'),
        hovertemplate: '<b>Cluster Center</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<extra></extra>',
      });
    }

    // User point
    if (visualization.user_3d) {
      traces.push({
        x: [visualization.user_3d[0]],
        y: [visualization.user_3d[1]],
        z: [visualization.user_3d[2]],
        mode: 'markers',
        type: 'scatter3d',
        name: 'You',
        marker: {
          size: 10,
          color: 'rgb(99, 102, 241)',
          symbol: 'star',
        },
        text: ['You'],
        hovertemplate: '<b>Your Profile</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<extra></extra>',
      });
    }

    return traces;
  }, [visualization]);

  if (!data || data.length === 0) return null;

  return (
    <Plot
      data={data}
      layout={{
        title: '3D Profile Embedding (UMAP)',
        scene: {
          xaxis: { title: 'UMAP1' },
          yaxis: { title: 'UMAP2' },
          zaxis: { title: 'UMAP3' },
        },
        height: 600,
      }}
      config={{ displayModeBar: false }}
    />
  );
}

export default Embedding3D;




