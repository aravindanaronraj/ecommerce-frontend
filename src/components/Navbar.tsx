import { AppBar, Badge, Box, Button, Container, Drawer, IconButton, List, ListItemButton, ListItemText, Toolbar, Typography } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import type { RootState } from "../redux/store";
import { useState } from "react";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth);
  const { cartItems = [] } = useSelector((state: RootState) => state.cart);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    dispatch(logout());
    setMobileOpen(false);
    navigate("/");
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "About us", to: "/about" },
    { label: "Contact us", to: "/contact" },
    { label: "Cart", to: "/cart", icon: <Badge badgeContent={cartCount} color="secondary" overlap="circular"><ShoppingCartIcon sx={{ color: "#0f172a" }} /></Badge> },
  ];

  const closeMenu = () => setMobileOpen(false);

  const renderMenuContent = () => (
    <Box sx={{ width: 280, height: "100%", bgcolor: "#f8fafc", p: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, pl: 0.5 }}>
        <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: 20, textAlign: "left" }}>Menu</Typography>
        <IconButton onClick={closeMenu} aria-label="Close menu" sx={{ ml: 1 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List
  disablePadding
  sx={{
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    alignItems: "stretch",
  }}
>
  {navItems.map((item) => (
    <ListItemButton
      key={item.label}
      component={Link}
      to={item.to}
      onClick={closeMenu}
      sx={{
        borderRadius: 2,
        px: 1.5,
        py: 1,
        justifyContent: "flex-start",
      }}
    >
      <ListItemText
        primary={
          <Typography
            sx={{
              fontWeight: 600,
              color: "#0f172a",
              textAlign: "left",
            }}
          >
            {item.label}
          </Typography>
        }
        sx={{ textAlign: "left", margin: 0 }}
      />
      {item.icon}
    </ListItemButton>
  ))}

  {isLoggedIn && ["admin", "staff"].includes(user?.role || "") && (
    <ListItemButton
      component={Link}
      to="/dashboard"
      onClick={closeMenu}
      sx={{
        borderRadius: 2,
        px: 1.5,
        py: 1,
        justifyContent: "flex-start",
      }}
    >
      <ListItemText
        primary={
          <Typography
            sx={{
              fontWeight: 600,
              color: "#0f172a",
              textAlign: "left",
            }}
          >
            Dashboard
          </Typography>
        }
        sx={{ textAlign: "left", margin: 0 }}
      />
    </ListItemButton>
  )}
</List>

      <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.25 }}>
        {isLoggedIn ? (
          <>
            <Box sx={{ px: 1.25, py: 0.8, borderRadius: 999, bgcolor: "#e2e8f0", color: "#0f172a", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {user?.name || "User"}
            </Box>
            <Button variant="contained" fullWidth onClick={handleLogout} sx={{ bgcolor: "#f59e0b", color: "#0f172a", fontWeight: 700, '&:hover': { bgcolor: "#fbbf24" } }}>
              Logout
            </Button>
          </>
        ) : (
          <Button component={Link} to="/login" variant="contained" fullWidth onClick={closeMenu} sx={{ bgcolor: "#f59e0b", color: "#0f172a", fontWeight: 700, '&:hover': { bgcolor: "#fbbf24" } }}>
            Sign in
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid #e5e7eb", backgroundColor: "#0f172a", color: "#f8fafc", backdropFilter: "blur(10px)" }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 0, minHeight: { xs: 64, sm: 72 }, gap: 1 }}>
            <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none", color: "#f8fafc" }}>
              <Box component="img" src="/logo.jpeg" alt="Jeev's Bliss logo" sx={{ width: 36, height: 36, objectFit: "contain" }} />
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 20, sm: 28 }, lineHeight: 1.2 }}>
                Jeev's Bliss
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Button component={Link} to="/" sx={{ color: "#f8fafc", fontWeight: 600 }}>
                Home
              </Button>
              <Button component={Link} to="/products" sx={{ color: "#f8fafc", fontWeight: 600 }}>
                Products
              </Button>
              <Button component={Link} to="/about" sx={{ color: "#f8fafc", fontWeight: 600 }}>
                About us
              </Button>
              <Button component={Link} to="/contact" sx={{ color: "#f8fafc", fontWeight: 600 }}>
                Contact us
              </Button>
              <Button component={Link} to="/cart" sx={{ color: "#f8fafc", fontWeight: 600 }} startIcon={
                <Badge badgeContent={cartCount} color="secondary" overlap="circular">
                  <ShoppingCartIcon sx={{ color: "#f8fafc" }} />
                </Badge>
              }>
                Cart
              </Button>
              {isLoggedIn && ["admin", "staff"].includes(user?.role || "") && (
                <Button component={Link} to="/dashboard" sx={{ color: "#f8fafc", fontWeight: 600 }}>
                  Dashboard
                </Button>
              )}
              {isLoggedIn ? (
                <>
                  <Box sx={{ px: 1.25, py: 0.6, borderRadius: 999, bgcolor: "rgba(255,255,255,0.16)", color: "#ffffff", fontWeight: 700, display: "inline-flex", alignItems: "center" }}>
                    {user?.name || "User"}
                  </Box>
                  <Button variant="contained" onClick={handleLogout} sx={{ bgcolor: "#f59e0b", color: "#0f172a", fontWeight: 700, '&:hover': { bgcolor: "#fbbf24" } }}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button component={Link} to="/login" variant="contained" sx={{ bgcolor: "#f59e0b", color: "#0f172a", fontWeight: 700, '&:hover': { bgcolor: "#fbbf24" } }}>
                  Sign in
                </Button>
              )}
            </Box>

            <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 0.5, ml: "auto" }}>
              <Button component={Link} to="/cart" sx={{ color: "#f8fafc", minWidth: 0, p: 0.75, borderRadius: 2 }}>
                <Badge badgeContent={cartCount} color="secondary" overlap="circular">
                  <ShoppingCartIcon sx={{ color: "#f8fafc" }} />
                </Badge>
              </Button>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "white", borderRadius: 2 }} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="left" open={mobileOpen} onClose={closeMenu} ModalProps={{ keepMounted: true }}>
        {renderMenuContent()}
      </Drawer>
    </>
  );
};

export default Navbar;
