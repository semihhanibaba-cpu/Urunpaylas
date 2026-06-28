import { NextRequest, NextResponse } from 'next/server';
import { getMerchantByEmail, createMerchant, initDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const { businessName, ownerName, email, password, phone } = await req.json();

    if (!businessName || !ownerName || !email || !password || !phone) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurunuz.' }, { status: 400 });
    }

    const existingMerchant = await getMerchantByEmail(email);
    if (existingMerchant) {
      return NextResponse.json({ error: 'Bu e-posta adresiyle zaten kayıtlı bir satıcı var.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const merchant = await createMerchant({
      businessName,
      ownerName,
      email,
      passwordHash,
      phone
    });

    return NextResponse.json({
      success: true,
      message: 'Kayıt işleminiz başarıyla tamamlandı. Hesabınız admin onayından sonra aktif edilecektir.',
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        email: merchant.email
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
