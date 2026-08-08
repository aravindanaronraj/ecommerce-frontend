import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Container, IconButton, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import api from "../api/axios";
import type { Product } from "../redux/slices/productSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setCart } from "../redux/slices/cartSlice";
import { addGuestItem } from "../utils/guestCart";
import ReviewSection from "../components/ReviewSection";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch {
        setError("This product could not be found.");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const addToCart = async () => {
    if (!user?.token) {
      dispatch(setCart(addGuestItem(product!, quantity)));
      navigate("/cart");
      return;
    }

    try {
      const { data } = await api.post(
        "/cart",
        { product: product?._id, quantity },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      dispatch(setCart(Array.isArray(data) ? data : data.items || []));
      navigate("/cart");
    } catch {
      setError("Unable to add this product to your cart.");
    }
  };

  if (loading) return <Container sx={{ py: 6 }}><Typography>Loading product...</Typography></Container>;
  if (!product) return <Container sx={{ py: 6 }}><Alert severity="error">{error || "Product not found."}</Alert></Container>;

  const maximumQuantity = product.stock > 0 ? product.stock : undefined;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
        <Box component="img" src={product.image} alt={product.title} sx={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 3 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>{product.title}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>{product.description}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>₹{product.price}</Typography>
          {product.stock > 0 && <Typography color="text.secondary" sx={{ mb: 2 }}>{product.stock} available</Typography>}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <IconButton aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity === 1}><RemoveIcon /></IconButton>
            <Typography sx={{ minWidth: 32, textAlign: "center", fontWeight: 700 }}>{quantity}</Typography>
            <IconButton aria-label="Increase quantity" onClick={() => setQuantity((value) => maximumQuantity ? Math.min(maximumQuantity, value + 1) : value + 1)} disabled={maximumQuantity !== undefined && quantity >= maximumQuantity}><AddIcon /></IconButton>
          </Box>
          <Button variant="contained" size="large" onClick={addToCart} disabled={product.stock === 0}>
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </Box>
      </Paper>
      <ReviewSection productId={product._id} />
    </Container>
  );
};

export default ProductDetails;
