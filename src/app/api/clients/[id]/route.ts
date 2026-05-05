import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { InvoiceStatus, Prisma } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const client = await db.client.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        invoices: {
          where: {
            userId: session.user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Calculate stats for the client
    const totalValue = client.invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0)
    const paidValue = client.invoices
      .filter(invoice => invoice.status === "PAID")
      .reduce((sum, invoice) => sum + Number(invoice.total), 0)
      const pendingValue = client.invoices
      .filter(inv => inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.SENT)
      .reduce((sum, inv) => sum + Number(inv.total), 0)

    const clientWithStats = {
      ...client,
      totalValue,
      paidValue,
      pendingValue,
      invoiceCount: client.invoices.length,
    }

    return NextResponse.json(clientWithStats)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, phone, address, city, state, zipCode, country } = body

    // Check if client exists and user has access
    const existingClient = await db.client.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const client = await db.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    // Check if client exists and user has access
    const existingClient = await db.client.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    try {
      await db.client.delete({
        where: { id },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        return NextResponse.json(
          {
            error:
              "This client still has invoices. Delete or reassign them first.",
          },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Error deleting client:", error)
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    )
  }
}
