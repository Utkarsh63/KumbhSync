import StatsOverview from '../components/dashboard/StatsOverview.jsx';
import SectorGrid from '../components/dashboard/SectorGrid.jsx';
import DeploymentFeed from '../components/dashboard/DeploymentFeed.jsx';
import SkillChart from '../components/dashboard/SkillChart.jsx';

export default function Dashboard() {

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <StatsOverview />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left — Sector Grid (~65%) */}
        <div className="xl:col-span-3 space-y-4">
          <SectorGrid />
        </div>

        {/* Right — Feed + Chart (~35%) */}
        <div className="xl:col-span-2 space-y-6">
          <DeploymentFeed />
          <SkillChart />
        </div>
      </div>
    </div>
  );
}
