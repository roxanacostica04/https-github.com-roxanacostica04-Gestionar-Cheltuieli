import { api } from "encore.dev/api";
import { expenseDB } from "./db";
import type { UtilityWithConsumption } from "./types";

interface ListConsumptionReadingsRequest {
  utilityId: number;
}

interface ListConsumptionReadingsResponse {
  utility: UtilityWithConsumption;
}

// Retrieves consumption readings for a utility.
export const listConsumptionReadings = api<ListConsumptionReadingsRequest, ListConsumptionReadingsResponse>(
  { expose: true, method: "GET", path: "/utilities/:utilityId/consumption" },
  async (req) => {
    const utility = await expenseDB.queryRow<UtilityWithConsumption>`
      SELECT id::INTEGER, category_id::INTEGER as "categoryId", name, description, 
             utility_type as "utilityType", config, created_at as "createdAt"
      FROM utilities 
      WHERE id = ${req.utilityId}
    `;

    if (!utility) {
      throw new Error("Utility not found");
    }

    const readings = await expenseDB.queryAll`
      SELECT id::INTEGER, utility_id::INTEGER as "utilityId", reading_date as "readingDate", 
             previous_reading::DOUBLE PRECISION as "previousReading", 
             current_reading::DOUBLE PRECISION as "currentReading", 
             consumption::DOUBLE PRECISION, unit, 
             total_amount::DOUBLE PRECISION as "totalAmount", created_at as "createdAt"
      FROM consumption_readings
      WHERE utility_id = ${req.utilityId}
      ORDER BY reading_date DESC
    `;

    const totalConsumption = readings.reduce((sum, reading) => sum + (reading.consumption || 0), 0);
    const lastReading = readings.length > 0 ? readings[0] : undefined;

    utility.consumptionReadings = readings;
    utility.totalConsumption = totalConsumption;
    utility.lastReading = lastReading;

    return { utility };
  }
);
