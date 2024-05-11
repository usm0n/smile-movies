import React, { useState } from "react";
import {
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

function AdminMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
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
            {AdminRoutes.map((item, index) => (
              <ListItem
                onClick={() => navigate(item.path)}
                key={item}
                disablePadding
              >
                <ListItemButton>
                  <ListItemIcon>{<item.icon/>}</ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default AdminMenu;
