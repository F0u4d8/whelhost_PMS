// API layer for PMS operations that works with Supabase
// This file is used in client components, so we use the client Supabase instance
import { createClient } from '@/lib/supabase/client';

// Helper functions to convert between camelCase (JS) and snake_case (DB)
const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
};

const convertKeysToSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnake);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnake(key);
      acc[snakeKey] = convertKeysToSnake(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

const convertKeysToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamel);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key);
      acc[camelKey] = convertKeysToCamel(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// API Functions
export const pmsApi = {
  async initializeData() {
    try {
      const supabase = await createClient();

      const [unitsRes, guestsRes, reservationsRes, invoicesRes, receiptsRes,
             paymentLinksRes, propertiesRes, conversationsRes, messagesRes,
             smartLocksRes, tasksRes, ownerStatementsRes] = await Promise.all([
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
        supabase.from('owner_statements').select('*'),
      ]);

      // Convert snake_case DB fields to camelCase
      const data = {
        units: unitsRes.data ? unitsRes.data.map(convertKeysToCamel) : [],
        guests: guestsRes.data ? guestsRes.data.map(convertKeysToCamel) : [],
        reservations: reservationsRes.data ? reservationsRes.data.map(convertKeysToCamel) : [],
        invoices: invoicesRes.data ? invoicesRes.data.map(convertKeysToCamel) : [],
        receipts: receiptsRes.data ? receiptsRes.data.map(convertKeysToCamel) : [],
        paymentLinks: paymentLinksRes.data ? paymentLinksRes.data.map(convertKeysToCamel) : [],
        properties: propertiesRes.data ? propertiesRes.data.map(convertKeysToCamel) : [],
        conversations: conversationsRes.data ? conversationsRes.data.map(convertKeysToCamel) : [],
        messages: messagesRes.data ? messagesRes.data.map(convertKeysToCamel) : [],
        smartLocks: smartLocksRes.data ? smartLocksRes.data.map(convertKeysToCamel) : [],
        tasks: tasksRes.data ? tasksRes.data.map(convertKeysToCamel) : [],
        ownerStatements: ownerStatementsRes.data ? ownerStatementsRes.data.map(convertKeysToCamel) : [],
      };

      return data;
    } catch (error) {
      console.error('Error initializing PMS data:', error);
      return {
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
        tasks: [],
        ownerStatements: [],
      };
    }
  },

  async addGuest(guest: any) {
    try {
      const supabase = await createClient();
      const guestForDB = convertKeysToSnake({ ...guest, id: `guest-${Date.now()}` });

      const { data, error } = await supabase
        .from('guests')
        .insert([guestForDB])
        .select()
        .single();

      if (error) throw error;

      return convertKeysToCamel(data);
    } catch (error) {
      console.error('Error adding guest:', error);
      return null;
    }
  },

  async updateGuest(id: string, guest: any) {
    try {
      const supabase = await createClient();
      const guestForDB = convertKeysToSnake(guest);

      const { data, error } = await supabase
        .from('guests')
        .update(guestForDB)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return convertKeysToCamel(data);
    } catch (error) {
      console.error('Error updating guest:', error);
      return null;
    }
  },

  async deleteGuest(id: string) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting guest:', error);
      return false;
    }
  },

  async addReservation(reservation: any) {
    try {
      const supabase = await createClient();
      const reservationForDB = convertKeysToSnake({ ...reservation, id: `RES-${Date.now()}` });

      const { data, error } = await supabase
        .from('reservations')
        .insert([reservationForDB])
        .select()
        .single();

      if (error) throw error;

      return convertKeysToCamel(data);
    } catch (error) {
      console.error('Error adding reservation:', error);
      return null;
    }
  },

  async updateReservation(id: string, reservation: any) {
    try {
      const supabase = await createClient();
      const reservationForDB = convertKeysToSnake(reservation);

      const { data, error } = await supabase
        .from('reservations')
        .update(reservationForDB)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return convertKeysToCamel(data);
    } catch (error) {
      console.error('Error updating reservation:', error);
      return null;
    }
  },

  async deleteReservation(id: string) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      return false;
    }
  },

  // Similar functions for other entities...
};