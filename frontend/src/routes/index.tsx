import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import HomePage from "../pages/HomePage";
import ExplorePage from "../pages/ExplorePage";
import ChatsPage from "../pages/ChatsPage";
import ProfilePage from "../pages/ProfilePage";
import EditProfilePage from "../pages/EditProfilePage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import SettingsPage from "../pages/SettingsPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import RoomDetailPage from "../pages/RoomDetailPage";
import RoomFormPage from "../pages/RoomFormPage";
import AdvancedFilterPage from "../pages/AdvancedFilterPage";
import TopicRequestsPage from "../pages/TopicRequestsPage";
import VideoRoomPage from "../pages/VideoRoomPage";

export const router = createBrowserRouter([
  // Auth routes (guest only)
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
    ],
  },

  // Protected app routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/explore", element: <ExplorePage /> },
          { path: "/chats", element: <ChatsPage /> },
          { path: "/rooms/create", element: <RoomFormPage /> },
          { path: "/rooms/:uuid", element: <RoomDetailPage /> },
          { path: "/rooms/:uuid/edit", element: <RoomFormPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/profile/edit", element: <EditProfilePage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/settings/change-password", element: <ChangePasswordPage /> },
          { path: "/advanced-filter", element: <AdvancedFilterPage /> },
          { path: "/moderation", element: <TopicRequestsPage /> },
        ],
      },
      // Video room is full-screen (no MainLayout sidebar/header)
      { path: "/rooms/:uuid/live", element: <VideoRoomPage /> },
    ],
  },
]);
