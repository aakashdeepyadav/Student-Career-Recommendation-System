import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import useProfileStore from '../store/profileStore';
import { useEffect, useMemo } from 'react';
import RadarChart from '../components/charts/RadarChart';
import SkillBarChart from '../components/charts/SkillBarChart';
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  LightBulbIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  BookOpenIcon,
  BriefcaseIcon,
  FireIcon
} from '@heroicons/react/24/outline';

function Dashboard() {
  const { profile, recommendations, cluster, fetchProfile } = useProfileStore();

  useEffect(() => {
    // Always fetch fresh data when Dashboard loads to ensure it's up to date
    console.log('[DASHBOARD] Fetching profile data...');
    fetchProfile();
  }, [fetchProfile]);

  // Calculate top RIASEC dimension
  const topRiasec = useMemo(() => {
    if (!profile?.riasec_profile) return null;
    const riasec = profile.riasec_profile;
    const dimensions = [
      { name: 'Realistic', value: riasec.R, icon: '🔧' },
      { name: 'Investigative', value: riasec.I, icon: '🔬' },
      { name: 'Artistic', value: riasec.A, icon: '🎨' },
      { name: 'Social', value: riasec.S, icon: '👥' },
      { name: 'Enterprising', value: riasec.E, icon: '💼' },
      { name: 'Conventional', value: riasec.C, icon: '📊' },
    ];
    return dimensions.sort((a, b) => b.value - a.value)[0];
  }, [profile]);

  // Calculate average skill level
  const avgSkillLevel = useMemo(() => {
    if (!profile?.skills) return 0;
    const skills = Object.values(profile.skills);
    const avg = skills.reduce((sum, val) => sum + val, 0) / skills.length;
    return Math.round((avg / 5) * 100);
  }, [profile]);

  // Get top 3 recommendations
  const topRecommendations = useMemo(() => {
    return recommendations?.slice(0, 3) || [];
  }, [recommendations]);

  const stats = [
    {
      label: 'Profile Status',
      value: profile ? 'Complete' : 'Incomplete',
      icon: CheckCircleIcon,
      color: profile ? 'text-green-500' : 'text-yellow-500',
      bg: profile ? 'bg-green-50' : 'bg-yellow-50',
      description: profile ? 'All assessments completed' : 'Start your journey',
    },
    {
      label: 'Career Recommendations',
      value: recommendations?.length || 0,
      icon: SparklesIcon,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      description: `${recommendations?.length || 0} personalized matches`,
    },
    {
      label: 'Cluster Assigned',
      value: cluster?.cluster_name || 'Pending',
      icon: AcademicCapIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: profile ? 'Your career personality type' : 'Complete profile first',
    },
    {
      label: 'Top Match Score',
      value: recommendations?.[0]?.similarity_score 
        ? `${Math.round(recommendations[0].similarity_score * 100)}%` 
        : 'N/A',
      icon: StarIcon,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      description: recommendations?.[0]?.title || 'No recommendations yet',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-8 text-white shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <LightBulbIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Welcome to SCRS</h1>
                <p className="text-blue-100 text-lg">
                  Discover your ideal career path through AI-powered profiling
                </p>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="card p-6 animate-slideIn hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} shadow-sm`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1 font-medium">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Main Action Card */}
        <div className="card-elevated p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                {profile ? 'Your Profile is Ready!' : 'Get Started with Your Career Profile'}
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                {profile
                  ? 'View your personalized career recommendations, cluster analysis, and detailed insights.'
                  : 'Complete our comprehensive questionnaire to discover your ideal career path. Our AI-powered system will analyze your interests, skills, and preferences to provide personalized recommendations.'}
              </p>
              
              {profile && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-semibold">
                      Profile completed! View your results and recommendations.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              {profile ? (
                <Link
                  to="/results"
                  className="group flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-200"
                >
                  <ChartBarIcon className="w-6 h-6" />
                  <span>View Results</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/questionnaire"
                  className="group flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-md shadow-blue-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  <ClipboardDocumentCheckIcon className="w-6 h-6" />
                  <span>Start Questionnaire</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              
              {profile && (
                <Link
                  to="/questionnaire"
                  className="flex items-center space-x-3 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-gray-200 hover:shadow-md"
                >
                  <ClipboardDocumentCheckIcon className="w-5 h-5" />
                  <span>Update Profile</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Profile Visualizations - Only show if profile exists */}
        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RIASEC Profile */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <SparklesIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">RIASEC Profile</h3>
                    {topRiasec && (
                      <p className="text-sm text-gray-600">
                        Top Dimension: <span className="font-semibold text-blue-600">{topRiasec.name} {topRiasec.icon}</span> ({Math.round(topRiasec.value * 100)}%)
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full overflow-auto relative" style={{ minHeight: '400px', height: '400px' }}>
                <RadarChart riasecProfile={profile.riasec_profile} />
              </div>
            </div>

            {/* Skills Assessment */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Skills Assessment</h3>
                    <p className="text-sm text-gray-600">
                      Average Level: <span className="font-semibold text-emerald-600">{avgSkillLevel}%</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full overflow-auto relative" style={{ minHeight: '400px', height: '400px' }}>
                <SkillBarChart skills={profile.skills} />
              </div>
            </div>
          </div>
        )}

        {/* Top Recommendations Preview */}
        {profile && topRecommendations.length > 0 && (
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <StarIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Top Career Recommendations</h3>
                  <p className="text-sm text-gray-600">Your best matches based on your profile</p>
                </div>
              </div>
              <Link
                to="/results"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 p-5 border border-gray-200 transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
                >
                  {/* Rank Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                      idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      #{idx + 1}
                    </div>
                  </div>
                  
                  <div className="pr-12">
                    <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {rec.title}
                    </h4>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                        {Math.round(rec.similarity_score * 100)}%
                      </div>
                      <span className="text-xs text-gray-500">Match</span>
                    </div>
                    {rec.domain && rec.domain !== 'Unknown' && (
                      <div className="flex items-center space-x-1 mb-2">
                        <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{rec.domain}</span>
                      </div>
                    )}
                    {rec.salary_range && rec.salary_range !== 'N/A' && (
                      <div className="flex items-center space-x-1">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600">{rec.salary_range}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cluster Information */}
        {profile && cluster && (
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UserGroupIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Your Career Cluster</h3>
                  <p className="text-gray-600">You belong to the <span className="font-semibold text-blue-600">{cluster.cluster_name}</span> cluster</p>
                  {cluster.algorithm_used && (
                    <p className="text-xs text-gray-500 mt-1">
                      Clustered using: <span className="font-semibold">{cluster.algorithm_used.toUpperCase()}</span> algorithm
                    </p>
                  )}
                </div>
              </div>
              <Link
                to="/model-statistics"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
              >
                <span>View Details</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">Cluster Type</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{cluster.cluster_name}</p>
                <p className="text-xs text-gray-600 mt-1">Your personality profile</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center space-x-2 mb-2">
                  <SparklesIcon className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-gray-800">Recommendations</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{recommendations?.length || 0}</p>
                <p className="text-xs text-gray-600 mt-1">Career matches found</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FireIcon className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-gray-800">Top Match</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {recommendations?.[0]?.similarity_score 
                    ? `${Math.round(recommendations[0].similarity_score * 100)}%` 
                    : 'N/A'}
                </p>
                <p className="text-xs text-gray-600 mt-1">Best career fit</p>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SparklesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">AI-Powered Analysis</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Our system uses <strong>dual clustering algorithms</strong> (KMeans++ and KMeans with Random Initialization) and automatically selects the best-performing one based on comprehensive deployment metrics including clustering quality, training speed, and model complexity.
            </p>
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Advanced Selection:</strong> The system trains both algorithms, compares their performance, and automatically uses the optimal one for your profile analysis.
              </p>
            </div>
            <Link
              to="/model-statistics"
              className="flex items-center space-x-2 text-sm text-blue-600 font-semibold hover:text-blue-700"
            >
              <BookOpenIcon className="w-4 h-4" />
              <span>View Algorithm Comparison</span>
            </Link>
          </div>

          <div className="card p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Visual Insights</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Interactive 2D and 3D visualizations help you understand your position in the career landscape and explore nearby opportunities.
            </p>
            <div className="flex items-center space-x-2 text-sm text-blue-600 font-semibold">
              <ChartBarIcon className="w-4 h-4" />
              <span>Explore Visualizations</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
