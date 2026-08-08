import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import api from "../api/axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const { data } = await api.get(`/products/${id}`);

    setTitle(data.title || "");
    setDescription(data.description || "");
    setPrice(data.price?.toString() || "");
    setCategory(data.category || "");
    setStock(data.stock?.toString() || "");
    setBrand(data.brand || "");
    setColor(data.color || "");
    setSize(data.size || "");
    setMaterial(data.material || "");
    setFeatured(Boolean(data.featured));
  };

  const updateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("stock", stock);
      formData.append("brand", brand);
      formData.append("color", color);
      formData.append("size", size);
      formData.append("material", material);
      formData.append("featured", String(featured));

      if (image) {
        formData.append("image", image);
      }

      await api.put(`/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setNotice("Product updated successfully.");
    } catch (error) {
      console.log(error);
      setNotice("Unable to update product.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Edit product
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Update the details for this listing and keep your catalog consistent.
          </Typography>

          {notice && (
            <Typography color="primary" sx={{ mb: 3, fontWeight: 600 }}>
              {notice}
            </Typography>
          )}

          <Stack spacing={2}>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth required />
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={3} fullWidth required />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <TextField label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} sx={{ flex: "1 1 180px" }} required />
              <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ flex: "1 1 180px" }} required />
              <TextField label="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} sx={{ flex: "1 1 180px" }} required />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <TextField label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} sx={{ flex: "1 1 180px" }} />
              <TextField label="Color" value={color} onChange={(e) => setColor(e.target.value)} sx={{ flex: "1 1 180px" }} />
              <TextField label="Size" value={size} onChange={(e) => setSize(e.target.value)} sx={{ flex: "1 1 180px" }} />
              <TextField label="Material" value={material} onChange={(e) => setMaterial(e.target.value)} sx={{ flex: "1 1 180px" }} />
            </Box>
            <FormControlLabel control={<Switch checked={featured} onChange={(e) => setFeatured(e.target.checked)} />} label="Featured product" />
            <Button variant="outlined" component="label" sx={{ alignSelf: "flex-start" }}>
              Upload new image
              <input hidden accept="image/*" type="file" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
            </Button>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="contained" onClick={updateProduct}>
                Update product
              </Button>
              <Button variant="outlined" onClick={() => navigate("/dashboard")}>
                Back to dashboard
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EditProduct;