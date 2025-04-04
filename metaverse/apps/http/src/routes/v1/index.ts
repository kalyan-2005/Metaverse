import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { SignInSchema, SignupSchema } from "../../types";
import client from "@repo/db/client";
import { hash, compare } from "../../scrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../config";

export const router = Router();

router.post("/signup", async (req, res) => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  const hashedPassword = await hash(parsedData.data.password);
  try {
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        password: hashedPassword,
        role: parsedData.data.type === "admin" ? "Admin" : "User",
      },
    });
    res.status(200).json({ userId: user.id });
  } catch (error) {
    res.status(400).json({ message: "User already exists" });
  }
});

router.post("/signin", async (req, res) => {
  const parsedData = SignInSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  try {
    const user = await client.user.findUnique({
      where: { username: parsedData.data.username },
    });
    if (!user) {
      res.status(403).json({ message: "User not found" });
      return;
    }
    const isValidPassword = await compare(
      parsedData.data.password,
      user.password
    );
    if (!isValidPassword) {
      res.status(403).json({ message: "Invalid password" });
      return;
    }
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_PASSWORD
    );
    res.json({ token: token });
  } catch (error) {
    res.status(400).json({ message: "Validation failed" });
  }
});

router.get("/elements", async (req, res) => {
  const elements = await client.element.findMany();
  res.json({
    elements: elements.map((element) => {
      return {
        id: element.id,
        imageUrl: element.imageUrl,
        width: element.width,
        height: element.height,
        static: element.static,
      };
    }),
  });
});

router.get("/avatars", async (req, res) => {
  const avatars = await client.avatar.findMany();
  res.json({
    avatars: avatars.map((avatar) => {
      return {
        id: avatar.id,
        name: avatar.name,
        imageUrl: avatar.imageUrl,
      };
    }),
  });
});

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
