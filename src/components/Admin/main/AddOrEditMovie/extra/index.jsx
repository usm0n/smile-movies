import React from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { t } from "i18next";

function AddOrEditMovieExtra({
  toggleValue,
  movieValue,
  handleExtraInput,
  handleToggleValue,
}) {
  return (
    toggleValue.page == "extra" && (
      <div className="movie-container">
        <div className="admin-extra">
          <div className="admin-extra-status">
            <h1 className="admin-extra-status-title">{t("Status")}:</h1>
            <div className="admin-extra-status-props">
              <div className="admin-extra-status-prop">
                <h1 className="admin-extra-status-prop-title">{t("isNew")}:</h1>
                <FormControl
                  variant="filled"
                  sx={{
                    m: 1,
                    minWidth: 120,
                    backgroundColor: "#fff",
                    borderRadius: "5px",
                  }}
                >
                  <InputLabel id="demo-simple-select-label">
                    {t("isNew")}
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name="isNew"
                    value={movieValue.status.isNew}
                    label="isNew"
                    onChange={(e) => handleExtraInput(e, "status")}
                  >
                    <MenuItem value={"true"}>True</MenuItem>
                    <MenuItem value={"false"}>False</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="admin-extra-status-prop">
                <h1 className="admin-extra-status-prop-title">
                  {t("isTrending")}:
                </h1>
                <FormControl
                  variant="filled"
                  sx={{
                    m: 1,
                    minWidth: 120,
                    backgroundColor: "#fff",
                    borderRadius: "5px",
                  }}
                >
                  <InputLabel id="demo-simple-select-label">
                    {t("isTrending")}
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name="isTrending"
                    value={movieValue.status.isTrending}
                    label="isTrending"
                    onChange={(e) => handleExtraInput(e, "status")}
                  >
                    <MenuItem value={"true"}>True</MenuItem>
                    <MenuItem value={"false"}>False</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="admin-extra-status-prop">
                <h1 className="admin-extra-status-prop-title">{t("type")}:</h1>
                <FormControl
                  variant="filled"
                  sx={{
                    m: 1,
                    minWidth: 120,
                    backgroundColor: "#fff",
                    borderRadius: "5px",
                  }}
                >
                  <InputLabel id="demo-simple-select-label">
                    {t("type")}
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name="type"
                    value={movieValue.status.type}
                    label="type"
                    onChange={(e) => handleExtraInput(e, "status")}
                  >
                    <MenuItem value={"movie"}>{t("movieText")}</MenuItem>
                    <MenuItem value={"series"}>{t("SeriesTitle")}</MenuItem>
                    <MenuItem value={"cartoon"}>{t("CartoonsTitle")}</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="admin-extra-status-prop">
                <h1 className="admin-extra-status-prop-title">
                  {t("isAvailable")}:
                </h1>
                <FormControl
                  variant="filled"
                  sx={{
                    m: 1,
                    minWidth: 120,
                    backgroundColor: "#fff",
                    borderRadius: "5px",
                  }}
                >
                  <InputLabel id="demo-simple-select-label">
                    {t("isAvailable")}
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name="isAvailable"
                    value={movieValue.status.isAvailable}
                    label="isAvailable"
                    onChange={(e) => handleExtraInput(e, "status")}
                  >
                    <MenuItem value={"true"}>True</MenuItem>
                    <MenuItem value={"false"}>False</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
          <div className="admin-extra-notes">
            <h1 className="admin-extra-notes-title">{t("Notes")}:</h1>
            <div className="admin-extra-notes-main">
              <ToggleButtonGroup
                color="info"
                value={toggleValue.notes}
                name="notes"
                onChange={(e) => handleToggleValue(e, "notes")}
                sx={{
                  backgroundColor: "gold",
                }}
                exclusive
                aria-label="Platform"
              >
                <ToggleButton value="uz">O'zbekcha</ToggleButton>
                <ToggleButton value="ru">Русский</ToggleButton>
                <ToggleButton value="en">English</ToggleButton>
              </ToggleButtonGroup>
              <textarea
                onChange={(e) => handleExtraInput(e, "notes")}
                value={movieValue.notes[toggleValue.notes]}
                name={toggleValue.notes}
                placeholder={`Note for ${toggleValue.notes}`}
                width="100%"
                className="admin-extra-notes-area"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default AddOrEditMovieExtra;
