import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const Questionnaire = lazy(() => import("./pages/Questionnaire"));
const Results = lazy(() => import("./pages/Results"));
const ModelStatistics = lazy(() => import("./pages/ModelStatistics"));
const RIASECInfo = lazy(() => import("./pages/RIASECInfo"));

function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-slate-600">
            Loading...
          </div>
        }
      >
        <Routes>
          <Route
            path="/dashboard"
            element={<Navigate to="/results" replace />}
          />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/results" element={<Results />} />
          <Route path="/model-statistics" element={<ModelStatistics />} />
          <Route path="/riasec-info" element={<RIASECInfo />} />
          <Route path="/" element={<Navigate to="/results" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
