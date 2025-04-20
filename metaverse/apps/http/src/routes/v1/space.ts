import { Router } from "express";
import {
  AddElementSchema,
  CreateSpaceSchema,
  DeleteElementSchema,
} from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();

// Create a new space
spaceRouter.post("/", userMiddleware, async (req, res) => {
  const parsedData = CreateSpaceSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  if (!parsedData.data.mapId) {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimensions.split("x")[0]),
        height: parseInt(parsedData.data.dimensions.split("x")[1]),
        creatorId: req.userId!,
      },
    });
    res.status(200).json({ spaceId: space.id });
  } else {
    const map = await client.map.findUnique({
      where: {
        id: parsedData.data.mapId,
      },
      select: {
        width: true,
        height: true,
        mapElements: true,
      },
    });
    if (!map) {
      res.status(400).json({ message: "Map not found" });
      return;
    }
    const space = await client.$transaction(async () => {
      const space = await client.space.create({
        data: {
          name: parsedData.data.name,
          width: map.width,
          height: map.height,
          creatorId: req.userId!,
        },
      });

      await client.spaceElements.createMany({
        data: map.mapElements.map((element) => {
          return {
            spaceId: space.id,
            elementId: element.elementId,
            x: element.x!,
            y: element.y!,
          };
        }),
      });
      return space;
    });
    res.status(200).json({ spaceId: space.id });
  }
});

// Delete an element from the space
spaceRouter.delete("/element", userMiddleware, async (req, res) => {
  const parsedData = DeleteElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const spaceElement = await client.spaceElements.findFirst({
    where: {
      id: parsedData.data.id,
    },
    include: {
      space: {
        select: {
          creatorId: true,
        },
      }
    },
  });
  if (
    !(spaceElement?.space.creatorId) ||
    spaceElement.space.creatorId !== req.userId
  ) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
  await client.spaceElements.delete({
    where: {
      id: parsedData.data.id,
    },
  });
  res.json({ message: "Element deleted" });
});

// Delete a space
spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
  const space = await client.space.findUnique({
    where: {
      id: req.params.spaceId,
    },
    select: {
      creatorId: true,
    },
  });
  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }

  if (space.creatorId !== req.userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  await client.space.delete({
    where: {
      id: req.params.spaceId,
    },
  });
  await client.spaceElements.deleteMany({
    where: {
      spaceId: req.params.spaceId,
    },
  });
  res.json({ message: "Space deleted" });
});

// Get all spaces for a user
spaceRouter.get("/all", userMiddleware, async (req, res) => {
  const spaces = await client.space.findMany({
    where: {
      creatorId: req.userId,
    },
  });
  res.status(200).json({
    spaces: spaces.map((space) => {
      return {
        id: space.id,
        name: space.name,
        thumbnail: space.thumbnail,
        dimensions: `${space.width}x${space.height}`,
      };
    }),
  });
});

// Add an element to a space
spaceRouter.post("/element", userMiddleware, async (req, res) => {
  const parsedData = AddElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const space = await client.space.findUnique({
    where: {
      id: parsedData.data.spaceId,
    },
    select: {
      creatorId: true,
      width: true,
      height: true,
    },
  });
  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }
  if (space.creatorId !== req.userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
  const { spaceId, elementId, x, y } = parsedData.data;
  if (x < 0 || y < 0 || x > space.width || y > space.height) {
    res.status(400).json({ message: "Invalid coordinates" });
    return;
  }
  await client.spaceElements.create({
    data: {
      spaceId,
      elementId,
      x,
      y,
    },
  });
  res.status(200).json({ message: "Element added to space" });
});

// Get complete space details
spaceRouter.get("/:spaceId", async (req, res) => {
  const space = await client.space.findUnique({
    where: { id: req.params.spaceId },
    include: {
      elements: {
        include: {
          element: true,
        },
      },
    },
  });
  if (!space) {
    res.status(400).json({ message: "Space not found" });
    return;
  }
  res.status(200).json({
    space: {
      id: space.id,
      name: space.name,
      thumbnail: space.thumbnail,
      dimensions: `${space.width}x${space.height}`,
      elements: space.elements.map((element) => {
        return {
          id: element.id,
          x: element.x,
          y: element.y,
          element: {
            imageUrl: element.element.imageUrl,
            width: element.element.width,
            height: element.element.height,
            static: element.element.static,
          },
        };
      }),
    },
  });
});
