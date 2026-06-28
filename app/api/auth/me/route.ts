import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getMerchantById, getSuperAdminByEmail, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await initDatabase();
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    if (session.role === 'superadmin') {
      const admin = await getSuperAdminByEmail(session.email);
      if (!admin) {
        return NextResponse.json({ error: 'Yönetici bulunamadı.' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        user: {
          email: admin.email,
          role: 'superadmin'
        }
      });
    } else {
      const merchant = await getMerchantById(session.id);
      if (!merchant) {
        return NextResponse.json({ error: 'Toptancı bulunamadı.' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        user: {
          id: merchant.id,
          businessName: merchant.businessName,
          ownerName: merchant.ownerName,
          email: merchant.email,
          phone: merchant.phone,
          isApproved: merchant.isApproved,
          subscriptionStatus: merchant.subscriptionStatus,
          role: 'merchant'
        }
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Post to /api/auth/me logout
  const response = NextResponse.json({ success: true, message: 'Çıkış yapıldı.' });
  response.cookies.delete('fs_token');
  return response;
}
