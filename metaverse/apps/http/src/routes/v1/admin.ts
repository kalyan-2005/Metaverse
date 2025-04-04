import { Router } from "express";
import client from "@repo/db/client";
import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
  UpdateElementSchema,
} from "../../types";
import { adminMiddleware } from "../../middleware/admin";

export const adminRouter = Router();

// Add new element
adminRouter.post("/element", adminMiddleware, async (req, res) => {
  const parsedData = CreateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const { imageUrl, width, height, static: isStatic } = parsedData.data;
  try {
    const element = await client.element.create({
      data: {
        imageUrl,
        width,
        height,
        static: isStatic,
      },
    });
    res.status(200).json({ id: element.id });
  } catch (error) {
    res.status(400).json({ message: "Failed to add element" });
  }
});

// Update element
adminRouter.put("/element/:elementId", adminMiddleware, async (req, res) => {
  const parsedData = UpdateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const { imageUrl } = parsedData.data;
  await client.element.update({
    where: { id: req.params.elementId },
    data: { imageUrl },
  });
  res.status(200).json({ message: "Element updated successfully" });
});

// Add new Avatar
adminRouter.post("/avatar",adminMiddleware, async (req, res) => {
  const parsedData = CreateAvatarSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const avatar = await client.avatar.create({
    data: {
      name: parsedData.data.name,
      imageUrl: parsedData.data.imageUrl,
    },
  });
  res.json({ avatarId: avatar.id });
});

// Create new map
adminRouter.post("/map", adminMiddleware, async (req, res) => {
  const parsedData = CreateMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const { name, thumbnail, dimensions, defaultElements } = parsedData.data;
  const map = await client.map.create({
    data: {
      name,
      thumbnail,
      width: parseInt(dimensions.split("x")[0]),
      height: parseInt(dimensions.split("x")[1]),
      mapElements: {
        create: defaultElements.map((element) => ({
          elementId: element.elementId,
          x: element.x,
          y: element.y,
        })),
      },
    },
  });
  res.status(200).json({ id: map.id });
});
