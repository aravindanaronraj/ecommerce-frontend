import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setCart } from "../redux/slices/cartSlice";
import { getGuestCart, saveGuestCart } from "../utils/guestCart";

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state: RootState) => state.auth);
  const { cartItems = [] } = useSelector((state: RootState) => state.cart);

  const fetchCart = async () => {
    if (!user?.token) {
      dispatch(setCart(getGuestCart()));
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const items = Array.isArray(data) ? data : data.items || [];
      dispatch(setCart(items));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user?.token]);

  const updateQuantity = async (itemId: string, nextQuantity: number) => {
    if (!user?.token) {
      const items = cartItems.map((item) => item._id === itemId ? { ...item, quantity: nextQuantity } : item).filter((item) => item.quantity > 0);
      saveGuestCart(items);
      dispatch(setCart(items));
      return;
    }

    try {
      const { data } = await api.put(
        `/cart/${itemId}`,
        { quantity: nextQuantity },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      dispatch(setCart(Array.isArray(data) ? data : data.items || []));
    } catch (error) {
      console.log(error);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user?.token) {
      const items = cartItems.filter((item) => item._id !== itemId);
      saveGuestCart(items);
      dispatch(setCart(items));
      return;
    }

    try {
      const { data } = await api.delete(`/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      dispatch(setCart(Array.isArray(data) ? data : data.items || []));
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckout = async () => {
    navigate(user?.token ? "/checkout" : "/login?checkout=1");
  };

  const total = useMemo(
    () =>
      (cartItems || []).reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2.25, md: 4 } }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Your Cart
              </Typography>
              <Typography color="text.secondary">
                Review your selected items and checkout with ease.
              </Typography>
            </Box>
            <Chip label={`${cartItems.length} item${cartItems.length === 1 ? "" : "s"}`} color="primary" variant="outlined" />
          </Box>

          {loading ? (
            <Typography color="text.secondary">Loading your cart...</Typography>
          ) : cartItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Your cart is empty.
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Add a few products to get started.
              </Typography>
              <Button variant="contained" onClick={() => navigate("/products")}>
                Continue Shopping
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {cartItems.map((item) => (
                <Box key={item._id} sx={{ border: "1px solid #e5e7eb", borderRadius: 3, p: { xs: 1.5, sm: 2 }, display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: { xs: "100%", sm: "auto" } }}>
                    <Box component="img" src={item.product?.image ? `${backendBaseUrl}${item.product.image}` : "https://via.placeholder.com/150"} alt={item.product?.title || "Product"} sx={{ width: { xs: 72, sm: 90 }, height: { xs: 72, sm: 90 }, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1rem" } }}>{item.product?.title || "Product"}</Typography>
                      <Typography variant="body2" color="text.secondary">₹{item.product?.price || 0}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "space-between", sm: "flex-start" } }}>
                    <IconButton size="small" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                      <AddIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => removeItem(item._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Typography sx={{ fontWeight: 700, color: "#1976d2", ml: { xs: 0, sm: "auto" } }}>
                    ₹{(item.product?.price || 0) * item.quantity}
                  </Typography>
                </Box>
              ))}

              <Divider />

              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total: ₹{total}
                </Typography>
                <Button variant="contained" size="large" onClick={handleCheckout}>
                  Checkout
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Cart;
