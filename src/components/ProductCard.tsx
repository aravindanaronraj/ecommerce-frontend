import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";
import api from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setCart } from "../redux/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { addGuestItem } from "../utils/guestCart";

interface ProductProps {
  product: {
    _id: string;
    title: string;
    description: string;
    price: number;
    image: string;
  };
}

const ProductCard = ({ product }: ProductProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  const addToCart = async () => {
    if (!user?.token) {
      dispatch(setCart(addGuestItem(product, 1)));
      return;
    }

    try {
      await api.post(
        "/cart",
        {
          product: product._id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      const { data } = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      dispatch(setCart(Array.isArray(data) ? data : data.items || []));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card
      sx={{ width: "100%", height: "100%", borderRadius: 4, overflow: "hidden", boxShadow: "0 8px 24px rgba(15,23,42,0.08)", transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer", display: "flex", flexDirection: "column", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 36px rgba(15,23,42,0.14)" } }}
      onClick={() => navigate(`/products/${product._id}`)}
    >
      <CardMedia
        component="img"
        height= "400"
        image={product.image}
        alt={product.title}
        sx={{ objectFit: "cover" }}
      />

      <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.35, mb: 2 }}>
          {product.title}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, mt: "auto" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            ₹ {product.price}
          </Typography>
          <Button
            variant="contained"
            sx={{ borderRadius: 999, px: 2.25, whiteSpace: "nowrap" }}
            onClick={(event) => {
              event.stopPropagation();
              addToCart();
            }}
          >
            Add To Cart
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
