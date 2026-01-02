import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function ClusterMembershipChart({ visualization }) {
  const data = useMemo(() => {
    if (!visualization || !visualization.students_2d || !visualization.student_clusters) return null;

    const clusterColors = [
      'rgba(99, 102, 241, 0.6)',   // Tech/Analytical - Indigo
      'rgba(236, 72, 153, 0.6)',   // Creative - Pink
      'rgba(34, 197, 94, 0.6)',    // Business/Leadership - Green
      'rgba(251, 146, 60, 0.6)',  // Social/People - Orange
      'rgba(59, 130, 246, 0.6)',   // Practical/Realistic - Blue
    ];

    const clusterNames = [
      'Tech/Analytical',
      'Creative',
      'Business/Leadership',
      'Social/People',
      'Practical/Realistic'
    ];

    const traces = [];
    
    // Group students by cluster
    const clusters = {};
    visualization.students_2d.forEach((point, idx) => {
      const clusterId = visualization.student_clusters[idx];
      if (!clusters[clusterId]) {
        clusters[clusterId] = { x: [], y: [] };
      }
      clusters[clusterId].x.push(point[0]);
      clusters[clusterId].y.push(point[1]);
    });

    // Create a trace for each cluster
    Object.keys(clusters).forEach((clusterId) => {
      const id = parseInt(clusterId);
      traces.push({
        x: clusters[clusterId].x,
        y: clusters[clusterId].y,
        mode: 'markers',
        type: 'scatter',
        name: clusterNames[id] || `Cluster ${id}`,
        marker: {
          size: 8,
          color: clusterColors[id] || 'rgba(156, 163, 175, 0.6)',
        },
        hovertemplate: `<b>${clusterNames[id] || `Cluster ${id}`}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>`,
      });
    });

    // Add cluster centers if available
    if (visualization.clusters_2d && visualization.clusters_2d.length > 0) {
      traces.push({
        x: visualization.clusters_2d.map(c => c[0]),
        y: visualization.clusters_2d.map(c => c[1]),
        mode: 'markers',
        type: 'scatter',
        name: 'Cluster Centers',
        marker: {
          size: 15,
          color: 'rgba(239, 68, 68, 0.9)',
          symbol: 'diamond',
        },
        hovertemplate: '<b>Cluster Center</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>',
      });
    }

    // Add user point if available
    if (visualization.user_2d) {
      traces.push({
        x: [visualization.user_2d[0]],
        y: [visualization.user_2d[1]],
        mode: 'markers',
        type: 'scatter',
        name: 'You',
        marker: {
          size: 20,
          color: 'rgb(255, 215, 0)',
          symbol: 'star',
          line: { color: 'rgb(0, 0, 0)', width: 2 },
        },
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
        title: 'Cluster Membership Visualization (2D)',
        xaxis: { title: 'PC1' },
        yaxis: { title: 'PC2' },
        height: 500,
        hovermode: 'closest',
        showlegend: true,
      }}
      config={{ displayModeBar: false }}
    />
  );
}

export default ClusterMembershipChart;




