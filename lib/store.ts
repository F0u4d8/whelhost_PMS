import { create } from "zustand";

// Types
export interface Unit {
  id: string;
  number: string;
  name: string;
  status: "occupied" | "vacant" | "out-of-service" | "departure-today" | "arrival-today";
  guest?: string;
  checkIn?: string;
  checkOut?: string;
  balance?: number;
  type?: string;
  floor?: string;
  pricePerNight?: number;
  propertyId?: string;
}

export interface Guest {
  id: string;
  name: string;
  nationality: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
  reservations: number;
}

export interface Reservation {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  unit: string;
  guest: string;
  pricePerNight: number;
  total: number;
  paid: number;
  balance: number;
  status: "active" | "paid" | "upcoming" | "completed" | "cancelled";
  channel?: string;
  externalId?: string;
}

export interface Invoice {
  id: string;
  date: string;
  guest: string;
  contractNumber: string;
  subtotal: number;
  vat: number;
  total: number;
  status: "paid" | "pending" | "overdue";
}

export interface Receipt {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  method: string;
  reservationNumber: string;
  notes: string;
  user: string;
}

export interface PaymentLink {
  id: string;
  createdAt: string;
  amount: number;
  description: string;
  status: "active" | "paid" | "expired";
  expiresAt: string;
  url: string;
}

export interface Property {
  id: string;
  name: string;
  nameAr: string;
  type: "hotel" | "apartments" | "resort" | "villa";
  address: string;
  city: string;
  country: string;
  unitsCount: number;
  status: "active" | "inactive";
  channelConnected: boolean;
  image?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: "guest" | "staff";
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  guestId: string;
  guestName: string;
  reservationId?: string;
  channel: "direct" | "booking" | "airbnb" | "whatsapp" | "email";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "open" | "resolved" | "pending";
}

export interface SmartLock {
  id: string;
  unitId: string;
  unitNumber: string;
  provider: "ttlock" | "yale" | "august" | "schlage";
  deviceId: string;
  status: "online" | "offline" | "low-battery";
  batteryLevel: number;
  lastSync: string;
}

export interface AccessKey {
  id: string;
  lockId: string;
  reservationId: string;
  guestName: string;
  code: string;
  validFrom: string;
  validTo: string;
  status: "active" | "expired" | "revoked";
  usageCount: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: "cleaning" | "maintenance" | "inspection" | "other";
  unitId?: string;
  unitNumber?: string;
  assignedTo: string;
  dueDate: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export interface OwnerStatement {
  id: string;
  ownerId: string;
  ownerName: string;
  period: string;
  totalRevenue: number;
  expenses: number;
  commission: number;
  netPayout: number;
  status: "draft" | "sent" | "paid";
  createdAt: string;
}

// Store Interface
interface PMSStore {
  units: Unit[];
  guests: Guest[];
  reservations: Reservation[];
  invoices: Invoice[];
  receipts: Receipt[];
  paymentLinks: PaymentLink[];
  properties: Property[];
  conversations: Conversation[];
  messages: Message[];
  smartLocks: SmartLock[];
  accessKeys: AccessKey[];
  tasks: Task[];
  ownerStatements: OwnerStatement[];

  // Initialization
  loadData: (data: {
    units: Unit[];
    guests: Guest[];
    reservations: Reservation[];
    invoices: Invoice[];
    receipts: Receipt[];
    paymentLinks: PaymentLink[];
    properties: Property[];
    conversations: Conversation[];
    messages: Message[];
    smartLocks: SmartLock[];
    accessKeys: AccessKey[];
    tasks: Task[];
    ownerStatements: OwnerStatement[];
  }) => void;

  // Unit actions
  addUnit: (unit: Omit<Unit, "id">) => void;
  updateUnit: (id: string, unit: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;

  // Guest actions
  addGuest: (guest: Omit<Guest, "id">) => void;
  updateGuest: (id: string, guest: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;

  // Reservation actions
  addReservation: (reservation: Omit<Reservation, "id">) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;

  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, "id">) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Receipt actions
  addReceipt: (receipt: Omit<Receipt, "id">) => void;
  updateReceipt: (id: string, receipt: Partial<Receipt>) => void;
  deleteReceipt: (id: string) => void;

  // Payment Link actions
  addPaymentLink: (link: Omit<PaymentLink, "id">) => void;
  updatePaymentLink: (id: string, link: Partial<PaymentLink>) => void;
  deletePaymentLink: (id: string) => void;

  // Property actions
  addProperty: (property: Omit<Property, "id">) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // Conversation actions
  addConversation: (conversation: Omit<Conversation, "id">) => void;
  updateConversation: (id: string, conversation: Partial<Conversation>) => void;
  markConversationRead: (id: string) => void;

  // Message actions
  addMessage: (message: Omit<Message, "id">) => void;

  // Smart Lock actions
  addSmartLock: (lock: Omit<SmartLock, "id">) => void;
  updateSmartLock: (id: string, lock: Partial<SmartLock>) => void;
  deleteSmartLock: (id: string) => void;

  // Access Key actions
  addAccessKey: (key: Omit<AccessKey, "id">) => void;
  updateAccessKey: (id: string, key: Partial<AccessKey>) => void;
  revokeAccessKey: (id: string) => void;

  // Task actions
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Owner Statement actions
  addOwnerStatement: (statement: Omit<OwnerStatement, "id">) => void;
  updateOwnerStatement: (id: string, statement: Partial<OwnerStatement>) => void;
}

// Create a separate store that uses Supabase
export const usePMSStore = create<PMSStore>((set, get) => ({
  units: [],
  guests: [],
  reservations: [],
  invoices: [],
  receipts: [],
  paymentLinks: [],
  properties: [],
  conversations: [],
  messages: [],
  smartLocks: [],
  accessKeys: [],
  tasks: [],
  ownerStatements: [],

  loadData: (data) => {
    set({
      units: data.units,
      guests: data.guests,
      reservations: data.reservations,
      invoices: data.invoices,
      receipts: data.receipts,
      paymentLinks: data.paymentLinks,
      properties: data.properties,
      conversations: data.conversations,
      messages: data.messages,
      smartLocks: data.smartLocks,
      accessKeys: data.accessKeys,
      tasks: data.tasks,
      ownerStatements: data.ownerStatements,
    });
  },

  // Unit actions
  addUnit: (unit) =>
    set((state) => ({
      units: [...state.units, { ...unit, id: `unit-${Date.now()}` }],
    })),
  updateUnit: (id, unit) =>
    set((state) => ({
      units: state.units.map((u) => (u.id === id ? { ...u, ...unit } : u)),
    })),
  deleteUnit: (id) =>
    set((state) => ({
      units: state.units.filter((u) => u.id !== id),
    })),

  // Guest actions
  addGuest: (guest) =>
    set((state) => ({
      guests: [...state.guests, { ...guest, id: `guest-${Date.now()}` }],
    })),
  updateGuest: (id, guest) =>
    set((state) => ({
      guests: state.guests.map((g) => (g.id === id ? { ...g, ...guest } : g)),
    })),
  deleteGuest: (id) =>
    set((state) => ({
      guests: state.guests.filter((g) => g.id !== id),
    })),

  // Reservation actions
  addReservation: (reservation) =>
    set((state) => ({
      reservations: [
        ...state.reservations,
        { ...reservation, id: `RES-${String(state.reservations.length + 1).padStart(3, "0")}` },
      ],
    })),
  updateReservation: (id, reservation) =>
    set((state) => ({
      reservations: state.reservations.map((r) => (r.id === id ? { ...r, ...reservation } : r)),
    })),
  deleteReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),

  // Invoice actions
  addInvoice: (invoice) =>
    set((state) => ({
      invoices: [...state.invoices, { ...invoice, id: `INV-${String(state.invoices.length + 1).padStart(3, "0")}` }],
    })),
  updateInvoice: (id, invoice) =>
    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...invoice } : i)),
    })),
  deleteInvoice: (id) =>
    set((state) => ({
      invoices: state.invoices.filter((i) => i.id !== id),
    })),

  // Receipt actions
  addReceipt: (receipt) =>
    set((state) => ({
      receipts: [...state.receipts, { ...receipt, id: `RCP-${String(state.receipts.length + 1).padStart(3, "0")}` }],
    })),
  updateReceipt: (id, receipt) =>
    set((state) => ({
      receipts: state.receipts.map((r) => (r.id === id ? { ...r, ...receipt } : r)),
    })),
  deleteReceipt: (id) =>
    set((state) => ({
      receipts: state.receipts.filter((r) => r.id !== id),
    })),

  // Payment Link actions
  addPaymentLink: (link) =>
    set((state) => ({
      paymentLinks: [
        ...state.paymentLinks,
        { ...link, id: `PL-${String(state.paymentLinks.length + 1).padStart(3, "0")}` },
      ],
    })),
  updatePaymentLink: (id, link) =>
    set((state) => ({
      paymentLinks: state.paymentLinks.map((l) => (l.id === id ? { ...l, ...link } : l)),
    })),
  deletePaymentLink: (id) =>
    set((state) => ({
      paymentLinks: state.paymentLinks.filter((l) => l.id !== id),
    })),

  // Property actions
  addProperty: (property) =>
    set((state) => ({
      properties: [...state.properties, { ...property, id: `prop-${Date.now()}` }],
    })),
  updateProperty: (id, property) =>
    set((state) => ({
      properties: state.properties.map((p) => (p.id === id ? { ...p, ...property } : p)),
    })),
  deleteProperty: (id) =>
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    })),

  // Conversation actions
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [...state.conversations, { ...conversation, id: `conv-${Date.now()}` }],
    })),
  updateConversation: (id, conversation) =>
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, ...conversation } : c)),
    })),
  markConversationRead: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ),
      messages: state.messages.map((m) =>
        m.conversationId === id ? { ...m, read: true } : m
      ),
    })),

  // Message actions
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: `msg-${Date.now()}` }],
      conversations: state.conversations.map((c) =>
        c.id === message.conversationId
          ? {
              ...c,
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
              unreadCount: message.sender === "guest" ? c.unreadCount + 1 : c.unreadCount,
            }
          : c
      ),
    })),

  // Smart Lock actions
  addSmartLock: (lock) =>
    set((state) => ({
      smartLocks: [...state.smartLocks, { ...lock, id: `lock-${Date.now()}` }],
    })),
  updateSmartLock: (id, lock) =>
    set((state) => ({
      smartLocks: state.smartLocks.map((l) => (l.id === id ? { ...l, ...lock } : l)),
    })),
  deleteSmartLock: (id) =>
    set((state) => ({
      smartLocks: state.smartLocks.filter((l) => l.id !== id),
    })),

  // Access Key actions
  addAccessKey: (key) =>
    set((state) => ({
      accessKeys: [...state.accessKeys, { ...key, id: `key-${Date.now()}` }],
    })),
  updateAccessKey: (id, key) =>
    set((state) => ({
      accessKeys: state.accessKeys.map((k) => (k.id === id ? { ...k, ...key } : k)),
    })),
  revokeAccessKey: (id) =>
    set((state) => ({
      accessKeys: state.accessKeys.map((k) =>
        k.id === id ? { ...k, status: "revoked" as const } : k
      ),
    })),

  // Task actions
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...task, id: `task-${Date.now()}` }],
    })),
  updateTask: (id, task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  // Owner Statement actions
  addOwnerStatement: (statement) =>
    set((state) => ({
      ownerStatements: [...state.ownerStatements, { ...statement, id: `stmt-${Date.now()}` }],
    })),
  updateOwnerStatement: (id, statement) =>
    set((state) => ({
      ownerStatements: state.ownerStatements.map((s) => (s.id === id ? { ...s, ...statement } : s)),
    })),
}));