import React from "react";
import { Avatar } from "@mui/material";
import { userInitial } from "./forumHelpers";

type Props = {
  name: string;
  size?: number;
  bgColor?: string;
  fontSize?: number;
};

const UserAvatar: React.FC<Props> = ({
  name,
  size = 38,
  bgColor = "#2e2e2e",
  fontSize,
}) => {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: bgColor,
        color: "#fff",
        fontWeight: 700,
        fontSize: fontSize ?? Math.max(13, Math.round(size * 0.34)),
      }}
    >
      {userInitial(name)}
    </Avatar>
  );
};

export default UserAvatar;