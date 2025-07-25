import DashboardIcon from "@mui/icons-material/Dashboard";
import MovieIcon from "@mui/icons-material/Movie";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import TheatersIcon from "@mui/icons-material/Theaters";
import BranchIcon from '@mui/icons-material/AccountTree';

const navConfig = [
  {
    type: "item",
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/admin/dashboard",
  },
  {
    type: "title",
    text: "Management",
  },
  {
    type: "item",
    text: "Movie",
    icon: <MovieIcon />,
    path: "/admin/movies",
  },
  {
    type: "item",
    text: "User",
    icon: <PeopleIcon />,
    path: "/admin/users",
  },
  {
    type: "item",
    text: "Showtime",
    icon: <AccessTimeIcon />,
    path: "/admin/showtimes",
  },
  {
    type: "item",
    text: "Seat Layout",
    icon: <EventSeatIcon />,
    path: "/admin/seat-layouts",
  },
  {
    type: "item",
    text: "Theater",
    path: "/admin/theaters",
    icon: <TheatersIcon />,
  },  {
    type: "item",
    text: "Branch",
    path: "/admin/branchs",
    icon: <BranchIcon />,
  },
  {
    type: "item",
    text: "Voucher",
    icon: <ConfirmationNumberIcon />,
    path: "/admin/vouchers",
  },
  {
    type: "item",
    text: "Combo",
    icon: <FastfoodIcon />,
    path: "/admin/combos",
  },

];

export default navConfig;
