import { useEffect } from "react";
import api from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";
import { Box, Container, Typography } from "@mui/material";

const Products = () => {
  const dispatch = useDispatch();

  const { products } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      dispatch(setProducts(data));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", mb: { xs: 3, md: 5 }, px: { xs: 1, sm: 0 } }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: "1.75rem", md: "3rem" } }}>
          Discover Premium Products
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}>
          Curated essentials designed for comfort, style, and everyday value.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: { xs: 1.5, md: 3 }, alignItems: "stretch" }}>
        {products.map((product) => (
          <Box key={product._id}>
            <ProductCard product={product} />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Products;
