import { lazy } from "react";
import HomeLayout from "../layouts/HomeLayout";

/**
 * Only the landing page is eager — it is what a cold visit renders, so pulling
 * it into a chunk would just add a round trip before first paint.
 *
 * Everything else is lazy. The heavy tails are the player (vidstack), the admin
 * dashboard, and the watch party, none of which a browsing user ever touches.
 */
const NotFound = lazy(() => import("../components/utils/NotFound"));
const ForgotPassword = lazy(() => import("../pages/auth/forgot-password"));
const Login = lazy(() => import("../pages/auth/Login"));
const QRApprove = lazy(() => import("../pages/auth/QRApprove"));
const QRClaim = lazy(() => import("../pages/auth/QRClaim"));
const Register = lazy(() => import("../pages/auth/Register"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AboutPage = lazy(() => import("../pages/public/AboutPage"));
const ContactPage = lazy(() => import("../pages/public/ContactPage"));
const DownloadPage = lazy(() => import("../pages/public/DownloadPage"));
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
const Collections = lazy(() => import("../pages/Collections"));
const CollectionDetail = lazy(() => import("../pages/CollectionDetail"));
const Downloads = lazy(() => import("../pages/Downloads"));
const WatchParty = lazy(() => import("../pages/WatchParty"));

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
    path: "/qr-approve/:token",
    element: <QRApprove />,
  },
  {
    path: "/qr-claim/:token",
    element: <QRClaim />,
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
    path: "/user/connections",
    element: <Settings initialTab={1} />,
  },
  {
    path: "/user/notifications",
    element: <Settings initialTab={2} />,
  },
  {
    path: "/user/devices",
    element: <Settings initialTab={3} />,
  },
  {
    path: "/user/privacy",
    element: <Settings initialTab={4} />,
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
    path: "/collections",
    element: <Collections />,
  },
  {
    path: "/collections/:collectionId",
    element: <CollectionDetail />,
  },
  {
    path: "/downloads",
    element: <Downloads />,
  },
  {
    path: "/party/:code",
    element: <WatchParty />,
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
