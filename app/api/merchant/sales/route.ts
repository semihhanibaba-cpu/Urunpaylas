import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getFlashSalesByMerchant, createFlashSale, getFlashSaleBySlug, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await initDatabase();
    const session = getSession(req);
    if (!session || session.role !== 'merchant') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yoktur.' }, { status: 403 });
    }

    const sales = await getFlashSalesByMerchant(session.id);
    return NextResponse.json({ success: true, sales });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const session = getSession(req);
    if (!session || session.role !== 'merchant') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yoktur.' }, { status: 403 });
    }

    const { title, productImage, price, totalStock, unitType } = await req.json();

    if (!title || !price || !totalStock || !unitType) {
      return NextResponse.json({ error: 'Lütfen zorunlu alanları (Ürün adı, fiyat, stok adeti, birim) doldurunuz.' }, { status: 400 });
    }

    // Generate unique slug
    // Let's create an elegant URL-friendly slug
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9ğüşıöç]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let uniqueSlug = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const randNum = Math.floor(100 + Math.random() * 900); // 3-digit number like 742
      uniqueSlug = cleanTitle ? `${cleanTitle}-${randNum}` : `firsat-${randNum}`;
      
      const existing = await getFlashSaleBySlug(uniqueSlug);
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      uniqueSlug = `firsat-${Date.now()}`;
    }

    const sale = await createFlashSale({
      merchantId: session.id,
      title,
      productImage: productImage || 'https://picsum.photos/seed/flashstock/400/300',
      price: Number(price),
      totalStock: Number(totalStock),
      unitType,
      uniqueSlug
    });

    return NextResponse.json({
      success: true,
      message: 'Flaş Satış başarıyla başlatıldı!',
      sale
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
