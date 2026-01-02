import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import useProfileStore from '../store/profileStore';
import RadarChart from '../components/charts/RadarChart';
import SkillBarChart from '../components/charts/SkillBarChart';
import Embedding2D from '../components/visualizations/Embedding2D';
import Embedding3D from '../components/visualizations/Embedding3D';
import ClusterMembershipChart from '../components/charts/ClusterMembershipChart';
import CareerRecommendationChart from '../components/charts/CareerRecommendationChart';
import NearbyCareers3D from '../components/visualizations/NearbyCareers3D';
import RIASECComparisonMatrix from '../components/charts/RIASECComparisonMatrix';
import SimilarityMatrix from '../components/charts/SimilarityMatrix';
import SkillDistributionChart from '../components/charts/SkillDistributionChart';
import ClusterDistanceMatrix from '../components/charts/ClusterDistanceMatrix';
import AlgorithmComparisonChart from '../components/charts/AlgorithmComparisonChart';
import ClusterCohesionSeparation from '../components/charts/ClusterCohesionSeparation';
import SilhouetteAnalysisChart from '../components/charts/SilhouetteAnalysisChart';
import DomainAlignmentMatrix from '../components/charts/DomainAlignmentMatrix';
import ClusterStabilityChart from '../components/charts/ClusterStabilityChart';
import ValidationIndicesChart from '../components/charts/ValidationIndicesChart';
import ExternalMetricsChart from '../components/charts/ExternalMetricsChart';
import {
  SparklesIcon,
  ChartBarIcon,
  AcademicCapIcon,
  TrophyIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  PresentationChartLineIcon,
  CalculatorIcon,
  ChartPieIcon,
  BeakerIcon,
  ScaleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

function Results() {
  const { profile, recommendations, cluster, visualization, fetchProfile, fetchVisualization, loading, error } = useProfileStore();
  const [modelStats, setModelStats] = useState(null);

  useEffect(() => {
    // First, fetch profile if not loaded
    if (!profile) {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  useEffect(() => {
    // Once profile is loaded, automatically fetch visualization
    // This ensures visualizations are available when user logs in again
    if (profile && profile.combined_vector && !visualization && !loading) {
      console.log('[RESULTS] Profile loaded, automatically fetching visualization...');
      console.log('[RESULTS] Profile has combined_vector:', !!profile.combined_vector);
      console.log('[RESULTS] Recommendations count:', recommendations?.length || 0);
      fetchVisualization();
    } else if (profile && !profile.combined_vector) {
      console.warn('[RESULTS] Profile loaded but missing combined_vector - cannot generate visualization');
    } else if (visualization) {
      console.log('[RESULTS] Visualization already loaded');
    } else if (loading) {
      console.log('[RESULTS] Visualization is loading...');
    }
  }, [profile, visualization, recommendations, loading, fetchVisualization]);

  // Fetch model statistics for advanced metrics
  useEffect(() => {
    const fetchModelStats = async () => {
      try {
        // Use API server endpoint (which proxies to ML Engine)
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/profile/model-statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[RESULTS] Model stats fetched:', response.data);
        setModelStats(response.data);
      } catch (err) {
        console.error('[RESULTS] Error fetching model statistics:', err);
        // If API fails, try direct ML Engine connection (for development)
        try {
          const ML_ENGINE_URL = import.meta.env.VITE_ML_ENGINE_URL || 'http://localhost:8001';
          const response = await axios.get(`${ML_ENGINE_URL}/model-statistics`);
          console.log('[RESULTS] Model stats from ML Engine (direct):', response.data);
          setModelStats(response.data);
        } catch (err2) {
          console.error('[RESULTS] Error fetching from ML Engine directly:', err2);
        }
      }
    };
    
    if (profile) {
      fetchModelStats();
    }
  }, [profile]);

  // Calculate statistics overview cards - must be at top level (Rules of Hooks)
  const statisticsCards = useMemo(() => {
    if (!profile) return [];
    
    const riasec = profile.riasec_profile;
    const topRiasec = riasec ? Object.entries(riasec)
      .map(([key, value]) => ({ name: key, value }))
      .sort((a, b) => b.value - a.value)[0] : null;
    
    const avgSkill = profile.skills ? 
      Object.values(profile.skills).reduce((sum, val) => sum + val, 0) / Object.keys(profile.skills).length : 0;
    
    const topMatch = recommendations && recommendations.length > 0 ? 
      Math.round(recommendations[0].similarity_score * 100) : 0;
    
    const avgMatch = recommendations && recommendations.length > 0 ?
      Math.round(recommendations.reduce((sum, r) => sum + (r.similarity_score || 0), 0) / recommendations.length * 100) : 0;

    return [
      {
        label: 'Top RIASEC Dimension',
        value: topRiasec ? `${topRiasec.name} (${Math.round(topRiasec.value * 100)}%)` : 'N/A',
        icon: BeakerIcon,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        description: 'Your strongest personality dimension'
      },
      {
        label: 'Average Skill Level',
        value: `${Math.round((avgSkill / 5) * 100)}%`,
        icon: ChartPieIcon,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        description: `Level ${avgSkill.toFixed(1)}/5.0 average`
      },
      {
        label: 'Top Match Score',
        value: `${topMatch}%`,
        icon: StarIcon,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        description: 'Highest career similarity'
      },
      {
        label: 'Average Match Score',
        value: `${avgMatch}%`,
        icon: PresentationChartLineIcon,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        description: 'Average across all recommendations'
      }
    ];
  }, [profile, recommendations]);

  // Show loading state
  if (loading && !profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error or no profile state
  if (!profile || !profile.riasec_profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="p-4 bg-yellow-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <TrophyIcon className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Profile Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "You haven't completed the questionnaire yet. Please complete it to see your career recommendations."}
            </p>
            <a
              href="/questionnaire"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span>Go to Questionnaire</span>
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-8 text-white shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Your Career Profile</h1>
                <p className="text-blue-100 text-lg">Personalized insights and recommendations</p>
              </div>
            </div>
            
            {cluster && (
              <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="w-6 h-6" />
                    <div>
                      <p className="text-sm text-blue-100">Your Career Cluster</p>
                      <p className="text-xl font-bold">{cluster.cluster_name}</p>
                      {cluster.algorithm_used && (
                        <p className="text-xs text-blue-200 mt-1">
                          Algorithm: <span className="font-semibold">
                            {cluster.algorithm_used === 'kmeans_plus' || cluster.algorithm_used === 'kmeans' ? 'KMeans++' : 
                             cluster.algorithm_used === 'kmeans_random' ? 'KMeans (Random)' : 
                             cluster.algorithm_used.toUpperCase()}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        </div>

        {/* Statistics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statisticsCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="card p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Profile Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-elevated p-6">
            <div className="flex items-center space-x-2 mb-4">
              <SparklesIcon className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-800">RIASEC Profile</h2>
            </div>
            <div className="w-full overflow-auto" style={{ minHeight: '400px', maxHeight: '400px' }}>
              <RadarChart riasecProfile={profile.riasec_profile} />
            </div>
          </div>
          
          <div className="card-elevated p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Skills Assessment</h2>
            </div>
            <div className="w-full overflow-auto" style={{ minHeight: '400px', maxHeight: '400px' }}>
              <SkillBarChart skills={profile.skills} />
            </div>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <div className="space-y-6">
          <div className="card-elevated p-8">
            <div className="flex items-center space-x-2 mb-6">
              <PresentationChartLineIcon className="w-6 h-6 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-800">Advanced Analytics & Matrices</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Comprehensive statistical analysis and comparison matrices for academic evaluation.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RIASEC Comparison Matrix */}
              <div className="card p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CalculatorIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-800">RIASEC Dimension Comparison</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Heatmap showing the relationship and differences between all RIASEC dimensions.
                </p>
                <div className="h-[500px]">
                  <RIASECComparisonMatrix riasecProfile={profile.riasec_profile} />
                </div>
              </div>

              {/* Skill Distribution Chart */}
              <div className="card p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ChartPieIcon className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-bold text-gray-800">Skill Level Distribution</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Distribution of your skills across different proficiency levels.
                </p>
                <div className="h-[400px]">
                  <SkillDistributionChart skills={profile.skills} />
                </div>
              </div>
            </div>

            {/* Similarity Matrix */}
            {recommendations && recommendations.length > 0 && (
              <div className="card p-6 mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <StarIcon className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-xl font-bold text-gray-800">Career Recommendation Similarity Matrix</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Heatmap showing how similar each recommended career is to others based on match scores.
                </p>
                <div className="h-[500px]">
                  <SimilarityMatrix recommendations={recommendations} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Clustering Evaluation Matrices */}
        {modelStats && (
          <div className="card-elevated p-8">
            <div className="flex items-center space-x-2 mb-6">
              <ScaleIcon className="w-6 h-6 text-indigo-600" />
              <h2 className="text-3xl font-bold text-gray-800">Advanced Clustering Evaluation Matrices</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Comprehensive unsupervised learning evaluation metrics and visualizations for academic assessment.
            </p>

            <div className="space-y-6">
              {/* Algorithm Comparison Chart */}
              {modelStats.deployment_metrics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <ArrowPathIcon className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-800">Algorithm Performance Comparison</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Side-by-side comparison of KMeans++ and KMeans (Random) across multiple evaluation metrics.
                    </p>
                    <div className="h-[500px]">
                      <AlgorithmComparisonChart deploymentMetrics={modelStats.deployment_metrics} />
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <ScaleIcon className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-xl font-bold text-gray-800">Cohesion vs Separation</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Cluster cohesion (intra-cluster similarity) vs separation (inter-cluster distance) analysis.
                    </p>
                    <div className="h-[400px]">
                      <ClusterCohesionSeparation deploymentMetrics={modelStats.deployment_metrics} />
                    </div>
                  </div>
                </div>
              )}

              {/* Cluster Distance Matrix */}
              {modelStats.cluster_info?.cluster_centers && modelStats.cluster_info?.cluster_names && (
                <div className="card p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <CalculatorIcon className="w-5 h-5 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-800">Inter-Cluster Distance Matrix</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Euclidean distance matrix between cluster centers. Higher values indicate better cluster separation.
                  </p>
                  <div className="h-[500px] overflow-auto">
                    <ClusterDistanceMatrix 
                      clusterCenters={modelStats.cluster_info.cluster_centers}
                      clusterNames={modelStats.cluster_info.cluster_names}
                    />
                  </div>
                </div>
              )}

              {/* Advanced Metrics Summary Table */}
              {modelStats.deployment_metrics && (
                <div className="card p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <PresentationChartLineIcon className="w-5 h-5 text-indigo-600" />
                    <span>Comprehensive Evaluation Metrics</span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-indigo-50 to-blue-50">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Metric</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">KMeans++</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">KMeans (Random)</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">Winner</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Interpretation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            name: 'Silhouette Score',
                            kmeansPlus: modelStats.deployment_metrics.kmeans_plus?.clustering_quality?.silhouette,
                            kmeansRandom: modelStats.deployment_metrics.kmeans_random?.clustering_quality?.silhouette,
                            higher: true,
                            interpretation: 'Higher is better (-1 to 1)'
                          },
                          {
                            name: 'Calinski-Harabasz Index',
                            kmeansPlus: modelStats.deployment_metrics.kmeans_plus?.clustering_quality?.calinski_harabasz,
                            kmeansRandom: modelStats.deployment_metrics.kmeans_random?.clustering_quality?.calinski_harabasz,
                            higher: true,
                            interpretation: 'Higher indicates better-defined clusters'
                          },
                          {
                            name: 'Davies-Bouldin Index',
                            kmeansPlus: modelStats.deployment_metrics.kmeans_plus?.clustering_quality?.davies_bouldin,
                            kmeansRandom: modelStats.deployment_metrics.kmeans_random?.clustering_quality?.davies_bouldin,
                            higher: false,
                            interpretation: 'Lower is better (indicates better separation)'
                          },
                          {
                            name: 'Cluster Stability',
                            kmeansPlus: modelStats.deployment_metrics.kmeans_plus?.performance?.cluster_stability,
                            kmeansRandom: modelStats.deployment_metrics.kmeans_random?.performance?.cluster_stability,
                            higher: true,
                            interpretation: 'Higher indicates more stable clusters'
                          },
                          {
                            name: 'Inter-Cluster Distance',
                            kmeansPlus: modelStats.deployment_metrics.kmeans_plus?.performance?.inter_cluster_distance,
                            kmeansRandom: modelStats.deployment_metrics.kmeans_random?.performance?.inter_cluster_distance,
                            higher: true,
                            interpretation: 'Higher indicates better cluster separation'
                          },
                          {
                            name: 'Intra-Cluster Variance',
                            kmeansPlus: modelStats.deployment_metrics.kmeans_plus?.performance?.intra_cluster_variance,
                            kmeansRandom: modelStats.deployment_metrics.kmeans_random?.performance?.intra_cluster_variance,
                            higher: false,
                            interpretation: 'Lower indicates tighter, more cohesive clusters'
                          },
                          {
                            name: 'Dunn Index',
                            kmeansPlus: modelStats.deployment_metrics.kmeans_plus?.clustering_quality?.dunn_index,
                            kmeansRandom: modelStats.deployment_metrics.kmeans_random?.clustering_quality?.dunn_index,
                            higher: true,
                            interpretation: 'Higher indicates better separation/cohesion ratio'
                          }
                        ].map((metric, idx) => {
                          const plus = metric.kmeansPlus ?? null;
                          const random = metric.kmeansRandom ?? null;
                          const winner = (plus !== null && random !== null) 
                            ? (metric.higher 
                                ? (plus > random ? 'KMeans++' : plus < random ? 'KMeans (Random)' : 'Tie')
                                : (plus < random ? 'KMeans++' : plus > random ? 'KMeans (Random)' : 'Tie'))
                            : 'N/A';
                          const isPlusWinner = winner === 'KMeans++';
                          const isRandomWinner = winner === 'KMeans (Random)';
                          
                          return (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-100">
                                {metric.name}
                              </td>
                              <td className={`px-4 py-3 text-sm text-center border-b border-gray-100 ${
                                isPlusWinner ? 'font-bold text-blue-600' : 'text-gray-700'
                              }`}>
                                {plus !== null && plus !== undefined ? plus.toFixed(4) : 'N/A'}
                              </td>
                              <td className={`px-4 py-3 text-sm text-center border-b border-gray-100 ${
                                isRandomWinner ? 'font-bold text-purple-600' : 'text-gray-700'
                              }`}>
                                {random !== null && random !== undefined ? random.toFixed(4) : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-center border-b border-gray-100">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isPlusWinner ? 'bg-blue-100 text-blue-800' :
                                  isRandomWinner ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {winner}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
                                {metric.interpretation}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* External Evaluation Matrices Section */}
              <div className="mt-8">
                <div className="flex items-center space-x-2 mb-6">
                  <ScaleIcon className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-3xl font-bold text-gray-800">External Evaluation Matrices</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  External validation metrics comparing clusters against domain knowledge and stability across runs.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Domain Alignment Matrix */}
                  {recommendations && recommendations.length > 0 && (
                    <div className="card p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <StarIcon className="w-5 h-5 text-yellow-600" />
                        <h3 className="text-xl font-bold text-gray-800">Career Domain Alignment</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        External validation: Alignment of recommendations with career domains (domain knowledge).
                      </p>
                      <div className="h-[400px] overflow-auto">
                        <DomainAlignmentMatrix 
                          recommendations={recommendations}
                          clusterNames={modelStats.cluster_info?.cluster_names}
                        />
                      </div>
                    </div>
                  )}

                  {/* Cluster Stability Chart */}
                  {modelStats.deployment_metrics && (
                    <div className="card p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <ArrowPathIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Cluster Stability Analysis</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        External validation: Stability metrics comparing algorithm consistency across runs.
                      </p>
                      <div className="h-[400px] overflow-auto">
                        <ClusterStabilityChart deploymentMetrics={modelStats.deployment_metrics} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Validation Indices Chart */}
                {modelStats.deployment_metrics && (
                  <div className="card p-6 mt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <PresentationChartLineIcon className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-800">External Validation Indices</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Comprehensive validation indices comparing both algorithms across multiple evaluation criteria.
                    </p>
                    <div className="h-[400px] overflow-auto">
                      <ValidationIndicesChart deploymentMetrics={modelStats.deployment_metrics} />
                    </div>
                  </div>
                )}

                {/* External Validation Metrics (ARI, NMI, FMI) */}
                {modelStats.external_metrics ? (
                  <div className="card p-6 mt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <ScaleIcon className="w-5 h-5 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-800">External Validation Metrics</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      External validation metrics comparing predicted clusters against RIASEC-based ground truth labels.
                      <span className="block mt-2 text-xs text-gray-500">
                        Ground Truth: {modelStats.external_metrics.ground_truth_type || 'RIASEC Dominant Dimension'}
                      </span>
                    </p>
                    {modelStats.external_metrics.adjusted_rand_index?.value !== null && 
                     modelStats.external_metrics.adjusted_rand_index?.value !== undefined ? (
                      <>
                        <div className="relative h-[400px] w-full overflow-auto">
                          <ExternalMetricsChart externalMetrics={modelStats.external_metrics} />
                        </div>
                      </>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-gray-500 mb-2">External metrics not available</p>
                          <p className="text-sm text-gray-400">Ensure students have RIASEC profiles to calculate these metrics</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Detailed Table */}
                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full text-left table-auto border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 text-sm font-semibold text-gray-700">Metric</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center">Value</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center">Range</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center">Interpretation</th>
                            <th className="py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              name: 'Adjusted Rand Index (ARI)',
                              metric: modelStats.external_metrics.adjusted_rand_index,
                              higher: true,
                              value: modelStats.external_metrics.adjusted_rand_index?.value || 0
                            },
                            {
                              name: 'Normalized Mutual Information (NMI)',
                              metric: modelStats.external_metrics.normalized_mutual_info,
                              higher: true,
                              value: modelStats.external_metrics.normalized_mutual_info?.value || 0
                            },
                            {
                              name: 'Fowlkes-Mallows Index (FMI)',
                              metric: modelStats.external_metrics.fowlkes_mallows_index,
                              higher: true,
                              value: modelStats.external_metrics.fowlkes_mallows_index?.value || 0
                            }
                          ]
                          .sort((a, b) => (b.value || 0) - (a.value || 0)) // Sort by value descending
                          .map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                              <td className="py-3 px-4 text-center">
                                {item.metric?.value !== null && item.metric?.value !== undefined ? (
                                  <span className="font-semibold text-blue-600">{item.metric.value.toFixed(4)}</span>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center text-sm text-gray-600">{item.metric?.range || 'N/A'}</td>
                              <td className="py-3 px-4 text-center">
                                {item.metric?.interpretation ? (
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    item.metric.interpretation === 'Excellent' ? 'bg-green-100 text-green-800' :
                                    item.metric.interpretation === 'Good' ? 'bg-blue-100 text-blue-800' :
                                    item.metric.interpretation === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {item.metric.interpretation}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{item.metric?.description || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Visualizations */}
        {visualization ? (
          <>
            {/* Embeddings */}
            <div className="card-elevated p-8">
              <div className="flex items-center space-x-2 mb-6">
                <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-800">Profile Embeddings</h2>
              </div>
              <div className="space-y-8">
                <Embedding2D visualization={visualization} />
                <Embedding3D visualization={visualization} />
              </div>
            </div>

            {/* Cluster Membership */}
            <div className="card-elevated p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-800">Cluster Membership</h2>
                  </div>
                  <p className="text-gray-600">
                    See which cluster you belong to and how other students are distributed across clusters.
                  </p>
                </div>
              </div>
              {cluster?.algorithm_used && (
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Algorithm Used:</strong> Your cluster assignment was determined using the{' '}
                    <span className="font-semibold">
                      {cluster.algorithm_used === 'kmeans_plus' || cluster.algorithm_used === 'kmeans' ? 'KMeans++' : 
                       cluster.algorithm_used === 'kmeans_random' ? 'KMeans (Random)' : 
                       cluster.algorithm_used}
                    </span> algorithm, 
                    which was automatically selected as the best-performing model based on comprehensive evaluation metrics.
                  </p>
                </div>
              )}
              <ClusterMembershipChart visualization={visualization} />
            </div>

            {/* Career Recommendations Visualization */}
            {recommendations && recommendations.length > 0 && (
              <div className="card-elevated p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <StarIcon className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-3xl font-bold text-gray-800">Career Recommendations</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Your recommended careers highlighted in the embedding space.
                </p>
                {(() => {
                  console.log('[RESULTS] Career Recommendations Chart Check:', {
                    has_loading: loading,
                    has_visualization: !!visualization,
                    has_careers_2d: !!visualization?.careers_2d,
                    careers_2d_length: visualization?.careers_2d?.length || 0,
                    has_recommended_indices: !!visualization?.recommended_career_indices,
                    recommended_indices: visualization?.recommended_career_indices,
                    has_error: !!error,
                    error_message: error
                  });
                  
                  if (loading && !visualization) {
                    return (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-500">Loading visualization data...</p>
                      </div>
                    );
                  } else if (visualization && visualization.careers_2d && visualization.recommended_career_indices) {
                    return <CareerRecommendationChart visualization={visualization} recommendations={recommendations} />;
                  } else {
                    return (
                      <div className="text-center py-8">
                        <div className="text-red-500 mb-2">⚠️ Visualization data not available</div>
                        <p className="text-gray-500 text-sm">Please try refreshing the page or resubmitting the questionnaire.</p>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="text-xs text-gray-400 mt-4">
                          Debug: visualization={!!visualization ? 'exists' : 'null'}, 
                          careers_2d={!!visualization?.careers_2d ? 'exists' : 'missing'}, 
                          recommended_indices={!!visualization?.recommended_career_indices ? 'exists' : 'missing'}
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {/* Nearby Careers 3D */}
            {recommendations && recommendations.length > 0 && (
              <div className="card-elevated p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <SparklesIcon className="w-6 h-6 text-pink-600" />
                  <h2 className="text-3xl font-bold text-gray-800">3D Nearby Careers</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Explore careers that are close to your top recommendation in 3D embedding space.
                </p>
                {(() => {
                  console.log('[RESULTS] 3D Nearby Careers Check:', {
                    has_loading: loading,
                    has_visualization: !!visualization,
                    has_careers_3d: !!visualization?.careers_3d,
                    careers_3d_length: visualization?.careers_3d?.length || 0,
                    has_recommended_indices: !!visualization?.recommended_career_indices,
                    recommended_indices: visualization?.recommended_career_indices,
                    has_error: !!error,
                    error_message: error
                  });
                  
                  if (loading && !visualization) {
                    return (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mb-4"></div>
                        <p className="text-gray-500">Loading 3D visualization data...</p>
                      </div>
                    );
                  } else if (visualization && visualization.careers_3d && visualization.recommended_career_indices) {
                    return <NearbyCareers3D visualization={visualization} recommendations={recommendations} />;
                  } else {
                    return (
                      <div className="text-center py-8">
                        <div className="text-red-500 mb-2">⚠️ 3D Visualization data not available</div>
                        <p className="text-gray-500 text-sm">Please try refreshing the page or resubmitting the questionnaire.</p>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="text-xs text-gray-400 mt-4">
                          Debug: visualization={!!visualization ? 'exists' : 'null'}, 
                          careers_3d={!!visualization?.careers_3d ? 'exists' : 'missing'}, 
                          recommended_indices={!!visualization?.recommended_career_indices ? 'exists' : 'missing'}
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </>
        ) : (
          <div className="card-elevated p-8">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading visualization data...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Detailed Statistics Panel */}
        <div className="card-elevated p-8">
          <div className="flex items-center space-x-2 mb-6">
            <PresentationChartLineIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-800">Detailed Profile Statistics</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* RIASEC Statistics */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <BeakerIcon className="w-5 h-5 text-purple-600" />
                <span>RIASEC Dimension Analysis</span>
              </h3>
              <div className="space-y-3">
                {profile.riasec_profile && Object.entries(profile.riasec_profile)
                  .sort(([, a], [, b]) => b - a)
                  .map(([dimension, value]) => {
                    const percentage = Math.round(value * 100);
                    const barWidth = percentage;
                    return (
                      <div key={dimension} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-700">
                            {dimension === 'R' ? 'Realistic' :
                             dimension === 'I' ? 'Investigative' :
                             dimension === 'A' ? 'Artistic' :
                             dimension === 'S' ? 'Social' :
                             dimension === 'E' ? 'Enterprising' : 'Conventional'}
                          </span>
                          <span className="text-gray-600 font-medium">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-800">
                  <strong>Dominant Dimension:</strong>{' '}
                  {(() => {
                    const entries = Object.entries(profile.riasec_profile || {});
                    if (entries.length === 0) return 'N/A';
                    const top = entries.sort(([, a], [, b]) => b - a)[0];
                    const dimNames = {
                      'R': 'Realistic', 'I': 'Investigative', 'A': 'Artistic',
                      'S': 'Social', 'E': 'Enterprising', 'C': 'Conventional'
                    };
                    return `${dimNames[top[0]]} (${Math.round(top[1] * 100)}%)`;
                  })()}
                </p>
              </div>
            </div>

            {/* Skills Statistics */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <ChartPieIcon className="w-5 h-5 text-emerald-600" />
                <span>Skills Proficiency Analysis</span>
              </h3>
              <div className="space-y-3">
                {profile.skills && Object.entries(profile.skills)
                  .sort(([, a], [, b]) => b - a)
                  .map(([skill, level]) => {
                    const percentage = Math.round((level / 5) * 100);
                    const barWidth = percentage;
                    const levelLabel = level <= 1.5 ? 'Beginner' :
                                     level <= 2.5 ? 'Novice' :
                                     level <= 3.5 ? 'Intermediate' :
                                     level <= 4.5 ? 'Advanced' : 'Expert';
                    return (
                      <div key={skill} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-700">
                            {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className="text-gray-600 font-medium">{level.toFixed(1)}/5.0 ({levelLabel})</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <strong>Average Proficiency:</strong>{' '}
                  {profile.skills ? 
                    `${(Object.values(profile.skills).reduce((sum, val) => sum + val, 0) / Object.keys(profile.skills).length).toFixed(2)}/5.0` :
                    'N/A'}
                </p>
                <p className="text-sm text-emerald-800 mt-1">
                  <strong>Strongest Skill:</strong>{' '}
                  {profile.skills ? (() => {
                    const entries = Object.entries(profile.skills);
                    const top = entries.sort(([, a], [, b]) => b - a)[0];
                    return `${top[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (${top[1].toFixed(1)}/5.0)`;
                  })() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations Summary Table */}
          {recommendations && recommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-yellow-600" />
                <span>Recommendations Summary</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Career</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Domain</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Match Score</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Skill Gaps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations.map((rec, idx) => {
                      const skillGapsCount = rec.skill_gaps ? Object.keys(rec.skill_gaps).length : 0;
                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-bold text-gray-800 border-b border-gray-100">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                              idx === 1 ? 'bg-gray-100 text-gray-800' :
                              idx === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-100">{rec.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">{rec.domain || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm border-b border-gray-100">
                            <span className="font-bold text-blue-600">{Math.round(rec.similarity_score * 100)}%</span>
                          </td>
                          <td className="px-4 py-3 text-sm border-b border-gray-100">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              skillGapsCount === 0 ? 'bg-green-100 text-green-800' :
                              skillGapsCount <= 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {skillGapsCount} {skillGapsCount === 1 ? 'gap' : 'gaps'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Career Recommendations List */}
        {recommendations && recommendations.length > 0 && (
          <div className="card-elevated p-8">
            <div className="flex items-center space-x-2 mb-6">
              <TrophyIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-800">Top Career Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {recommendations.map((rec, idx) => {
                // Debug: Log all data for this recommendation
                console.log(`[UI] Recommendation ${idx + 1}:`, {
                  title: rec.title,
                  domain: rec.domain,
                  salary_range: rec.salary_range,
                  skill_gaps: rec.skill_gaps,
                  has_skill_gaps: !!rec.skill_gaps && Object.keys(rec.skill_gaps || {}).length > 0,
                  required_skills: rec.required_skills
                });
                
                return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 border border-gray-200 transition-all duration-300 hover:border-indigo-300 hover:shadow-xl"
                >
                  {/* Rank Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      idx === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400' :
                      'bg-gradient-to-br from-blue-600 to-blue-500'
                    }`}>
                      #{idx + 1}
                    </div>
                  </div>

                  <div className="pr-16">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                          {rec.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{rec.description}</p>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                          {(rec.similarity_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-500 font-medium">Match Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <p className="text-xs text-gray-600 mb-1">Domain</p>
                        <p className="font-semibold text-blue-700">
                          {rec.domain && rec.domain !== 'Unknown' ? rec.domain : 'Not specified'}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <p className="text-xs text-gray-600 mb-1">Salary Range</p>
                        <p className="font-semibold text-blue-700">
                          {rec.salary_range && rec.salary_range !== 'N/A' ? rec.salary_range : 'Not specified'}
                        </p>
                      </div>
                    </div>

                    {rec.required_skills && rec.required_skills.length > 0 && (
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Required Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.required_skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.skill_gaps && Object.keys(rec.skill_gaps).length > 0 ? (
                      <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-sm font-semibold text-yellow-800 mb-3">Skill Gaps (Areas to Improve):</p>
                        <div className="space-y-3">
                          {Object.entries(rec.skill_gaps)
                            .filter(([_, gap]) => {
                              // Filter: show gaps > 10% (0.1) - backend already filters at 0.1, but we can be more lenient
                              const gapValue = typeof gap === 'number' ? gap : parseFloat(gap);
                              return !isNaN(gapValue) && gapValue > 0.1;
                            })
                            .sort(([_, a], [__, b]) => {
                              // Sort by gap value (highest first)
                              const gapA = typeof a === 'number' ? a : parseFloat(a);
                              const gapB = typeof b === 'number' ? b : parseFloat(b);
                              return (isNaN(gapB) ? 0 : gapB) - (isNaN(gapA) ? 0 : gapA);
                            })
                            .map(([skill, gap]) => {
                              const gapValue = typeof gap === 'number' ? gap : parseFloat(gap);
                              const gapPercent = isNaN(gapValue) ? 0 : Math.round(gapValue * 100);
                              // Calculate filled portion: 100% - gap% = current skill level
                              // This shows how much skill the user has, with gap as empty space
                              const filledPercent = Math.max(0, Math.min(100 - gapPercent, 100));
                              
                              return (
                                <div key={skill} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700">{skill}</span>
                                    <span className="text-yellow-700 font-semibold">{gapPercent}% gap</span>
                                  </div>
                                  <div className="progress-bar bg-yellow-100">
                                    <div
                                      className="progress-fill bg-gradient-to-r from-yellow-400 to-orange-500"
                                      style={{ width: `${filledPercent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        {Object.entries(rec.skill_gaps).filter(([_, gap]) => {
                          const gapValue = typeof gap === 'number' ? gap : parseFloat(gap);
                          return !isNaN(gapValue) && gapValue > 0.1;
                        }).length === 0 && (
                          <p className="text-sm text-gray-600 italic">All skill gaps are below 10% threshold.</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm font-semibold text-green-800">✓ No significant skill gaps detected!</p>
                        <p className="text-xs text-green-700 mt-1">Your skills align well with this career path.</p>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Results;
