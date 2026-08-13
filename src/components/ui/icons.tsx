/**
 * Icon layer.
 *
 * The app used filled Material icons; the Vercel look needs thin outline
 * strokes (Geist Icons). Lucide is the closest open equivalent, so every icon
 * is re-exported here under the name the codebase already imports. Call sites
 * only change their import path.
 *
 * Each icon renders at `1em`, so the existing `sx={{ fontSize: 18 }}` usage
 * keeps working exactly as it did with Material icons.
 */
import { Box } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";
import * as L from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ElementType } from "react";

export type IconProps = {
  sx?: SxProps;
  className?: string;
  strokeWidth?: number;
  fontSize?: number | string;
  color?: string;
  onClick?: (event: React.MouseEvent<SVGSVGElement>) => void;
  style?: React.CSSProperties;
  titleAccess?: string;
};

const icon = (Component: LucideIcon, defaultStroke = 1.5) => {
  const Wrapped = ({ sx, fontSize, strokeWidth, titleAccess, ...rest }: IconProps) => (
    <Box
      component={Component as ElementType}
      aria-hidden={titleAccess ? undefined : true}
      aria-label={titleAccess}
      strokeWidth={strokeWidth ?? defaultStroke}
      absoluteStrokeWidth
      sx={{
        width: "1em",
        height: "1em",
        fontSize: fontSize ?? "20px",
        flexShrink: 0,
        display: "inline-block",
        verticalAlign: "middle",
        ...(sx as object),
      }}
      {...rest}
    />
  );
  return Wrapped;
};

/* ── Actions ─────────────────────────────────────────────────────────────── */
export const Add = icon(L.Plus);
export const AddRounded = Add;
export const Check = icon(L.Check);
export const CheckCircle = icon(L.CircleCheck);
export const CheckCircleOutline = CheckCircle;
export const CheckCircleRounded = CheckCircle;
export const Close = icon(L.X);
export const Delete = icon(L.Trash2);
export const DeleteOutline = Delete;
export const DeleteOutlineRounded = Delete;
export const Edit = icon(L.Pencil);
export const ContentCopy = icon(L.Copy);
export const ContentCopyRounded = ContentCopy;
export const ContentCut = icon(L.Scissors);
export const IosShare = icon(L.Share);
export const Send = icon(L.Send);
export const Download = icon(L.Download);
export const DownloadRounded = Download;
export const DownloadDone = icon(L.CircleCheckBig);
export const RefreshRounded = icon(L.RefreshCw);
export const Replay = icon(L.RotateCcw);
export const ReplayRounded = Replay;
export const UpdateRounded = icon(L.RefreshCw);
export const LaunchRounded = icon(L.ExternalLink);
export const Link = icon(L.Link);
export const PlaylistAdd = icon(L.ListPlus);
export const BookmarkAdd = icon(L.BookmarkPlus);
export const Bookmark = icon(L.Bookmark);

/* ── Navigation ──────────────────────────────────────────────────────────── */
export const ArrowBack = icon(L.ArrowLeft);
export const ArrowForward = icon(L.ArrowRight);
export const ArrowForwardRounded = ArrowForward;
export const ArrowBackIos = icon(L.ChevronLeft);
export const ArrowForwardIos = icon(L.ChevronRight);
export const ArrowDropDown = icon(L.ChevronDown);
export const ArrowUpRight = icon(L.ArrowUpRight);
export const KeyboardArrowLeft = icon(L.ChevronLeft);
export const KeyboardArrowRight = icon(L.ChevronRight);
export const KeyboardArrowUp = icon(L.ChevronUp);
export const KeyboardArrowDown = icon(L.ChevronDown);
export const KeyboardDoubleArrowLeft = icon(L.ChevronsLeft);
export const KeyboardDoubleArrowRight = icon(L.ChevronsRight);
export const Menu = icon(L.Menu);
export const MenuRounded = Menu;
export const MoreVert = icon(L.EllipsisVertical);
export const MoreHoriz = icon(L.Ellipsis);
export const Home = icon(L.House);
export const HomeOutlined = Home;
export const Search = icon(L.Search);
export const SearchRounded = Search;
export const Command = icon(L.Command);

/* ── Media ───────────────────────────────────────────────────────────────── */
export const PlayArrow = icon(L.Play);
export const Pause = icon(L.Pause);
export const SkipNext = icon(L.SkipForward);
export const SkipPrevious = icon(L.SkipBack);
export const Movie = icon(L.Film);
export const Tv = icon(L.Tv);
export const Star = icon(L.Star);
export const StarBorder = icon(L.Star);
export const Popcorn = icon(L.Popcorn);
export const Compass = icon(L.Compass);
export const Fullscreen = icon(L.Maximize);
export const VolumeUp = icon(L.Volume2);
export const VolumeOff = icon(L.VolumeX);
export const Subtitles = icon(L.Captions);

/* ── People & account ────────────────────────────────────────────────────── */
export const Person = icon(L.User);
export const PersonOutline = Person;
export const PersonAdd = icon(L.UserPlus);
export const People = icon(L.Users);
export const SwitchAccount = icon(L.UsersRound);
export const Login = icon(L.LogIn);
export const Logout = icon(L.LogOut);
export const Lock = icon(L.Lock);
export const LockOutlined = Lock;
export const LockOpen = icon(L.LockOpen);
export const KeyRounded = icon(L.KeyRound);
export const ShieldRounded = icon(L.Shield);
export const AdminPanelSettingsRounded = icon(L.ShieldCheck);
export const VerifiedRounded = icon(L.BadgeCheck);
export const Visibility = icon(L.Eye);
export const VisibilityOff = icon(L.EyeOff);
export const Settings = icon(L.Settings);

/* ── Communication ───────────────────────────────────────────────────────── */
export const Mail = icon(L.Mail);
export const Email = Mail;
export const MarkEmailReadRounded = icon(L.MailCheck);
export const Chat = icon(L.MessageSquare);
export const Notifications = icon(L.Bell);
export const NotificationsNone = Notifications;
export const QrCode2 = icon(L.QrCode);

/* ── Devices ─────────────────────────────────────────────────────────────── */
export const LaptopMac = icon(L.Laptop);
export const TabletMac = icon(L.Tablet);
export const PhoneIphone = icon(L.Smartphone);
export const DevicesOther = icon(L.MonitorSmartphone);
export const DeviceUnknown = icon(L.MonitorSmartphone);

/* ── Status & meta ───────────────────────────────────────────────────────── */
export const WarningRounded = icon(L.TriangleAlert);
export const WarningAmber = WarningRounded;
export const WarningAmberOutlined = WarningRounded;
export const Info = icon(L.Info);
export const Help = icon(L.CircleHelp);
export const History = icon(L.History);
export const HistoryRounded = History;
export const WatchLaterOutlined = icon(L.Clock);
export const Clock = icon(L.Clock);
export const AutoAwesome = icon(L.Sparkles);
export const AutoGraph = icon(L.TrendingUp);
export const BarChart = icon(L.ChartColumn);
export const FamilyRestroom = icon(L.Baby);
export const Calendar = icon(L.Calendar);
export const Globe = icon(L.Globe);
export const Inbox = icon(L.Inbox);
export const FileText = icon(L.FileText);
export const Filter = icon(L.SlidersHorizontal);
export const Heart = icon(L.Heart);
export const Flag = icon(L.Flag);
export const Zap = icon(L.Zap);
export const Ban = icon(L.Ban);
export const Wifi = icon(L.Wifi);
export const WifiOff = icon(L.WifiOff);
export const Rocket = icon(L.Rocket);
export const Layers = icon(L.Layers);
export const Cookie = icon(L.Cookie);
export const Scale = icon(L.Scale);
export const Loader = icon(L.LoaderCircle);
