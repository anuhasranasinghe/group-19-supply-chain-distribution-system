import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/express.js';
import * as reportService from '../services/reportService.js';

interface QuarterlyReportQuery {
  year?: number;
  quarter?: number;
}

interface DateRangeQuery {
  start_date?: string;
  end_date?: string;
}

interface MonthlyReportQuery {
  year?: number;
  month?: number;
}

export async function quarterlySales(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { year, quarter } =
      req.query as unknown as QuarterlyReportQuery;

    const data = await reportService.getQuarterlySalesReport(
      year,
      quarter
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function topProducts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { year, quarter } =
      req.query as unknown as QuarterlyReportQuery;

    const data = await reportService.getTopProductsReport(
      year,
      quarter
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}


export async function citySales(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { start_date, end_date } =
      req.query as unknown as DateRangeQuery;

    const data = await reportService.getCitySalesReport(
      start_date,
      end_date
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function routeSales(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { start_date, end_date } =
      req.query as unknown as DateRangeQuery;

    const data = await reportService.getRouteSalesReport(
      start_date,
      end_date
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function workerHours(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { start_date, end_date } =
      req.query as unknown as DateRangeQuery;

    const data = await reportService.getWorkerHoursReport(
      start_date,
      end_date
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}


export async function truckUsage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { year, month } =
      req.query as unknown as MonthlyReportQuery;

    const data = await reportService.getTruckUsageReport(
      year,
      month
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function customerOrders(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const customerId =
      req.user!.system_role === 'customer'
        ? req.user!.id
        : undefined;

    const data =
      await reportService.getCustomerOrderHistory(customerId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}