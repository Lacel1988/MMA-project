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
  title: string;          // pl "Fighter A" vagy a név
  fighterName: string;    // a legend helyett
  metrics?: Metrics | null;
  last: number;
  color?: string;         // pl piros/kék
};

function clamp(v: number, max: number) {
  return Math.max(0, Math.min(v, max));
}

// normalizálás 0-100-ra, hogy egy skálán legyen
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
          p: 2,
          color: "white",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
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
      stat: "Significant Strike Accuracy (%)",
      value: toPct(metrics.sig_str_acc_pct, 100),
      raw: metrics.sig_str_acc_pct,
      unit: "%",
    },
    {
      stat: "Takedown Accuracy (%)",
      value: toPct(metrics.td_acc_pct, 100),
      raw: metrics.td_acc_pct,
      unit: "%",
    },
    {
      stat: "Knockdowns per 15 min",
      value: toPct(metrics.kd_per15, 1.5),
      raw: metrics.kd_per15,
      unit: "",
    },
    {
      stat: "Submission Attempts per 15 min",
      value: toPct(metrics.sub_att_per15, 6),
      raw: metrics.sub_att_per15,
      unit: "",
    },
    {
      stat: "Control Time (sec) per 15 min",
      value: toPct(metrics.ctrl_sec_per15, 900),
      raw: metrics.ctrl_sec_per15,
      unit: "sec",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 3,
        p: 2,
        color: "white",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 900 }}>
        {title} Radar
      </Typography>
      <Typography sx={{ opacity: 0.75, mb: 2 }}>
        {fighterName} | last {last} fights
      </Typography>

      <Box sx={{ width: "100%", minWidth: 0 }}>
        <ResponsiveContainer width="100%" aspect={ 1.2 }>
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.18)" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                background: "rgba(20,20,20,0.95)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
              formatter={(val: any, _name: any, props: any) => {
                const raw = props?.payload?.raw;
                const unit = props?.payload?.unit;
                if (raw == null) return [val, "Value"];
                return [`${raw}${unit ? " " + unit : ""}`, "Raw"];
              }}
              labelFormatter={(label) => label as string}
            />

            <Radar
              name={fighterName}
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.22}
              strokeWidth={3}
              dot={{ r: 2 }}
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
