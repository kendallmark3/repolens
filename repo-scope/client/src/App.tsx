import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { OverviewPage } from "./pages/OverviewPage";
import { RepositoriesPage } from "./pages/RepositoriesPage";
import { RepositoryDetailPage } from "./pages/RepositoryDetailPage";
import { CapabilitiesPage } from "./pages/CapabilitiesPage";
import { IntelligencePage } from "./pages/IntelligencePage";
import { DependenciesPage } from "./pages/DependenciesPage";
import { ArchiveCandidatesPage } from "./pages/ArchiveCandidatesPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/repositories/:id" element={<RepositoryDetailPage />} />
          <Route path="/capabilities" element={<CapabilitiesPage />} />
          <Route path="/intelligence" element={<IntelligencePage />} />
          <Route path="/dependencies" element={<DependenciesPage />} />
          <Route path="/archive-candidates" element={<ArchiveCandidatesPage />} />
          <Route path="/discovery" element={<DiscoveryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
