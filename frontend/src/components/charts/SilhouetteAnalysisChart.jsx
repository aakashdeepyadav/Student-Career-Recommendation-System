import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function SilhouetteAnalysisChart({ stats, studentVectors, clusterLabels }) {
  const data = useMemo(() => {
    if (!stats || !studentVectors || !clusterLabels || studentVectors.length === 0) return null;

    // Group samples by cluster
    const clusters = {};
    clusterLabels.forEach((label, idx) => {
      if (!clusters[label]) clusters[label] = [];
      clusters[label].push(idx);
    });

    // Calculate silhouette scores for each sample
    const silhouetteScores = [];
    const clusterIds = [];
    
    clusterLabels.forEach((label, idx) => {
      const clusterSamples = clusters[label];
      const otherClusters = Object.keys(clusters).filter(k => k !== label.toString());
      
      // a(i) = average distance to other points in same cluster
      let a = 0;
      if (clusterSamples.length > 1) {
        const distances = clusterSamples
          .filter(i => i !== idx)
          .map(i => {
            const diff = studentVectors[idx].map((v, j) => Math.pow(v - studentVectors[i][j], 2));
            return Math.sqrt(diff.reduce((sum, d) => sum + d, 0));
          });
        a = distances.length > 0 ? distances.reduce((sum, d) => sum + d, 0) / distances.length : 0;
      }

      // b(i) = minimum average distance to points in other clusters
      let b = Infinity;
      otherClusters.forEach(clusterKey => {
        const otherSamples = clusters[clusterKey];
        const distances = otherSamples.map(i => {
          const diff = studentVectors[idx].map((v, j) => Math.pow(v - studentVectors[i][j], 2));
          return Math.sqrt(diff.reduce((sum, d) => sum + d, 0));
        });
        const avgDist = distances.length > 0 ? distances.reduce((sum, d) => sum + d, 0) / distances.length : Infinity;
        b = Math.min(b, avgDist);
      });

      const s = b > a && (a > 0 || b < Infinity) ? (b - a) / Math.max(a, b) : 0;
      silhouetteScores.push(s);
      clusterIds.push(label);
    });

    // Group by cluster for visualization
    const clusterNames = stats.cluster_info?.cluster_names || [];
    const colors = ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    const traces = [];
    Object.keys(clusters).forEach((clusterKey, idx) => {
      const clusterIndices = clusters[clusterKey];
      const clusterScores = clusterIndices.map(i => silhouetteScores[i]).sort((a, b) => b - a);
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

    // Calculate average silhouette per cluster
    const avgSilhouette = silhouetteScores.reduce((sum, s) => sum + s, 0) / silhouetteScores.length;
    const avgByCluster = {};
    Object.keys(clusters).forEach(key => {
      const clusterScores = clusters[key].map(i => silhouetteScores[i]);
      avgByCluster[key] = clusterScores.reduce((sum, s) => sum + s, 0) / clusterScores.length;
    });

    return { traces, avgSilhouette, avgByCluster };
  }, [stats, studentVectors, clusterLabels]);

  if (!data || !data.traces || data.traces.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data.traces}
        layout={{
          title: {
            text: `Silhouette Analysis (Avg: ${data.avgSilhouette.toFixed(3)})`,
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
          }],
          annotations: [
            {
              x: data.avgSilhouette,
              y: 1,
              yref: 'paper',
              text: `Overall Avg: ${data.avgSilhouette.toFixed(3)}`,
              showarrow: true,
              arrowhead: 2,
              ax: 0,
              ay: -30,
              font: { color: '#1f2937', size: 12 }
            }
          ]
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default SilhouetteAnalysisChart;

