import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function NearbyCareers3D({ visualization, recommendations }) {
  const data = useMemo(() => {
    if (!visualization || !visualization.careers_3d || !recommendations || recommendations.length === 0) {
      console.warn('[NearbyCareers3D] Missing data:', {
        has_visualization: !!visualization,
        has_careers_3d: !!visualization?.careers_3d,
        has_recommendations: !!recommendations,
        recommendations_count: recommendations?.length || 0
      });
      return null;
    }

    // Get the top recommended career
    const topRecommendation = recommendations[0];
    const topCareerIndex = visualization.recommended_career_indices?.[0];
    
    if (topCareerIndex === undefined) return null;

    const topCareer3D = visualization.careers_3d[topCareerIndex];
    if (!topCareer3D) return null;

    // Calculate distances from top recommended career to all other careers
    const careerData = visualization.careers_3d.map((career3D, idx) => {
      if (idx === topCareerIndex) {
        return { 
          idx, 
          distance: 0, 
          x: career3D[0], 
          y: career3D[1], 
          z: career3D[2],
          title: visualization.career_titles?.[idx] || `Career ${idx + 1}`,
          isTopRecommendation: true
        };
      }
      const dx = career3D[0] - topCareer3D[0];
      const dy = career3D[1] - topCareer3D[1];
      const dz = career3D[2] - topCareer3D[2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      return {
        idx,
        distance,
        x: career3D[0],
        y: career3D[1],
        z: career3D[2],
        title: visualization.career_titles?.[idx] || `Career ${idx + 1}`,
        isTopRecommendation: false
      };
    });

    // Sort by distance
    const sortedCareers = [...careerData].sort((a, b) => a.distance - b.distance);
    const maxDistance = Math.max(...sortedCareers.map(c => c.distance));

    // Get sizes based on distance (closer = larger)
    const getSize = (distance, maxDist, isTop) => {
      if (isTop) return 15; // Top recommendation - largest
      const normalized = distance / maxDist;
      if (normalized <= 0.2) return 10; // Very close
      if (normalized <= 0.5) return 7; // Medium
      return 5; // Far
    };

    // Prepare data for all careers
    const allX = careerData.map(c => c.x);
    const allY = careerData.map(c => c.y);
    const allZ = careerData.map(c => c.z);
    const allTitles = careerData.map(c => c.title);
    const allSizes = careerData.map(c => getSize(c.distance, maxDistance, c.isTopRecommendation));
    const allDistances = careerData.map(c => c.distance);

    const traces = [];

    // All careers with color gradient based on distance
    traces.push({
      x: allX,
      y: allY,
      z: allZ,
      mode: 'markers',
      type: 'scatter3d',
      name: 'All Careers',
      marker: {
        size: allSizes,
        color: allDistances, // Use distance values for color mapping
        colorscale: [
          [0, 'rgb(99, 102, 241)'],      // Blue - Top recommendation (distance = 0)
          [0.2, 'rgb(34, 197, 94)'],     // Green - Very close
          [0.5, 'rgb(251, 146, 60)'],    // Orange - Medium distance
          [1, 'rgb(156, 163, 175)']      // Gray - Far
        ],
        cmin: 0,
        cmax: maxDistance,
        colorbar: {
          title: 'Distance',
          titleside: 'right',
        },
        symbol: careerData.map(c => c.isTopRecommendation ? 'diamond' : 'circle'),
        line: careerData.map(c => c.isTopRecommendation ? { color: 'rgb(0, 0, 0)', width: 2 } : { width: 0 }),
      },
      text: allTitles,
      customdata: allDistances.map(d => d.toFixed(3)),
      hovertemplate: '<b>%{text}</b><br>Distance: %{customdata}<br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<extra></extra>',
    });

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
          size: 12,
          color: 'rgb(255, 215, 0)',
          symbol: 'star',
          line: { color: 'rgb(0, 0, 0)', width: 2 },
        },
        text: ['Your Profile'],
        hovertemplate: '<b>Your Profile</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<extra></extra>',
      });
    }

    return traces;
  }, [visualization, recommendations]);

  if (!data || data.length === 0) return null;

  // Get top 5 closest for legend
  const top5Indices = visualization.recommended_career_indices?.slice(0, 5) || [];

  return (
    <div>
      <Plot
        data={data}
        layout={{
          title: `3D Career Proximity - Based on "${recommendations?.[0]?.title || 'Top Recommendation'}"`,
          scene: {
            xaxis: { title: 'UMAP1' },
            yaxis: { title: 'UMAP2' },
            zaxis: { title: 'UMAP3' },
          },
          height: 600,
          showlegend: true,
        }}
        config={{ displayModeBar: false }}
      />
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-2">Color Gradient Legend:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-600 rounded mr-2 border border-black"></div>
            <span>Top Recommendation (0 distance)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span>Very Close (&lt;20%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span>Medium (20-50%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
            <span>Far (&gt;50%)</span>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          <strong>All 25 careers are displayed.</strong> Colors show distance from your top recommendation using a gradient:
          Blue (closest) → Green → Orange → Gray (farthest). Marker size also indicates proximity - larger markers are closer.
          Hover over any career to see its exact distance value.
        </p>
      </div>
    </div>
  );
}

export default NearbyCareers3D;




