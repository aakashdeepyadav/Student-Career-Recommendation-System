import { useState } from 'react';
import Layout from '../components/Layout';
import {
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  UserGroupIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CubeIcon,
  AdjustmentsHorizontalIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

function ModelWorkflow() {
  const [activeStep, setActiveStep] = useState(null);

  const workflowSteps = [
    {
      id: 1,
      title: "Questionnaire Input",
      icon: ClipboardDocumentCheckIcon,
      color: "bg-blue-500",
      description: "User answers questions about interests, skills, and subject preferences",
      details: [
        "32 RIASEC questions (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)",
        "10 Skill assessment questions (Programming, Problem Solving, Communication, etc.)",
        "4 Subject preference questions (Mathematics, Science, Arts, Languages)",
        "Each response is rated on a 1-5 scale"
      ],
      output: "Raw questionnaire responses"
    },
    {
      id: 2,
      title: "Profile Processing",
      icon: AdjustmentsHorizontalIcon,
      color: "bg-indigo-500",
      description: "Convert responses into normalized feature vectors",
      details: [
        "RIASEC scores calculated by averaging responses per category",
        "Skill scores normalized to 0-1 scale (divide by 5)",
        "Subject preferences normalized to 0-1 scale",
        "Combined into 20-dimensional feature vector"
      ],
      output: "20D Combined Vector: [6 RIASEC + 10 Skills + 4 Subjects]",
      formula: "Vector = [R, I, A, S, E, C, skill₁...skill₁₀, subj₁...subj₄]"
    },
    {
      id: 3,
      title: "Dual Algorithm Clustering",
      icon: UserGroupIcon,
      color: "bg-purple-500",
      description: "Assign user to one of 5 career-oriented clusters using dual algorithms with automatic selection",
      details: [
        "Unsupervised learning - no labeled data needed",
        "Trains both KMeans++ (smart initialization) and KMeans with random initialization",
        "Automatically selects best algorithm based on comprehensive metrics",
        "Evaluation includes: clustering quality, training speed, model complexity, stability",
        "5 clusters: Tech/Analytical, Creative, Business/Leadership, Social/People, Practical/Realistic",
        "KMeans++ typically finds better solutions faster due to smart initialization"
      ],
      output: "Cluster ID, Name, and Algorithm Used (KMeans++ or KMeans Random)",
      metrics: ["Silhouette Score", "Calinski-Harabasz Index", "Davies-Bouldin Index", "Training Time", "Inertia"]
    },
    {
      id: 4,
      title: "Career Embedding",
      icon: CubeIcon,
      color: "bg-pink-500",
      description: "Create vector representations of careers for comparison",
      details: [
        "Each career has: RIASEC profile, required skills, description",
        "Text descriptions embedded using SentenceTransformers (384D)",
        "Combined with RIASEC (6D) and skills (10D) vectors",
        "Total career embedding: 400D → reduced to 20D for comparison"
      ],
      output: "Career embedding vectors for similarity matching"
    },
    {
      id: 5,
      title: "Similarity Matching",
      icon: SparklesIcon,
      color: "bg-amber-500",
      description: "Find careers most similar to user profile using cosine similarity",
      details: [
        "Compare user vector with all 25 career vectors",
        "Cosine similarity: cos(θ) = (A·B)/(||A||×||B||)",
        "Score range: -1 to 1 (higher = more similar)",
        "Return top 5 most similar careers"
      ],
      output: "Top 5 career recommendations with match scores",
      formula: "Similarity = Σ(user_i × career_i) / (√Σuser_i² × √Σcareer_i²)"
    },
    {
      id: 6,
      title: "Skill Gap Analysis",
      icon: DocumentMagnifyingGlassIcon,
      color: "bg-emerald-500",
      description: "Identify skills user needs to develop for each career",
      details: [
        "Compare user skill levels with career requirements",
        "Map career-specific skills to user skill categories",
        "Calculate gap: required_level - user_level",
        "Filter gaps > 10% as significant"
      ],
      output: "Skill gap percentages for improvement areas",
      formula: "Gap = max(0, required_skill - user_skill)"
    },
    {
      id: 7,
      title: "Visualization",
      icon: ChartBarIcon,
      color: "bg-cyan-500",
      description: "Reduce dimensions for 2D/3D visual representation",
      details: [
        "PCA (Principal Component Analysis) for 2D projection",
        "UMAP (Uniform Manifold Approximation) for 3D projection",
        "Shows user position relative to careers and clusters",
        "Interactive Plotly charts for exploration"
      ],
      output: "2D and 3D coordinates for all entities"
    }
  ];

  const algorithms = [
    {
      name: "KMeans++ Clustering",
      type: "Unsupervised Learning",
      purpose: "Group similar students into clusters using smart initialization (hard assignments)",
      how: "Uses k-means++ initialization to spread initial centers, then iteratively assigns points to nearest centroid and updates centroids until convergence",
      params: "k=5 clusters, k-means++ init, n_init=10, max_iter=300, Euclidean distance",
      advantages: "Faster convergence, finds better solutions, more stable than random initialization, deterministic"
    },
    {
      name: "KMeans with Random Initialization",
      type: "Unsupervised Learning",
      purpose: "Group students into clusters using random initialization (baseline comparison)",
      how: "Same KMeans algorithm but starts with random cluster centers instead of k-means++",
      params: "k=5 clusters, random init, fewer runs (n_init=3), fewer iterations (max_iter=100)",
      advantages: "Shows importance of initialization, faster training, demonstrates algorithm differences"
    },
    {
      name: "Cosine Similarity",
      type: "Similarity Metric",
      purpose: "Measure similarity between user and career vectors",
      how: "Calculates the cosine of the angle between two vectors in high-dimensional space",
      params: "Range: -1 to 1"
    },
    {
      name: "PCA",
      type: "Dimensionality Reduction",
      purpose: "Project 20D vectors to 2D for visualization",
      how: "Finds principal components that capture maximum variance",
      params: "n_components=2"
    },
    {
      name: "UMAP",
      type: "Dimensionality Reduction",
      purpose: "Project 20D vectors to 3D for visualization",
      how: "Preserves local and global structure using manifold learning",
      params: "n_components=3, n_neighbors=15"
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Model Workflow</h1>
          <p className="text-slate-500 mt-1">
            Understanding how the career recommendation system works
          </p>
        </div>

        {/* Main Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">ML Pipeline Overview</h2>
          
          {/* Visual Flow */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 p-4 bg-slate-50 rounded-xl">
            {workflowSteps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeStep === step.id 
                      ? `${step.color} text-white shadow-lg` 
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                  <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                  <span className="text-sm font-medium md:hidden">{step.id}</span>
                </button>
                {idx < workflowSteps.length - 1 && (
                  <ArrowRightIcon className="w-5 h-5 text-slate-400 mx-1" />
                )}
              </div>
            ))}
          </div>

          {/* Step Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {workflowSteps.map((step) => (
              <div
                key={step.id}
                className={`border rounded-xl p-5 transition-all cursor-pointer ${
                  activeStep === step.id 
                    ? 'border-slate-900 shadow-lg ring-2 ring-slate-900/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              >
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-slate-400">Step {step.id}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                
                {activeStep === step.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 animate-fadeIn">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Process</h4>
                      <ul className="space-y-1">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-slate-600">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {step.formula && (
                      <div className="bg-slate-100 rounded-lg p-3">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Formula</h4>
                        <code className="text-xs text-slate-700 font-mono">{step.formula}</code>
                      </div>
                    )}
                    
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-emerald-700 uppercase mb-1">Output</h4>
                      <p className="text-sm text-emerald-800">{step.output}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Data Flow</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[800px] p-4">
              {/* Flow Diagram */}
              <svg viewBox="0 0 800 300" className="w-full h-auto">
                {/* Background */}
                <rect x="0" y="0" width="800" height="300" fill="#f8fafc" rx="8"/>
                
                {/* User Input */}
                <rect x="20" y="120" width="100" height="60" fill="#3b82f6" rx="8"/>
                <text x="70" y="145" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">User</text>
                <text x="70" y="160" textAnchor="middle" fill="white" fontSize="9">Questionnaire</text>
                
                {/* Arrow 1 */}
                <path d="M 120 150 L 150 150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                
                {/* Profile Processor */}
                <rect x="160" y="110" width="100" height="80" fill="#6366f1" rx="8"/>
                <text x="210" y="140" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Profile</text>
                <text x="210" y="155" textAnchor="middle" fill="white" fontSize="9">Processor</text>
                <text x="210" y="175" textAnchor="middle" fill="white" fontSize="8">→ 20D Vector</text>
                
                {/* Arrow 2 */}
                <path d="M 260 150 L 290 150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                
                {/* Split */}
                <circle cx="310" cy="150" r="10" fill="#94a3b8"/>
                
                {/* Arrow to Clustering */}
                <path d="M 320 150 L 340 80 L 370 80" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                
                {/* Arrow to Similarity */}
                <path d="M 320 150 L 340 150 L 370 150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                
                {/* Arrow to Visualization */}
                <path d="M 320 150 L 340 220 L 370 220" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                
                {/* Clustering */}
                <rect x="380" y="50" width="120" height="60" fill="#a855f7" rx="8"/>
                <text x="440" y="70" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Dual Algorithm</text>
                <text x="440" y="85" textAnchor="middle" fill="white" fontSize="9">KMeans++ & Random</text>
                <text x="440" y="100" textAnchor="middle" fill="white" fontSize="8">Auto-Select</text>
                
                {/* Similarity */}
                <rect x="380" y="120" width="120" height="60" fill="#f59e0b" rx="8"/>
                <text x="440" y="145" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Cosine</text>
                <text x="440" y="160" textAnchor="middle" fill="white" fontSize="9">Similarity</text>
                
                {/* Visualization */}
                <rect x="380" y="190" width="120" height="60" fill="#06b6d4" rx="8"/>
                <text x="440" y="215" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">PCA/UMAP</text>
                <text x="440" y="230" textAnchor="middle" fill="white" fontSize="9">Reduction</text>
                
                {/* Arrows from processes */}
                <path d="M 500 80 L 540 80" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                <path d="M 500 150 L 540 150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                <path d="M 500 220 L 540 220" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                
                {/* Outputs */}
                <rect x="550" y="50" width="100" height="60" fill="#10b981" rx="8"/>
                <text x="600" y="75" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Cluster</text>
                <text x="600" y="90" textAnchor="middle" fill="white" fontSize="9">Assignment</text>
                
                <rect x="550" y="120" width="100" height="60" fill="#10b981" rx="8"/>
                <text x="600" y="145" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Career</text>
                <text x="600" y="160" textAnchor="middle" fill="white" fontSize="9">Recommendations</text>
                
                <rect x="550" y="190" width="100" height="60" fill="#10b981" rx="8"/>
                <text x="600" y="215" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">2D/3D</text>
                <text x="600" y="230" textAnchor="middle" fill="white" fontSize="9">Visualizations</text>
                
                {/* Merge */}
                <path d="M 650 80 L 680 80 L 700 150" stroke="#94a3b8" strokeWidth="2"/>
                <path d="M 650 150 L 700 150" stroke="#94a3b8" strokeWidth="2"/>
                <path d="M 650 220 L 680 220 L 700 150" stroke="#94a3b8" strokeWidth="2"/>
                <path d="M 700 150 L 730 150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                
                {/* Final Output */}
                <rect x="740" y="120" width="50" height="60" fill="#1e293b" rx="8"/>
                <text x="765" y="145" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">UI</text>
                <text x="765" y="160" textAnchor="middle" fill="white" fontSize="8">Results</text>
                
                {/* Arrow marker definition */}
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8"/>
                  </marker>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Algorithms Used */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Algorithms & Techniques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {algorithms.map((algo, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{algo.name}</h3>
                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {algo.type}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{algo.purpose}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">How: </span>
                    <span className="text-slate-600">{algo.how}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Params: </span>
                    <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{algo.params}</code>
                  </div>
                  {algo.advantages && (
                    <div>
                      <span className="font-medium text-slate-700">Advantages: </span>
                      <span className="text-slate-600">{algo.advantages}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Vector Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Feature Vector Structure (20D)</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Vector visualization */}
              <div className="flex items-center space-x-1 mb-4">
                {/* RIASEC */}
                {['R', 'I', 'A', 'S', 'E', 'C'].map((letter, idx) => (
                  <div key={letter} className="w-10 h-12 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    {letter}
                  </div>
                ))}
                <div className="w-2"></div>
                {/* Skills */}
                {['Pro', 'PS', 'Com', 'Cre', 'Lea', 'Ana', 'Mat', 'Des', 'Res', 'Tea'].map((skill, idx) => (
                  <div key={skill} className="w-10 h-12 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    {skill}
                  </div>
                ))}
                <div className="w-2"></div>
                {/* Subjects */}
                {['M', 'S', 'A', 'L'].map((subj, idx) => (
                  <div key={subj} className="w-10 h-12 bg-emerald-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    {subj}
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-slate-600">RIASEC (6 dimensions)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-slate-600">Skills (10 dimensions)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span className="text-slate-600">Subjects (4 dimensions)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Selection Process */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <CpuChipIcon className="w-6 h-6 text-blue-600" />
            <span>Dual Algorithm Selection Process</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-700 mb-3">How Selection Works</h3>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Both KMeans++ and KMeans (Random) are trained on the same dataset</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Comprehensive evaluation using deployment-level metrics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Weighted scoring: Quality (50%), Performance (25%), Efficiency (15%), Complexity (10%)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>Best algorithm automatically selected and used for all predictions</span>
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Evaluation Metrics</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Clustering Quality:</strong> Silhouette, Calinski-Harabasz, Davies-Bouldin</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Performance:</strong> Cluster stability, inter/intra cluster metrics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Efficiency:</strong> Training time, prediction latency</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Complexity:</strong> Inertia (within-cluster sum of squares, lower is better)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why Unsupervised? */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Why Unsupervised Learning?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Advantages</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span><strong>No labeled data required</strong> - Don't need pre-defined "correct" career matches</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Discovers natural patterns</strong> - Finds genuine student groupings</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Scalable</strong> - Easy to add new students and careers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span><strong>Interpretable</strong> - Cluster centers show clear career orientations</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Key Metrics</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start space-x-2">
                  <CpuChipIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>Silhouette Score</strong> - Measures cluster cohesion vs separation (both algorithms)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CpuChipIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>Training Time</strong> - Deployment metric (KMeans Random typically faster but may find suboptimal solutions)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CpuChipIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>Inertia</strong> - Model complexity (both algorithms, lower is better - tighter clusters)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CpuChipIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>Cosine Similarity</strong> - Career match quality (0-100%)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CpuChipIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span><strong>PCA Variance</strong> - Information retained in visualization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ModelWorkflow;


