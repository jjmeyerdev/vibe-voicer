import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user and settings
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      fullName: user.name || "",
      email: user.email || "",
      phone: user.settings?.phone || "",
      address: user.settings?.address || "",
      city: user.settings?.city || "",
      state: user.settings?.state || "",
      zipCode: user.settings?.zipCode || "",
      country: user.settings?.country || ""
    })
  } catch (error) {
    console.error("Error fetching personal settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch personal settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, email, phone, address, city, state, zipCode, country } = body

    const trimmedName = typeof fullName === "string" ? fullName.trim() : ""
    if (!trimmedName) {
      return NextResponse.json({ error: "Name can’t be empty." }, { status: 400 })
    }

    const trimmedEmail = typeof email === "string" ? email.trim() : ""
    if (!trimmedEmail) {
      return NextResponse.json({ error: "Email can’t be empty." }, { status: 400 })
    }
    // Lightweight email shape check — auth providers will enforce more strictly.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ error: "That doesn’t look like a valid email." }, { status: 400 })
    }

    // Update user basic info
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: trimmedName,
        email: trimmedEmail,
      }
    })

    // Update or create user settings
    await db.settings.upsert({
      where: { userId: session.user.id },
      update: {
        phone: phone || "",
        address: address || "",
        city: city || "",
        state: state || "",
        zipCode: zipCode || "",
        country: country || ""
      },
      create: {
        userId: session.user.id,
        phone: phone || "",
        address: address || "",
        city: city || "",
        state: state || "",
        zipCode: zipCode || "",
        country: country || ""
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating personal settings:", error)
    return NextResponse.json(
      { error: "Failed to update personal settings" },
      { status: 500 }
    )
  }
}
