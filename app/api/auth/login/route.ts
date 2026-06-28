import { NextRequest, NextResponse } from 'next/server';
import { getMerchantByEmail, getSuperAdminByEmail, initDatabase } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre alanları zorunludur.' }, { status: 400 });
    }

    // 1. Check if SuperAdmin
    const superAdmin = await getSuperAdminByEmail(email);
    if (superAdmin && superAdmin.password) {
      const isMatch = await bcrypt.compare(password, superAdmin.password);
      if (isMatch) {
        const token = signToken({
          id: superAdmin.id || 'admin-default',
          email: superAdmin.email,
          role: 'superadmin'
        });

        const response = NextResponse.json({
          success: true,
          role: 'superadmin',
          token,
          user: {
            email: superAdmin.email,
            role: 'superadmin'
          }
        });

        // Set token in httpOnly cookie
        response.cookies.set('fs_token', token, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax'
        });

        return response;
      }
    }

    // 2. Check if Merchant
    const merchant = await getMerchantByEmail(email);
    if (merchant && merchant.password) {
      const isMatch = await bcrypt.compare(password, merchant.password);
      if (isMatch) {
        // Critical Rule check: MUST check approval
        if (!merchant.isApproved) {
          return NextResponse.json({
            error: 'Hesabınız henüz onaylanmamıştır, lütfen admin onayını bekleyiniz.',
            isApproved: false
          }, { status: 403 });
        }

        const token = signToken({
          id: merchant.id || '',
          email: merchant.email,
          role: 'merchant'
        });

        const response = NextResponse.json({
          success: true,
          role: 'merchant',
          token,
          user: {
            id: merchant.id,
            businessName: merchant.businessName,
            ownerName: merchant.ownerName,
            email: merchant.email,
            phone: merchant.phone,
            role: 'merchant'
          }
        });

        // Set token in httpOnly cookie
        response.cookies.set('fs_token', token, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax'
        });

        return response;
      }
    }

    return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
