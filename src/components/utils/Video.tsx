import { AspectRatio, Box, Tab, TabList, TabPanel, Tabs } from "@mui/joy";

function Video({ link }: { link: string }) {
  const videoValue = (videoLink: string) => (
    <AspectRatio ratio="16/9">
      <iframe
        src={videoLink}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        style={{
          width: "100%",
          height: "100%",
          border: "1px solid gray",
          borderRadius: "5px",
        }}
      />
    </AspectRatio>
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
