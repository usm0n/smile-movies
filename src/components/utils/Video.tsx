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
                "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation allow-presentation"
              }
              src={`https://vidsrc.xyz/embed${link}`}
              style={{ border: "1px solid gray", borderRadius: "10px" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </AspectRatio>
        </TabPanel>
        <TabPanel value={1}>
          <AspectRatio ratio="16/9">
            <iframe
              sandbox={
                "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation allow-presentation"
              }
              src={`https://vidsrc.cc/v2/embed${link}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ border: "1px solid gray", borderRadius: "10px" }}
            />
          </AspectRatio>
        </TabPanel>
        <TabPanel value={2}>
          <AspectRatio ratio="16/9">
            <iframe
              sandbox={
                "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-presentation"
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              src={`https://vidsrc.cc/v3/embed${link}`}
              style={{ border: "1px solid gray", borderRadius: "10px" }}
            />
          </AspectRatio>
        </TabPanel>
      </Tabs>
    </Box>
  );
}

export default Video;
