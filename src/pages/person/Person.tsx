import { AspectRatio, Box, Typography, useColorScheme } from "@mui/joy";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { ageCount, backdropLoading, ymdToDmy } from "../../utilities/defaults";
import NotFound from "../../components/utils/NotFound";
import {
  peopleCombinedCredits,
  peopleDetails,
  peopleImages,
} from "../../tmdb-res";
import PersonIcon from "@mui/icons-material/Person";
import { useState } from "react";
import { Button } from "@mui/joy";
import EventMC from "../../components/cards/EventMC";

function Person() {
  const { personId } = useParams();
  const {
    peopleDetails,
    peopleDetailsData,
    peopleCombinedCredits,
    peopleCombinedCreditsData,
    peopleImages,
    peopleImagesData,
  } = useTMDB();
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme();

  const peopleDetailsDataArr = peopleDetailsData?.data as peopleDetails;
  const peopleImagesDataArr = peopleImagesData?.data as peopleImages;
  const peopleCombinedCreditsDataArr =
    peopleCombinedCreditsData?.data as peopleCombinedCredits;
  const isLoading =
    peopleDetailsData?.isLoading ||
    peopleCombinedCreditsData?.isLoading ||
    peopleImagesData?.isLoading;
  const isIncorrect =
    peopleCombinedCreditsData?.isIncorrect ||
    peopleDetailsData?.isIncorrect ||
    peopleImagesData?.isIncorrect;

  useEffect(() => {
    if (personId) {
      peopleDetails(personId);
      peopleCombinedCredits(personId);
      peopleImages(personId);
    }
  }, []);
  return isIncorrect ? (
    <NotFound />
  ) : isLoading ? (
    backdropLoading(isLoading, colorScheme)
  ) : (
    <Box
      sx={{
        padding: "100px 0",
        width: "90%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "70px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "30px",
          "@media (max-width: 768px)": {
            flexDirection: "column",
            alignItems: "center",
          },
        }}
      >
        {peopleDetailsDataArr?.profile_path ? (
          <Box
            component="img"
            sx={{
              borderRadius: "8px",
              maxWidth: "300px",
              "@media (max-width: 768px)": { maxWidth: "150px" },
            }}
            src={`https://image.tmdb.org/t/p/original${peopleDetailsDataArr?.profile_path}`}
            alt="Profile"
          />
        ) : (
          <AspectRatio
            ratio="2/3"
            sx={{
              width: "300px",
              borderRadius: "8px",
              "@media (max-width: 768px)": { width: "150px" },
            }}
          >
            <PersonIcon sx={{ width: "100%", height: "100%" }} />
          </AspectRatio>
        )}
        <Box>
          <Typography
            level="h2"
            sx={{ fontSize: "2rem", fontWeight: "bold", marginTop: "20px" }}
          >
            {peopleDetailsDataArr?.name}
          </Typography>
          <Typography
            level="body-md"
            sx={{
              maxWidth: "650px",
              marginTop: "10px",
              display: isExpanded ? "block" : "-webkit-box",
              WebkitLineClamp: isExpanded ? "unset" : 3,
              WebkitBoxOrient: "vertical",
              overflow: isExpanded ? "visible" : "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {peopleDetailsDataArr?.biography ||
              "Biography not available for this person."}
          </Typography>
          {peopleDetailsDataArr?.biography && (
            <Button
              variant="plain"
              size="sm"
              sx={{ marginTop: "10px" }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show less" : "Show more"}
            </Button>
          )}
          <Typography
            startDecorator={
              <Typography
                level="body-sm"
                sx={{ color: "text.secondary", fontWeight: "bold" }}
              >
                Birthday:{" "}
              </Typography>
            }
            level="body-sm"
            sx={{ marginTop: "20px", color: "text.secondary" }}
          >
            {ymdToDmy(peopleDetailsDataArr?.birthday || "N/A")}
            {ageCount(
              peopleDetailsDataArr?.birthday,
              peopleDetailsDataArr?.deathday,
            ) &&
              ` (${ageCount(
                peopleDetailsDataArr?.birthday,
                peopleDetailsDataArr?.deathday,
              )} years old)`}
          </Typography>
          {peopleDetailsDataArr?.deathday && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Deathday:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {ymdToDmy(peopleDetailsDataArr?.deathday || "N/A")}
            </Typography>
          )}
          {peopleDetailsDataArr?.place_of_birth && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Place of Birth:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.place_of_birth}
            </Typography>
          )}
          {peopleDetailsDataArr?.gender && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Gender:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.gender === 1 ? "Female" : "Male"}
            </Typography>
          )}
          {peopleDetailsDataArr?.known_for_department && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Known For:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.known_for_department}
            </Typography>
          )}
          {peopleDetailsDataArr?.also_known_as && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Also Known As:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.also_known_as?.join(", ")}
            </Typography>
          )}
          {peopleDetailsDataArr?.homepage && (
            <Typography
              startDecorator={
                <Typography
                  level="body-sm"
                  sx={{ color: "text.secondary", fontWeight: "bold" }}
                >
                  Homepage:{" "}
                </Typography>
              }
              level="body-sm"
              sx={{ marginTop: "10px", color: "text.secondary" }}
            >
              {peopleDetailsDataArr?.homepage}
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Typography level="h2">Cast</Typography>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            overflow: "scroll",
            gap: 2,
          }}
        >
          {peopleCombinedCreditsDataArr?.cast
            ?.sort((itemA, itemB) => {
              const aPopularity = itemA.popularity || 0;
              const bPopularity = itemB.popularity || 0;
              return bPopularity - aPopularity;
            })
            .map((credit) => (
              <EventMC
                eventId={credit.id}
                key={credit.id}
                eventPoster={credit.poster_path}
                eventType={credit.media_type}
              />
            ))}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Typography level="h2">Images</Typography>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            overflow: "scroll",
            gap: 2,
          }}
        >
          {peopleImagesDataArr?.profiles?.map((image, index) => (
            <Box
              component="img"
              key={index}
              sx={{
                height: "200px",
                borderRadius: "8px",
              }}
              src={`https://image.tmdb.org/t/p/original${image.file_path}`}
              alt={`Image ${index + 1}`}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Person;
