import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();

userRouter.get("/currentUser", userMiddleware, async (req, res) => {
  const userId = req.userId;
  const user = await client.user.findUnique({
    where: { id: userId },
    include: {
      avatar: {
        select: {
          imageUrl: true,
        },
      },
    },
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.status(200).json({
    id: user.id,
    username: user.username,
    avatarId: user.avatar?.imageUrl,
    type: user.role,
  });
});

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  const parsedData = UpdateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  try {
    await client.user.update({
      where: {
        id: req.userId,
      },
      data: {
        avatarId: parsedData.data.avatarId,
      },
    });
    res.json({ message: "Metadata updated" });
  } catch (e) {
    res.status(400).json({ message: "Internal server error" });
  }
});

userRouter.get("/metadata/bulk", async (req, res) => {
  const userIdString = (req.query.ids ?? "[]") as string;
  const userIds = userIdString.slice(1, userIdString?.length - 1).split(",");

  const metadata = await client.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      avatar: true,
    },
  });
  res.status(200).json({
    avatars: metadata.map((user) => ({
      userId: user.id,
      avatarId: user.avatar?.imageUrl,
    })),
  });
});
