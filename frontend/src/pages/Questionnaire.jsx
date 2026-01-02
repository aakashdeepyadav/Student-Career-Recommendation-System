import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import useProfileStore from '../store/profileStore';
import ProgressLoader from '../components/ProgressLoader';
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

// RIASEC Questions (48 questions - 8 per dimension)
const RIASEC_QUESTIONS = {
  R: [
    { id: 'r1', text: 'I enjoy working with tools and machinery' },
    { id: 'r2', text: 'I like building or fixing things' },
    { id: 'r3', text: 'I prefer hands-on work over theoretical work' },
    { id: 'r4', text: 'I enjoy outdoor activities' },
    { id: 'r5', text: 'I like working with my hands' },
    { id: 'r6', text: 'I enjoy technical and mechanical tasks' },
    { id: 'r7', text: 'I prefer concrete, practical problems' },
    { id: 'r8', text: 'I like working with physical materials' },
  ],
  I: [
    { id: 'i1', text: 'I enjoy scientific research' },
    { id: 'i2', text: 'I like analyzing data and solving complex problems' },
    { id: 'i3', text: 'I enjoy learning about new theories' },
    { id: 'i4', text: 'I prefer independent research work' },
    { id: 'i5', text: 'I enjoy mathematical and logical puzzles' },
    { id: 'i6', text: 'I like conducting experiments' },
    { id: 'i7', text: 'I enjoy reading scientific articles' },
    { id: 'i8', text: 'I prefer abstract thinking' },
  ],
  A: [
    { id: 'a1', text: 'I enjoy creative writing' },
    { id: 'a2', text: 'I like expressing myself through art' },
    { id: 'a3', text: 'I enjoy music, drama, or visual arts' },
    { id: 'a4', text: 'I prefer unstructured, creative work' },
    { id: 'a5', text: 'I like designing and creating original work' },
    { id: 'a6', text: 'I enjoy artistic expression' },
    { id: 'a7', text: 'I prefer creative freedom' },
    { id: 'a8', text: 'I like working with colors, sounds, or words' },
  ],
  S: [
    { id: 's1', text: 'I enjoy helping others' },
    { id: 's2', text: 'I like teaching or training people' },
    { id: 's3', text: 'I enjoy working with people' },
    { id: 's4', text: 'I prefer helping others solve problems' },
    { id: 's5', text: 'I like counseling or advising others' },
    { id: 's6', text: 'I enjoy social interactions' },
    { id: 's7', text: 'I prefer working in teams' },
    { id: 's8', text: 'I like making a difference in people\'s lives' },
  ],
  E: [
    { id: 'e1', text: 'I enjoy leading and managing others' },
    { id: 'e2', text: 'I like persuading and influencing people' },
    { id: 'e3', text: 'I enjoy business and entrepreneurship' },
    { id: 'e4', text: 'I prefer competitive environments' },
    { id: 'e5', text: 'I like making decisions and taking risks' },
    { id: 'e6', text: 'I enjoy sales and marketing' },
    { id: 'e7', text: 'I prefer leadership roles' },
    { id: 'e8', text: 'I like achieving goals and success' },
  ],
  C: [
    { id: 'c1', text: 'I enjoy organizing and maintaining records' },
    { id: 'c2', text: 'I like working with numbers and data' },
    { id: 'c3', text: 'I enjoy structured, routine work' },
    { id: 'c4', text: 'I prefer following established procedures' },
    { id: 'c5', text: 'I like attention to detail' },
    { id: 'c6', text: 'I enjoy administrative tasks' },
    { id: 'c7', text: 'I prefer predictable work environments' },
    { id: 'c8', text: 'I like working with spreadsheets and databases' },
  ],
};

const SKILL_QUESTIONS = [
  { id: 'programming', text: 'Programming/Coding' },
  { id: 'problem_solving', text: 'Problem Solving' },
  { id: 'communication', text: 'Communication' },
  { id: 'creativity', text: 'Creativity' },
  { id: 'leadership', text: 'Leadership' },
  { id: 'analytical', text: 'Analytical Thinking' },
  { id: 'mathematics', text: 'Mathematics' },
  { id: 'design', text: 'Design' },
  { id: 'research', text: 'Research' },
  { id: 'teamwork', text: 'Teamwork' },
];

const SUBJECT_QUESTIONS = [
  { id: 'stem', text: 'STEM (Science, Technology, Engineering, Math)' },
  { id: 'arts', text: 'Arts & Humanities' },
  { id: 'business', text: 'Business & Economics' },
  { id: 'social_sciences', text: 'Social Sciences' },
];

const SECTIONS = [
  { id: 'riasec', name: 'Interests', icon: '🎯', questions: Object.values(RIASEC_QUESTIONS).flat().length },
  { id: 'skills', name: 'Skills', icon: '💼', questions: SKILL_QUESTIONS.length },
  { id: 'subjects', name: 'Subjects', icon: '📚', questions: SUBJECT_QUESTIONS.length },
];

function Questionnaire() {
  const navigate = useNavigate();
  const { submitProfile, loading, loadingStep } = useProfileStore();
  
  const [riasecResponses, setRiasecResponses] = useState({});
  const [skillResponses, setSkillResponses] = useState({});
  const [subjectResponses, setSubjectResponses] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [error, setError] = useState('');

  const currentSection = SECTIONS[currentSectionIndex];

  const calculateProgress = () => {
    const totalQuestions = SECTIONS.reduce((sum, s) => sum + s.questions, 0);
    let answered = 0;
    
    if (currentSectionIndex === 0) {
      answered = Object.keys(riasecResponses).length;
    } else if (currentSectionIndex === 1) {
      answered = Object.keys(skillResponses).length;
    } else {
      answered = Object.keys(subjectResponses).length;
    }
    
    const sectionProgress = (answered / currentSection.questions) * 100;
    const overallProgress = ((currentSectionIndex * 100) + sectionProgress) / SECTIONS.length;
    
    return { sectionProgress, overallProgress };
  };

  const { sectionProgress, overallProgress } = calculateProgress();

  const handleRiasecChange = (questionId, value) => {
    setRiasecResponses({ ...riasecResponses, [questionId]: parseInt(value) });
  };

  const handleSkillChange = (skillId, value) => {
    setSkillResponses({ ...skillResponses, [skillId]: parseInt(value) });
  };

  const handleSubjectChange = (subjectId, value) => {
    setSubjectResponses({ ...subjectResponses, [subjectId]: parseInt(value) });
  };

  const handleNext = () => {
    if (currentSectionIndex < SECTIONS.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setError('');
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    const allRiasec = Object.values(RIASEC_QUESTIONS).flat().every(q => riasecResponses[q.id]);
    const allSkills = SKILL_QUESTIONS.every(q => skillResponses[q.id]);
    const allSubjects = SUBJECT_QUESTIONS.every(q => subjectResponses[q.id]);

    if (!allRiasec || !allSkills || !allSubjects) {
      setError('Please answer all questions before submitting');
      return;
    }

    setError('');
    const result = await submitProfile(riasecResponses, skillResponses, subjectResponses);
    
    if (result.success) {
      navigate('/results');
    } else {
      setError(result.error || 'Failed to submit profile');
    }
  };

  const renderRiasecSection = () => {
    const allQuestions = Object.values(RIASEC_QUESTIONS).flat();
    return (
      <div className="space-y-4">
        {allQuestions.map((question, idx) => (
          <div key={question.id} className="card p-5 transition-all duration-200">
            <p className="font-semibold text-gray-800 mb-4">{question.text}</p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = riasecResponses[question.id] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRiasecChange(question.id, value)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkillsSection = () => {
    return (
      <div className="space-y-4">
        {SKILL_QUESTIONS.map((question) => (
          <div key={question.id} className="card p-5 transition-all duration-200">
            <p className="font-semibold text-gray-800 mb-4">{question.text}</p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = skillResponses[question.id] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleSkillChange(question.id, value)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSubjectsSection = () => {
    return (
      <div className="space-y-4">
        {SUBJECT_QUESTIONS.map((question) => (
          <div key={question.id} className="card p-5 transition-all duration-200">
            <p className="font-semibold text-gray-800 mb-4">{question.text}</p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = subjectResponses[question.id] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleSubjectChange(question.id, value)}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      {/* Progress Loader */}
      {loading && (
        <ProgressLoader 
          currentStep={loadingStep} 
          isComplete={loadingStep >= 6}
        />
      )}
      
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="card-elevated p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Career Profiling Questionnaire</h1>
          <p className="text-gray-600">Answer honestly to get the most accurate recommendations</p>
        </div>

        {/* Progress Bar */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {currentSection.icon} {currentSection.name}
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              {Math.round(overallProgress)}% Complete
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {SECTIONS.map((section, idx) => (
              <span
                key={section.id}
                className={idx === currentSectionIndex ? 'font-semibold text-indigo-600' : ''}
              >
                {section.name}
              </span>
            ))}
          </div>
        </div>

        {/* Section Indicator */}
        <div className="flex space-x-2">
          {SECTIONS.map((section, idx) => {
            const isActive = idx === currentSectionIndex;
            const isCompleted = idx < currentSectionIndex;
            return (
              <div
                key={section.id}
                className={`flex-1 p-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                    : isCompleted
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-xl">{section.icon}</span>
                  )}
                  <span className="font-semibold">{section.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scale Legend */}
        <div className="card p-4 bg-indigo-50 border border-indigo-200">
          <p className="text-sm font-semibold text-indigo-800 mb-2">Rating Scale:</p>
          <div className="flex justify-between text-xs text-indigo-700">
            <span>1 = Strongly Disagree</span>
            <span>2 = Disagree</span>
            <span>3 = Neutral</span>
            <span>4 = Agree</span>
            <span>5 = Strongly Agree</span>
          </div>
        </div>

        {/* Questions */}
        <div className="card p-6">
          {currentSectionIndex === 0 && renderRiasecSection()}
          {currentSectionIndex === 1 && renderSkillsSection()}
          {currentSectionIndex === 2 && renderSubjectsSection()}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fadeIn">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentSectionIndex < SECTIONS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600"
            >
              <span>Next</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Questionnaire</span>
                  <CheckCircleIcon className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Questionnaire;
