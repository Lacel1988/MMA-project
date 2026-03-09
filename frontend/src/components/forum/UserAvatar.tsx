import { Avatar } from "@mui/material";

type Props = {
  username: string;
  avatarUrl?: string;
};

export default function UserAvatar({ username, avatarUrl }: Props) {
  if (avatarUrl) {
    return <Avatar src={avatarUrl} />;
  }

  return <Avatar>{username.charAt(0).toUpperCase()}</Avatar>;
}