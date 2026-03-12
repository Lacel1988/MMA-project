import { Box, Paper, Typography } from "@mui/material";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Metrics = {
  sig_str_acc_pct: number;
  td_acc_pct: number;
  kd_per15: number;
  sub_att_per15: number;
  ctrl_sec_per15: number;
};

type Props = {
  title: string;
  fighterName: string;
  metrics?: Metrics | null;
  last: number;
  color?: string;
};

function clamp(v: number, max: number) {
  return Math.max(0, Math.min(v, max));
}

function toPct(value: number, cap: number) {
  return (clamp(value, cap) / cap) * 100;
}

export default function UfcRadarChart({
  title,
  fighterName,
  metrics,
  last,
  color = "#b71c1c",
}: Props) {
  if (!metrics) {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 3,
          p: { xs: 1.5, sm: 2 },
          color: "white",
          height: "100%",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
          {title} Radar
        </Typography>
        <Typography sx={{ opacity: 0.75, mt: 1 }}>
          Select a fighter to show radar stats.
        </Typography>
      </Paper>
    );
  }

  const data = [
    {
      stat: "Sig. Strike Acc.",
      value: toPct(metrics.sig_str_acc_pct, 100),
      raw: metrics.sig_str_acc_pct,
      unit: "%",
      fullLabel: "Significant Strike Accuracy (%)",
    },
    {
      stat: "Takedown Acc.",
      value: toPct(metrics.td_acc_pct, 100),
      raw: metrics.td_acc_pct,
      unit: "%",
      fullLabel: "Takedown Accuracy (%)",
    },
    {
      stat: "KD / 15 min",
      value: toPct(metrics.kd_per15, 1.5),
      raw: metrics.kd_per15,
      unit: "",
      fullLabel: "Knockdowns per 15 min",
    },
    {
      stat: "Sub. Att. / 15",
      value: toPct(metrics.sub_att_per15, 6),
      raw: metrics.sub_att_per15,
      unit: "",
      fullLabel: "Submission Attempts per 15 min",
    },
    {
      stat: "Ctrl Time / 15",
      value: toPct(metrics.ctrl_sec_per15, 900),
      raw: metrics.ctrl_sec_per15,
      unit: "sec",
      fullLabel: "Control Time (sec) per 15 min",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        p: { xs: 1.5, sm: 2 },
        color: "white",
        height: "100%",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
        {title} Radar
      </Typography>

      <Typography
        sx={{
          opacity: 0.75,
          mb: 2,
          fontSize: { xs: 13, sm: 15 },
          wordBreak: "break-word",
        }}
      >
        {fighterName} | last {last} fights
      </Typography>

      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          height: { xs: 250, sm: 300, md: 360 },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="68%">
            <PolarGrid stroke="rgba(255,255,255,0.18)" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{
                fill: "rgba(255,255,255,0.92)",
                fontSize: 10,
              }}
            />

            <Tooltip
              contentStyle={{
                background: "rgba(20,20,20,0.95)",
                border: "1px solid rgba(244, 11, 11, 0.15)",
                color: "white",
              }}
              formatter={(val: any, _name: any, props: any) => {
                const raw = props?.payload?.raw;
                const unit = props?.payload?.unit;
                if (raw == null) return [val, "Value"];
                return [`${raw}${unit ? " " + unit : ""}`, "Raw"];
              }}
              labelFormatter={(_label, payload) => {
                const first = payload?.[0]?.payload;
                return first?.fullLabel ?? "";
              }}
            />

            <Radar
              name={fighterName}
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.35}
              strokeWidth={3}
              dot={{ r: 3 }}
              animationDuration={0}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Box>

      <Typography sx={{ opacity: 0.6, mt: 1, fontSize: 12 }}>
        Note: chart is normalized to 0-100 for visual comparison.
      </Typography>
    </Paper>
  );
}