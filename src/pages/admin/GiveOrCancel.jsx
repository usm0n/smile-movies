import React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { FormControl, InputLabel, Select, TextField } from "@mui/material";
import { useUser } from "../../contexts/User";
import { snackbar } from "../../utilities/defaultFunctions";

function GiveOrCancel() {
  const {
    getUserByEmail,
    statusGetUserByEmail,
    updateUserByEmail,
    statusUpdateUserByEmail,
  } = useUser();
  const buttonOptions = ["Give", "Cancel"];
  const [buttonOpen, setbuttonOpen] = React.useState(false);
  const buttonAnchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [value, setValue] = React.useState();
  const [email, setEmail] = React.useState();

  const handleButtonClick = () => {
    updateUserByEmail(email, {
      [value]: buttonOptions[selectedIndex] == "Give" ? true : false,
    });
    console.info(`You clicked ${buttonOptions[selectedIndex]}`);
  };

  const handleButtonMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setbuttonOpen(false);
  };

  const handleButtonToggle = () => {
    setbuttonOpen((prevbuttonOpen) => !prevbuttonOpen);
  };

  const handleButtonClose = (event) => {
    if (
      buttonAnchorRef.current &&
      buttonAnchorRef.current.contains(event.target)
    ) {
      return;
    }

    setbuttonOpen(false);
  };

  const handleValueChange = (e) => {
    setValue(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value.toLowerCase());
    getUserByEmail(e.target.value.toLowerCase());
  };

  return (
    <div className="giveorcancel">
      <h1 className="giveorcancel-title">Give or Cancel</h1>
      {statusUpdateUserByEmail.isSuccess && snackbar("success", "Success")}
      {statusUpdateUserByEmail.isError && snackbar("danger", "Error")}
      <div className="giveorcancel-content">
        <TextField
          value={email}
          color={
            statusGetUserByEmail.isError
              ? "error"
              : statusGetUserByEmail.isSuccess
              ? "success"
              : "info"
          }
          onChange={handleEmailChange}
          sx={{
            background: "#fff",
            borderRadius: "5px",
            width: "200px",
          }}
          id="filled-basic"
          label="Email"
          variant="filled"
        />
        <FormControl
          sx={{
            background: "#fff",
            width: "200px",
            borderRadius: "5px",
          }}
          variant="filled"
        >
          <InputLabel id="demo-simple-select-label">Value</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={value}
            label="Value"
            onChange={handleValueChange}
          >
            <MenuItem value={"isAdmin"}>Admin</MenuItem>
            <MenuItem value={"isPremiumUser"}>Premium</MenuItem>
            <MenuItem value={"isBanned"}>Ban</MenuItem>
            <MenuItem value={"isBlocked"}>Block</MenuItem>
          </Select>
        </FormControl>
        <ButtonGroup
          disabled={
            !value || !email ||
            statusGetUserByEmail.isError ||
            statusGetUserByEmail.loading
          }
          sx={{
            background: "#fff",
          }}
          color={buttonOptions[selectedIndex] == "Give" ? "success" : "error"}
          variant="contained"
          ref={buttonAnchorRef}
        >
          <Button
            sx={{
              width: "156px",
            }}
            disabled={
              statusUpdateUserByEmail.loading ||
              statusUpdateUserByEmail.isSuccess
            }
            onClick={handleButtonClick}
          >
            {statusUpdateUserByEmail.loading
              ? "Loading..."
              : buttonOptions[selectedIndex]}
          </Button>
          <Button
            size="small"
            aria-controls={buttonOpen ? "split-button-menu" : undefined}
            aria-expanded={buttonOpen ? "true" : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleButtonToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper
          sx={{
            zIndex: 1,
          }}
          open={buttonOpen}
          anchorEl={buttonAnchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleButtonClose}>
                  <MenuList id="split-button-menu" autoFocusItem>
                    {buttonOptions.map((option, index) => (
                      <MenuItem
                        key={option}
                        selected={index === selectedIndex}
                        onClick={(event) =>
                          handleButtonMenuItemClick(event, index)
                        }
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </div>
  );
}

export default GiveOrCancel;
