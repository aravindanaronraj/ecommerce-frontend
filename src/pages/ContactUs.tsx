import { Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";

const ContactUs = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }}>
          Contact us
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
          We would love to hear from you.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Reach out for support, product questions, or partnership ideas.
        </Typography>

        <Stack spacing={2} component="form">
          <TextField label="Your name" fullWidth />
          <TextField label="Email address" fullWidth />
          <TextField label="Message" fullWidth multiline rows={4} />
          <Button variant="contained" size="large" sx={{ alignSelf: "flex-start" }}>
            Send message
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ContactUs;
