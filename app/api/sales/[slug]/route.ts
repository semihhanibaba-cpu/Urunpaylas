import { NextRequest, NextResponse } from 'next/server';
import { getFlashSaleBySlug, getMerchantById, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await initDatabase();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug belirtilmedi.' }, { status: 400 });
    }

    const sale = await getFlashSaleBySlug(slug);
    if (!sale) {
      return NextResponse.json({ error: 'Flaş kampanya bulunamadı.' }, { status: 404 });
    }

    const merchant = await getMerchantById(sale.merchantId);
    
    return NextResponse.json({
      success: true,
      sale,
      merchant: merchant ? {
        businessName: merchant.businessName,
        phone: merchant.phone
      } : null
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
