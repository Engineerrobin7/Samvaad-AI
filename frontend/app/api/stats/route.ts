import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // Fetch stats from database
  const chats = await prisma.chat.count();
  const translations = await prisma.translation.count();
  const learnSessions = await prisma.learnSession.count();
  const stats = {
    chats,
    translations,
    learnSessions
  };
  return NextResponse.json(stats);
}