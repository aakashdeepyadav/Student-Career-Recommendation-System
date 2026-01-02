import Layout from '../components/Layout';
import RadarChart from '../components/charts/RadarChart';
import useProfileStore from '../store/profileStore';
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  LightBulbIcon,
  SparklesIcon,
  BeakerIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CpuChipIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

function RIASECInfo() {
  const { profile } = useProfileStore();

  const riasecDimensions = [
    {
      code: 'R',
      name: 'Realistic',
      description: 'People who like to work with their hands, tools, machines, and animals. They prefer practical, hands-on activities.',
      icon: '🔧',
      traits: ['Practical', 'Mechanical', 'Athletic', 'Concrete', 'Stable'],
      careers: ['Engineer', 'Mechanic', 'Farmer', 'Architect', 'Pilot'],
      color: 'from-orange-500 to-red-500'
    },
    {
      code: 'I',
      name: 'Investigative',
      description: 'People who like to observe, learn, investigate, analyze, evaluate, and solve problems. They enjoy scientific and intellectual activities.',
      icon: '🔬',
      traits: ['Analytical', 'Intellectual', 'Scientific', 'Curious', 'Independent'],
      careers: ['Scientist', 'Researcher', 'Doctor', 'Mathematician', 'Engineer'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      code: 'A',
      name: 'Artistic',
      description: 'People who like to work in unstructured situations using their creativity and imagination. They enjoy artistic, musical, and literary activities.',
      icon: '🎨',
      traits: ['Creative', 'Expressive', 'Intuitive', 'Original', 'Imaginative'],
      careers: ['Artist', 'Musician', 'Writer', 'Designer', 'Actor'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      code: 'S',
      name: 'Social',
      description: 'People who like to work with other people to help, teach, and serve. They enjoy helping, teaching, and serving others.',
      icon: '👥',
      traits: ['Helpful', 'Friendly', 'Empathetic', 'Cooperative', 'Understanding'],
      careers: ['Teacher', 'Counselor', 'Nurse', 'Social Worker', 'Therapist'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      code: 'E',
      name: 'Enterprising',
      description: 'People who like to work with people to influence, persuade, lead, or manage for organizational goals or economic gain.',
      icon: '💼',
      traits: ['Ambitious', 'Energetic', 'Persuasive', 'Confident', 'Optimistic'],
      careers: ['Manager', 'Salesperson', 'Entrepreneur', 'Lawyer', 'Politician'],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      code: 'C',
      name: 'Conventional',
      description: 'People who like to work with data, have clerical or numerical ability, and carry out tasks in detail. They prefer structured, organized activities.',
      icon: '📊',
      traits: ['Organized', 'Detail-oriented', 'Efficient', 'Practical', 'Reliable'],
      careers: ['Accountant', 'Banker', 'Secretary', 'Data Analyst', 'Administrator'],
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 p-8 text-white shadow-xl">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <AcademicCapIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">RIASEC Career Theory</h1>
                <p className="text-purple-100 text-lg">Understanding the Foundation of Career Assessment</p>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>
        </div>

        {/* What is RIASEC */}
        <div className="card-elevated p-8">
          <div className="flex items-center space-x-3 mb-6">
            <LightBulbIcon className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-800">What is RIASEC?</h2>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-4">
              <strong>RIASEC</strong> is an acronym for six personality types and work environments developed by psychologist 
              <strong> John L. Holland</strong> in the 1950s. It's one of the most widely used career assessment tools in the world.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6 rounded-r-lg">
              <p className="text-blue-800 font-semibold mb-2">Core Principle:</p>
              <p className="text-blue-700">
                People are happiest and most successful in careers that match their personality type. 
                The theory suggests that both people and work environments can be classified into six types: 
                <strong> Realistic, Investigative, Artistic, Social, Enterprising, and Conventional</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <h3 className="font-bold text-gray-800 mb-2">🎯 Purpose</h3>
                <p className="text-gray-700 text-sm">
                  Help individuals understand their interests and find careers that align with their personality type.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <h3 className="font-bold text-gray-800 mb-2">📊 Application</h3>
                <p className="text-gray-700 text-sm">
                  Used in career counseling, education, and HR to match people with suitable career paths.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="card-elevated p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpenIcon className="w-8 h-8 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-800">History & Development</h2>
          </div>

          <div className="space-y-6">
            <div className="relative pl-8 border-l-4 border-indigo-500">
              <div className="absolute -left-3 top-0 w-6 h-6 bg-indigo-500 rounded-full"></div>
              <div className="mb-2">
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">1950s</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Origins</h3>
              <p className="text-gray-700">
                John L. Holland, a psychologist at Johns Hopkins University, began developing his theory of vocational choice. 
                He observed that people in similar occupations shared similar personality traits and interests.
              </p>
            </div>

            <div className="relative pl-8 border-l-4 border-purple-500">
              <div className="absolute -left-3 top-0 w-6 h-6 bg-purple-500 rounded-full"></div>
              <div className="mb-2">
                <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">1970s</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Formalization</h3>
              <p className="text-gray-700">
                Holland published his book "Making Vocational Choices: A Theory of Vocational Personalities and Work Environments" 
                (1973), formally establishing the RIASEC model. The theory became widely adopted in career counseling.
              </p>
            </div>

            <div className="relative pl-8 border-l-4 border-pink-500">
              <div className="absolute -left-3 top-0 w-6 h-6 bg-pink-500 rounded-full"></div>
              <div className="mb-2">
                <span className="text-sm font-semibold text-pink-600 bg-pink-50 px-3 py-1 rounded-full">1980s-Present</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Modern Application</h3>
              <p className="text-gray-700">
                RIASEC has been integrated into numerous career assessment tools, including the Strong Interest Inventory, 
                O*NET, and various online career platforms. It's used by millions of people worldwide to make career decisions.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <div className="flex items-start space-x-4">
              <UserGroupIcon className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-indigo-900 mb-2">John L. Holland (1919-2008)</h4>
                <p className="text-indigo-800 text-sm">
                  A pioneering psychologist who revolutionized career counseling. His RIASEC theory remains one of the most 
                  influential models in vocational psychology, helping millions of people find fulfilling careers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How RIASEC Works */}
        <div className="card-elevated p-8">
          <div className="flex items-center space-x-3 mb-6">
            <CpuChipIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-800">How RIASEC Works</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="text-4xl mb-3">1️⃣</div>
                <h3 className="font-bold text-gray-800 mb-2">Assessment</h3>
                <p className="text-gray-700 text-sm">
                  Individuals answer questions about their interests, preferences, and activities they enjoy or would enjoy.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="text-4xl mb-3">2️⃣</div>
                <h3 className="font-bold text-gray-800 mb-2">Scoring</h3>
                <p className="text-gray-700 text-sm">
                  Responses are scored across all six RIASEC dimensions, creating a profile showing relative strength in each area.
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-4xl mb-3">3️⃣</div>
                <h3 className="font-bold text-gray-800 mb-2">Matching</h3>
                <p className="text-gray-700 text-sm">
                  The profile is matched with careers and work environments that align with the individual's dominant types.
                </p>
              </div>
            </div>

            <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5" />
                <span>Key Concepts</span>
              </h3>
              <ul className="space-y-2 text-indigo-800">
                <li className="flex items-start space-x-2">
                  <ArrowRightIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Congruence:</strong> The match between a person's type and their work environment</span>
                </li>
                <li className="flex items-start space-x-2">
                  <ArrowRightIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Consistency:</strong> How similar adjacent types are (e.g., R and I are more similar than R and A)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <ArrowRightIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Differentiation:</strong> How clearly defined a person's type profile is</span>
                </li>
                <li className="flex items-start space-x-2">
                  <ArrowRightIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Holland Code:</strong> A 3-letter code representing a person's top three types (e.g., "ISA" = Investigative, Social, Artistic)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIASEC Dimensions */}
        <div className="card-elevated p-8">
          <div className="flex items-center space-x-3 mb-6">
            <ChartBarIcon className="w-8 h-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-gray-800">The Six RIASEC Dimensions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riasecDimensions.map((dimension) => (
              <div
                key={dimension.code}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${dimension.color} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{dimension.icon}</div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">Type</div>
                      <div className="text-2xl font-bold">{dimension.code}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{dimension.name}</h3>
                  <p className="text-white/90 text-sm mb-4 leading-relaxed">{dimension.description}</p>
                  
                  <div className="mb-4">
                    <div className="text-xs font-semibold mb-2 opacity-90">Key Traits:</div>
                    <div className="flex flex-wrap gap-2">
                      {dimension.traits.map((trait, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold mb-2 opacity-90">Example Careers:</div>
                    <div className="flex flex-wrap gap-2">
                      {dimension.careers.slice(0, 3).map((career, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/30 backdrop-blur-sm rounded text-xs"
                        >
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              </div>
            ))}
          </div>
        </div>

        {/* How RIASEC is Mapped in This System */}
        <div className="card-elevated p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BeakerIcon className="w-8 h-8 text-emerald-600" />
            <h2 className="text-3xl font-bold text-gray-800">How RIASEC is Mapped in SCRS</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <h3 className="font-bold text-emerald-900 mb-3 flex items-center space-x-2">
                <SparklesIcon className="w-5 h-5" />
                <span>Our Implementation</span>
              </h3>
              <p className="text-emerald-800 mb-4">
                In the Student Career Recommendation System (SCRS), RIASEC plays a central role in understanding 
                student interests and matching them with appropriate career paths.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3">1. Questionnaire Assessment</h4>
                <p className="text-blue-800 text-sm mb-3">
                  Students answer 48 questions (8 per dimension) about their interests, preferences, and activities.
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Questions cover all six RIASEC dimensions</li>
                  <li>• Responses are scored on a scale</li>
                  <li>• Creates a comprehensive interest profile</li>
                </ul>
              </div>

              <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-3">2. Profile Calculation</h4>
                <p className="text-purple-800 text-sm mb-3">
                  Responses are processed to create a normalized RIASEC profile with scores for each dimension.
                </p>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Each dimension gets a score (0-1)</li>
                  <li>• Profile shows relative strength in each area</li>
                  <li>• Top dimensions identified for matching</li>
                </ul>
              </div>

              <div className="p-6 bg-pink-50 rounded-xl border border-pink-200">
                <h4 className="font-bold text-pink-900 mb-3">3. Vector Representation</h4>
                <p className="text-pink-800 text-sm mb-3">
                  RIASEC scores are converted into a numerical vector for machine learning processing.
                </p>
                <ul className="text-pink-700 text-sm space-y-1">
                  <li>• 6-dimensional RIASEC vector created</li>
                  <li>• Combined with skills and subject preferences</li>
                  <li>• Used for clustering and similarity matching</li>
                </ul>
              </div>

              <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-3">4. Career Matching</h4>
                <p className="text-indigo-800 text-sm mb-3">
                  RIASEC profile is matched with careers that align with the student's dominant types.
                </p>
                <ul className="text-indigo-700 text-sm space-y-1">
                  <li>• Careers have associated RIASEC codes</li>
                  <li>• Similarity calculated using cosine similarity</li>
                  <li>• Top matches recommended based on alignment</li>
                </ul>
              </div>
            </div>

            {/* Visual Representation */}
            {profile && profile.riasec_profile && (
              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-indigo-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                  <span>Your RIASEC Profile</span>
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Here's how your RIASEC profile looks based on your questionnaire responses:
                </p>
                <div className="h-[400px]">
                  <RadarChart riasecProfile={profile.riasec_profile} />
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(profile.riasec_profile)
                    .sort(([, a], [, b]) => b - a)
                    .map(([code, value]) => {
                      const dim = riasecDimensions.find(d => d.code === code);
                      return (
                        <div key={code} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700">{dim?.name || code}</span>
                            <span className="text-indigo-600 font-bold">{Math.round(value * 100)}%</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Process Flow */}
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-indigo-200">
              <h4 className="font-bold text-gray-800 mb-4">RIASEC Processing Flow in SCRS</h4>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">
                    1
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Questionnaire</p>
                </div>
                <ArrowRightIcon className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">
                    2
                  </div>
                  <p className="text-sm font-semibold text-gray-700">RIASEC Scores</p>
                </div>
                <ArrowRightIcon className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">
                    3
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Vector Creation</p>
                </div>
                <ArrowRightIcon className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">
                    4
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Clustering</p>
                </div>
                <ArrowRightIcon className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">
                    5
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Career Match</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="card-elevated p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpenIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-800">Additional Resources</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">Key Principles</h3>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• People choose careers that match their personality type</li>
                <li>• Work environments can also be classified by RIASEC types</li>
                <li>• Better person-environment fit leads to job satisfaction</li>
                <li>• Most people have 2-3 dominant types (Holland Code)</li>
              </ul>
            </div>

            <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-2">Research Support</h3>
              <ul className="text-purple-800 text-sm space-y-2">
                <li>• Used in over 50 countries worldwide</li>
                <li>• Validated through decades of research</li>
                <li>• Integrated into major career assessment tools</li>
                <li>• Continuously refined and updated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default RIASECInfo;

