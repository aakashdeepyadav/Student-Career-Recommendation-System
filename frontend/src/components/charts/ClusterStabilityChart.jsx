import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function ClusterStabilityChart({ deploymentMetrics }) {
  const data = useMemo(() => {
    if (!deploymentMetrics) return null;

    const kmeansPlus = deploymentMetrics.kmeans_plus;
    const kmeansRandom = deploymentMetrics.kmeans_random;

    if (!kmeansPlus || !kmeansRandom) return null;

    // Extract stability and performance metrics
    const metrics = [
      'Cluster Stability',
      'Inter-Cluster Distance',
      'Intra-Cluster Variance',
      'Training Time (s)',
      'Prediction Time (ms)'
    ];

    const kmeansPlusValues = [
      kmeansPlus.performance?.cluster_stability || 0,
      kmeansPlus.performance?.inter_cluster_distance || 0,
      kmeansPlus.performance?.intra_cluster_variance || 0,
      kmeansPlus.performance?.training_time_seconds || 0,
      kmeansPlus.performance?.prediction_time_ms || 0
    ];

    const kmeansRandomValues = [
      kmeansRandom.performance?.cluster_stability || 0,
      kmeansRandom.performance?.inter_cluster_distance || 0,
      kmeansRandom.performance?.intra_cluster_variance || 0,
      kmeansRandom.performance?.training_time_seconds || 0,
      kmeansRandom.performance?.prediction_time_ms || 0
    ];

    // Normalize values for comparison (except time metrics which are already comparable)
    const normalizedPlus = kmeansPlusValues.map((val, idx) => {
      if (idx >= 3) return val; // Keep time metrics as-is
      const maxVal = Math.max(val, kmeansRandomValues[idx] || 1);
      return maxVal > 0 ? val / maxVal : 0;
    });

    const normalizedRandom = kmeansRandomValues.map((val, idx) => {
      if (idx >= 3) return val; // Keep time metrics as-is
      const maxVal = Math.max(val, kmeansPlusValues[idx] || 1);
      return maxVal > 0 ? val / maxVal : 0;
    });

    return [
      {
        x: metrics,
        y: normalizedPlus,
        type: 'bar',
        name: 'KMeans++',
        marker: { color: '#3b82f6' },
        hovertemplate: '<b>KMeans++</b><br>%{x}: %{y:.3f}<extra></extra>'
      },
      {
        x: metrics,
        y: normalizedRandom,
        type: 'bar',
        name: 'KMeans (Random)',
        marker: { color: '#8b5cf6' },
        hovertemplate: '<b>KMeans (Random)</b><br>%{x}: %{y:.3f}<extra></extra>'
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
            text: 'Cluster Stability & Performance Comparison',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { 
            title: 'Metric',
            tickangle: -45
          },
          yaxis: { title: 'Normalized Score' },
          barmode: 'group',
          margin: { l: 60, r: 30, t: 60, b: 100 },
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

export default ClusterStabilityChart;

