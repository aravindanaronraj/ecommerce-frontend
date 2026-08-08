import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import api from "../api/axios";

type Review = {
  _id: string;
  rating: number;
  comment: string;
  user?: {
    name: string;
  };
};

const ReviewSection = ({ productId }: { productId?: string }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState("");

  const loadReviews = async () => {
    const { data } = await api.get("/reviews", {
      params: productId ? { product: productId } : {},
    });

    setReviews(data);
  };

  useEffect(() => {
    loadReviews().catch(() => {
      setNotice("Reviews could not be loaded.");
    });
  }, [productId]);

  const submitReview = async () => {
    if (!user?.token) {
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      setNotice("Please write a review before submitting.");
      return;
    }

    try {
      await api.post(
        "/reviews",
        {
          product: productId,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setComment("");
      setNotice("Thanks for your review!");

      await loadReviews();
    } catch (error: any) {
      setNotice(
        error.response?.data?.message ||
          "Unable to submit your review."
      );
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        mt: 4,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          mb: 2,
        }}
      >
        Customer reviews
      </Typography>

      {notice && (
        <Alert
          severity={
            notice.includes("Thanks") ? "success" : "error"
          }
          sx={{ mb: 2 }}
        >
          {notice}
        </Alert>
      )}

      <Stack spacing={1.5} sx={{ mb: 3 }}>
        <Rating
          value={rating}
          onChange={(_, value) => setRating(value || 1)}
        />

        <TextField
          label="Share your experience"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={submitReview}
          sx={{
            alignSelf: "flex-start",
          }}
        >
          {user ? "Submit review" : "Sign in to review"}
        </Button>
      </Stack>

      {reviews.length ? (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <Box
              key={review._id}
              sx={{
                borderTop: "1px solid",
                borderColor: "divider",
                pt: 1.5,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {review.user?.name || "Customer"}
              </Typography>

              <Rating
                value={review.rating}
                readOnly
                size="small"
              />

              <Typography
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {review.comment}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography color="text.secondary">
          No reviews yet. Be the first to share your experience.
        </Typography>
      )}
    </Paper>
  );
};

export default ReviewSection;