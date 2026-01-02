import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function ValidationIndicesChart({ deploymentMetrics }) {
  const data = useMemo(() => {
    if (!deploymentMetrics) return null;

    const kmeansPlus = deploymentMetrics.kmeans_plus;
    const kmeansRandom = deploymentMetrics.kmeans_random;

    if (!kmeansPlus || !kmeansRandom) return null;

    // Collect all validation indices
    const indices = [
      {
        name: 'Silhouette Score',
        kmeansPlus: kmeansPlus.clustering_quality?.silhouette || 0,
        kmeansRandom: kmeansRandom.clustering_quality?.silhouette || 0,
        higher: true,
        range: '[-1, 1]'
      },
      {
        name: 'Calinski-Harabasz',
        kmeansPlus: (kmeansPlus.clustering_quality?.calinski_harabasz || 0) / 100, // Normalize
        kmeansRandom: (kmeansRandom.clustering_quality?.calinski_harabasz || 0) / 100,
        higher: true,
        range: '[0, ∞)'
      },
      {
        name: 'Davies-Bouldin',
        kmeansPlus: (kmeansRandom.clustering_quality?.davies_bouldin || 0) * 10, // Normalize and invert
        kmeansRandom: (kmeansRandom.clustering_quality?.davies_bouldin || 0) * 10,
        higher: false,
        range: '[0, ∞)'
      },
      {
        name: 'Cluster Stability',
        kmeansPlus: kmeansPlus.performance?.cluster_stability || 0,
        kmeansRandom: kmeansRandom.performance?.cluster_stability || 0,
        higher: true,
        range: '[0, 1]'
      }
    ];

    return {
      indices: indices.map(idx => idx.name),
      kmeansPlus: indices.map(idx => idx.kmeansPlus),
      kmeansRandom: indices.map(idx => idx.kmeansRandom),
      metadata: indices
    };
  }, [deploymentMetrics]);

  if (!data) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={[
          {
            x: data.indices,
            y: data.kmeansPlus,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'KMeans++',
            line: { color: '#3b82f6', width: 3 },
            marker: { size: 10, color: '#3b82f6' },
            hovertemplate: '<b>KMeans++</b><br>%{x}: %{y:.3f}<extra></extra>'
          },
          {
            x: data.indices,
            y: data.kmeansRandom,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'KMeans (Random)',
            line: { color: '#8b5cf6', width: 3 },
            marker: { size: 10, color: '#8b5cf6' },
            hovertemplate: '<b>KMeans (Random)</b><br>%{x}: %{y:.3f}<extra></extra>'
          }
        ]}
        layout={{
          title: {
            text: 'External Validation Indices Comparison',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { 
            title: 'Validation Index',
            tickangle: -45
          },
          yaxis: { title: 'Normalized Score' },
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

export default ValidationIndicesChart;

