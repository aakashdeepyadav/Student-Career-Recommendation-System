import { useMemo } from "react";
import Layout from "../components/Layout";
import useProfileStore from "../store/profileStore";
import RadarChart from "../components/charts/RadarChart";
import SkillBarChart from "../components/charts/SkillBarChart";
import Embedding2D from "../components/visualizations/Embedding2D";
import Embedding3D from "../components/visualizations/Embedding3D";
import ClusterMembershipChart from "../components/charts/ClusterMembershipChart";
import CareerRecommendationChart from "../components/charts/CareerRecommendationChart";
import NearbyCareers3D from "../components/visualizations/NearbyCareers3D";
import {
  SparklesIcon,
  ChartBarIcon,
  BeakerIcon,
  ChartPieIcon,
  AcademicCapIcon,
  TrophyIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";

function Results() {
  const { profile, recommendations, cluster, visualization, loading, error } =
    useProfileStore();

  // Calculate statistics overview cards - must be at top level (Rules of Hooks)
  const statisticsCards = useMemo(() => {
    if (!profile) return [];

    const riasec = profile.riasec_profile;
    const topRiasec = riasec
      ? Object.entries(riasec)
          .map(([key, value]) => ({ name: key, value }))
          .sort((a, b) => b.value - a.value)[0]
      : null;

    const avgSkill = profile.skills
      ? Object.values(profile.skills).reduce((sum, val) => sum + val, 0) /
        Object.keys(profile.skills).length
      : 0;

    const topMatch =
      recommendations && recommendations.length > 0
        ? Math.round(recommendations[0].similarity_score * 100)
        : 0;

    const avgMatch =
      recommendations && recommendations.length > 0
        ? Math.round(
            (recommendations.reduce(
              (sum, r) => sum + (r.similarity_score || 0),
              0,
            ) /
              recommendations.length) *
              100,
          )
        : 0;

    return [
      {
        label: "Top RIASEC Dimension",
        value: topRiasec
          ? `${topRiasec.name} (${Math.round(topRiasec.value * 100)}%)`
          : "N/A",
        icon: BeakerIcon,
        color: "text-purple-600",
        bg: "bg-purple-50",
        description: "Your strongest personality dimension",
      },
      {
        label: "Average Skill Level",
        value: `${Math.round((avgSkill / 5) * 100)}%`,
        icon: ChartPieIcon,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        description: `Level ${avgSkill.toFixed(1)}/5.0 average`,
      },
      {
        label: "Top Match Score",
        value: `${topMatch}%`,
        icon: StarIcon,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        description: "Highest career similarity",
      },
      {
        label: "Average Match Score",
        value: `${avgMatch}%`,
        icon: PresentationChartLineIcon,
        color: "text-blue-600",
        bg: "bg-blue-50",
        description: "Average across all recommendations",
      },
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Profile Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "You haven't completed the questionnaire yet. Please complete it to see your career recommendations."}
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
                <h1 className="text-4xl font-bold mb-2">
                  Your Career Assessment
                </h1>
                <p className="text-blue-100 text-lg">
                  Personalized insights and recommendations
                </p>
              </div>
            </div>

            {cluster && (
              <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="w-6 h-6" />
                    <div>
                      <p className="text-sm text-blue-100">
                        Your Career Cluster
                      </p>
                      <p className="text-xl font-bold">
                        {cluster.cluster_name}
                      </p>
                      {cluster.algorithm_used && (
                        <p className="text-xs text-blue-200 mt-1">
                          Algorithm:{" "}
                          <span className="font-semibold">
                            {cluster.algorithm_used === "kmeans_plus" ||
                            cluster.algorithm_used === "kmeans"
                              ? "KMeans++"
                              : cluster.algorithm_used === "kmeans_random"
                                ? "KMeans (Random)"
                                : cluster.algorithm_used.toUpperCase()}
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
              <div
                key={idx}
                className="card p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </p>
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
              <h2 className="text-2xl font-bold text-gray-800">
                RIASEC Profile
              </h2>
            </div>
            <div
              className="w-full overflow-auto"
              style={{ minHeight: "400px", maxHeight: "400px" }}
            >
              <RadarChart riasecProfile={profile.riasec_profile} />
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Skills Assessment
              </h2>
            </div>
            <div
              className="w-full overflow-auto"
              style={{ minHeight: "400px", maxHeight: "400px" }}
            >
              <SkillBarChart skills={profile.skills} />
            </div>
          </div>
        </div>

        {/* Visualizations */}
        {visualization ? (
          <>
            {/* Embeddings */}
            <div className="card-elevated p-8">
              <div className="flex items-center space-x-2 mb-6">
                <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-800">
                  Profile Embeddings
                </h2>
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
                    <h2 className="text-3xl font-bold text-gray-800">
                      Cluster Membership
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    See which cluster you belong to and how other students are
                    distributed across clusters.
                  </p>
                </div>
              </div>
              {cluster?.algorithm_used && (
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Algorithm Used:</strong> Your cluster assignment was
                    determined using the{" "}
                    <span className="font-semibold">
                      {cluster.algorithm_used === "kmeans_plus" ||
                      cluster.algorithm_used === "kmeans"
                        ? "KMeans++"
                        : cluster.algorithm_used === "kmeans_random"
                          ? "KMeans (Random)"
                          : cluster.algorithm_used}
                    </span>{" "}
                    algorithm, which was automatically selected as the
                    best-performing model based on comprehensive evaluation
                    metrics.
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
                  <h2 className="text-3xl font-bold text-gray-800">
                    Career Recommendations
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Your recommended careers highlighted in the embedding space.
                </p>
                {visualization.careers_2d &&
                visualization.recommended_career_indices ? (
                  <CareerRecommendationChart
                    visualization={visualization}
                    recommendations={recommendations}
                  />
                ) : (
                  <p className="text-sm text-gray-500">
                    2D recommendation view is unavailable for this profile.
                  </p>
                )}
              </div>
            )}

            {/* Nearby Careers 3D */}
            {recommendations && recommendations.length > 0 && (
              <div className="card-elevated p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <SparklesIcon className="w-6 h-6 text-pink-600" />
                  <h2 className="text-3xl font-bold text-gray-800">
                    3D Nearby Careers
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Explore careers that are close to your top recommendation in
                  3D embedding space.
                </p>
                {visualization.careers_3d &&
                visualization.recommended_career_indices ? (
                  <NearbyCareers3D
                    visualization={visualization}
                    recommendations={recommendations}
                  />
                ) : (
                  <p className="text-sm text-gray-500">
                    3D recommendation view is unavailable for this profile.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="card-elevated p-8">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading visualization data...</p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few moments
              </p>
            </div>
          </div>
        )}

        {/* Career Recommendations List */}
        {recommendations && recommendations.length > 0 && (
          <div className="card-elevated p-8">
            <div className="flex items-center space-x-2 mb-6">
              <TrophyIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-800">
                Top Career Recommendations
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {recommendations.map((rec, idx) => {
                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 border border-gray-200 transition-all duration-300 hover:border-indigo-300 hover:shadow-xl"
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-4 right-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                          idx === 0
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                            : idx === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-400"
                              : idx === 2
                                ? "bg-gradient-to-br from-orange-300 to-orange-400"
                                : "bg-gradient-to-br from-blue-600 to-blue-500"
                        }`}
                      >
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="pr-16">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                            {rec.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {rec.description}
                          </p>
                        </div>
                        <div className="ml-6 text-right">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                            {(rec.similarity_score * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-500 font-medium">
                            Match Score
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <p className="text-xs text-gray-600 mb-1">Domain</p>
                          <p className="font-semibold text-blue-700">
                            {rec.domain && rec.domain !== "Unknown"
                              ? rec.domain
                              : "Not specified"}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <p className="text-xs text-gray-600 mb-1">
                            Salary Range
                          </p>
                          <p className="font-semibold text-blue-700">
                            {rec.salary_range && rec.salary_range !== "N/A"
                              ? rec.salary_range
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      {rec.required_skills &&
                        rec.required_skills.length > 0 && (
                          <div className="mt-6">
                            <p className="text-sm font-semibold text-gray-700 mb-3">
                              Required Skills:
                            </p>
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

                      {rec.skill_gaps &&
                      Object.keys(rec.skill_gaps).length > 0 ? (
                        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                          <p className="text-sm font-semibold text-yellow-800 mb-3">
                            Skill Gaps (Areas to Improve):
                          </p>
                          <div className="space-y-3">
                            {Object.entries(rec.skill_gaps)
                              .filter(([_, gap]) => {
                                // Filter: show gaps > 10% (0.1) - backend already filters at 0.1, but we can be more lenient
                                const gapValue =
                                  typeof gap === "number"
                                    ? gap
                                    : parseFloat(gap);
                                return !isNaN(gapValue) && gapValue > 0.1;
                              })
                              .sort(([_, a], [__, b]) => {
                                // Sort by gap value (highest first)
                                const gapA =
                                  typeof a === "number" ? a : parseFloat(a);
                                const gapB =
                                  typeof b === "number" ? b : parseFloat(b);
                                return (
                                  (isNaN(gapB) ? 0 : gapB) -
                                  (isNaN(gapA) ? 0 : gapA)
                                );
                              })
                              .map(([skill, gap]) => {
                                const gapValue =
                                  typeof gap === "number"
                                    ? gap
                                    : parseFloat(gap);
                                const gapPercent = isNaN(gapValue)
                                  ? 0
                                  : Math.round(gapValue * 100);
                                // Calculate filled portion: 100% - gap% = current skill level
                                // This shows how much skill the user has, with gap as empty space
                                const filledPercent = Math.max(
                                  0,
                                  Math.min(100 - gapPercent, 100),
                                );

                                return (
                                  <div key={skill} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="font-medium text-gray-700">
                                        {skill}
                                      </span>
                                      <span className="text-yellow-700 font-semibold">
                                        {gapPercent}% gap
                                      </span>
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
                            const gapValue =
                              typeof gap === "number" ? gap : parseFloat(gap);
                            return !isNaN(gapValue) && gapValue > 0.1;
                          }).length === 0 && (
                            <p className="text-sm text-gray-600 italic">
                              All skill gaps are below 10% threshold.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-sm font-semibold text-green-800">
                            ✓ No significant skill gaps detected!
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Your skills align well with this career path.
                          </p>
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
