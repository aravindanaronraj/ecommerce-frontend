import { Alert, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import api from "../api/axios";

const AdminSettings = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [notice, setNotice] = useState("");

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("banner", JSON.stringify({ title: bannerTitle, subtitle: bannerSubtitle }));
      if (bannerImage) {
        formData.append("bannerImage", bannerImage);
      }
      const { data } = await api.put("/admin/settings", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setNotice(data?.banner?.image ? "Banner settings saved to storage and database." : "Banner settings saved to the database.");
    } catch (error: any) {
      setNotice(error?.response?.data?.message || "Unable to save banner settings.");
    }
  };

  if (!user || user.role !== "admin") return null;

  return <Container maxWidth="md" sx={{ py: 8 }}><Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}><Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Admin Settings</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Update the home page banner in the database.</Typography>{notice && <Alert severity={notice.includes("Unable") ? "error" : "success"} sx={{ mb: 2 }}>{notice}</Alert>}<Stack spacing={2}><TextField label="Banner title" fullWidth value={bannerTitle} onChange={(event) => setBannerTitle(event.target.value)} /><TextField label="Banner subtitle" fullWidth multiline rows={3} value={bannerSubtitle} onChange={(event) => setBannerSubtitle(event.target.value)} /><Button variant="outlined" component="label">Upload banner image<input hidden accept="image/*" type="file" onChange={(event) => setBannerImage(event.target.files?.[0] || null)} /></Button><Button variant="contained" onClick={handleSave}>Save settings</Button></Stack></Paper></Container>;
};

export default AdminSettings;
