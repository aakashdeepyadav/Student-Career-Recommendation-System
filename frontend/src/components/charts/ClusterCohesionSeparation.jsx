import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function ClusterCohesionSeparation({ deploymentMetrics }) {
  const data = useMemo(() => {
    if (!deploymentMetrics) return null;

    const algorithms = ['KMeans++', 'KMeans (Random)'];
    const kmeansPlus = deploymentMetrics.kmeans_plus;
    const kmeansRandom = deploymentMetrics.kmeans_random;

    if (!kmeansPlus || !kmeansRandom) return null;

    // Cohesion (Intra-cluster variance - lower is better, so invert)
    const cohesion = [
      1 - (kmeansPlus.performance?.intra_cluster_variance || 0),
      1 - (kmeansRandom.performance?.intra_cluster_variance || 0)
    ];

    // Separation (Inter-cluster distance - higher is better)
    const separation = [
      kmeansPlus.performance?.inter_cluster_distance || 0,
      kmeansRandom.performance?.inter_cluster_distance || 0
    ];

    // Normalize to 0-1 scale for visualization
    const maxSep = Math.max(...separation);
    const normalizedSep = separation.map(s => maxSep > 0 ? s / maxSep : s);

    return [
      {
        x: algorithms,
        y: cohesion,
        type: 'bar',
        name: 'Cohesion (1 - Intra-cluster Variance)',
        marker: { color: '#10b981' },
        hovertemplate: '<b>Cohesion</b><br>%{x}: %{y:.3f}<br><i>Higher is better</i><extra></extra>'
      },
      {
        x: algorithms,
        y: normalizedSep,
        type: 'bar',
        name: 'Separation (Inter-cluster Distance)',
        marker: { color: '#3b82f6' },
        hovertemplate: '<b>Separation</b><br>%{x}: %{y:.3f}<br><i>Higher is better</i><extra></extra>'
      }
    ];
  }, [deploymentMetrics]);

  if (!data) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={{
          title: {
            text: 'Cluster Cohesion vs Separation',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { title: 'Algorithm' },
          yaxis: { 
            title: 'Normalized Score (0-1)',
            range: [0, 1.1]
          },
          barmode: 'group',
          margin: { l: 60, r: 30, t: 60, b: 60 },
          height: 400,
          autosize: true,
          legend: { orientation: 'h', y: -0.2 },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default ClusterCohesionSeparation;

