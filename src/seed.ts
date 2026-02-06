import "dotenv/config";
import { DataSource } from "typeorm";
import * as fs from 'fs';
import * as path from 'path';
import { User, UserRole } from "./entities/user.entity";
import { Vendor } from "./entities/vendor.entity";
import { VendorLocation } from "./entities/vendor-location.entity";
import { Driver } from "./entities/driver.entity";
import { Customer } from "./entities/customer.entity";
import { Order } from "./entities/order.entity";
import { TableSemantics } from "./entities/table-semantics.entity";

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "supplynow",
  entities: [
    User,
    Vendor,
    VendorLocation,
    Driver,
    Customer,
    TableSemantics,
    Order,
  ],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    await manager.query(`SET LOCAL app.role = 'super_admin';`);

    const userRepo = manager.getRepository(User);
    const vendorRepo = manager.getRepository(Vendor);
    const locationRepo = manager.getRepository(VendorLocation);
    const driverRepo = manager.getRepository(Driver);
    const customerRepo = manager.getRepository(Customer);
    const orderRepo = manager.getRepository(Order);
    const semanticsRepo = manager.getRepository(TableSemantics);

    // ---------- Users ----------
    await userRepo.upsert(
      [
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a01",
          email: "admin@supplynow.test",
          first_name: "Ava",
          last_name: "Admin",
          phone: "555-0101",
          role: UserRole.SUPER_ADMIN,
          is_active: true,
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a02",
          email: "vendor1@supplynow.test",
          first_name: "Victor",
          last_name: "Vendor",
          phone: "555-0102",
          role: UserRole.VENDOR_ADMIN,
          is_active: true,
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01",
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a03",
          email: "vendor2@supplynow.test",
          first_name: "Vera",
          last_name: "Vendor",
          phone: "555-0103",
          role: UserRole.VENDOR_ADMIN,
          is_active: true,
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02",
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a04",
          email: "locadmin@supplynow.test",
          first_name: "Liam",
          last_name: "Location",
          phone: "555-0104",
          role: UserRole.VENDOR_LOCATION_ADMIN,
          is_active: true,
          vendor_location_id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c01",
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a09",
          email: "vendor3@supplynow.test",
          first_name: "Sunny",
          last_name: "Vendor",
          phone: "555-0109",
          role: UserRole.VENDOR_ADMIN,
          is_active: true,
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03",
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a05",
          email: "driver1@supplynow.test",
          first_name: "Dina",
          last_name: "Driver",
          phone: "555-0105",
          role: UserRole.DRIVER,
          is_active: true,
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01",
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a06",
          email: "driver2@supplynow.test",
          first_name: "Diego",
          last_name: "Driver",
          phone: "555-0106",
          role: UserRole.DRIVER,
          is_active: true,
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02",
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a07",
          email: "customer1@supplynow.test",
          first_name: "Casey",
          last_name: "Customer",
          phone: "555-0107",
          role: UserRole.CUSTOMER,
          is_active: true,
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a08",
          email: "customer2@supplynow.test",
          first_name: "Carmen",
          last_name: "Customer",
          phone: "555-0108",
          role: UserRole.CUSTOMER,
          is_active: true,
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a10",
          email: "customer3@supplynow.test",
          first_name: "Noah",
          last_name: "Customer",
          phone: "555-0110",
          role: UserRole.CUSTOMER,
          is_active: true,
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a11",
          email: "customer4@supplynow.test",
          first_name: "Gina",
          last_name: "Customer",
          phone: "555-0111",
          role: UserRole.CUSTOMER,
          is_active: true,
        },
      ],
      ["email"]
    );

    // ---------- Vendors ----------
    await vendorRepo.upsert(
      [
        { id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01", name: "Fresh Fields Produce", email: "freshfields@supplynow.test", phone: "555-0201", isActive: true, user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a02" },
        { id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02", name: "Harbor Seafood Co.", email: "harborsea@supplynow.test", phone: "555-0202", isActive: true, user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a03" },
        { id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03", name: "Sunrise Bakery", email: "sunrisebake@supplynow.test", phone: "555-0203", isActive: true },
      ],
      ["email"]
    );

    // ---------- Vendor Locations ----------
    await locationRepo.upsert(
      [
        { id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c01", name: "Fresh Fields - Downtown", address: "101 Market St", city: "San Francisco", state: "CA", zip: "94105", latitude: 37.78921, longitude: -122.3969, phone: "555-0301", is_active: true, vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01" },
        { id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c02", name: "Fresh Fields - Mission", address: "220 Valencia St", city: "San Francisco", state: "CA", zip: "94103", latitude: 37.76882, longitude: -122.422, phone: "555-0302", is_active: true, vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01" },
        { id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c03", name: "Harbor Seafood - Pier 39", address: "Pier 39", city: "San Francisco", state: "CA", zip: "94133", latitude: 37.80867, longitude: -122.40982, phone: "555-0303", is_active: true, vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02" },
        { id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c04", name: "Harbor Seafood - Oakland", address: "55 Embarcadero W", city: "Oakland", state: "CA", zip: "94607", latitude: 37.7955, longitude: -122.2764, phone: "555-0304", is_active: true, vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02" },
        { id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c05", name: "Sunrise Bakery - SoMa", address: "700 Folsom St", city: "San Francisco", state: "CA", zip: "94107", latitude: 37.78233, longitude: -122.39718, phone: "555-0305", is_active: true, vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03" },
        { id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c06", name: "Sunrise Bakery - Daly City", address: "90 Mission St", city: "Daly City", state: "CA", zip: "94014", latitude: 37.70577, longitude: -122.47, phone: "555-0306", is_active: true, vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03" },
      ],
      ["id"]
    );

    // ---------- Drivers ----------
    await driverRepo.upsert(
      [
        { id: "3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d01", license_number: "D-CA-394020", license_expiry_date: new Date("2027-12-31"), vehicle_number: "CA-DRV-101", vehicle_type: "van", is_available: true, is_active: true, user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a05" },
        { id: "3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d02", license_number: "D-CA-482910", license_expiry_date: new Date("2026-08-15"), vehicle_number: "CA-DRV-102", vehicle_type: "truck", is_available: false, is_active: true, user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a06" },
        { id: "3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d03", license_number: "D-CA-553210", license_expiry_date: new Date("2028-05-20"), vehicle_number: "CA-DRV-103", vehicle_type: "car", is_available: true, is_active: true },
      ],
      ["id"]
    );

    // ---------- Customers ----------
    await customerRepo.upsert(
      [
        { id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e01", name: "Blue Bottle Cafe", phone: "555-0401", is_active: true, user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a07" },
        { id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e02", name: "Mission Bistro", phone: "555-0402", is_active: true, user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a08" },
        { id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e03", name: "North Beach Deli", phone: "555-0403", is_active: true },
        { id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e04", name: "Golden Gate Hotel", phone: "555-0404", is_active: true },
      ],
      ["id"]
    );

    // ---------- Orders (30 random orders) ----------
    const orderStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    const vendorIds = [
      "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01",
      "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02",
      "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03",
    ];
    const customerIds = [
      "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e01",
      "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e02",
      "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e03",
      "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e04",
    ];
    const driverIds = [
      "3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d01",
      "3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d02",
      "3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d03",
      null, // Some orders without assigned driver
    ];
    // Map vendor to their locations for proper RLS testing
    const vendorLocationMap: Record<string, string[]> = {
      "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01": [
        "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c01",
        "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c02",
      ],
      "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02": [
        "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c03",
        "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c04",
      ],
      "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03": [
        "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c05",
        "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c06",
      ],
    };

    const orders: any[] = [];
    for (let i = 1; i <= 30; i++) {
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const vendor_id = vendorIds[Math.floor(Math.random() * vendorIds.length)];
      const customer_id = customerIds[Math.floor(Math.random() * customerIds.length)];
      const total_amount = parseFloat((Math.random() * 500 + 20).toFixed(2));
      const driver_id = driverIds[Math.floor(Math.random() * driverIds.length)];
      
      // Get a random vendor location for this vendor
      const vendorLocations = vendorLocationMap[vendor_id];
      const vendor_location_id = vendorLocations[Math.floor(Math.random() * vendorLocations.length)];

      orders.push({
        id: `5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a${(1000 + i).toString().padStart(2, "0")}`,
        order_number: `SN-${100000 + i}`,
        customer_id,
        vendor_id,
        driver_id,
        vendor_location_id,
        status,
        total_amount,
      });
    }

    await orderRepo.upsert(orders, ["order_number"]);

    // ---------- Table Semantics ----------
    await semanticsRepo.upsert(
      [
        {
          id: "6b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a2001",
          name: "orders",
          type: "materialized_view",
          description: "CREATE MATERIALIZED VIEW pending_orders AS SELECT * FROM orders WHERE status = 'pending';",
          columns: ["status", "created_at"],
          embed: undefined,
        },
        {
          id: "6b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a2002",
          name: "orders",
          type: "materialized_view",
          description: "CREATE MATERIALIZED VIEW completed_orders AS SELECT * FROM orders WHERE status = 'completed';",
          columns: ["status", "created_at"],
          embed: undefined,
        },
      ],
      ["id"]
    );

    // ---------- Materialized Views ----------
    await manager.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS pending_orders AS
      SELECT *
      FROM orders
      WHERE status = 'pending';
    `);

    await manager.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS delivered_orders AS
      SELECT *
      FROM orders
      WHERE status = 'delivered';
    `);
  });

  await dataSource.destroy();
}

seed()
  .then(() => console.log("Seed completed."))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
