import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function AlgorithmComparisonChart({ deploymentMetrics }) {
  const data = useMemo(() => {
    if (!deploymentMetrics) return null;

    const kmeansPlus = deploymentMetrics.kmeans_plus;
    const kmeansRandom = deploymentMetrics.kmeans_random;

    if (!kmeansPlus || !kmeansRandom) return null;

    const metrics = [
      'Silhouette',
      'Calinski-Harabasz',
      'Davies-Bouldin',
      'Cluster Stability',
      'Inter-Cluster Distance',
      'Intra-Cluster Variance'
    ];

    const kmeansPlusValues = [
      kmeansPlus.clustering_quality?.silhouette || 0,
      (kmeansPlus.clustering_quality?.calinski_harabasz || 0) / 100, // Normalize
      (kmeansPlus.clustering_quality?.davies_bouldin || 0) * 10, // Normalize (invert and scale)
      kmeansPlus.performance?.cluster_stability || 0,
      kmeansPlus.performance?.inter_cluster_distance || 0,
      (kmeansPlus.performance?.intra_cluster_variance || 0) * 10 // Normalize
    ];

    const kmeansRandomValues = [
      kmeansRandom.clustering_quality?.silhouette || 0,
      (kmeansRandom.clustering_quality?.calinski_harabasz || 0) / 100,
      (kmeansRandom.clustering_quality?.davies_bouldin || 0) * 10,
      kmeansRandom.performance?.cluster_stability || 0,
      kmeansRandom.performance?.inter_cluster_distance || 0,
      (kmeansRandom.performance?.intra_cluster_variance || 0) * 10
    ];

    return [
      {
        x: metrics,
        y: kmeansPlusValues,
        type: 'bar',
        name: 'KMeans++',
        marker: { color: '#3b82f6' },
        hovertemplate: '<b>KMeans++</b><br>%{x}: %{y:.3f}<extra></extra>'
      },
      {
        x: metrics,
        y: kmeansRandomValues,
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
            text: 'Algorithm Performance Comparison',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { 
            title: 'Metric',
            tickangle: -45
          },
          yaxis: { title: 'Normalized Score' },
          barmode: 'group',
          margin: { l: 60, r: 30, t: 60, b: 100 },
          height: 500,
          autosize: true,
          legend: { orientation: 'h', y: -0.2 },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default AlgorithmComparisonChart;

