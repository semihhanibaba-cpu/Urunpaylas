import { NextRequest, NextResponse } from 'next/server';
import { placeOrder, initDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const { flashSaleId, customerBusinessName, customerName, customerPhone, quantity } = await req.json();

    if (!flashSaleId || !customerBusinessName || !customerName || !customerPhone || !quantity) {
      return NextResponse.json({ error: 'Lütfen sipariş formundaki tüm alanları doldurunuz.' }, { status: 400 });
    }

    const result = await placeOrder({
      flashSaleId,
      customerBusinessName,
      customerName,
      customerPhone,
      quantity: Number(quantity)
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      order: result.order
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
