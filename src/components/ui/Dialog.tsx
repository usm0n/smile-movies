import { Box, Modal, ModalDialog, Typography } from "@mui/joy";
import { ReactNode } from "react";
import { Close } from "./icons";
import IconButton from "./IconButton";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Footer actions, right-aligned. */
  actions?: ReactNode;
  width?: number | string;
  /** Hide the close button (e.g. a dialog that must be answered). */
  hideClose?: boolean;
  disableBackdropClose?: boolean;
};

/**
 * The one modal in the app: #0a0a0a panel, hairline border, 12px radius,
 * header / body / right-aligned footer.
 */
function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  width = 460,
  hideClose = false,
  disableBackdropClose = false,
}: DialogProps) {
  return (
    <Modal
      open={open}
      onClose={(_event, reason) => {
        if (disableBackdropClose && reason === "backdropClick") return;
        onClose();
      }}
      sx={{ backdropFilter: "none" }}
    >
      <ModalDialog
        layout="center"
        sx={{
          width: "100%",
          maxWidth: width,
          p: 0,
          gap: 0,
          overflow: "hidden",
          mx: 2,
        }}
      >
        {(title || !hideClose) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 2,
              px: 3,
              pt: 2.5,
              pb: description ? 1 : 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              {title && (
                <Typography level="title-lg" sx={{ fontWeight: 600 }}>
                  {title}
                </Typography>
              )}
              {description && (
                <Typography level="body-sm" sx={{ mt: 0.75 }}>
                  {description}
                </Typography>
              )}
            </Box>
            {!hideClose && (
              <IconButton label="Close" onClick={onClose} size="sm" sx={{ mt: -0.5, mr: -1 }}>
                <Close sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        )}

        {children && (
          <Box
            sx={{
              px: 3,
              pb: actions ? 2.5 : 3,
              pt: title ? 1 : 3,
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            {children}
          </Box>
        )}

        {actions && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              px: 3,
              py: 2,
              borderTop: "1px solid",
              borderColor: "neutral.outlinedBorder",
              backgroundColor: "background.level1",
              flexWrap: "wrap",
            }}
          >
            {actions}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
}

export default Dialog;
