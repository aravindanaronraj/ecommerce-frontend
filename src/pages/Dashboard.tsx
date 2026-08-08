import { useEffect, useMemo, useState, type ReactNode } from "react";
import api from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setProducts, type Product } from "../redux/slices/productSlice";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Drawer,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const initialForm = {
  title: "", description: "", price: "", category: "", stock: "", brand: "", color: "", size: "", material: "", featured: false,
};

const defaultAbout = {
  eyebrow: "About LuxeCart", title: "Designed for effortless, modern shopping.", description: "LuxeCart brings together elegant design, premium products, and a seamless customer journey in one place.", perkOne: "Curated premium products for everyday living", perkTwo: "Fast checkout and trusted delivery", perkThree: "A polished shopping experience built for modern shoppers", whyTitle: "Why customers love us", whyDescription: "We focus on polished presentation, reliable service, and intuitive product discovery so shopping feels simple and rewarding.",
};

const defaultFooter = {
  brand: "LuxeCart", tagline: "Thoughtfully chosen essentials for a more beautiful everyday life.", email: "hello@luxecart.com", phone: "+91 98765 43210", address: "Mumbai, Maharashtra",
};

const emptyBannerSlides = Array.from({ length: 3 }, () => ({ title: "", subtitle: "" }));

type DashboardSection = "overview" | "products" | "add-product" | "orders" | "banner" | "about" | "footer" | "staff";

interface Account {
  _id: string;
  name: string;
  email: string;
  role: "user" | "staff" | "admin";
}

interface Order {
  _id: string;
  user?: { name: string; email: string };
  items: { title: string; price: number; quantity: number }[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { products } = useSelector((state: RootState) => state.products);
  const isAdmin = user?.role === "admin";
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bannerSlides, setBannerSlides] = useState(emptyBannerSlides);
  const [bannerImage, setBannerImage] = useState("");
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [aboutContent, setAboutContent] = useState(defaultAbout);
  const [footerContent, setFooterContent] = useState(defaultFooter);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      dispatch(setProducts(data));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAccounts = async () => {
    if (!user?.token || !isAdmin) return;
    try {
      const { data } = await api.get("/users", { headers: { Authorization: `Bearer ${user.token}` } });
      setAccounts(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrders = async () => {
    if (!user?.token) return;
    try {
      const { data } = await api.get("/orders", { headers: { Authorization: `Bearer ${user.token}` } });
      setOrders(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!user?.token || !["admin", "staff"].includes(user.role)) {
      navigate("/products");
      return;
    }

    fetchProducts();
    fetchOrders();
    fetchAccounts();
    api.get("/admin/settings").then(({ data }) => {
      setBannerSlides(data.banner?.slides?.length ? [...data.banner.slides, ...emptyBannerSlides].slice(0, 3).map((slide: { title?: string; subtitle?: string }) => ({ title: slide.title || "", subtitle: slide.subtitle || "" })) : [{ title: data.banner?.title || "", subtitle: data.banner?.subtitle || "" }, ...emptyBannerSlides.slice(1)]);
      setBannerImage(data.banner?.images?.[0] ? `http://localhost:5000${data.banner.images[0]}` : data.banner?.image ? `http://localhost:5000${data.banner.image}` : "");
      setAboutContent({ ...defaultAbout, ...data.about });
      setFooterContent({ ...defaultFooter, ...data.footer });
    }).catch(console.log);
  }, [user?.token, user?.role, navigate]);

  const stats = useMemo(() => ({
    total: products.length,
    featured: products.filter((product) => product.featured).length,
    units: products.reduce((total, product) => total + product.stock, 0),
    orders: orders.length,
  }), [products, orders.length]);

  const handleFormChange = (field: string, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const createProduct = async () => {
    if (!user?.token) return;
    if (!form.title.trim() || !form.description.trim() || !form.category.trim() || form.price === "" || form.stock === "") {
      setNotice("Please complete the title, description, price, category, and stock fields.");
      return;
    }
    setSubmitting(true);
    setNotice("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
      if (image) formData.append("image", image);

      await api.post("/products", formData, {
        headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" },
      });
      setForm(initialForm);
      setImage(null);
      await fetchProducts();
      setNotice("Product added successfully.");
      setActiveSection("products");
    } catch (error: any) {
      console.log(error);
      setNotice(error.response?.data?.message || "Unable to add product right now. Please check your connection and sign-in access.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`, { headers: { Authorization: `Bearer ${user?.token}` } });
      await fetchProducts();
      setNotice("Product deleted.");
    } catch (error) {
      console.log(error);
      setNotice("Unable to delete product right now.");
    }
  };

  const saveBanner = async () => {
    try {
      if (!bannerFiles.length) {
        setNotice("Please choose a banner image first.");
        return;
      }

      const formData = new FormData();
      formData.append("bannerSlides", JSON.stringify(bannerSlides));
      bannerFiles.forEach((file) => formData.append("bannerImage", file, file.name));
      const { data } = await api.put("/admin/settings", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setBannerImage(
        data.banner?.images?.[0]
          ? data.banner.images[0]
          : data.banner?.image || ""
      );
      setBannerFiles([]);
      setNotice("Home banner settings saved.");
    } catch (error: any) {
      console.log(error);
      setNotice(error?.response?.data?.message || "Unable to save banner settings.");
    }
  };

  const handleBannerImages = (files?: FileList | null) => {
    const selectedFiles = Array.from(files || []).slice(0, 3);
    if (!selectedFiles.length) return;
    setBannerFiles(selectedFiles);
    setBannerImage(URL.createObjectURL(selectedFiles[0]));
  };

  const updateBannerSlide = (index: number, field: "title" | "subtitle", value: string) => {
    setBannerSlides((current) => current.map((slide, slideIndex) => slideIndex === index ? { ...slide, [field]: value } : slide));
  };

  const saveAbout = async () => {
    try {
      await api.put("/admin/settings", { about: JSON.stringify(aboutContent) }, { headers: { Authorization: `Bearer ${user?.token}` } });
      setNotice("About Us content saved.");
    } catch {
      setNotice("Unable to save About Us content.");
    }
  };

  const saveFooter = async () => {
    try {
      await api.put("/admin/settings", { footer: JSON.stringify(footerContent) }, { headers: { Authorization: `Bearer ${user?.token}` } });
      setNotice("Footer details saved.");
    } catch {
      setNotice("Unable to save footer details.");
    }
  };

  const updateStaffRole = async (account: Account, role: "user" | "staff") => {
    try {
      await api.patch(`/users/${account._id}/role`, { role }, { headers: { Authorization: `Bearer ${user?.token}` } });
      await fetchAccounts();
      setNotice(`${account.name} is now ${role === "staff" ? "a staff member" : "a customer"}.`);
    } catch (error) {
      console.log(error);
      setNotice("Unable to update staff access.");
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${user?.token}` } });
      await fetchOrders();
      setNotice("Order status updated.");
    } catch (error) {
      console.log(error);
      setNotice("Unable to update order status.");
    }
  };

  const menuItems: { id: DashboardSection; label: string; icon: ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <DashboardOutlinedIcon /> },
    { id: "products", label: "Products", icon: <Inventory2OutlinedIcon /> },
    { id: "add-product", label: "Add product", icon: <AddBoxOutlinedIcon /> },
    { id: "orders", label: "Orders", icon: <ReceiptLongOutlinedIcon /> },
    ...(isAdmin ? [
      { id: "staff" as DashboardSection, label: "Staff access", icon: <PeopleAltOutlinedIcon /> },
      { id: "banner" as DashboardSection, label: "Home banner", icon: <ImageOutlinedIcon /> },
      { id: "about" as DashboardSection, label: "About Us", icon: <InfoOutlinedIcon /> },
      { id: "footer" as DashboardSection, label: "Footer details", icon: <ContactMailOutlinedIcon /> },
    ] : []),
  ];

  const productForm = (
    <Stack spacing={2.25}>
      <TextField label="Title" value={form.title} onChange={(event) => handleFormChange("title", event.target.value)} fullWidth required />
      <TextField label="Description" value={form.description} onChange={(event) => handleFormChange("description", event.target.value)} multiline rows={3} fullWidth required />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
        <TextField label="Price" type="number" value={form.price} onChange={(event) => handleFormChange("price", event.target.value)} required />
        <TextField label="Category" value={form.category} onChange={(event) => handleFormChange("category", event.target.value)} required />
        <TextField label="Stock" type="number" value={form.stock} onChange={(event) => handleFormChange("stock", event.target.value)} required />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
        <TextField label="Brand" value={form.brand} onChange={(event) => handleFormChange("brand", event.target.value)} />
        <TextField label="Color" value={form.color} onChange={(event) => handleFormChange("color", event.target.value)} />
        <TextField label="Size" value={form.size} onChange={(event) => handleFormChange("size", event.target.value)} />
        <TextField label="Material" value={form.material} onChange={(event) => handleFormChange("material", event.target.value)} />
      </Box>
      <FormControlLabel control={<Switch checked={form.featured} onChange={(event) => handleFormChange("featured", event.target.checked)} />} label="Feature this product on the home page" />
      <Button variant="outlined" component="label" sx={{ alignSelf: "flex-start" }}>Upload image<input hidden accept="image/*" type="file" onChange={(event) => setImage(event.target.files?.[0] || null)} /></Button>
      <Button variant="contained" onClick={createProduct} disabled={submitting} sx={{ alignSelf: "flex-start" }}>{submitting ? "Saving..." : "Save product"}</Button>
    </Stack>
  );

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const sidebarContent = (
    <Box sx={{ width: 280, height: "100%", bgcolor: "#0f172a", color: "white", p: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, pl: 0.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 20, textAlign: "left" }}>Admin panel</Typography>
        <IconButton onClick={closeMobileMenu} sx={{ color: "white", ml: 1 }} aria-label="Close menu">
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 13, mb: 2 }}>{user?.name || "Administrator"}</Typography>
      <List disablePadding sx={{ alignItems: "stretch" }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeSection === item.id}
            onClick={() => { setActiveSection(item.id); setNotice(""); closeMobileMenu(); }}
            sx={{ borderRadius: 2, mb: 0.5, color: "inherit", justifyContent: "flex-start", "&.Mui-selected": { bgcolor: "rgba(251,191,36,0.18)", color: "#fbbf24" }, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} sx={{ textAlign: "left", margin: 0 }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  const panel = () => {
    if (activeSection === "overview") {
      return <>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Dashboard overview</Typography>
        <Typography color="text.secondary" sx={{ mb: 3.5 }}>A quick view of your product catalog.</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
          {[{ label: "Total products", value: stats.total }, { label: "Featured products", value: stats.featured }, { label: "Units in stock", value: stats.units }, { label: "Total orders", value: stats.orders }].map((stat) => <Card key={stat.label} variant="outlined" sx={{ borderRadius: 3 }}><CardContent><Typography color="text.secondary" variant="body2">{stat.label}</Typography><Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{stat.value}</Typography></CardContent></Card>)}
        </Box>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Ready to update your catalog?</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Add a new item or review your existing products.</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}><Button variant="contained" onClick={() => setActiveSection("add-product")}>Add product</Button><Button variant="outlined" onClick={() => setActiveSection("products")}>Manage products</Button></Stack>
        </Paper>
      </>;
    }

    if (activeSection === "products") {
      return <>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 3 }}><Box><Typography variant="h4" sx={{ fontWeight: 800 }}>Products</Typography><Typography color="text.secondary">Edit or remove catalog listings.</Typography></Box><Button variant="contained" onClick={() => setActiveSection("add-product")}>Add product</Button></Box>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}><Table><TableHead><TableRow><TableCell>Product</TableCell><TableCell>Price</TableCell><TableCell>Stock</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>{products.map((product: Product) => <TableRow key={product._id}><TableCell><Typography sx={{ fontWeight: 700 }}>{product.title}</Typography>{product.featured && <Chip label="Featured" size="small" sx={{ mt: 0.5 }} />}</TableCell><TableCell>₹{product.price}</TableCell><TableCell>{product.stock}</TableCell><TableCell><Stack direction="row" spacing={1}><Button variant="outlined" size="small" onClick={() => navigate(`/edit-product/${product._id}`)}>Edit</Button><Button variant="contained" color="error" size="small" onClick={() => deleteProduct(product._id)}>Delete</Button></Stack></TableCell></TableRow>)}</TableBody></Table></TableContainer>
      </>;
    }

    if (activeSection === "orders") return <>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Orders</Typography>
      <Typography color="text.secondary" sx={{ mb: 3.5 }}>Review customer orders and keep their delivery status up to date.</Typography>
      {orders.length === 0 ? <Paper variant="outlined" sx={{ borderRadius: 3, p: 4 }}><Typography color="text.secondary">No orders have been placed yet.</Typography></Paper> : <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead><TableRow><TableCell>Order</TableCell><TableCell>Customer</TableCell><TableCell>Items</TableCell><TableCell>Total</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
          <TableBody>{orders.map((order) => <TableRow key={order._id}><TableCell><Typography sx={{ fontWeight: 700 }}>#{order._id.slice(-6).toUpperCase()}</Typography><Typography variant="caption" color="text.secondary">{new Date(order.createdAt).toLocaleDateString()}</Typography></TableCell><TableCell><Typography sx={{ fontWeight: 600 }}>{order.user?.name || "Customer"}</Typography><Typography variant="body2" color="text.secondary">{order.user?.email}</Typography></TableCell><TableCell><Typography variant="body2">{order.items.map((item) => `${item.title} × ${item.quantity}`).join(", ")}</Typography></TableCell><TableCell sx={{ fontWeight: 700 }}>₹{order.total}</TableCell><TableCell><TextField select size="small" value={order.status} onChange={(event) => updateOrderStatus(order._id, event.target.value as Order["status"])} sx={{ minWidth: 125 }}>{["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => <MenuItem key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</MenuItem>)}</TextField></TableCell></TableRow>)}</TableBody>
        </Table>
      </TableContainer>}
    </>;

    if (activeSection === "add-product") return <><Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Add product</Typography><Typography color="text.secondary" sx={{ mb: 3.5 }}>Create a new listing for your catalog.</Typography>{productForm}</>;

    if (activeSection === "staff" && isAdmin) return <>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Staff access</Typography>
      <Typography color="text.secondary" sx={{ mb: 3.5 }}>Grant staff members access to manage products. Only administrators can change access.</Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Access</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
          <TableBody>{accounts.map((account) => <TableRow key={account._id}><TableCell sx={{ fontWeight: 700 }}>{account.name}</TableCell><TableCell>{account.email}</TableCell><TableCell><Chip label={account.role} color={account.role === "staff" ? "primary" : account.role === "admin" ? "secondary" : "default"} size="small" /></TableCell><TableCell>{account.role === "admin" ? <Typography variant="body2" color="text.secondary">Administrator</Typography> : <Button size="small" variant={account.role === "staff" ? "outlined" : "contained"} color={account.role === "staff" ? "error" : "primary"} onClick={() => updateStaffRole(account, account.role === "staff" ? "user" : "staff")}>{account.role === "staff" ? "Remove staff access" : "Grant staff access"}</Button>}</TableCell></TableRow>)}</TableBody>
        </Table>
      </TableContainer>
    </>;

    if (activeSection === "about") return <>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>About Us</Typography>
      <Typography color="text.secondary" sx={{ mb: 3.5 }}>Edit the content displayed on the About Us page.</Typography>
      <Stack spacing={2.25}>
        <TextField label="Section label" value={aboutContent.eyebrow} onChange={(event) => setAboutContent({ ...aboutContent, eyebrow: event.target.value })} fullWidth />
        <TextField label="Main heading" value={aboutContent.title} onChange={(event) => setAboutContent({ ...aboutContent, title: event.target.value })} fullWidth />
        <TextField label="Description" value={aboutContent.description} onChange={(event) => setAboutContent({ ...aboutContent, description: event.target.value })} multiline rows={4} fullWidth />
        <TextField label="Benefit 1" value={aboutContent.perkOne} onChange={(event) => setAboutContent({ ...aboutContent, perkOne: event.target.value })} fullWidth />
        <TextField label="Benefit 2" value={aboutContent.perkTwo} onChange={(event) => setAboutContent({ ...aboutContent, perkTwo: event.target.value })} fullWidth />
        <TextField label="Benefit 3" value={aboutContent.perkThree} onChange={(event) => setAboutContent({ ...aboutContent, perkThree: event.target.value })} fullWidth />
        <TextField label="Why section heading" value={aboutContent.whyTitle} onChange={(event) => setAboutContent({ ...aboutContent, whyTitle: event.target.value })} fullWidth />
        <TextField label="Why section description" value={aboutContent.whyDescription} onChange={(event) => setAboutContent({ ...aboutContent, whyDescription: event.target.value })} multiline rows={3} fullWidth />
        <Button variant="contained" onClick={saveAbout} sx={{ alignSelf: "flex-start" }}>Save About Us</Button>
      </Stack>
    </>;

    if (activeSection === "footer") return <>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Footer details</Typography>
      <Typography color="text.secondary" sx={{ mb: 3.5 }}>Update your footer branding and contact information.</Typography>
      <Stack spacing={2.25}>
        <TextField label="Brand name" value={footerContent.brand} onChange={(event) => setFooterContent({ ...footerContent, brand: event.target.value })} fullWidth />
        <TextField label="Brand description" value={footerContent.tagline} onChange={(event) => setFooterContent({ ...footerContent, tagline: event.target.value })} multiline rows={3} fullWidth />
        <TextField label="Contact email" type="email" value={footerContent.email} onChange={(event) => setFooterContent({ ...footerContent, email: event.target.value })} fullWidth />
        <TextField label="Phone number" value={footerContent.phone} onChange={(event) => setFooterContent({ ...footerContent, phone: event.target.value })} fullWidth />
        <TextField label="Address" value={footerContent.address} onChange={(event) => setFooterContent({ ...footerContent, address: event.target.value })} fullWidth />
        <Button variant="contained" onClick={saveFooter} sx={{ alignSelf: "flex-start" }}>Save footer details</Button>
      </Stack>
    </>;

    return <><Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>Home banner</Typography><Typography color="text.secondary" sx={{ mb: 3.5 }}>Choose three images and set the title and subtitle for each slide.</Typography><Stack spacing={2.25}>{bannerSlides.map((slide, index) => <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography sx={{ fontWeight: 700, mb: 1.5 }}>Banner {index + 1}</Typography><Stack spacing={1.5}><TextField label="Title" value={slide.title} onChange={(event) => updateBannerSlide(index, "title", event.target.value)} fullWidth /><TextField label="Subtitle" value={slide.subtitle} onChange={(event) => updateBannerSlide(index, "subtitle", event.target.value)} fullWidth /></Stack></Paper>)}{bannerImage && <Box component="img" src={bannerImage} alt="Banner preview" sx={{ width: "100%", maxWidth: 420, height: 180, objectFit: "cover", borderRadius: 2 }} />}<Button variant="outlined" component="label" sx={{ alignSelf: "flex-start" }}>Choose 3 banner images<input hidden accept="image/*" type="file" multiple onChange={(event) => handleBannerImages(event.target.files)} /></Button>{bannerFiles.length > 0 && <Typography variant="body2" color="text.secondary">{bannerFiles.length} image{bannerFiles.length === 1 ? "" : "s"} selected.</Typography>}<Button variant="contained" onClick={saveBanner} sx={{ alignSelf: "flex-start" }}>Save banner settings</Button></Stack></>;
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Box sx={{ alignItems: "center", justifyContent: "space-between", mb: 2, display: { xs: "flex", md: "none" } }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Admin dashboard</Typography>
        <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ bgcolor: "#0f172a", color: "white", borderRadius: 2 }} aria-label="Open menu">
          <MenuIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "240px minmax(0, 1fr)" }, gap: 3, alignItems: "start" }}>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Paper sx={{ borderRadius: 4, p: 2, bgcolor: "#0f172a", color: "white", position: { md: "sticky" }, top: { md: 92 } }}>
            <Typography sx={{ fontWeight: 800, fontSize: 20, px: 1.5, pt: 1 }}>Admin panel</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 13, px: 1.5, mt: 0.5, mb: 2 }}>{user?.name || "Administrator"}</Typography>
            <List disablePadding>{menuItems.map((item) => <ListItemButton key={item.id} selected={activeSection === item.id} onClick={() => { setActiveSection(item.id); setNotice(""); }} sx={{ borderRadius: 2, mb: 0.5, "&.Mui-selected": { bgcolor: "rgba(251,191,36,0.18)", color: "#fbbf24" }, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}><ListItemIcon sx={{ color: "inherit", minWidth: 38 }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} /></ListItemButton>)}</List>
          </Paper>
        </Box>

        <Drawer anchor="left" open={mobileMenuOpen} onClose={closeMobileMenu} ModalProps={{ keepMounted: true }}>
          {sidebarContent}
        </Drawer>

        <Paper sx={{ borderRadius: 4, p: { xs: 2.5, md: 4 }, minHeight: 560, boxShadow: "0 16px 45px rgba(15,23,42,0.09)" }}>
          {notice && <Alert severity={notice.includes("Unable") || notice.startsWith("Please complete") ? "error" : "success"} sx={{ mb: 3 }}>{notice}</Alert>}
          {panel()}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
