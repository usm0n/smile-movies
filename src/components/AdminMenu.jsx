import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AdminRoutes } from "../helpers/admin.routes";
import { useNavigate } from "react-router-dom";
import Home from "@mui/icons-material/Home";

function AdminMenu({ user }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (navigate) => {
    navigate(navigate);
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          top: "15px",
          left: "10px",
          zIndex: 99999999,
          color: "white",
        }}
      >
        <MenuIcon />
      </Button>
      <Drawer
        sx={{
          zIndex: 99999999,
        }}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            <ListItem
              sx={{ pl: 2, gap: 1 }}
              onClick={() => handleClick("/admin")}
              disablePadding
            >
              <Avatar sx={{ width: 56, height: 56 }}>
                {user.firstname.slice(0, 1)}
              </Avatar>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "5px",
                  }}
                >
                  <ListItemText primary={user.firstname} />
                  <ListItemText primary={user.lastname} />
                </Box>
                Admin
              </Box>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default AdminMenu;
