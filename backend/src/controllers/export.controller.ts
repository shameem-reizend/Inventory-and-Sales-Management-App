import { Response } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { AppDataSource } from '../config/data-source';
import { SalesOrderItem } from '../entities/SalesOrderItem';

// Helper to get revenue data
const getRevenueData = async () => {
  return await AppDataSource.getRepository(SalesOrderItem)
    .createQueryBuilder('item')
    .leftJoin('item.salesOrder', 'order')
    .leftJoin('item.product', 'product')
    .select([
      'product.name AS productName',
      'product.category AS category',
      "TO_CHAR(order.approvedAt, 'YYYY-MM') AS month",
      'SUM(item.totalPrice)::numeric AS totalRevenue',
      'SUM(item.quantity) AS totalUnitsSold'
    ])
    .where('order.status = :status AND order.isPaid = true', { status: 'approved' })
    .groupBy('product.name, product.category, TO_CHAR(order.approvedAt, \'YYYY-MM\')')
    .orderBy('month', 'DESC')
    .getRawMany();
};

// Export as PDF
export const exportRevenueAsPDF = async (_req: any, res: Response) => {
  const data = await getRevenueData();

  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=revenue_report.pdf');
  doc.pipe(res);

  doc.fontSize(18).text('Revenue Report', { align: 'center' });
  doc.moveDown();

  data.forEach((row, i) => {
    doc
      .fontSize(12)
      .text(`${i + 1}. Product: ${row.productname}, Category: ${row.category}, Month: ${row.month}`);
    doc.text(`   Units Sold: ${row.totalunitssold}, Revenue: ₹${row.totalrevenue}`);
    doc.moveDown();
  });

  doc.end();
};

// Export as Excel
export const exportRevenueAsExcel = async (_req: any, res: Response) => {
  const data = await getRevenueData();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Revenue Report');

  sheet.columns = [
    { header: 'Product', key: 'productname', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Month', key: 'month', width: 15 },
    { header: 'Units Sold', key: 'totalunitssold', width: 15 },
    { header: 'Revenue', key: 'totalrevenue', width: 15 }
  ];

  sheet.addRows(data);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=revenue_report.xlsx');

  await workbook.xlsx.write(res);
  res.end();
};
