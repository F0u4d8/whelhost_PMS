import { create } from "zustand";
import { createClient } from "./supabase/server";

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
  initializeData: () => Promise<void>;

  // Unit actions
  addUnit: (unit: Omit<Unit, "id">) => Promise<void>;
  updateUnit: (id: string, unit: Partial<Unit>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;

  // Guest actions
  addGuest: (guest: Omit<Guest, "id">) => Promise<void>;
  updateGuest: (id: string, guest: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;

  // Reservation actions
  addReservation: (reservation: Omit<Reservation, "id">) => Promise<void>;
  updateReservation: (id: string, reservation: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;

  // Invoice actions
  addInvoice: (invoice: Omit<Invoice, "id">) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  // Receipt actions
  addReceipt: (receipt: Omit<Receipt, "id">) => Promise<void>;
  updateReceipt: (id: string, receipt: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;

  // Payment Link actions
  addPaymentLink: (link: Omit<PaymentLink, "id">) => Promise<void>;
  updatePaymentLink: (id: string, link: Partial<PaymentLink>) => Promise<void>;
  deletePaymentLink: (id: string) => Promise<void>;

  // Property actions
  addProperty: (property: Omit<Property, "id">) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;

  // Conversation actions
  addConversation: (conversation: Omit<Conversation, "id">) => Promise<void>;
  updateConversation: (id: string, conversation: Partial<Conversation>) => Promise<void>;
  markConversationRead: (id: string) => Promise<void>;

  // Message actions
  addMessage: (message: Omit<Message, "id">) => Promise<void>;

  // Smart Lock actions
  addSmartLock: (lock: Omit<SmartLock, "id">) => Promise<void>;
  updateSmartLock: (id: string, lock: Partial<SmartLock>) => Promise<void>;
  deleteSmartLock: (id: string) => Promise<void>;

  // Access Key actions
  addAccessKey: (key: Omit<AccessKey, "id">) => Promise<void>;
  updateAccessKey: (id: string, key: Partial<AccessKey>) => Promise<void>;
  revokeAccessKey: (id: string) => Promise<void>;

  // Task actions
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Owner Statement actions
  addOwnerStatement: (statement: Omit<OwnerStatement, "id">) => Promise<void>;
  updateOwnerStatement: (id: string, statement: Partial<OwnerStatement>) => Promise<void>;
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

  initializeData: async () => {
    try {
      const supabase = await createClient();
      
      // Fetch all data from Supabase tables
      // Replace with actual table names and queries based on your schema
      const [unitsRes, guestsRes, reservationsRes, invoicesRes, receiptsRes, 
             paymentLinksRes, propertiesRes, conversationsRes, messagesRes, 
             smartLocksRes, tasksRes] = await Promise.all([
        supabase.from('units').select('*'),
        supabase.from('guests').select('*'),
        supabase.from('reservations').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('receipts').select('*'),
        supabase.from('payment_links').select('*'),
        supabase.from('properties').select('*'),
        supabase.from('conversations').select('*'),
        supabase.from('messages').select('*'),
        supabase.from('smart_locks').select('*'),
        supabase.from('tasks').select('*'),
      ]);

      // Update the store state with fetched data
      if (unitsRes.data) set({ units: unitsRes.data as Unit[] });
      if (guestsRes.data) set({ guests: guestsRes.data as Guest[] });
      if (reservationsRes.data) set({ reservations: reservationsRes.data as Reservation[] });
      if (invoicesRes.data) set({ invoices: invoicesRes.data as Invoice[] });
      if (receiptsRes.data) set({ receipts: receiptsRes.data as Receipt[] });
      if (paymentLinksRes.data) set({ paymentLinks: paymentLinksRes.data as PaymentLink[] });
      if (propertiesRes.data) set({ properties: propertiesRes.data as Property[] });
      if (conversationsRes.data) set({ conversations: conversationsRes.data as Conversation[] });
      if (messagesRes.data) set({ messages: messagesRes.data as Message[] });
      if (smartLocksRes.data) set({ smartLocks: smartLocksRes.data as SmartLock[] });
      if (tasksRes.data) set({ tasks: tasksRes.data as Task[] });
      
    } catch (error) {
      console.error('Error initializing PMS data:', error);
    }
  },

  // Unit actions
  addUnit: async (unit) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('units')
        .insert([{ ...unit, id: `unit-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ units: [...state.units, data] }));
    } catch (error) {
      console.error('Error adding unit:', error);
    }
  },
  
  updateUnit: async (id, unit) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('units')
        .update(unit)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        units: state.units.map((u) => (u.id === id ? { ...u, ...data } : u))
      }));
    } catch (error) {
      console.error('Error updating unit:', error);
    }
  },
  
  deleteUnit: async (id) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        units: state.units.filter((u) => u.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  },

  // Guest actions
  addGuest: async (guest) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('guests')
        .insert([{ ...guest, id: `guest-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ guests: [...state.guests, data] }));
    } catch (error) {
      console.error('Error adding guest:', error);
    }
  },
  
  updateGuest: async (id, guest) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('guests')
        .update(guest)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        guests: state.guests.map((g) => (g.id === id ? { ...g, ...data } : g))
      }));
    } catch (error) {
      console.error('Error updating guest:', error);
    }
  },
  
  deleteGuest: async (id) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        guests: state.guests.filter((g) => g.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting guest:', error);
    }
  },

  // Reservation actions
  addReservation: async (reservation) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('reservations')
        .insert([{ ...reservation, id: `RES-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ reservations: [...state.reservations, data] }));
    } catch (error) {
      console.error('Error adding reservation:', error);
    }
  },
  
  updateReservation: async (id, reservation) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('reservations')
        .update(reservation)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? { ...r, ...data } : r))
      }));
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  },
  
  deleteReservation: async (id) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        reservations: state.reservations.filter((r) => r.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  },

  // Invoice actions
  addInvoice: async (invoice) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('invoices')
        .insert([{ ...invoice, id: `INV-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ invoices: [...state.invoices, data] }));
    } catch (error) {
      console.error('Error adding invoice:', error);
    }
  },
  
  updateInvoice: async (id, invoice) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('invoices')
        .update(invoice)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...data } : i))
      }));
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  },
  
  deleteInvoice: async (id) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        invoices: state.invoices.filter((i) => i.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  },

  // Receipt actions
  addReceipt: async (receipt) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('receipts')
        .insert([{ ...receipt, id: `RCP-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ receipts: [...state.receipts, data] }));
    } catch (error) {
      console.error('Error adding receipt:', error);
    }
  },
  
  updateReceipt: async (id, receipt) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('receipts')
        .update(receipt)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        receipts: state.receipts.map((r) => (r.id === id ? { ...r, ...data } : r))
      }));
    } catch (error) {
      console.error('Error updating receipt:', error);
    }
  },
  
  deleteReceipt: async (id) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        receipts: state.receipts.filter((r) => r.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  },

  // Payment Link actions
  addPaymentLink: async (link) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('payment_links')
        .insert([{ ...link, id: `PL-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ paymentLinks: [...state.paymentLinks, data] }));
    } catch (error) {
      console.error('Error adding payment link:', error);
    }
  },
  
  updatePaymentLink: async (id, link) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('payment_links')
        .update(link)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        paymentLinks: state.paymentLinks.map((l) => (l.id === id ? { ...l, ...data } : l))
      }));
    } catch (error) {
      console.error('Error updating payment link:', error);
    }
  },
  
  deletePaymentLink: async (id) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('payment_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        paymentLinks: state.paymentLinks.filter((l) => l.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting payment link:', error);
    }
  },

  // Property actions
  addProperty: async (property) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('properties')
        .insert([{ ...property, id: `prop-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ properties: [...state.properties, data] }));
    } catch (error) {
      console.error('Error adding property:', error);
    }
  },
  
  updateProperty: async (id, property) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('properties')
        .update(property)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        properties: state.properties.map((p) => (p.id === id ? { ...p, ...data } : p))
      }));
    } catch (error) {
      console.error('Error updating property:', error);
    }
  },
  
  deleteProperty: async (id) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        properties: state.properties.filter((p) => p.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  },

  // Conversation actions
  addConversation: async (conversation) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ ...conversation, id: `conv-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ conversations: [...state.conversations, data] }));
    } catch (error) {
      console.error('Error adding conversation:', error);
    }
  },
  
  updateConversation: async (id, conversation) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('conversations')
        .update(conversation)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        conversations: state.conversations.map((c) => (c.id === id ? { ...c, ...data } : c))
      }));
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  },
  
  markConversationRead: async (id) => {
    try {
      const supabase = await createClient();
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', id)
        .select()
        .single();

      if (convError) throw convError;

      const { error: msgError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', id);

      if (msgError) throw msgError;
      
      set((state) => ({
        conversations: state.conversations.map((c) => 
          c.id === id ? { ...c, unreadCount: 0 } : c
        ),
        messages: state.messages.map((m) => 
          m.conversationId === id ? { ...m, read: true } : m
        )
      }));
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  },

  // Message actions
  addMessage: async (message) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('messages')
        .insert([{ ...message, id: `msg-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      // Update conversation with new message info
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .update({ 
          last_message: message.content,
          last_message_time: message.timestamp,
          unread_count: message.sender === 'guest' ? 1 : 0
        })
        .eq('id', message.conversationId)
        .select()
        .single();

      if (convError) throw convError;

      set((state) => ({
        messages: [...state.messages, data],
        conversations: state.conversations.map((c) =>
          c.id === message.conversationId
            ? {
                ...c,
                lastMessage: message.content,
                lastMessageTime: message.timestamp,
                unreadCount: message.sender === 'guest' ? c.unreadCount + 1 : c.unreadCount,
              }
            : c
        ),
      }));
    } catch (error) {
      console.error('Error adding message:', error);
    }
  },

  // Smart Lock actions
  addSmartLock: async (lock) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('smart_locks')
        .insert([{ ...lock, id: `lock-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ smartLocks: [...state.smartLocks, data] }));
    } catch (error) {
      console.error('Error adding smart lock:', error);
    }
  },
  
  updateSmartLock: async (id, lock) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('smart_locks')
        .update(lock)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        smartLocks: state.smartLocks.map((l) => (l.id === id ? { ...l, ...data } : l))
      }));
    } catch (error) {
      console.error('Error updating smart lock:', error);
    }
  },
  
  deleteSmartLock: async (id) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('smart_locks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        smartLocks: state.smartLocks.filter((l) => l.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting smart lock:', error);
    }
  },

  // Access Key actions
  addAccessKey: async (key) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('access_keys')
        .insert([{ ...key, id: `key-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ accessKeys: [...state.accessKeys, data] }));
    } catch (error) {
      console.error('Error adding access key:', error);
    }
  },
  
  updateAccessKey: async (id, key) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('access_keys')
        .update(key)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        accessKeys: state.accessKeys.map((k) => (k.id === id ? { ...k, ...data } : k))
      }));
    } catch (error) {
      console.error('Error updating access key:', error);
    }
  },
  
  revokeAccessKey: async (id) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('access_keys')
        .update({ status: 'revoked' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        accessKeys: state.accessKeys.map((k) => 
          k.id === id ? { ...k, status: 'revoked' as const } : k
        )
      }));
    } catch (error) {
      console.error('Error revoking access key:', error);
    }
  },

  // Task actions
  addTask: async (task) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, id: `task-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ tasks: [...state.tasks, data] }));
    } catch (error) {
      console.error('Error adding task:', error);
    }
  },
  
  updateTask: async (id, task) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('tasks')
        .update(task)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t))
      }));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  },
  
  deleteTask: async (id) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  },

  // Owner Statement actions
  addOwnerStatement: async (statement) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('owner_statements')
        .insert([{ ...statement, id: `stmt-${Date.now()}` }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ ownerStatements: [...state.ownerStatements, data] }));
    } catch (error) {
      console.error('Error adding owner statement:', error);
    }
  },
  
  updateOwnerStatement: async (id, statement) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('owner_statements')
        .update(statement)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        ownerStatements: state.ownerStatements.map((s) => (s.id === id ? { ...s, ...data } : s))
      }));
    } catch (error) {
      console.error('Error updating owner statement:', error);
    }
  },
}));