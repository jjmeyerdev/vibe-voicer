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

    const clients = await db.client.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        invoices: {
          select: {
            id: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate additional fields for each client
    const clientsWithStats = clients.map(client => {
      const totalValue = client.invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0)
      const invoiceCount = client.invoices.length
      
      return {
        ...client,
        totalValue,
        invoiceCount,
        // Remove the invoices array since we only needed it for calculations
        invoices: undefined,
      }
    })

    return NextResponse.json(clientsWithStats)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, address, city, state, zipCode, country } = body

    const client = await db.client.create({
      data: {
        userId: session.user.id,
        name,
        email: email ? email : null,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}
