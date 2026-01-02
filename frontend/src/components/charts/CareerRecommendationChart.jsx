import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function CareerRecommendationChart({ visualization, recommendations }) {
  const data = useMemo(() => {
    if (!visualization || !visualization.careers_2d) {
      console.warn('[CareerRecommendationChart] Missing visualization data:', {
        has_visualization: !!visualization,
        has_careers_2d: !!visualization?.careers_2d,
        has_recommendations: !!recommendations,
        recommendations_count: recommendations?.length || 0
      });
      return null;
    }

    const recommendedIds = recommendations?.map(r => r.career_id) || [];
    const recommendedIndices = visualization.recommended_career_indices || [];

    const traces = [];

    // Separate recommended and non-recommended careers
    const recommendedX = [];
    const recommendedY = [];
    const recommendedTitles = [];
    const otherX = [];
    const otherY = [];
    const otherTitles = [];

    visualization.careers_2d.forEach((point, idx) => {
      const title = visualization.career_titles?.[idx] || `Career ${idx + 1}`;
      if (recommendedIndices.includes(idx)) {
        recommendedX.push(point[0]);
        recommendedY.push(point[1]);
        recommendedTitles.push(title);
      } else {
        otherX.push(point[0]);
        otherY.push(point[1]);
        otherTitles.push(title);
      }
    });

    // Non-recommended careers
    if (otherX.length > 0) {
      traces.push({
        x: otherX,
        y: otherY,
        mode: 'markers',
        type: 'scatter',
        name: 'Other Careers',
        marker: {
          size: 8,
          color: 'rgba(156, 163, 175, 0.4)',
        },
        text: otherTitles,
        hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>',
      });
    }

    // Recommended careers
    if (recommendedX.length > 0) {
      traces.push({
        x: recommendedX,
        y: recommendedY,
        mode: 'markers',
        type: 'scatter',
        name: 'Recommended Careers',
        marker: {
          size: 15,
          color: 'rgba(99, 102, 241, 0.8)',
          symbol: 'star',
          line: { color: 'rgb(99, 102, 241)', width: 2 },
        },
        text: recommendedTitles,
        hovertemplate: '<b>%{text}</b><br>Recommended<br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>',
      });
    }

    // User point
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
  }, [visualization, recommendations]);

  if (!data || data.length === 0) return null;

  return (
    <Plot
      data={data}
      layout={{
        title: 'Career Recommendations Visualization (2D)',
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

export default CareerRecommendationChart;




