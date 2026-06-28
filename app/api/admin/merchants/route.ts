import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllMerchants, updateMerchantApproval, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await initDatabase();
    const session = getSession(req);
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yoktur.' }, { status: 403 });
    }

    const merchants = await getAllMerchants();
    return NextResponse.json({ success: true, merchants });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await initDatabase();
    const session = getSession(req);
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yoktur.' }, { status: 403 });
    }

    const { id, isApproved } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Toptancı ID zorunludur.' }, { status: 400 });
    }

    const success = await updateMerchantApproval(id, !!isApproved);
    if (!success) {
      return NextResponse.json({ error: 'Toptancı bulunamadı veya güncellenemedi.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: isApproved ? 'Toptancı hesabı onaylandı ve aktif edildi.' : 'Toptancı hesabı askıya alındı.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
