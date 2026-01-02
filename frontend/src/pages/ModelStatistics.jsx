import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import Plot from 'react-plotly.js';
import {
  ChartBarIcon,
  CpuChipIcon,
  CircleStackIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  TrophyIcon,
  BoltIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function ModelStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile/model-statistics`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching model statistics:', err);
      setError(err.response?.data?.error || 'Failed to fetch model statistics');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (interpretation) => {
    const colors = {
      'Excellent': 'text-emerald-600 bg-emerald-50',
      'Good': 'text-blue-600 bg-blue-50',
      'Fair': 'text-amber-600 bg-amber-50',
      'Poor': 'text-red-600 bg-red-50'
    };
    return colors[interpretation] || 'text-slate-600 bg-slate-50';
  };

  const formatTime = (seconds) => {
    if (seconds < 0.001) return `${(seconds * 1000).toFixed(2)}ms`;
    if (seconds < 1) return `${(seconds * 1000).toFixed(1)}ms`;
    return `${seconds.toFixed(3)}s`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading model statistics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
            <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Statistics</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchStatistics}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const deploymentMetrics = stats?.deployment_metrics;
  // Normalize selected algorithm for comparison (handle both display names and internal names)
  const selectedAlgoRaw = deploymentMetrics?.selected_algorithm || stats?.model_info?.algorithm || 'KMeans++';
  const selectedAlgorithm = selectedAlgoRaw.toLowerCase().includes('kmeans++') || selectedAlgoRaw.toLowerCase().includes('kmeans_plus') || selectedAlgoRaw.toLowerCase() === 'kmeans' ? 'kmeans_plus' : 'kmeans_random';
  const kmeansPlusMetrics = deploymentMetrics?.kmeans_plus;
  const kmeansRandomMetrics = deploymentMetrics?.kmeans_random;
  const comparison = deploymentMetrics?.comparison;

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Model Statistics</h1>
            <p className="text-slate-500 mt-1">
              Comprehensive comparison of KMeans++ and KMeans (Random) clustering algorithms
            </p>
          </div>
          <button
            onClick={fetchStatistics}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Selected Algorithm Banner */}
        {selectedAlgorithm && (
          <div className={`relative overflow-hidden rounded-2xl p-6 ${
            selectedAlgorithm === 'kmeans_plus' || selectedAlgorithm === 'kmeans'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
              : 'bg-gradient-to-r from-purple-600 to-purple-500'
          } text-white shadow-xl`}>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrophyIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-white/90 mb-1">Selected Algorithm</p>
                  <h2 className="text-3xl font-bold">{selectedAlgoRaw}</h2>
                  <p className="text-sm text-white/80 mt-1">
                    {selectedAlgorithm === 'kmeans_plus' || selectedAlgorithm === 'kmeans' ? 'K-Means++ Clustering' : 'K-Means (Random Initialization)'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <SparklesIcon className="w-5 h-5" />
                  <span className="font-semibold">Active</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          </div>
        )}

        {/* Algorithm Comparison Cards */}
        {deploymentMetrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KMeans++ Card */}
            <div className={`bg-white rounded-xl border-2 p-6 transition-all ${
              selectedAlgorithm === 'kmeans_plus' || selectedAlgorithm === 'kmeans'
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedAlgorithm === 'kmeans_plus' || selectedAlgorithm === 'kmeans' ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <CpuChipIcon className={`w-7 h-7 ${
                      selectedAlgorithm === 'kmeans_plus' || selectedAlgorithm === 'kmeans' ? 'text-blue-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">KMeans++</h3>
                    <p className="text-sm text-slate-500">K-Means++ Initialization</p>
                  </div>
                </div>
                {(selectedAlgorithm === 'kmeans_plus' || selectedAlgorithm === 'kmeans') && (
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <TrophyIcon className="w-4 h-4" />
                    <span>SELECTED</span>
                  </div>
                )}
              </div>

              {/* Clustering Quality */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Clustering Quality</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Silhouette Score</span>
                    <span className="font-bold text-slate-900">
                      {kmeansPlusMetrics?.clustering_quality?.silhouette?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Calinski-Harabasz</span>
                    <span className="font-bold text-slate-900">
                      {kmeansPlusMetrics?.clustering_quality?.calinski_harabasz?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Davies-Bouldin</span>
                    <span className="font-bold text-slate-900">
                      {kmeansPlusMetrics?.clustering_quality?.davies_bouldin?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Performance</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">Training Time</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {kmeansPlusMetrics?.performance?.training_time_seconds 
                        ? formatTime(kmeansPlusMetrics.performance.training_time_seconds) 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BoltIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">Prediction Time</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {kmeansPlusMetrics?.performance?.prediction_time_ms 
                        ? `${kmeansPlusMetrics.performance.prediction_time_ms.toFixed(2)}ms` 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Cluster Stability</span>
                    <span className="font-bold text-slate-900">
                      {kmeansPlusMetrics?.performance?.cluster_stability?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Model Complexity (Inertia) */}
              {kmeansPlusMetrics?.model_complexity && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Model Complexity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm text-slate-600">Inertia</span>
                      <span className="font-bold text-blue-700">
                        {kmeansPlusMetrics.model_complexity.inertia?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* KMeans Random Card */}
            <div className={`bg-white rounded-xl border-2 p-6 transition-all ${
              selectedAlgorithm === 'kmeans_random' 
                ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' 
                : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedAlgorithm === 'kmeans_random' ? 'bg-purple-100' : 'bg-slate-100'
                  }`}>
                    <SparklesIcon className={`w-7 h-7 ${
                      selectedAlgorithm === 'kmeans_random' ? 'text-purple-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">KMeans (Random)</h3>
                    <p className="text-sm text-slate-500">Random Initialization</p>
                  </div>
                </div>
                {selectedAlgorithm === 'kmeans_random' && (
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <TrophyIcon className="w-4 h-4" />
                    <span>SELECTED</span>
                  </div>
                )}
              </div>

              {/* Clustering Quality */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Clustering Quality</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Silhouette Score</span>
                    <span className="font-bold text-slate-900">
                      {kmeansRandomMetrics?.clustering_quality?.silhouette?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Calinski-Harabasz</span>
                    <span className="font-bold text-slate-900">
                      {kmeansRandomMetrics?.clustering_quality?.calinski_harabasz?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Davies-Bouldin</span>
                    <span className="font-bold text-slate-900">
                      {kmeansRandomMetrics?.clustering_quality?.davies_bouldin?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Performance</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">Training Time</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {kmeansRandomMetrics?.performance?.training_time_seconds 
                        ? formatTime(kmeansRandomMetrics.performance.training_time_seconds) 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BoltIcon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">Prediction Time</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {kmeansRandomMetrics?.performance?.prediction_time_ms 
                        ? `${kmeansRandomMetrics.performance.prediction_time_ms.toFixed(2)}ms` 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Cluster Stability</span>
                    <span className="font-bold text-slate-900">
                      {kmeansRandomMetrics?.performance?.cluster_stability?.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Model Complexity (Inertia) */}
              {kmeansRandomMetrics?.model_complexity && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Model Complexity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                      <span className="text-sm text-slate-600">Inertia</span>
                      <span className="font-bold text-purple-700">
                        {kmeansRandomMetrics.model_complexity.inertia?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison Summary */}
        {comparison && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <ChartBarIcon className="w-6 h-6" />
              <span>Algorithm Comparison</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">Winner</p>
                <p className="text-2xl font-bold text-slate-900">{comparison.winner}</p>
                <p className="text-xs text-slate-400 mt-1">Selected Algorithm</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">Quality Difference</p>
                <p className="text-2xl font-bold text-slate-900">
                  {comparison.quality_difference?.toFixed(4) || '0.0000'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Silhouette Score Gap</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-1">Speed Advantage</p>
                <p className={`text-2xl font-bold ${
                  comparison.speed_advantage === 'KMeans (Random)' ? 'text-purple-600' : 'text-blue-600'
                }`}>
                  {comparison.speed_advantage}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {comparison.speed_difference_seconds 
                    ? `${comparison.speed_difference_seconds.toFixed(3)}s faster` 
                    : 'Training time'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Model Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Algorithm Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Algorithm</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats?.model_info?.algorithm || 'N/A'}</p>
            <p className="text-sm text-slate-500 mt-1">
              {stats?.model_info?.n_clusters} clusters
            </p>
          </div>

          {/* Data Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <CircleStackIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Training Data</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats?.data_info?.n_students || 0}</p>
            <p className="text-sm text-slate-500 mt-1">
              Students in dataset ({stats?.data_info?.feature_dimension || 0}D features)
            </p>
          </div>

          {/* Model Status Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Model Status</h3>
            </div>
            <div className="flex items-center space-x-2">
              {stats?.model_info?.model_trained ? (
                <>
                  <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                  <span className="text-emerald-600 font-semibold">Trained</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-6 h-6 text-red-500" />
                  <span className="text-red-600 font-semibold">Not Trained</span>
                </>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {stats?.data_info?.n_careers || 0} careers available
            </p>
          </div>
        </div>

        {/* Clustering Metrics (Legacy - only show if deployment_metrics not available) */}
        {!deploymentMetrics && stats?.metrics && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Showing legacy metrics. Please restart the ML engine server to see advanced deployment metrics with dual algorithm comparison.
              </p>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Clustering Quality Metrics (Active Algorithm Only)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Silhouette Score */}
              <div className="border border-slate-200 rounded-xl p-5">
                <h4 className="text-sm font-medium text-slate-500 mb-2">Silhouette Score</h4>
                {stats?.metrics?.silhouette_score ? (
                  <>
                    <p className="text-3xl font-bold text-slate-900">
                      {stats.metrics.silhouette_score.value}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(stats.metrics.silhouette_score.interpretation)}`}>
                      {stats.metrics.silhouette_score.interpretation}
                    </span>
                    <p className="text-xs text-slate-400 mt-2">
                      Range: -1 to 1 (higher is better)
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400">Not available</p>
                )}
              </div>

              {/* Davies-Bouldin Index */}
              <div className="border border-slate-200 rounded-xl p-5">
                <h4 className="text-sm font-medium text-slate-500 mb-2">Davies-Bouldin Index</h4>
                {stats?.metrics?.davies_bouldin_score ? (
                  <>
                    <p className="text-3xl font-bold text-slate-900">
                      {stats.metrics.davies_bouldin_score.value}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(stats.metrics.davies_bouldin_score.interpretation)}`}>
                      {stats.metrics.davies_bouldin_score.interpretation}
                    </span>
                    <p className="text-xs text-slate-400 mt-2">
                      Lower values indicate better clustering
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400">Not available</p>
                )}
              </div>

              {/* Calinski-Harabasz Index */}
              <div className="border border-slate-200 rounded-xl p-5">
                <h4 className="text-sm font-medium text-slate-500 mb-2">Calinski-Harabasz Index</h4>
                {stats?.metrics?.calinski_harabasz_score ? (
                  <>
                    <p className="text-3xl font-bold text-slate-900">
                      {stats.metrics.calinski_harabasz_score.value}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {stats.metrics.calinski_harabasz_score.interpretation}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400">Not available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cluster Distribution */}
        {stats?.cluster_info?.cluster_sizes && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cluster Sizes Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Cluster Distribution</h2>
              <Plot
                data={[
                  {
                    type: 'pie',
                    labels: Object.keys(stats.cluster_info.cluster_sizes).map(
                      k => stats.cluster_info.cluster_names[k] || `Cluster ${k}`
                    ),
                    values: Object.values(stats.cluster_info.cluster_sizes),
                    hole: 0.4,
                    marker: {
                      colors: ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                    },
                    textinfo: 'percent+label',
                    textposition: 'outside'
                  }
                ]}
                layout={{
                  showlegend: true,
                  legend: { orientation: 'h', y: -0.1 },
                  margin: { t: 20, b: 60, l: 20, r: 20 },
                  paper_bgcolor: 'transparent',
                  font: { family: 'Inter, sans-serif' }
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%', height: '350px' }}
              />
            </div>

            {/* Cluster Details Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Cluster Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-slate-600">Cluster</th>
                      <th className="text-right py-3 px-2 text-sm font-semibold text-slate-600">Students</th>
                      <th className="text-right py-3 px-2 text-sm font-semibold text-slate-600">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.cluster_info.cluster_centers?.map((center, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: ['#1e293b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][idx % 5]
                              }}
                            ></div>
                            <span className="font-medium text-slate-900">{center.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right text-slate-700">
                          {stats.cluster_info.cluster_sizes[center.cluster_id] || 0}
                        </td>
                        <td className="py-3 px-2 text-right text-slate-700">
                          {stats.cluster_info.cluster_percentages[center.cluster_id] || 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Elbow Curve */}
        {stats?.elbow_data && stats.elbow_data.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Elbow Method - Inertia */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Elbow Method</h2>
              <p className="text-sm text-slate-500 mb-4">Optimal number of clusters analysis</p>
              <Plot
                data={[
                  {
                    x: stats.elbow_data.map(d => d.k),
                    y: stats.elbow_data.map(d => d.inertia),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Inertia',
                    line: { color: '#1e293b', width: 2 },
                    marker: { size: 8, color: '#1e293b' }
                  }
                ]}
                layout={{
                  xaxis: { title: 'Number of Clusters (k)', dtick: 1 },
                  yaxis: { title: 'Inertia (WCSS)' },
                  margin: { t: 20, b: 60, l: 60, r: 20 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { family: 'Inter, sans-serif' },
                  shapes: [{
                    type: 'line',
                    x0: stats.model_info.n_clusters,
                    x1: stats.model_info.n_clusters,
                    y0: 0,
                    y1: 1,
                    yref: 'paper',
                    line: { color: '#ef4444', width: 2, dash: 'dash' }
                  }],
                  annotations: [{
                    x: stats.model_info.n_clusters,
                    y: 1,
                    yref: 'paper',
                    text: `Current (k=${stats.model_info.n_clusters})`,
                    showarrow: false,
                    font: { color: '#ef4444', size: 11 }
                  }]
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%', height: '300px' }}
              />
            </div>

            {/* Silhouette Scores by K */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Silhouette Analysis</h2>
              <p className="text-sm text-slate-500 mb-4">Cluster quality for different k values</p>
              <Plot
                data={[
                  {
                    x: stats.elbow_data.map(d => d.k),
                    y: stats.elbow_data.map(d => d.silhouette),
                    type: 'bar',
                    marker: {
                      color: stats.elbow_data.map(d =>
                        d.k === stats.model_info.n_clusters ? '#1e293b' : '#94a3b8'
                      )
                    }
                  }
                ]}
                layout={{
                  xaxis: { title: 'Number of Clusters (k)', dtick: 1 },
                  yaxis: { title: 'Silhouette Score', range: [0, 1] },
                  margin: { t: 20, b: 60, l: 60, r: 20 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { family: 'Inter, sans-serif' },
                  showlegend: false
                }}
                config={{ displayModeBar: false }}
                style={{ width: '100%', height: '300px' }}
              />
            </div>
          </div>
        )}

        {/* PCA Variance */}
        {stats?.pca_info?.explained_variance_ratio && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">PCA Variance Explained</h2>
            <p className="text-sm text-slate-500 mb-4">
              Dimensionality reduction quality - Total variance explained: {(stats.pca_info.total_variance_explained * 100).toFixed(1)}%
            </p>
            <Plot
              data={[
                {
                  x: stats.pca_info.explained_variance_ratio.map((_, i) => `PC${i + 1}`),
                  y: stats.pca_info.explained_variance_ratio.map(v => v * 100),
                  type: 'bar',
                  name: 'Individual',
                  marker: { color: '#3b82f6' }
                },
                {
                  x: stats.pca_info.cumulative_variance.map((_, i) => `PC${i + 1}`),
                  y: stats.pca_info.cumulative_variance.map(v => v * 100),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Cumulative',
                  line: { color: '#1e293b', width: 2 },
                  marker: { size: 8, color: '#1e293b' }
                }
              ]}
              layout={{
                xaxis: { title: 'Principal Component' },
                yaxis: { title: 'Variance Explained (%)', range: [0, 100] },
                margin: { t: 20, b: 60, l: 60, r: 20 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { family: 'Inter, sans-serif' },
                legend: { orientation: 'h', y: 1.1 },
                barmode: 'group'
              }}
              config={{ displayModeBar: false }}
              style={{ width: '100%', height: '300px' }}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ModelStatistics;
