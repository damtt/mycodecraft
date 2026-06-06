import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { useProfiles } from '../stores/profileStore';
import HudBar from '../components/HudBar';
import BottomNav from '../components/BottomNav';
import GuideBuddy from '../features/guide/GuideBuddy';
import TitleScreen from '../screens/TitleScreen';
import PlayersScreen from '../screens/PlayersScreen';
import MapScreen from '../screens/MapScreen';
import QuestScreen from '../screens/QuestScreen';
import InventoryScreen from '../screens/InventoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

/** Game routes need an active profile; otherwise bounce to player select. */
function RequireProfile() {
  const activeId = useProfiles((s) => s.activeId);
  if (!activeId) return <Navigate to="/players" replace />;
  return (
    <div className="flex min-h-screen flex-col">
      <HudBar />
      <main className="flex flex-1 flex-col pb-16 md:pb-0"><Outlet /></main>
      <GuideBuddy />
      <BottomNav />
    </div>
  );
}

export const routes = [
  { path: '/', element: <TitleScreen /> },
  { path: '/players', element: <PlayersScreen /> },
  {
    element: <RequireProfile />,
    children: [
      { path: '/map', element: <MapScreen /> },
      { path: '/quest/:id', element: <QuestScreen /> },
      { path: '/inventory', element: <InventoryScreen /> },
      { path: '/settings', element: <SettingsScreen /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
