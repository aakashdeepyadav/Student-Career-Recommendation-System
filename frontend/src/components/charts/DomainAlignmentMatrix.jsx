import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function DomainAlignmentMatrix({ recommendations, clusterNames }) {
  const data = useMemo(() => {
    if (!recommendations || !clusterNames || recommendations.length === 0) return null;

    // Extract unique domains from recommendations
    const domains = [...new Set(recommendations.map(r => r.domain).filter(d => d && d !== 'Unknown' && d !== 'N/A'))];
    
    if (domains.length === 0) return null;

    // Count recommendations per domain per cluster
    // Since we don't have cluster assignments for recommendations, we'll use similarity-based grouping
    const domainClusterMatrix = [];
    
    // Group recommendations by similarity (top matches likely in same cluster)
    const highSimilarity = recommendations.filter(r => r.similarity_score > 0.7);
    const mediumSimilarity = recommendations.filter(r => r.similarity_score > 0.5 && r.similarity_score <= 0.7);
    const lowSimilarity = recommendations.filter(r => r.similarity_score <= 0.5);

    // Create pseudo-clusters based on similarity
    const pseudoClusters = [
      { name: 'High Match', recs: highSimilarity },
      { name: 'Medium Match', recs: mediumSimilarity },
      { name: 'Low Match', recs: lowSimilarity }
    ];

    // Build matrix: domains (rows) vs clusters (columns)
    const matrix = domains.map(domain => {
      return pseudoClusters.map(cluster => {
        const count = cluster.recs.filter(r => r.domain === domain).length;
        return count;
      });
    });

    return {
      z: matrix,
      x: pseudoClusters.map(c => c.name),
      y: domains,
      type: 'heatmap',
      colorscale: [
        [0, 'rgb(255, 255, 255)'],
        [0.3, 'rgb(255, 237, 160)'],
        [0.6, 'rgb(255, 200, 100)'],
        [0.8, 'rgb(255, 150, 50)'],
        [1, 'rgb(255, 100, 0)']
      ],
      showscale: true,
      colorbar: {
        title: 'Count',
        titleside: 'right'
      },
      text: matrix.map((row, i) => 
        row.map((val, j) => val > 0 ? val.toString() : '')
      ),
      hovertemplate: '<b>%{y} in %{x}</b><br>Count: %{z}<extra></extra>',
    };
  }, [recommendations, clusterNames]);

  if (!data) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={[data]}
        layout={{
          title: {
            text: 'Career Domain Alignment Matrix',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { title: 'Match Category', side: 'bottom' },
          yaxis: { title: 'Career Domain', autorange: 'reversed' },
          margin: { l: 120, r: 50, t: 60, b: 80 },
          height: 400,
          autosize: true,
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default DomainAlignmentMatrix;

