import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // Fetch the 5 most recent chats
  const chats = await prisma.chat.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { message: true, createdAt: true }
  });
  return NextResponse.json({ chats });
}