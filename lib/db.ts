import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Types representing our entities
export interface ISuperAdmin {
  id?: string;
  email: string;
  password?: string;
  createdAt: Date;
}

export interface IMerchant {
  id?: string;
  businessName: string;
  ownerName: string;
  email: string;
  password?: string;
  phone: string;
  isApproved: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired';
  createdAt: Date;
}

export interface IFlashSale {
  id?: string;
  merchantId: string;
  title: string;
  productImage: string; // Base64 or URL
  price: number;
  totalStock: number;
  remainingStock: number;
  unitType: string; // Koli, Adet, kg, vb.
  status: 'active' | 'sold_out';
  uniqueSlug: string;
  createdAt: Date;
}

export interface IOrder {
  id?: string;
  flashSaleId: string;
  merchantId: string;
  customerBusinessName: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

// Check environment to determine whether to use MONGODB or LOCAL_JSON
const MONGODB_URI = process.env.MONGODB_URI || '';
const useLocalDB = !MONGODB_URI;

const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure local directory exists
if (useLocalDB) {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const defaultData = {
      superadmins: [],
      merchants: [],
      flashsales: [],
      orders: []
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

// Local Database Lock to prevent Race Conditions on local file write
let localDbLockPromise: Promise<any> = Promise.resolve();

async function runWithLock<T>(action: () => Promise<T>): Promise<T> {
  let resolveLock: any;
  const currentLock = localDbLockPromise;
  localDbLockPromise = new Promise((resolve) => {
    resolveLock = resolve;
  });

  await currentLock;
  try {
    return await action();
  } finally {
    resolveLock();
  }
}

// Helpers for Local Database
function readLocalDB() {
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { superadmins: [], merchants: [], flashsales: [], orders: [] };
  }
}

function writeLocalDB(data: any) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Ensure at least one default SuperAdmin exists
async function seedDefaultAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  if (useLocalDB) {
    await runWithLock(async () => {
      const db = readLocalDB();
      if (db.superadmins.length === 0) {
        db.superadmins.push({
          id: 'admin-default',
          email: 'admin@flashstock.com',
          password: hashedPassword,
          createdAt: new Date().toISOString()
        });
        writeLocalDB(db);
      }
    });
  } else {
    try {
      await connectMongo();
      const existing = await MongoSuperAdmin.findOne({ email: 'admin@flashstock.com' });
      if (!existing) {
        await MongoSuperAdmin.create({
          email: 'admin@flashstock.com',
          password: hashedPassword,
          createdAt: new Date()
        });
      }
    } catch (e) {
      console.error('Failed to seed default MongoDB admin:', e);
    }
  }
}

// ---------------- MONGOOSE SCHEMAS & MODELS ----------------
const SuperAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MerchantSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  subscriptionStatus: { type: String, enum: ['trial', 'active', 'expired'], default: 'trial' },
  createdAt: { type: Date, default: Date.now }
});

const FlashSaleSchema = new mongoose.Schema({
  merchantId: { type: String, required: true },
  title: { type: String, required: true },
  productImage: { type: String, required: true }, // Base64 or relative image
  price: { type: Number, required: true },
  totalStock: { type: Number, required: true },
  remainingStock: { type: Number, required: true },
  unitType: { type: String, required: true },
  status: { type: String, enum: ['active', 'sold_out'], default: 'active' },
  uniqueSlug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  flashSaleId: { type: String, required: true },
  merchantId: { type: String, required: true },
  customerBusinessName: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const MongoSuperAdmin = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);
const MongoMerchant = mongoose.models.Merchant || mongoose.model('Merchant', MerchantSchema);
const MongoFlashSale = mongoose.models.FlashSale || mongoose.model('FlashSale', FlashSaleSchema);
const MongoOrder = mongoose.models.Order || mongoose.model('Order', OrderSchema);

let isMongoConnected = false;
async function connectMongo() {
  if (isMongoConnected) return;
  if (!MONGODB_URI) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isMongoConnected = true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

// ---------------- UNIFIED DATABASE API ----------------

export async function initDatabase() {
  await seedDefaultAdmin();
}

// --- SuperAdmin Operations ---
export async function getSuperAdminByEmail(email: string): Promise<ISuperAdmin | null> {
  if (useLocalDB) {
    const db = readLocalDB();
    const found = db.superadmins.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
    return found ? { ...found, id: found.id } : null;
  } else {
    await connectMongo();
    const found = await MongoSuperAdmin.findOne({ email: email.toLowerCase() });
    if (!found) return null;
    return { id: found._id.toString(), email: found.email, password: found.password, createdAt: found.createdAt };
  }
}

// --- Merchant Operations ---
export async function getMerchantByEmail(email: string): Promise<IMerchant | null> {
  if (useLocalDB) {
    const db = readLocalDB();
    const found = db.merchants.find((m: any) => m.email.toLowerCase() === email.toLowerCase());
    return found ? { ...found, id: found.id } : null;
  } else {
    await connectMongo();
    const found = await MongoMerchant.findOne({ email: email.toLowerCase() });
    if (!found) return null;
    return {
      id: found._id.toString(),
      businessName: found.businessName,
      ownerName: found.ownerName,
      email: found.email,
      password: found.password,
      phone: found.phone,
      isApproved: found.isApproved,
      subscriptionStatus: found.subscriptionStatus,
      createdAt: found.createdAt
    };
  }
}

export async function getMerchantById(id: string): Promise<IMerchant | null> {
  if (useLocalDB) {
    const db = readLocalDB();
    const found = db.merchants.find((m: any) => m.id === id);
    return found ? { ...found, id: found.id } : null;
  } else {
    await connectMongo();
    try {
      const found = await MongoMerchant.findById(id);
      if (!found) return null;
      return {
        id: found._id.toString(),
        businessName: found.businessName,
        ownerName: found.ownerName,
        email: found.email,
        password: found.password,
        phone: found.phone,
        isApproved: found.isApproved,
        subscriptionStatus: found.subscriptionStatus,
        createdAt: found.createdAt
      };
    } catch {
      return null;
    }
  }
}

export async function createMerchant(data: Omit<IMerchant, 'id' | 'isApproved' | 'subscriptionStatus' | 'createdAt'> & { passwordHash: string }): Promise<IMerchant> {
  if (useLocalDB) {
    return runWithLock(async () => {
      const db = readLocalDB();
      const newMerchant: IMerchant = {
        id: 'merchant-' + Math.random().toString(36).substr(2, 9),
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email.toLowerCase(),
        password: data.passwordHash,
        phone: data.phone,
        isApproved: false,
        subscriptionStatus: 'trial',
        createdAt: new Date()
      };
      db.merchants.push({
        ...newMerchant,
        createdAt: newMerchant.createdAt.toISOString()
      });
      writeLocalDB(db);
      return newMerchant;
    });
  } else {
    await connectMongo();
    const created = await MongoMerchant.create({
      businessName: data.businessName,
      ownerName: data.ownerName,
      email: data.email.toLowerCase(),
      password: data.passwordHash,
      phone: data.phone,
      isApproved: false,
      subscriptionStatus: 'trial',
      createdAt: new Date()
    });
    return {
      id: created._id.toString(),
      businessName: created.businessName,
      ownerName: created.ownerName,
      email: created.email,
      phone: created.phone,
      isApproved: created.isApproved,
      subscriptionStatus: created.subscriptionStatus,
      createdAt: created.createdAt
    };
  }
}

export async function getAllMerchants(): Promise<IMerchant[]> {
  if (useLocalDB) {
    const db = readLocalDB();
    return db.merchants.map((m: any) => ({
      ...m,
      createdAt: new Date(m.createdAt)
    }));
  } else {
    await connectMongo();
    const merchants = await MongoMerchant.find().sort({ createdAt: -1 });
    return merchants.map(m => ({
      id: m._id.toString(),
      businessName: m.businessName,
      ownerName: m.ownerName,
      email: m.email,
      phone: m.phone,
      isApproved: m.isApproved,
      subscriptionStatus: m.subscriptionStatus,
      createdAt: m.createdAt
    }));
  }
}

export async function updateMerchantApproval(id: string, isApproved: boolean): Promise<boolean> {
  if (useLocalDB) {
    return runWithLock(async () => {
      const db = readLocalDB();
      const merchantIndex = db.merchants.findIndex((m: any) => m.id === id);
      if (merchantIndex === -1) return false;
      db.merchants[merchantIndex].isApproved = isApproved;
      writeLocalDB(db);
      return true;
    });
  } else {
    await connectMongo();
    try {
      const res = await MongoMerchant.findByIdAndUpdate(id, { isApproved }, { new: true });
      return !!res;
    } catch {
      return false;
    }
  }
}

// --- Flash Sale Operations ---
export async function createFlashSale(data: Omit<IFlashSale, 'id' | 'status' | 'remainingStock' | 'createdAt'>): Promise<IFlashSale> {
  if (useLocalDB) {
    return runWithLock(async () => {
      const db = readLocalDB();
      const newSale: IFlashSale = {
        id: 'sale-' + Math.random().toString(36).substr(2, 9),
        merchantId: data.merchantId,
        title: data.title,
        productImage: data.productImage,
        price: Number(data.price),
        totalStock: Number(data.totalStock),
        remainingStock: Number(data.totalStock),
        unitType: data.unitType,
        status: 'active',
        uniqueSlug: data.uniqueSlug,
        createdAt: new Date()
      };
      db.flashsales.push({
        ...newSale,
        createdAt: newSale.createdAt.toISOString()
      });
      writeLocalDB(db);
      return newSale;
    });
  } else {
    await connectMongo();
    const created = await MongoFlashSale.create({
      merchantId: data.merchantId,
      title: data.title,
      productImage: data.productImage,
      price: Number(data.price),
      totalStock: Number(data.totalStock),
      remainingStock: Number(data.totalStock),
      unitType: data.unitType,
      status: 'active',
      uniqueSlug: data.uniqueSlug,
      createdAt: new Date()
    });
    return {
      id: created._id.toString(),
      merchantId: created.merchantId,
      title: created.title,
      productImage: created.productImage,
      price: created.price,
      totalStock: created.totalStock,
      remainingStock: created.remainingStock,
      unitType: created.unitType,
      status: created.status,
      uniqueSlug: created.uniqueSlug,
      createdAt: created.createdAt
    };
  }
}

export async function getFlashSaleBySlug(slug: string): Promise<IFlashSale | null> {
  if (useLocalDB) {
    const db = readLocalDB();
    const found = db.flashsales.find((s: any) => s.uniqueSlug === slug);
    return found ? {
      ...found,
      price: Number(found.price),
      totalStock: Number(found.totalStock),
      remainingStock: Number(found.remainingStock),
      createdAt: new Date(found.createdAt)
    } : null;
  } else {
    await connectMongo();
    const found = await MongoFlashSale.findOne({ uniqueSlug: slug });
    if (!found) return null;
    return {
      id: found._id.toString(),
      merchantId: found.merchantId,
      title: found.title,
      productImage: found.productImage,
      price: found.price,
      totalStock: found.totalStock,
      remainingStock: found.remainingStock,
      unitType: found.unitType,
      status: found.status,
      uniqueSlug: found.uniqueSlug,
      createdAt: found.createdAt
    };
  }
}

export async function getFlashSalesByMerchant(merchantId: string): Promise<IFlashSale[]> {
  if (useLocalDB) {
    const db = readLocalDB();
    return db.flashsales
      .filter((s: any) => s.merchantId === merchantId)
      .map((s: any) => ({
        ...s,
        price: Number(s.price),
        totalStock: Number(s.totalStock),
        remainingStock: Number(s.remainingStock),
        createdAt: new Date(s.createdAt)
      }))
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
  } else {
    await connectMongo();
    const sales = await MongoFlashSale.find({ merchantId }).sort({ createdAt: -1 });
    return sales.map(s => ({
      id: s._id.toString(),
      merchantId: s.merchantId,
      title: s.title,
      productImage: s.productImage,
      price: s.price,
      totalStock: s.totalStock,
      remainingStock: s.remainingStock,
      unitType: s.unitType,
      status: s.status,
      uniqueSlug: s.uniqueSlug,
      createdAt: s.createdAt
    }));
  }
}

// --- Order Operations with Atomic Race-Condition Prevention ---
export interface IOrderResult {
  success: boolean;
  message: string;
  order?: IOrder;
}

export async function placeOrder(orderData: {
  flashSaleId: string;
  customerBusinessName: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
}): Promise<IOrderResult> {
  const quantityToBuy = Number(orderData.quantity);
  if (quantityToBuy <= 0) {
    return { success: false, message: 'Geçersiz miktar.' };
  }

  if (useLocalDB) {
    // Atomic block via locking to prevent overlapping order increments/decrements
    return runWithLock(async () => {
      const db = readLocalDB();
      const saleIndex = db.flashsales.findIndex((s: any) => s.id === orderData.flashSaleId);
      if (saleIndex === -1) {
        return { success: false, message: 'İlgili flaş kampanya bulunamadı.' };
      }

      const sale = db.flashsales[saleIndex];
      const remaining = Number(sale.remainingStock);

      if (sale.status === 'sold_out' || remaining <= 0) {
        return { success: false, message: 'Bu ürünün stoğu tükenmiştir.' };
      }

      if (remaining < quantityToBuy) {
        return { success: false, message: `Yetersiz stok! En fazla ${remaining} ${sale.unitType} sipariş edebilirsiniz.` };
      }

      // Deduct stock atomically
      const newRemaining = remaining - quantityToBuy;
      db.flashsales[saleIndex].remainingStock = newRemaining;
      if (newRemaining === 0) {
        db.flashsales[saleIndex].status = 'sold_out';
      }

      const totalPrice = Number((sale.price * quantityToBuy).toFixed(2));
      const newOrder: IOrder = {
        id: 'order-' + Math.random().toString(36).substr(2, 9),
        flashSaleId: orderData.flashSaleId,
        merchantId: sale.merchantId,
        customerBusinessName: orderData.customerBusinessName,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        quantity: quantityToBuy,
        totalPrice: totalPrice,
        status: 'pending',
        createdAt: new Date()
      };

      db.orders.push({
        ...newOrder,
        createdAt: newOrder.createdAt.toISOString()
      });

      writeLocalDB(db);

      return {
        success: true,
        message: 'Siparişiniz başarıyla alınmıştır ve stok ayrılmıştır!',
        order: newOrder
      };
    });
  } else {
    await connectMongo();
    try {
      // Find and update flash sale atomically using findOneAndUpdate with $gte to prevent race conditions
      const updatedSale = await MongoFlashSale.findOneAndUpdate(
        {
          _id: orderData.flashSaleId,
          remainingStock: { $gte: quantityToBuy },
          status: 'active'
        },
        {
          $inc: { remainingStock: -quantityToBuy }
        },
        { new: true }
      );

      if (!updatedSale) {
        // Find the sale to see why it failed
        const sale = await MongoFlashSale.findById(orderData.flashSaleId);
        if (!sale) {
          return { success: false, message: 'İlgili flaş kampanya bulunamadı.' };
        }
        if (sale.remainingStock <= 0) {
          return { success: false, message: 'Bu ürünün stoğu tükenmiştir.' };
        }
        return { success: false, message: `Yetersiz stok! En fazla ${sale.remainingStock} ${sale.unitType} sipariş edebilirsiniz.` };
      }

      // If remaining stock became 0, update status to sold_out
      if (updatedSale.remainingStock === 0) {
        await MongoFlashSale.findByIdAndUpdate(orderData.flashSaleId, { status: 'sold_out' });
      }

      const totalPrice = Number((updatedSale.price * quantityToBuy).toFixed(2));
      const createdOrder = await MongoOrder.create({
        flashSaleId: orderData.flashSaleId,
        merchantId: updatedSale.merchantId,
        customerBusinessName: orderData.customerBusinessName,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        quantity: quantityToBuy,
        totalPrice: totalPrice,
        status: 'pending',
        createdAt: new Date()
      });

      return {
        success: true,
        message: 'Siparişiniz başarıyla alınmıştır ve stok ayrılmıştır!',
        order: {
          id: createdOrder._id.toString(),
          flashSaleId: createdOrder.flashSaleId,
          merchantId: createdOrder.merchantId,
          customerBusinessName: createdOrder.customerBusinessName,
          customerName: createdOrder.customerName,
          customerPhone: createdOrder.customerPhone,
          quantity: createdOrder.quantity,
          totalPrice: createdOrder.totalPrice,
          status: createdOrder.status,
          createdAt: createdOrder.createdAt
        }
      };
    } catch (err: any) {
      return { success: false, message: 'Sipariş işlemi sırasında hata oluştu: ' + err.message };
    }
  }
}

export async function getOrdersByMerchant(merchantId: string): Promise<IOrder[]> {
  if (useLocalDB) {
    const db = readLocalDB();
    return db.orders
      .filter((o: any) => o.merchantId === merchantId)
      .map((o: any) => ({
        ...o,
        createdAt: new Date(o.createdAt)
      }))
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
  } else {
    await connectMongo();
    const orders = await MongoOrder.find({ merchantId }).sort({ createdAt: -1 });
    return orders.map(o => ({
      id: o._id.toString(),
      flashSaleId: o.flashSaleId,
      merchantId: o.merchantId,
      customerBusinessName: o.customerBusinessName,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      quantity: o.quantity,
      totalPrice: o.totalPrice,
      status: o.status,
      createdAt: o.createdAt
    }));
  }
}
