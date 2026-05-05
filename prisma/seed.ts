import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      id: "demo-user-id",
      email: "demo@example.com",
      name: "Demo User",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      emailVerified: true,
    },
  })

  console.log("✅ Created demo user:", user.email)

  // Create settings
  const settings = await prisma.settings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      companyName: "Vibe Voicer Inc.",
      email: "hello@vibevoicer.com",
      phone: "+1 (555) 123-4567",
      address: "123 Business Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States",
      taxRate: 8.5,
      currency: "USD",
    },
  })

  console.log("✅ Created settings for user")

  // Create clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: "client-1" },
      update: {},
      create: {
        id: "client-1",
        userId: user.id,
        name: "Acme Corporation",
        email: "billing@acme.com",
        phone: "+1 (555) 987-6543",
        address: "456 Corporate Blvd",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
      },
    }),
    prisma.client.upsert({
      where: { id: "client-2" },
      update: {},
      create: {
        id: "client-2",
        userId: user.id,
        name: "Tech Solutions LLC",
        email: "contact@techsolutions.com",
        phone: "+1 (555) 456-7890",
        address: "789 Innovation Drive",
        city: "Austin",
        state: "TX",
        zipCode: "73301",
        country: "United States",
      },
    }),
    prisma.client.upsert({
      where: { id: "client-3" },
      update: {},
      create: {
        id: "client-3",
        userId: user.id,
        name: "Design Studio Co.",
        email: "hello@designstudio.com",
        phone: "+1 (555) 321-0987",
        address: "321 Creative Lane",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        country: "United States",
      },
    }),
  ])

  console.log("✅ Created clients:", clients.length)

  // Create invoices
  const invoices = await Promise.all([
    prisma.invoice.upsert({
      where: { userId_invoiceNumber: { userId: user.id, invoiceNumber: "INV-001" } },
      update: {},
      create: {
        id: "invoice-1",
        userId: user.id,
        clientId: clients[0].id,
        invoiceNumber: "INV-001",
        publicSlug: "inv-001-acme-corp",
        status: "PAID" as const,
        issueDate: new Date("2024-01-15"),
        dueDate: new Date("2024-02-15"),
        subtotal: 5000,
        taxRate: 8.5,
        taxAmount: 425,
        total: 5425,
        notes: "Thank you for your business! Payment received.",
      },
    }),
    prisma.invoice.upsert({
      where: { userId_invoiceNumber: { userId: user.id, invoiceNumber: "INV-002" } },
      update: {},
      create: {
        id: "invoice-2",
        userId: user.id,
        clientId: clients[1].id,
        invoiceNumber: "INV-002",
        publicSlug: "inv-002-tech-solutions",
        status: "SENT" as const,
        issueDate: new Date("2024-02-01"),
        dueDate: new Date("2024-03-01"),
        subtotal: 3200,
        taxRate: 8.5,
        taxAmount: 272,
        total: 3472,
        notes: "Please remit payment within 30 days.",
      },
    }),
    prisma.invoice.upsert({
      where: { userId_invoiceNumber: { userId: user.id, invoiceNumber: "INV-003" } },
      update: {},
      create: {
        id: "invoice-3",
        userId: user.id,
        clientId: clients[2].id,
        invoiceNumber: "INV-003",
        publicSlug: "inv-003-design-studio",
        status: "OVERDUE" as const,
        issueDate: new Date("2024-01-15"),
        dueDate: new Date("2024-01-30"),
        subtotal: 1800,
        taxRate: 8.5,
        taxAmount: 153,
        total: 1953,
        notes: "This invoice is overdue. Please contact us immediately.",
      },
    }),
  ])

  console.log("✅ Created invoices:", invoices.length)

  // Create invoice items
  const invoiceItems = await Promise.all([
    // Invoice 1 items
    prisma.invoiceItem.upsert({
      where: { id: "item-1" },
      update: {},
      create: {
        id: "item-1",
        invoiceId: invoices[0].id,
        description: "Web Development Services",
        quantity: 40,
        unitPrice: 100,
        total: 4000,
      },
    }),
    prisma.invoiceItem.upsert({
      where: { id: "item-2" },
      update: {},
      create: {
        id: "item-2",
        invoiceId: invoices[0].id,
        description: "UI/UX Design",
        quantity: 10,
        unitPrice: 100,
        total: 1000,
      },
    }),
    // Invoice 2 items
    prisma.invoiceItem.upsert({
      where: { id: "item-3" },
      update: {},
      create: {
        id: "item-3",
        invoiceId: invoices[1].id,
        description: "Mobile App Development",
        quantity: 32,
        unitPrice: 100,
        total: 3200,
      },
    }),
    // Invoice 3 items
    prisma.invoiceItem.upsert({
      where: { id: "item-4" },
      update: {},
      create: {
        id: "item-4",
        invoiceId: invoices[2].id,
        description: "Logo Design",
        quantity: 1,
        unitPrice: 500,
        total: 500,
      },
    }),
    prisma.invoiceItem.upsert({
      where: { id: "item-5" },
      update: {},
      create: {
        id: "item-5",
        invoiceId: invoices[2].id,
        description: "Brand Guidelines",
        quantity: 1,
        unitPrice: 1300,
        total: 1300,
      },
    }),
  ])

  console.log("✅ Created invoice items:", invoiceItems.length)

  // Create payments
  const payments = await Promise.all([
    prisma.payment.upsert({
      where: { id: "payment-1" },
      update: {},
      create: {
        id: "payment-1",
        userId: user.id,
        invoiceId: invoices[0].id,
        amount: 5425,
        method: "BANK_TRANSFER" as const,
        status: "COMPLETED" as const,
        paidAt: new Date("2024-02-10"),
        reference: "TXN-123456789",
        notes: "Payment received via bank transfer",
      },
    }),
  ])

  console.log("✅ Created payments:", payments.length)

  console.log("🎉 Database seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
