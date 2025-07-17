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
import BranchIcon from '@mui/icons-material/Theaters';

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
    text: "Movie Management",
    icon: <MovieIcon />,
    path: "/admin/movies",
  },
  {
    type: "item",
    text: "User Management",
    icon: <PeopleIcon />,
    path: "/admin/users",
  },
  {
    type: "item",
    text: "Showtime Management",
    icon: <AccessTimeIcon />,
    path: "/admin/showtimes",
  },
  {
    type: "item",
    text: "Seat Layout Management",
    icon: <EventSeatIcon />,
    path: "/admin/seat-layouts",
  },
  {
    type: "item",
    text: "Voucher Management",
    icon: <ConfirmationNumberIcon />,
    path: "/admin/vouchers",
  },
  {
    type: "item",
    text: "Combo Management",
    icon: <FastfoodIcon />,
    path: "/admin/combos",
  },
  {
    type: "item",
    text: "Theater Management",
    path: "/admin/theaters",
    icon: <TheatersIcon />,
  },  {
    type: "item",
    text: "Branch Management",
    path: "/admin/branchs",
    icon: <TheatersIcon />,
  },
  {
    type: "parent",
    text: "Settings",
    icon: <SettingsIcon />,
    children: [
      {
        type: "item",
        text: "General",
        path: "/admin/settings/general",
      },
      {
        type: "item",
        text: "Permissions",
        path: "/admin/settings/permissions",
      },
    ],
  },
  {
    type: "title",
    text: "Analytics",
  },
  {
    type: "parent",
    text: "Reports",
    icon: <BarChartIcon />,
    children: [
      {
        type: "item",
        text: "Sales Report",
        path: "/admin/reports/sales",
      },
      {
        type: "item",
        text: "User Report",
        path: "/admin/reports/users",
      },
    ],
  },
];

export default navConfig;
