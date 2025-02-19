import { AspectRatio, Box, Tab, TabList, TabPanel, Tabs } from "@mui/joy";

function Video({ link }: { link: string }) {
  const videoValue = (videoLink: string) => (
    <AspectRatio ratio="16/9">
      <iframe
        sandbox={
          "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation allow-presentation"
        }
        src={`${videoLink}?autoPlay=false`}
        style={{ border: "1px solid gray", borderRadius: "10px", }}
        allowFullScreen
      >
        <p>Your browser does not support iframes.</p>
        <a href={videoLink}>Click here to view the video</a>
      </iframe>
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
