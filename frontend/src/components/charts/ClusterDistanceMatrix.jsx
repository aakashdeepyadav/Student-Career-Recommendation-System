import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function ClusterDistanceMatrix({ clusterCenters, clusterNames }) {
  const data = useMemo(() => {
    if (!clusterCenters || !clusterNames || clusterCenters.length === 0) {
      console.log('[ClusterDistanceMatrix] Missing data:', { clusterCenters, clusterNames });
      return null;
    }

    // Normalize cluster centers - handle different data structures
    const normalizedCenters = clusterCenters.map((center, idx) => {
      // If it's already an array, use it
      if (Array.isArray(center)) {
        return center;
      }
      // If it's an object with center property (from API)
      if (center && typeof center === 'object' && center.center) {
        const centerArray = Array.isArray(center.center) ? center.center : [];
        if (centerArray.length > 0) {
          return centerArray;
        }
      }
      // If it's an object with numeric properties, convert to array
      if (center && typeof center === 'object') {
        const values = Object.values(center).filter(v => typeof v === 'number');
        if (values.length > 0) return values;
      }
      console.warn(`[ClusterDistanceMatrix] Invalid center at index ${idx}:`, center);
      return [];
    }).filter(center => center.length > 0);

    if (normalizedCenters.length === 0) {
      console.error('[ClusterDistanceMatrix] No valid cluster centers found');
      return null;
    }

    // Ensure all centers have the same dimension
    const dimension = normalizedCenters[0].length;
    const validCenters = normalizedCenters.filter(c => c.length === dimension);
    
    if (validCenters.length !== normalizedCenters.length) {
      console.warn(`[ClusterDistanceMatrix] Filtered out ${normalizedCenters.length - validCenters.length} centers with mismatched dimensions`);
    }

    if (validCenters.length === 0) {
      console.error('[ClusterDistanceMatrix] No valid centers after dimension check');
      return null;
    }

    // Calculate pairwise distances between cluster centers
    const n = validCenters.length;
    const distanceMatrix = [];
    
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          row.push(0);
        } else {
          // Euclidean distance between cluster centers
          const diff = validCenters[i].map((val, idx) => 
            Math.pow(val - (validCenters[j][idx] || 0), 2)
          );
          const distance = Math.sqrt(diff.reduce((sum, d) => sum + d, 0));
          row.push(distance);
        }
      }
      distanceMatrix.push(row);
    }

    // Use only the valid cluster names
    const validNames = clusterNames.slice(0, n);

    return [
      {
        z: distanceMatrix,
        x: validNames,
        y: validNames,
        type: 'heatmap',
        colorscale: [
          [0, 'rgb(255, 255, 255)'],
          [0.2, 'rgb(220, 220, 220)'],
          [0.4, 'rgb(173, 216, 230)'],
          [0.6, 'rgb(135, 206, 250)'],
          [0.8, 'rgb(70, 130, 180)'],
          [1, 'rgb(30, 144, 255)']
        ],
        showscale: true,
        colorbar: {
          title: 'Distance',
          titleside: 'right'
        },
        text: distanceMatrix.map((row, i) => 
          row.map((val, j) => 
            i === j ? '0 (Same)' : `${val.toFixed(2)}`
          )
        ),
        hovertemplate: '<b>%{y} ↔ %{x}</b><br>Distance: %{z:.3f}<extra></extra>',
      },
    ];
  }, [clusterCenters, clusterNames]);

  if (!data) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={{
          title: {
            text: 'Inter-Cluster Distance Matrix',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { title: 'Cluster', side: 'bottom' },
          yaxis: { title: 'Cluster', autorange: 'reversed' },
          margin: { l: 100, r: 50, t: 60, b: 100 },
          height: 500,
          autosize: true,
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default ClusterDistanceMatrix;

