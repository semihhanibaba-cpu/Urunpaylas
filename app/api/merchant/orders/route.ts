import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOrdersByMerchant, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await initDatabase();
    const session = getSession(req);
    if (!session || session.role !== 'merchant') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yoktur.' }, { status: 403 });
    }

    const orders = await getOrdersByMerchant(session.id);
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
