import { useEffect, useState } from "react";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import api from "../api/axios";

const defaultAbout = {
  eyebrow: "About LuxeCart",
  title: "Designed for effortless, modern shopping.",
  description: "LuxeCart brings together elegant design, premium products, and a seamless customer journey in one place. Whether you are discovering new favorites or managing your cart with ease, every step is crafted for confidence and convenience.",
  perkOne: "Curated premium products for everyday living",
  perkTwo: "Fast checkout and trusted delivery",
  perkThree: "A polished shopping experience built for modern shoppers",
  whyTitle: "Why customers love us",
  whyDescription: "We focus on polished presentation, reliable service, and intuitive product discovery so shopping feels simple and rewarding.",
};

const AboutUs = () => {
  const [content, setContent] = useState(defaultAbout);

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => setContent({ ...defaultAbout, ...data.about })).catch(console.log);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
        <Box sx={{ flex: "1 1 320px" }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>{content.eyebrow}</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>{content.title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>{content.description}</Typography>
          <Stack spacing={1.5}>
            {[content.perkOne, content.perkTwo, content.perkThree].filter(Boolean).map((item) => (
              <Box key={item} sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main" }} /><Typography>{item}</Typography></Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ flex: "1 1 320px" }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{content.whyTitle}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{content.whyDescription}</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {[{ label: "24/7 support", value: "Always online" }, { label: "Fast delivery", value: "Within 48 hrs" }, { label: "Secure checkout", value: "Protected" }].map((stat) => (
                <Box key={stat.label} sx={{ flex: "1 1 120px", p: 2, borderRadius: 3, bgcolor: "white" }}><Typography variant="h6" sx={{ fontWeight: 700 }}>{stat.label}</Typography><Typography variant="body2" color="text.secondary">{stat.value}</Typography></Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default AboutUs;
