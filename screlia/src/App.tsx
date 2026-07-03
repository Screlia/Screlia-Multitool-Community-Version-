import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage';
import CodeStudioPage from './pages/CodeStudioPage';
import WeatherPage from './pages/WeatherPage';
import NewsPage from './pages/NewsPage';
import StudiosDashboardPage from './pages/StudiosDashboardPage';

import SettingsPage from './pages/SettingsPage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';
import StorePage from './pages/StorePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SearchPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="studios" element={<StudiosDashboardPage />} />
          <Route path="code" element={<CodeStudioPage />} />
          <Route path="weather" element={<WeatherPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
