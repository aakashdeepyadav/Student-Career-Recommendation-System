import { useMemo } from 'react';
import Plot from 'react-plotly.js';

function SimilarityMatrix({ recommendations }) {
  const data = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return null;

    const titles = recommendations.map(r => r.title);
    const similarityScores = recommendations.map(r => r.similarity_score || 0);

    // Create similarity matrix (how similar each career is to others)
    const z = [];
    for (let i = 0; i < titles.length; i++) {
      const row = [];
      for (let j = 0; j < titles.length; j++) {
        if (i === j) {
          row.push(similarityScores[i]);
        } else {
          // Calculate similarity between careers based on their scores
          const similarity = 1 - Math.abs(similarityScores[i] - similarityScores[j]);
          row.push(similarity);
        }
      }
      z.push(row);
    }

    return [
      {
        z: z,
        x: titles,
        y: titles,
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
          title: 'Similarity',
          titleside: 'right'
        },
        text: z.map((row, i) => 
          row.map((val, j) => 
            i === j ? `${(val * 100).toFixed(0)}% Match` : 
            `${(val * 100).toFixed(0)}% Similar`
          )
        ),
        hovertemplate: '<b>%{y} vs %{x}</b><br>Similarity: %{z:.2%}<extra></extra>',
      },
    ];
  }, [recommendations]);

  if (!data) return null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={{
          title: {
            text: 'Career Recommendation Similarity Matrix',
            font: { size: 16, color: '#1f2937' }
          },
          xaxis: { title: 'Career', tickangle: -45 },
          yaxis: { title: 'Career', autorange: 'reversed' },
          margin: { l: 120, r: 50, t: 60, b: 120 },
          height: 500,
          autosize: true,
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default SimilarityMatrix;

