import { NextResponse } from "next/server";
import { exportSalesReport } from "@/app/actions/report";

export async function GET() {
    try {
        const result = await exportSalesReport();

        if (!result.success || !result.orders) {
            return NextResponse.json(
                { error: result.error || "Failed to export" },
                { status: 500 }
            );
        }

        const { orders, summary } = result;

        // Generate HTML for PDF print
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Penjualan</title>
    <style>
        @page {
            margin: 1cm;
            size: A4;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 11px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #27272a;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0 0 8px 0;
            font-size: 24px;
            color: #27272a;
        }
        .header p {
            margin: 4px 0;
            color: #52525b;
        }
        .summary {
            background: #f4f4f5;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .summary h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #27272a;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
        }
        .summary-item.grand-total {
            grid-column: span 2;
            font-weight: bold;
            font-size: 14px;
            padding-top: 10px;
            border-top: 2px solid #27272a;
            margin-top: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #d4d4d8;
            padding: 8px;
            text-align: left;
        }
        th {
            background: #27272a;
            color: white;
            font-weight: bold;
            font-size: 10px;
        }
        td {
            font-size: 10px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #d4d4d8;
            color: #71717a;
            font-size: 9px;
            font-style: italic;
        }
        @media print {
            body {
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN PENJUALAN</h1>
        <p><strong>Gitarin - Toko Gitar Online</strong></p>
        <p>Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { 
            day: "numeric", 
            month: "long", 
            year: "numeric" 
        })}</p>
    </div>

    <div class="summary">
        <h3>RINGKASAN</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <span>Total Pesanan:</span>
                <strong>${summary.totalOrders}</strong>
            </div>
            <div class="summary-item">
                <span>Total Produk:</span>
                <strong>Rp ${summary.totalRevenue.toLocaleString("id-ID")}</strong>
            </div>
            <div class="summary-item">
                <span>Total Ongkir:</span>
                <strong>Rp ${summary.totalShipping.toLocaleString("id-ID")}</strong>
            </div>
            <div class="summary-item grand-total">
                <span>GRAND TOTAL:</span>
                <strong>Rp ${summary.grandTotal.toLocaleString("id-ID")}</strong>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 5%;">No</th>
                <th style="width: 12%;">ID Order</th>
                <th style="width: 12%;">Tanggal</th>
                <th style="width: 20%;">Customer</th>
                <th class="text-center" style="width: 8%;">Items</th>
                <th class="text-right" style="width: 14%;">Subtotal</th>
                <th class="text-right" style="width: 14%;">Ongkir</th>
                <th class="text-right" style="width: 15%;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map((order, index) => {
                const itemsTotal = order.items.reduce((sum, item) => {
                    return sum + (Number(item.price) * item.quantity);
                }, 0);
                const shipping = order.shipment ? Number(order.shipment.cost) : 0;
                const total = itemsTotal + shipping;
                
                return `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${order.id.substring(0, 8)}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString("id-ID")}</td>
                    <td>${order.user.name || "N/A"}</td>
                    <td class="text-center">${order.items.length}</td>
                    <td class="text-right">Rp ${itemsTotal.toLocaleString("id-ID")}</td>
                    <td class="text-right">Rp ${shipping.toLocaleString("id-ID")}</td>
                    <td class="text-right"><strong>Rp ${total.toLocaleString("id-ID")}</strong></td>
                </tr>
                `;
            }).join("")}
        </tbody>
    </table>

    <div class="footer">
        Dokumen ini dibuat secara otomatis oleh sistem Gitarin
    </div>

    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>
        `;

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
            },
        });
    } catch (error) {
        console.error("Error generating report:", error);
        return NextResponse.json(
            { error: "Failed to generate report" },
            { status: 500 }
        );
    }
}
