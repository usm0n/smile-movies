import NotFound from "../components/utils/NotFound";
import HomeLayout from "../layouts/HomeLayout";
import ForgotPassword from "../pages/auth/forgot-password";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";
import DownloadPage from "../pages/public/DownloadPage";
import LegalDocumentPage from "../pages/public/LegalDocumentPage";
import UnsubscribePage from "../pages/public/UnsubscribePage";
import Discover from "../pages/Discover";
import Movie from "../pages/movie/Movie";
import Person from "../pages/person/Person";
import PublicProfilePage from "../pages/profile/PublicProfilePage";
import Search from "../pages/search/Search";
import TVSeries from "../pages/tv/TVSeries";
import Settings from "../pages/user";
import Watch from "../pages/video/Watch";
import Watchlist from "../pages/Watchlist";
import AIAssistant from "../pages/ai/AIAssistant";
import TVRatings from "../pages/tv/TVRatings";

export const mainRoutes = [
  {
    path: "/",
    element: <HomeLayout />,
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
    path: "/u/:handle/watchlist",
    element: <PublicProfilePage />,
  },
  {
    path: "/u/:handle/recently-watched",
    element: <PublicProfilePage />,
  },
  {
    path: "/u/:handle/ratings",
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
