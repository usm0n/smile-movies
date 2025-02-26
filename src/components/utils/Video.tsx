import { Box, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import Iframe from "react-iframe";

function Video({ link }: { link: string }) {
  const videoValue = (videoLink: string) => (
    <Iframe
      url={`${videoLink}?autoPlay=false`}
      sandbox={[
        "allow-forms",
        "allow-pointer-lock",
        "allow-same-origin",
        "allow-scripts",
        "allow-presentation"
      ]}
      className="iframe-video"
      allowFullScreen="true"
      webkitallowfullscreen="true"
      mozallowfullscreen="true"
      loading="eager"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share fullscreen"
    />
  );
  return (
    <Box width={"90%"} margin={"100px auto"}>
      <Tabs defaultValue={0}>
        <TabList>
          <Tab>Player 1</Tab>
          <Tab>Player 2</Tab>
          <Tab>Player 3</Tab>
        </TabList>
        <TabPanel value={0}>
          {videoValue(`https://vidsrc.cc/v2/embed${link}`)}
        </TabPanel>
        <TabPanel value={1}>
          {videoValue(`https://vidsrc.cc/v3/embed${link}`)}
        </TabPanel>
        <TabPanel value={2}>
          {videoValue(`https://vidsrc.xyz/embed${link}`)}
        </TabPanel>
      </Tabs>
    </Box>
  );
}

export default Video;
