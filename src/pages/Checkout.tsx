import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../redux/store";
import { setCart } from "../redux/slices/cartSlice";
import api from "../api/axios";
import { clearGuestCart, getGuestCart } from "../utils/guestCart";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const guestItems = useMemo(() => getGuestCart(), []);
  const [address, setAddress] = useState(() => user?.shippingAddress || { address: "", city: "", state: "", postalCode: "", phone: "" });
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.token) navigate("/login?checkout=1");
  }, [user?.token, navigate]);

  const items = guestItems.length ? guestItems : cartItems;
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const placeOrder = async () => {
    if (Object.values(address).some((value) => !value.trim())) {
      setNotice("Please complete your shipping address.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/orders", {
        shippingAddress: address,
        ...(guestItems.length ? { items: guestItems.map((item) => ({ product: item.product._id, quantity: item.quantity })) } : {}),
      }, { headers: { Authorization: `Bearer ${user?.token}` } });
      clearGuestCart();
      dispatch(setCart([]));
      setNotice("Your order has been placed successfully.");
    } catch {
      setNotice("Unable to place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.token) return null;

  return <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}>
    <Card sx={{ borderRadius: 4, boxShadow: "0 16px 45px rgba(15,23,42,0.1)" }}><CardContent sx={{ p: { xs: 2.25, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Checkout</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Confirm your shipping address before placing your order.</Typography>
      {notice && <Alert severity={notice.includes("successfully") ? "success" : "error"} sx={{ mb: 3 }}>{notice}</Alert>}
      {items.length === 0 ? <Box sx={{ textAlign: "center", py: 4 }}><Typography sx={{ mb: 2 }}>Your cart is empty.</Typography><Button variant="contained" onClick={() => navigate("/products")}>Browse products</Button></Box> : <Stack spacing={2.25}>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc" }}><Typography sx={{ fontWeight: 700 }}>Order total: ₹{total}</Typography><Typography variant="body2" color="text.secondary">{items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</Typography></Box>
        <TextField label="Shipping address" value={address.address} onChange={(event) => setAddress({ ...address, address: event.target.value })} fullWidth required />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
          <TextField label="City" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required />
          <TextField label="State" value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} required />
          <TextField label="Postal code" value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} required />
          <TextField label="Phone number" value={address.phone} onChange={(event) => setAddress({ ...address, phone: event.target.value })} required />
        </Box>
        <Button variant="contained" size="large" onClick={placeOrder} disabled={submitting} sx={{ width: { xs: "100%", sm: "auto" } }}>{submitting ? "Placing order..." : "Place order"}</Button>
      </Stack>}
    </CardContent></Card>
  </Container>;
};

export default Checkout;
