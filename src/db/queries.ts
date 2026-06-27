import { eq, and } from 'drizzle-orm';
import { db } from './index.ts';
import { users, properties, deals, clients, financials } from './schema.ts';
import { Property, Deal, Client, FinancialEntry } from '../types.ts';

// Get or create user
export async function getOrCreateUser(uid: string, email: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const inserted = await db.insert(users)
      .values({ uid, email })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw new Error("Database user synchronization failed.", { cause: error });
  }
}

// Fetch all data for user
export async function fetchUserData(userId: number) {
  try {
    const propsList = await db.select().from(properties).where(eq(properties.userId, userId));
    const dealsList = await db.select().from(deals).where(eq(deals.userId, userId));
    const clientsList = await db.select().from(clients).where(eq(clients.userId, userId));
    const financialsList = await db.select().from(financials).where(eq(financials.userId, userId));

    return {
      properties: propsList.map(p => ({
        id: p.id,
        address: p.address,
        city: p.city,
        state: p.state,
        price: p.price,
        beds: p.beds,
        baths: p.baths,
        sqft: p.sqft,
        type: p.type as any,
        status: p.status as any,
        features: p.notes ? [] : [], // We'll keep compatibility
        monthlyRent: p.monthlyRent || undefined,
        monthlyNOI: p.monthlyNOI || undefined,
        purchasePrice: p.purchasePrice || undefined,
        capRate: p.capRate || undefined,
        equityGain: p.equityGain || undefined,
        notes: p.notes || undefined,
      })),
      deals: dealsList.map(d => ({
        id: d.id,
        clientName: d.clientName,
        propertyAddress: d.propertyAddress,
        stage: d.stage as any,
        price: d.price,
        commissionRate: d.commissionRate,
        projectedCommission: d.projectedCommission,
        date: d.date,
        type: d.type as any,
      })),
      clients: clientsList.map(c => ({
        id: c.id,
        name: c.name,
        role: c.role as any,
        email: c.email,
        phone: c.phone,
        budget: c.budget,
        notes: c.notes || '',
      })),
      financialHistory: financialsList.map(f => ({
        month: f.month,
        commissionEarned: f.commissionEarned,
        projectedIncome: f.projectedIncome,
        rentalIncome: f.rentalIncome,
        noi: f.noi,
      })),
    };
  } catch (error) {
    console.error("Error in fetchUserData:", error);
    throw new Error("Database retrieval failed.", { cause: error });
  }
}

// Sync all data from client
export async function syncUserData(
  userId: number,
  data: {
    properties: Property[];
    deals: Deal[];
    clients: Client[];
    financialHistory: FinancialEntry[];
  }
) {
  try {
    // We use a simple but robust transaction-like flow or sequential cleanup to rewrite the user's specific records
    // Since this is private sandbox database per user, simple delete and insert of user's rows is clean and prevents mismatch.
    
    // Properties
    await db.delete(properties).where(eq(properties.userId, userId));
    if (data.properties.length > 0) {
      await db.insert(properties).values(
        data.properties.map(p => ({
          id: p.id,
          address: p.address,
          city: p.city,
          state: p.state,
          price: p.price,
          beds: p.beds,
          baths: p.baths,
          sqft: p.sqft,
          type: p.type,
          status: p.status,
          monthlyRent: p.monthlyRent || null,
          monthlyNOI: p.monthlyNOI || null,
          purchasePrice: p.purchasePrice || null,
          capRate: p.capRate || null,
          equityGain: p.equityGain || null,
          notes: p.notes || null,
          userId,
        }))
      );
    }

    // Deals
    await db.delete(deals).where(eq(deals.userId, userId));
    if (data.deals.length > 0) {
      await db.insert(deals).values(
        data.deals.map(d => ({
          id: d.id,
          clientName: d.clientName,
          propertyAddress: d.propertyAddress,
          stage: d.stage,
          price: d.price,
          commissionRate: d.commissionRate,
          projectedCommission: d.projectedCommission,
          date: d.date,
          type: d.type,
          userId,
        }))
      );
    }

    // Clients
    await db.delete(clients).where(eq(clients.userId, userId));
    if (data.clients.length > 0) {
      await db.insert(clients).values(
        data.clients.map(c => ({
          id: c.id,
          name: c.name,
          role: c.role,
          email: c.email,
          phone: c.phone,
          budget: c.budget,
          notes: c.notes || null,
          userId,
        }))
      );
    }

    // Financials
    await db.delete(financials).where(eq(financials.userId, userId));
    if (data.financialHistory.length > 0) {
      await db.insert(financials).values(
        data.financialHistory.map(f => ({
          month: f.month,
          commissionEarned: f.commissionEarned,
          projectedIncome: f.projectedIncome,
          rentalIncome: f.rentalIncome,
          noi: f.noi,
          userId,
        }))
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error in syncUserData:", error);
    throw new Error("Database synchronization failed.", { cause: error });
  }
}
