import { lazy } from "react";
import NotFound from "../components/utils/NotFound";

const HomeLayout = lazy(() => import("../layouts/HomeLayout"));
const ForgotPassword = lazy(() => import("../pages/auth/forgot-password"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AboutPage = lazy(() => import("../pages/public/AboutPage"));
const ContactPage = lazy(() => import("../pages/public/ContactPage"));
const DownloadPage = lazy(() => import("../pages/public/DownloadPage"));
const LandingPage = lazy(() => import("../pages/public/LandingPage"));
const LegalDocumentPage = lazy(() => import("../pages/public/LegalDocumentPage"));
const UnsubscribePage = lazy(() => import("../pages/public/UnsubscribePage"));
const Discover = lazy(() => import("../pages/Discover"));
const Movie = lazy(() => import("../pages/movie/Movie"));
const Person = lazy(() => import("../pages/person/Person"));
const PublicProfilePage = lazy(() => import("../pages/profile/PublicProfilePage"));
const Search = lazy(() => import("../pages/search/Search"));
const TVSeries = lazy(() => import("../pages/tv/TVSeries"));
const Settings = lazy(() => import("../pages/user"));
const Watch = lazy(() => import("../pages/video/Watch"));
const Watchlist = lazy(() => import("../pages/Watchlist"));
const AIAssistant = lazy(() => import("../pages/ai/AIAssistant"));
const TVRatings = lazy(() => import("../pages/tv/TVRatings"));
const Favorites = lazy(() => import("../pages/Favorites"));
const TasteProfile = lazy(() => import("../pages/TasteProfile"));

export const mainRoutes = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/browse",
    element: <HomeLayout />,
  },
  {
    path: "/download",
    element: <DownloadPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/privacy",
    element: <LegalDocumentPage forcedSlug="privacy" />,
  },
  {
    path: "/terms",
    element: <LegalDocumentPage forcedSlug="terms" />,
  },
  {
    path: "/dmca",
    element: <LegalDocumentPage forcedSlug="dmca" />,
  },
  {
    path: "/cookies",
    element: <LegalDocumentPage forcedSlug="cookies" />,
  },
  {
    path: "/unsubscribe/:token",
    element: <UnsubscribePage />,
  },
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/users",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/notifications",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/moderation",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/releases",
    element: <AdminDashboard />,
  },
  {
    path: "/auth/register",
    element: <Register />,
  },
  {
    path: "/user/settings",
    element: <Settings initialTab={0} />,
  },
  {
    path: "/user/notifications",
    element: <Settings initialTab={1} />,
  },
  {
    path: "/user/devices",
    element: <Settings initialTab={2} />,
  },
  {
    path: "/user/privacy",
    element: <Settings initialTab={3} />,
  },
  {
    path: "/movie/:movieId",
    element: <Movie />,
  },
  {
    path: "/tv/:tvId",
    element: <TVSeries />,
  },
  {
    path: "/person/:personId",
    element: <Person />,
  },
  {
    path: "/u/:handle",
    element: <PublicProfilePage />,
  },
  {
    path: "/u/:handle/favorites",
    element: <PublicProfilePage />,
  },
  {
    path: "/u/:handle/watchlist",
    element: <PublicProfilePage />,
  },
  {
    path: "/u/:handle/reviews",
    element: <PublicProfilePage />,
  },
  {
    path: "/search/:query",
    element: <Search />,
  },
  {
    path: "/search/:query/:page",
    element: <Search />,
  },
  {
    path: "/:movieType/:movieId/:seasonId?/:episodeId?/watch/:startAt?",
    element: <Watch />,
  },
  {
    path: "/auth/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/discover/:type?/:page?",
    element: <Discover />,
  },
  {
    path: "/watchlist",
    element: <Watchlist />,
  },
  {
    path: "/favorites",
    element: <Favorites />,
  },
  {
    path: "/taste-profile",
    element: <TasteProfile />,
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPassword />
  },
  {
    path: "/reset-password/:email/:token",
    element: <ResetPassword />
  },
  {
    path: "/ai",
    element: <AIAssistant />,
  },
  {
    path: "/tv/:tvId/ratings",
    element: <TVRatings />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
