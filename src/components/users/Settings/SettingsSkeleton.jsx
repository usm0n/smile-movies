import { Box, Skeleton } from "@mui/material";
import React from "react";

function SettingsSkeleton() {
  return (
    <Box className="settings">
      <Box className="container">
        <Box className="settings-content">
          <Box className="settings-box">
            <Skeleton
              variant="rectangular"
              sx={{
                position: "fixed",
                background: "gold",
                border: "1px solid gold",
                color: "#000",
                borderRadius: "50px",
                padding: "20px 70px",
                bottom: "25px",
                right: "25px",
                zIndex: "99999",
              }}
              className="settings-button edit"
            />
            {/* <Button
                  className="settings-button delete"
                  sx={{
                    position: "fixed",
                    background: "red",
                    border: "1px solid red",
                    color: "#fff",
                    borderRadius: "50px",
                    padding: "10px 20px",
                    bottom: "25px",
                    left: "25px",
    
                    "&:hover": {
                      background: "red",
                      border: "1px solid red",
                      color: "#000",
                    },
                  }}
                >
                  {t("DeleteAccount")}
                </Button> */}
          </Box>
          <Box className="settings-box">
            <Skeleton
              sx={{
                backgroundColor: "#ffffff2f",
              }}
              variant="rounded"
              className="settings-title"
            ></Skeleton>
            <Box className="settings-user_items">
              <Skeleton
                variant="circular"
                sx={{
                  backgroundColor: "#ffffff2f",
                  width: 64,
                  height: 64,
                }}
                className="settings-user_img"
              ></Skeleton>
            </Box>
          </Box>

          <Box className="settings-box">
            <Skeleton
              sx={{
                backgroundColor: "#ffffff2f",
              }}
              variant="rounded"
              className="settings-title"
            ></Skeleton>
            <Skeleton
              sx={{
                backgroundColor: "#ffffff2f",
                height: "50px",
              }}
              variant="rounded"
              className="settings-input"
            />
          </Box>

          <Box className="settings-box">
            <Skeleton sx={{
                backgroundColor: "#ffffff2f",
              }}
              variant="rounded" className="settings-title"></Skeleton>
            <Skeleton sx={{
                backgroundColor: "#ffffff2f",
                height: "50px",
              }}
              variant="rounded" className="settings-input" />
          </Box>

          <Box className="settings-box">
            <Skeleton sx={{
                backgroundColor: "#ffffff2f",
              }}
              variant="rounded" className="settings-title"></Skeleton>
            <Skeleton sx={{
                backgroundColor: "#ffffff2f",
                height: "50px",
              }}
              variant="rounded" className="settings-input" />
          </Box>

          <Box className="settings-box">
            <Skeleton sx={{
                backgroundColor: "#ffffff2f",
              }}
              variant="rounded" className="settings-title"></Skeleton>
            <Skeleton sx={{
                backgroundColor: "#ffffff2f",
                height: "40px",
              }}
              variant="rounded" className="settings-password_btn"></Skeleton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default SettingsSkeleton;
