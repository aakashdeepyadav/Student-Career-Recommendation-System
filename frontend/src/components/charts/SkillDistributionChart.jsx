import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function SkillDistributionChart({ skills }) {
  const data = useMemo(() => {
    if (!skills) return null;

    const skillNames = Object.keys(skills);
    const values = Object.values(skills).map(v => (v - 1) / 4); // Normalize 1-5 to 0-1

    // Create histogram data
    const bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const binLabels = ['Beginner (1)', 'Novice (2)', 'Intermediate (3)', 'Advanced (4)', 'Expert (5)'];
    const counts = new Array(bins.length - 1).fill(0);

    values.forEach(val => {
      for (let i = 0; i < bins.length - 1; i++) {
        if (val >= bins[i] && val < bins[i + 1]) {
          counts[i]++;
          break;
        }
      }
      if (val === 1) counts[counts.length - 1]++;
    });

    return [
      {
        x: binLabels,
        y: counts,
        type: 'bar',
        marker: {
          color: counts.map((_, i) => {
            const colors = [
              'rgb(239, 68, 68)',   // Red for beginner
              'rgb(251, 146, 60)',  // Orange for novice
              'rgb(251, 191, 36)',  // Yellow for intermediate
              'rgb(34, 197, 94)',   // Green for advanced
              'rgb(59, 130, 246)'   // Blue for expert
            ];
            return colors[i];
          }),
          line: {
            color: 'rgb(255, 255, 255)',
            width: 2
          }
        },
        text: counts.map(c => c > 0 ? c : ''),
        textposition: 'outside',
        hovertemplate: '<b>%{x}</b><br>Count: %{y}<extra></extra>',
      },
    ];
  }, [skills]);

  if (!data) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={{
          title: {
            text: 'Skill Level Distribution',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { 
            title: 'Skill Level',
            tickangle: -45
          },
          yaxis: { title: 'Number of Skills' },
          margin: { l: 60, r: 30, t: 60, b: 100 },
          height: 400,
          autosize: true,
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default SkillDistributionChart;

