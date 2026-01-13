import { useState } from "react";
import {Box,Paper,Typography,Tabs,Tab,TextField,Button,Alert,
} from "@mui/material";
import { login, registerUser, fetchMe, type MeResponse } from "../../api/authApi";

type Props = {
  onLoginSuccess: (me: MeResponse) => void;
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "white",
    bgcolor: "rgba(255,255,255,0.04)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.18)",
  },
};

const labelSx = { sx: { color: "rgba(255,255,255,0.75)" } };

export default function AuthPanel({ onLoginSuccess }: Props) {
  const [tab, setTab] = useState<"login" | "register">("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [email, setEmail] = useState("");
  const [password2, setPassword2] = useState("");

  const [hiba, setHiba] = useState<string>("");
  const [ok, setOk] = useState<string>("");

  async function handleLogin() {
    setHiba("");
    setOk("");

    try {
      await login(username.trim(), password);
      const me = await fetchMe();
      onLoginSuccess(me);
    } catch (e: any) {
      setHiba(e?.message || "Login failed.");
    }
  }

  async function handleRegister() {
    setHiba("");
    setOk("");

    if (!username.trim()) return setHiba("Username is required.");
    if (!email.trim()) return setHiba("Email is required.");
    if (!password) return setHiba("Password is required.");
    if (password !== password2) return setHiba("Passwords do not match.");

    try {
      await registerUser(username.trim(), email.trim(), password);
      setOk("Registration successful. You can login now.");
      setTab("login");
    } catch (e: any) {
      setHiba(e?.message || "Registration failed.");
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        p: 2,
        color: "white",
        maxWidth: 520,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
        Account
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        textColor="inherit"
        indicatorColor="secondary"
        sx={{
          mb: 2,
          "& .MuiTab-root": { color: "rgba(255,255,255,0.7)", fontWeight: 800 },
          "& .Mui-selected": { color: "white" },
        }}
      >
        <Tab value="login" label="LOGIN" />
        <Tab value="register" label="REGISTER" />
      </Tabs>

      {hiba ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {hiba}
        </Alert>
      ) : null}

      {ok ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {ok}
        </Alert>
      ) : null}

      {tab === "login" ? (
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputLabelProps={labelSx}
            sx={inputSx}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={labelSx}
            sx={inputSx}
          />

          <Button
            onClick={handleLogin}
            variant="contained"
            sx={{
              mt: 1,
              bgcolor: "#b71c1c",
              fontWeight: 900,
              "&:hover": { bgcolor: "#c62828" },
            }}
          >
            LOGIN
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputLabelProps={labelSx}
            sx={inputSx}
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={labelSx}
            sx={inputSx}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={labelSx}
            sx={inputSx}
          />
          <TextField
            label="Password again"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            InputLabelProps={labelSx}
            sx={inputSx}
          />

          <Button
            onClick={handleRegister}
            variant="contained"
            sx={{
              mt: 1,
              bgcolor: "#b71c1c",
              fontWeight: 900,
              "&:hover": { bgcolor: "#c62828" },
            }}
          >
            REGISTER
          </Button>
        </Box>
      )}
    </Paper>
  );
}
