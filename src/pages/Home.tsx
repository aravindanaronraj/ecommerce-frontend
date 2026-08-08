import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Card, CardContent, Chip, Container, IconButton, Paper, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setProducts } from "../redux/slices/productSlice";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const defaultBanner = {
  title: "Elevated essentials",
  subtitle: "Discover premium home and lifestyle picks curated for modern living.",
  image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
};

type Banner = typeof defaultBanner & { images?: string[]; slides?: { image: string; title: string; subtitle: string }[] };

const banners = [
  {
    title: "Elevated essentials",
    subtitle: "Discover premium home and lifestyle picks curated for modern living.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Fresh arrivals every week",
    subtitle: "From comfort-driven furniture to personal favorites, stay ahead of the season.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Shop with confidence",
    subtitle: "Fast delivery, smooth checkout, and a polished experience from start to finish.",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  },
];

const assetUrl = (image: string) => {
  return image || "";
};

const reviews = [
  { name: "Ava", quote: "The experience feels premium and effortless from the moment I land on the page." },
  { name: "Rohan", quote: "Beautiful layout, fast cart updates, and great product discovery." },
  { name: "Neha", quote: "I love how simple it is to browse, buy, and return to shopping again." },
];

const Home = () => {
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerContent, setBannerContent] = useState<Banner | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { products } = useSelector((state: RootState) => state.products);
  const homeBanners = bannerContent
    ? (bannerContent.slides?.length ? bannerContent.slides : (bannerContent.images || [bannerContent.image]).map((image) => ({ title: bannerContent.title, subtitle: bannerContent.subtitle, image })))
    : banners;
  const featuredProducts = products.filter((product) => product.featured).length
    ? products.filter((product) => product.featured)
    : products.slice(0, 8);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data } = await api.get("/admin/settings");
        const uploadedImages = data.banner?.images?.length ? data.banner.images : data.banner?.image ? [data.banner.image] : [];
        if (uploadedImages.length) setBannerContent({ title: data.banner.title || defaultBanner.title, subtitle: data.banner.subtitle || defaultBanner.subtitle, image: assetUrl(uploadedImages[0]), images: uploadedImages.map(assetUrl), slides: data.banner.slides?.map((slide: { image: string; title?: string; subtitle?: string }) => ({ image: assetUrl(slide.image), title: slide.title || defaultBanner.title, subtitle: slide.subtitle || defaultBanner.subtitle })) });
      } catch (error) {
        console.log(error);
      }
    };

    fetchBanner();

    const timer = window.setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % homeBanners.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [homeBanners.length]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await api.get("/products");
        dispatch(setProducts(data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchFeaturedProducts();
  }, [dispatch]);

  const moveSlider = (direction: "left" | "right") => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.scrollBy({
      left: direction === "right" ? slider.clientWidth : -slider.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc" }}>
      <Box
        sx={{
          minHeight: { xs: 440, sm: 520 },
          py: { xs: 6, md: 0 },
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.62) 0%, rgba(15,23,42,0.12) 100%), url("${homeBanners[activeBanner].image}")`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2} sx={{ maxWidth: 620, color: "white", width: "100%" }}>
            <Chip label="New season collection" sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.16)", color: "white" }} />
            <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: { xs: "2.1rem", sm: "2.7rem", md: "3.4rem" } }}>
              {homeBanners[activeBanner].title}
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.7, fontSize: { xs: "1rem", md: "1.125rem" } }}>
              {homeBanners[activeBanner].subtitle}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button component={Link} to="/products" variant="contained" size="large" sx={{ bgcolor: "white", color: "#111827", px: 3, width: { xs: "100%", sm: "auto" } }}>
                Shop now
              </Button>
              <Button component={Link} to="/about" variant="outlined" size="large" sx={{ color: "white", borderColor: "rgba(255,255,255,0.6)", px: 3, width: { xs: "100%", sm: "auto" } }}>
                Learn more
              </Button>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 5, justifyContent: { xs: "center", sm: "flex-start" } }}>
            {homeBanners.map((banner, index) => <Box key={`${banner.title}-${index}`} component="button" aria-label={`Show banner ${index + 1}`} onClick={() => setActiveBanner(index)} sx={{ width: index === activeBanner ? 28 : 8, height: 8, border: 0, borderRadius: 99, p: 0, cursor: "pointer", bgcolor: index === activeBanner ? "#ffffff" : "rgba(255,255,255,0.5)", transition: "all 0.25s ease" }} />)}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "flex-end" }, gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>
              Featured products
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.5rem" } }}>
              Shop the latest picks.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignSelf: { xs: "stretch", sm: "auto" } }}>
            <IconButton aria-label="Previous featured products" onClick={() => moveSlider("left")} sx={{ border: "1px solid", borderColor: "divider", flex: { xs: 1, sm: "auto" } }}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton aria-label="Next featured products" onClick={() => moveSlider("right")} sx={{ border: "1px solid", borderColor: "divider", flex: { xs: 1, sm: "auto" } }}>
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </Box>

        {featuredProducts.length === 0 ? (
          <Typography color="text.secondary">Featured products will appear here soon.</Typography>
        ) : (
          <Box
            ref={sliderRef}
            sx={{
              display: "flex",
              gap: 3,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {featuredProducts.map((product) => (
              <Box
                key={product._id}
                sx={{
                  flex: { xs: "0 0 88%", sm: "0 0 calc((100% - 24px) / 2)", md: "0 0 calc((100% - 48px) / 3)" },
                  scrollSnapAlign: "start",
                  pb: 1,
                }}
              >
                <ProductCard product={product} />
              </Box>
            ))}
          </Box>
        )}
      </Container>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box id="about" sx={{ mb: 8 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>
            About us
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            Beautiful products, delivered with intention.
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.8 }}>
            LuxeCart brings together a curated catalog and a premium buying journey for shoppers who appreciate style, ease, and reliability.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 8 }}>
          {[
            { title: "Premium quality", text: "Only the finest essentials make it to our shelves." },
            { title: "Fast support", text: "Friendly assistance whenever you need a helping hand." },
            { title: "Secure checkout", text: "Private, trusted payments and seamless account access." },
          ].map((item) => (
            <Box key={item.title} sx={{ flex: { xs: "1 1 100%", sm: "1 1 220px" } }}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, height: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{item.title}</Typography>
                <Typography color="text.secondary">{item.text}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        <Box id="products" sx={{ mb: 8, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: "1.6rem", md: "2rem" } }}>
            Looking for more?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, px: { xs: 1, sm: 0 } }}>
            Explore the complete collection and find your next favorite.
          </Typography>
          <Button component={Link} to="/products" variant="contained" sx={{ width: { xs: "100%", sm: "auto" } }}>
            Explore all products
          </Button>
        </Box>

        <Box id="reviews" sx={{ mb: 4 }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>
            Reviews
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
            Loved by customers.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {reviews.map((review) => (
              <Box key={review.name} sx={{ flex: "1 1 220px" }}>
                <Card elevation={0} sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      “{review.quote}”
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {review.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
