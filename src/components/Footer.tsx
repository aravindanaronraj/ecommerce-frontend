import { Box, Container, Divider, Link as MuiLink, Stack, Typography } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const footerLinkStyle = {
  color: "rgba(255,255,255,0.68)",
  textDecoration: "none",
  width: "fit-content",
  "&:hover": { color: "#ffffff" },
};

const defaultFooter = {
  brand: "Jeev's Bliss",
  tagline: "Thoughtfully chosen essentials for a more beautiful everyday life.",
  email: "hello@luxecart.com",
  phone: "+91 98765 43210",
  address: "Mumbai, Maharashtra",
};

const Footer = () => {
  const year = new Date().getFullYear();
  const [content, setContent] = useState(defaultFooter);

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => setContent({ ...defaultFooter, ...data.footer })).catch(console.log);
  }, []);

  return (
    <Box component="footer" sx={{ mt: { xs: 5, md: 8 }, bgcolor: "#0b1220", color: "white" }}>
      <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", bgcolor: "rgba(255,255,255,0.03)" }}>
        <Container maxWidth="xl" sx={{ py: 2.5 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
            {[
              { icon: <LocalShippingOutlinedIcon />, title: "Fast delivery", text: "Reliable delivery to your doorstep." },
              { icon: <LockOutlinedIcon />, title: "Secure payments", text: "Protected checkout every time." },
              { icon: <SupportAgentOutlinedIcon />, title: "Helpful support", text: "Here when you need us." },
            ].map((item) => (
              <Box key={item.title} sx={{ display: "flex", alignItems: "center", justifyContent: { sm: "center" }, gap: 1.5 }}>
                <Box sx={{ color: "#fbbf24", display: "flex" }}>{item.icon}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.title}</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>{item.text}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 6 } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1.5fr 1fr 1fr", lg: "1.6fr 1fr 1fr 1.4fr" }, gap: { xs: 4, md: 5 } }}>
          <Box>
            <Typography component={RouterLink} to="/" sx={{ display: "inline-block", color: "white", textDecoration: "none", fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px", mb: 1.5 }}>
            {defaultFooter.brand}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.75, maxWidth: 310 }}>
              {content.tagline}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Shop</Typography>
            <Stack spacing={1}>
              <MuiLink component={RouterLink} to="/products" sx={footerLinkStyle}>All products</MuiLink>
              <MuiLink component={RouterLink} to="/cart" sx={footerLinkStyle}>Your cart</MuiLink>
              <MuiLink component={RouterLink} to="/products" sx={footerLinkStyle}>New arrivals</MuiLink>
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Company</Typography>
            <Stack spacing={1}>
              <MuiLink component={RouterLink} to="/about" sx={footerLinkStyle}>About us</MuiLink>
              <MuiLink component={RouterLink} to="/contact" sx={footerLinkStyle}>Contact us</MuiLink>
              <MuiLink component={RouterLink} to="/login" sx={footerLinkStyle}>My account</MuiLink>
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Get in touch</Typography>
            <Stack spacing={1.25}>
              <Box sx={{ display: "flex", gap: 1.25, color: "rgba(255,255,255,0.68)" }}><EmailOutlinedIcon fontSize="small" /><Typography variant="body2">{content.email}</Typography></Box>
              <Box sx={{ display: "flex", gap: 1.25, color: "rgba(255,255,255,0.68)" }}><PhoneOutlinedIcon fontSize="small" /><Typography variant="body2">{content.phone}</Typography></Box>
              <Box sx={{ display: "flex", gap: 1.25, color: "rgba(255,255,255,0.68)" }}><LocationOnOutlinedIcon fontSize="small" /><Typography variant="body2">{content.address}</Typography></Box>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: { xs: 4, md: 5 } }} />

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", gap: 1.5, color: "rgba(255,255,255,0.55)" }}>
          <Typography variant="body2">© {year} Jeev's Bliss. All rights reserved.</Typography>
          <Typography variant="body2">Designed for a better everyday shopping experience.</Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
