import { AspectRatio, Box, Tab, TabList, TabPanel, Tabs } from "@mui/joy";

function Video({ link }: { link: string }) {
  return (
    <Box width={"90%"} margin={"100px auto"}>
      <Tabs defaultValue={0}>
        <TabList>
          <Tab>Player 1</Tab>
          <Tab>Player 2</Tab>
          <Tab>Player 3</Tab>
        </TabList>
        <TabPanel value={0}>
          <AspectRatio ratio="16/9">
            <iframe
              sandbox={
                "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
              }
              src={`https://vidsrc.xyz/embed${link}`}
              style={{ border: "1px solid gray", borderRadius: "10px" }}
              allowFullScreen
            />
          </AspectRatio>
        </TabPanel>
        <TabPanel value={1}>
          <AspectRatio ratio="16/9">
            <iframe
              sandbox={
                "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
              }
              src={`https://vidsrc.cc/v2/embed${link}?autoPlay=false`}
              style={{ border: "1px solid gray", borderRadius: "10px" }}
              allowFullScreen
            />
          </AspectRatio>
        </TabPanel>
        <TabPanel value={2}>
          <AspectRatio ratio="16/9">
            <iframe
              sandbox={
                "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
              }
              src={`https://vidsrc.cc/v3/embed/${link}?autoPlay=false`}
              style={{ border: "1px solid gray", borderRadius: "10px" }}
              allowFullScreen
            />
          </AspectRatio>
        </TabPanel>
      </Tabs>
    </Box>
  );
}

export default Video;
