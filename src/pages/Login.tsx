import { useState } from "react";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Container, TextField, Typography } from "@mui/material";



const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutFlow = new URLSearchParams(location.search).get("checkout") === "1";
  const [isSignup, setIsSignup] = useState(checkoutFlow);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shippingAddress, setShippingAddress] = useState({ address: "", city: "", state: "", postalCode: "", phone: "" });
  const dispatch = useDispatch();

  const loginHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/users/login", {
        email,
        password,
      });

      dispatch(loginSuccess(data));
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate(checkoutFlow ? "/checkout" : data.role === "admin" ? "/dashboard" : "/products");
    } catch (error) {
      console.log(error);
    }
  };

  const signupHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkoutFlow && Object.values(shippingAddress).some((value) => !value.trim())) return;

    try {
      const { data } = await api.post("/users/register", {
        name,
        email,
        password,
        shippingAddress,
      });

      dispatch(loginSuccess(data));
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate(checkoutFlow ? "/checkout" : data.role === "admin" ? "/dashboard" : "/products");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ borderRadius: 4, boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)" }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            {isSignup ? "Create account" : "Welcome back"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {checkoutFlow ? "Create an account and add your shipping address to continue to checkout." : isSignup ? "Sign up to start shopping with LuxeCart." : "Sign in to continue shopping with confidence."}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <Button variant={!isSignup ? "contained" : "outlined"} onClick={() => setIsSignup(false)}>
              Login
            </Button>
            <Button variant={isSignup ? "contained" : "outlined"} onClick={() => setIsSignup(true)}>
              Sign up
            </Button>
          </Box>

          <Box component="form" onSubmit={isSignup ? signupHandler : loginHandler} sx={{ display: "grid", gap: 2 }}>
            {isSignup && (
              <TextField label="Full Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
            {isSignup && checkoutFlow && <>
              <TextField label="Shipping address" fullWidth required value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} />
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 2 }}>
                <TextField label="City" required value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} />
                <TextField label="State" required value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} />
                <TextField label="Postal code" required value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} />
                <TextField label="Phone number" required value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} />
              </Box>
            </>}
            <Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
              {isSignup ? "Create account" : "Login"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
