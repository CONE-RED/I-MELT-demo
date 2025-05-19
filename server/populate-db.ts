import { db } from "./db";
import { heats, buckets, stages, additives, chemistry } from "@shared/schema";

// Data matching exactly with the Markdown tables provided
async function populateSampleData() {
  try {
    console.log("Checking if data already exists...");
    const existingHeats = await db.select().from(heats).where(({ heatNumber }) => heatNumber.eq(93378));
    
    if (existingHeats.length > 0) {
      console.log("Sample data already exists in the database.");
      return;
    }

    console.log("Populating database with sample data...");
    
    // Insert Heat record
    const [heat] = await db.insert(heats).values({
      heatNumber: 93378,
      ts: new Date("2019-01-13T03:00:11.000Z"),
      grade: "13KhFA/9",
      master: "Ivanov",
      operator: "Petrov",
      modelStatus: "idle",
      confidence: 85,
      data: {},
    }).returning();
    
    // Insert Bucket records
    const [bucket1] = await db.insert(buckets).values({
      heatId: heat.id,
      bucketNumber: 1,
      totalWeight: 101.3,
      data: {
        materials: [
          { name: "Scrap 3AZhD", weight: 9.7, percentage: 9.6 },
          { name: "Scrap 25A", weight: 5.8, percentage: 5.7 },
          { name: "Scrap 3AN", weight: 76.1, percentage: 75.1 },
          { name: "Turnings 15A", weight: 4.2, percentage: 4.1 },
          { name: "Anthracite", weight: 0.8, percentage: 0.8 },
          { name: "HBI (briquetted DRI)", weight: 4.7, percentage: 4.6 }
        ]
      },
    }).returning();
    
    const [bucket2] = await db.insert(buckets).values({
      heatId: heat.id,
      bucketNumber: 2,
      totalWeight: 56.1,
      data: {
        materials: [
          { name: "Scrap 3AZhD", weight: 9.9, percentage: 17.6 },
          { name: "Scrap 3AN", weight: 39.5, percentage: 70.4 },
          { name: "Turnings 15A", weight: 5.9, percentage: 10.5 },
          { name: "Anthracite", weight: 0.8, percentage: 1.4 }
        ]
      },
    }).returning();
    
    // Insert Stage records (matching the operating schedule table)
    await db.insert(stages).values([
      { heatId: heat.id, bucketId: bucket1.id, stageNumber: 10, plannedEnergy: 0.38, actualEnergy: 0.38, plannedTime: "00:24", actualTime: "00:23", profile: 3, temp: null, status: "done" },
      { heatId: heat.id, bucketId: bucket1.id, stageNumber: 12, plannedEnergy: 0.19, actualEnergy: 0.20, plannedTime: "00:09", actualTime: "00:10", profile: 3, temp: null, status: "done" },
      { heatId: heat.id, bucketId: bucket1.id, stageNumber: 14, plannedEnergy: 0.20, actualEnergy: 0.20, plannedTime: "00:09", actualTime: "00:10", profile: 3, temp: null, status: "done" },
      { heatId: heat.id, bucketId: bucket1.id, stageNumber: 15, plannedEnergy: 0.18, actualEnergy: null, plannedTime: "00:09", actualTime: null, profile: 5, temp: null, status: "current" },
      { heatId: heat.id, bucketId: bucket1.id, stageNumber: 16, plannedEnergy: 0.20, actualEnergy: null, plannedTime: "00:08", actualTime: null, profile: 5, temp: null, status: "planned" },
      { heatId: heat.id, bucketId: bucket1.id, stageNumber: 18, plannedEnergy: 20.02, actualEnergy: null, plannedTime: "15:31", actualTime: null, profile: 5, temp: null, status: "planned" },
      { heatId: heat.id, bucketId: bucket2.id, stageNumber: 10, plannedEnergy: 0.389, actualEnergy: null, plannedTime: "00:24", actualTime: null, profile: 4, temp: null, status: "planned" },
      { heatId: heat.id, bucketId: bucket2.id, stageNumber: 12, plannedEnergy: 0.21, actualEnergy: null, plannedTime: "00:09", actualTime: null, profile: 4, temp: null, status: "planned" },
      { heatId: heat.id, bucketId: bucket2.id, stageNumber: 14, plannedEnergy: 0.20, actualEnergy: null, plannedTime: "00:09", actualTime: null, profile: 4, temp: null, status: "planned" },
      { heatId: heat.id, bucketId: bucket2.id, stageNumber: 15, plannedEnergy: 0.18, actualEnergy: null, plannedTime: "00:09", actualTime: null, profile: 4, temp: null, status: "planned" },
      { heatId: heat.id, bucketId: bucket2.id, stageNumber: 16, plannedEnergy: 0.20, actualEnergy: null, plannedTime: "00:08", actualTime: null, profile: 5, temp: null, status: "planned" },
      { heatId: heat.id, bucketId: bucket2.id, stageNumber: 18, plannedEnergy: 9.05, actualEnergy: null, plannedTime: "00:08", actualTime: null, profile: 5, temp: null, status: "planned" },
      { heatId: heat.id, bucketId: bucket2.id, stageNumber: 18, plannedEnergy: 0.37, actualEnergy: null, plannedTime: "00:06", actualTime: null, profile: 5, temp: null, status: "planned" },
      { heatId: heat.id, bucketId: bucket2.id, stageNumber: 17, plannedEnergy: 23.4, actualEnergy: null, plannedTime: "00:16:42", actualTime: null, profile: 3, temp: 1590, status: "planned" }
    ]);
    
    // Insert Additives (matching the furnace additives table)
    await db.insert(additives).values([
      { heatId: heat.id, bucketId: bucket1.id, stageId: 0, name: "Lime 3-80 mm", weight: 3002, energy: 16.8 },
      { heatId: heat.id, bucketId: bucket2.id, stageId: 0, name: "Anthracite", weight: 706, energy: 31.0 },
      { heatId: heat.id, bucketId: bucket2.id, stageId: 0, name: "Lime 3-80 mm", weight: 3006, energy: 31.0 },
      { heatId: heat.id, bucketId: bucket2.id, stageId: 0, name: "Magma", weight: 606, energy: 44.8 },
      { heatId: heat.id, bucketId: bucket2.id, stageId: 0, name: "Magma", weight: 1000, energy: 50.4 }
    ]);
    
    // Insert Chemistry data (steel and slag chemistry)
    await db.insert(chemistry).values([
      { 
        heatId: heat.id, 
        type: "steel", 
        data: {
          "C": 0.090,
          "Mn": 0.140,
          "Si": 0.000,
          "P": 0.004,
          "S": 0.029,
          "Cr": 0.100,
          "Cu": 0.190,
          "Ni": 0.120,
          "V": null,
          "Mo": 0.027,
          "N2": null,
          "Sn": null
        }
      },
      {
        heatId: heat.id,
        type: "slag",
        data: {
          "CaO": 0.090,
          "SiO2": 0.140,
          "P2O5": 0.000,
          "Cr2O3": 0.004,
          "FeO": 0.029,
          "MnO": 0.100,
          "MgO": 0.190,
          "Al2O3": 0.120,
          "S": null,
          "Mo": 0.027,
          "N2": null,
          "Basicity": null
        }
      }
    ]);

    console.log("Sample data populated successfully!");
  } catch (error) {
    console.error("Error populating sample data:", error);
  }
}

// Run the function
populateSampleData()
  .then(() => console.log("Database population complete"))
  .catch((error) => {
    console.error("Failed to populate data:", error);
  });

export default populateSampleData;