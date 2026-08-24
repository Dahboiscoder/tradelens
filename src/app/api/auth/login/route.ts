import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const genericError = NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  if (!user) return genericError;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return genericError;

  setSessionCookie(signSession(user.id));

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
  });
}
