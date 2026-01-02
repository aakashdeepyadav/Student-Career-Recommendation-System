import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function SilhouetteAnalysis({ stats, studentVectors, clusterLabels }) {
  const data = useMemo(() => {
    if (!stats || !studentVectors || !clusterLabels) return null;

    // Group samples by cluster
    const clusters = {};
    clusterLabels.forEach((label, idx) => {
      if (!clusters[label]) clusters[label] = [];
      clusters[label].push(idx);
    });

    // Calculate silhouette scores for each sample (simplified version)
    // In real implementation, this would use sklearn's silhouette_samples
    const silhouetteScores = clusterLabels.map((label, idx) => {
      const clusterSamples = clusters[label];
      const otherClusters = Object.keys(clusters).filter(k => k !== label.toString());
      
      // Simplified silhouette calculation
      // a(i) = average distance to other points in same cluster
      // b(i) = minimum average distance to points in other clusters
      let a = 0;
      if (clusterSamples.length > 1) {
        const distances = clusterSamples
          .filter(i => i !== idx)
          .map(i => {
            const diff = studentVectors[idx].map((v, j) => Math.pow(v - studentVectors[i][j], 2));
            return Math.sqrt(diff.reduce((sum, d) => sum + d, 0));
          });
        a = distances.reduce((sum, d) => sum + d, 0) / distances.length;
      }

      let b = Infinity;
      otherClusters.forEach(clusterKey => {
        const otherSamples = clusters[clusterKey];
        const distances = otherSamples.map(i => {
          const diff = studentVectors[idx].map((v, j) => Math.pow(v - studentVectors[i][j], 2));
          return Math.sqrt(diff.reduce((sum, d) => sum + d, 0));
        });
        const avgDist = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        b = Math.min(b, avgDist);
      });

      const s = b > a ? (b - a) / Math.max(a, b) : 0;
      return { score: s, cluster: label };
    });

    // Sort by cluster, then by score
    silhouetteScores.sort((a, b) => {
      if (a.cluster !== b.cluster) return a.cluster - b.cluster;
      return b.score - a.score;
    });

    // Create data for each cluster
    const traces = [];
    const clusterNames = stats.cluster_info?.cluster_names || [];
    const colors = ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    Object.keys(clusters).forEach((clusterKey, idx) => {
      const clusterScores = silhouetteScores
        .filter(s => s.cluster === parseInt(clusterKey))
        .map(s => s.score);
      
      const yPositions = clusterScores.map((_, i) => i);
      
      traces.push({
        x: clusterScores,
        y: yPositions,
        type: 'bar',
        orientation: 'h',
        name: clusterNames[clusterKey] || `Cluster ${clusterKey}`,
        marker: {
          color: colors[idx % colors.length],
          line: { color: 'white', width: 0.5 }
        },
        hovertemplate: `<b>${clusterNames[clusterKey] || `Cluster ${clusterKey}`}</b><br>Silhouette Score: %{x:.3f}<extra></extra>`
      });
    });

    return traces;
  }, [stats, studentVectors, clusterLabels]);

  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={{
          title: {
            text: 'Silhouette Analysis by Cluster',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { 
            title: 'Silhouette Score',
            range: [-1, 1]
          },
          yaxis: { title: 'Sample Index (sorted by cluster)' },
          barmode: 'overlay',
          margin: { l: 80, r: 50, t: 60, b: 60 },
          height: 500,
          autosize: true,
          showlegend: true,
          shapes: [{
            type: 'line',
            x0: 0,
            x1: 0,
            y0: 0,
            y1: 1,
            yref: 'paper',
            line: { color: 'gray', width: 1, dash: 'dash' }
          }]
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default SilhouetteAnalysis;

