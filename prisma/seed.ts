import { PrismaClient, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to generate slug
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function main() {
    console.log('🌱 Starting seed...\n');

    // 1. Clean up Database
    console.log('🧹 Cleaning up database...');
    await prisma.passwordReset.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 3. Create Users (5 User)
    console.log('\n👤 Creating users...');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@gitarin.com',
            name: 'Admin Septian',
            password: hashedPassword,
            role: 'ADMIN'
        },
    });
    console.log('  ✓ Admin:', admin.email);

    const gudang = await prisma.user.create({
        data: {
            email: 'gudang@gitarin.com',
            name: 'Staff Gudang',
            password: hashedPassword,
            role: 'GUDANG'
        },
    });
    console.log('  ✓ Gudang:', gudang.email);

    const customers = [];
    for (let i = 1; i <= 3; i++) {
        const c = await prisma.user.create({
            data: {
                email: `customer${i}@gmail.com`,
                name: `Customer ${i}`,
                password: hashedPassword,
                role: 'CUSTOMER'
            },
        });
        customers.push(c);
        console.log('  ✓ Customer:', c.email);
    }

    // 4. Create Categories
    console.log('\n📁 Creating categories...');
    const catNames = ['Gitar Akustik', 'Gitar Elektrik', 'Bass'];
    const categories = [];
    for (const name of catNames) {
        const cat = await prisma.category.create({
            data: {
                name,
                slug: slugify(name),
                image: null
            }
        });
        categories.push(cat);
        console.log('  ✓ Category:', cat.name);
    }

    // 5. Create 15 Products
    console.log('\n🎸 Creating products...');
    const products = [];
    const guitarImages = [
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1",
        "https://images.unsplash.com/photo-1550291652-6ea9114a47b1",
        "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f",
    ];

    const productDescriptions = [
        "Gitar akustik berkualitas tinggi dengan suara yang jernih dan resonansi yang sempurna.",
        "Gitar elektrik dengan pickup premium untuk tone yang powerful.",
        "Bass dengan sustain panjang dan low-end yang dalam."
    ];

    for (let i = 0; i < 15; i++) {
        const catIdx = Math.floor(i / 5);
        const productName = `${catNames[catIdx]} Series ${i + 1}`;
        const p = await prisma.product.create({
            data: {
                name: productName,
                slug: slugify(productName) + '-' + (i + 1),
                description: productDescriptions[catIdx],
                price: 2000000 + (i * 500000),
                stock: 10,
                weight: 3000 + (i * 100),
                image: `${guitarImages[catIdx]}?auto=format&fit=crop&w=800&q=60`,
                categoryId: categories[catIdx].id
            }
        });
        products.push(p);
        console.log('  ✓ Product:', p.name);
    }

    // 6. Create 10 Orders
    console.log('\n📦 Creating orders...');
    const statuses: OrderStatus[] = [
        OrderStatus.PENDING,
        OrderStatus.DIKEMAS,
        OrderStatus.DIKIRIM,
        OrderStatus.SELESAI,
        OrderStatus.DIBATALKAN
    ];

    for (let i = 0; i < 10; i++) {
        const status = statuses[Math.floor(i / 2)];
        const order = await prisma.order.create({
            data: {
                userId: customers[i % 3].id,
                totalAmount: 0,
                status: status,
            }
        });

        let total = 0;
        for (let j = 0; j < 2; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const qty = 1;
            const productPrice = Number(product.price);

            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: product.id,
                    quantity: qty,
                    price: productPrice
                }
            });
            total += productPrice;
        }

        await prisma.order.update({
            where: { id: order.id },
            data: { totalAmount: total }
        });

        console.log(`  ✓ Order ${i + 1}:`, status);
    }

    console.log('\n================================================');
    console.log('✅ Seed completed successfully!');
    console.log('================================================');
    console.log('📊 Summary:');
    console.log('   Users: 5 (1 Admin, 1 Gudang, 3 Customers)');
    console.log('   Categories: 3');
    console.log('   Products: 15');
    console.log('   Orders: 10');
    console.log('================================================\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });