import "dotenv/config";
import { DataSource } from "typeorm";
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
    const userRepo = manager.getRepository(User);
    const vendorRepo = manager.getRepository(Vendor);
    const locationRepo = manager.getRepository(VendorLocation);
    const driverRepo = manager.getRepository(Driver);
    const customerRepo = manager.getRepository(Customer);
    const orderRepo = manager.getRepository(Order);
    const semanticsRepo = manager.getRepository(TableSemantics);

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
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a03",
          email: "vendor2@supplynow.test",
          first_name: "Vera",
          last_name: "Vendor",
          phone: "555-0103",
          role: UserRole.VENDOR_ADMIN,
          is_active: true,
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a04",
          email: "locadmin@supplynow.test",
          first_name: "Liam",
          last_name: "Location",
          phone: "555-0104",
          role: UserRole.VENDOR_LOCATION_ADMIN,
          is_active: true,
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a05",
          email: "driver1@supplynow.test",
          first_name: "Dina",
          last_name: "Driver",
          phone: "555-0105",
          role: UserRole.DRIVER,
          is_active: true,
        },
        {
          id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a06",
          email: "driver2@supplynow.test",
          first_name: "Diego",
          last_name: "Driver",
          phone: "555-0106",
          role: UserRole.DRIVER,
          is_active: true,
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
      ],
      ["email"]
    );

    await vendorRepo.upsert(
      [
        {
          id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01",
          name: "Fresh Fields Produce",
          email: "freshfields@supplynow.test",
          phone: "555-0201",
          isActive: true,
          user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a02",
        },
        {
          id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02",
          name: "Harbor Seafood Co.",
          email: "harborsea@supplynow.test",
          phone: "555-0202",
          isActive: true,
          user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a03",
        },
        {
          id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03",
          name: "Sunrise Bakery",
          email: "sunrisebake@supplynow.test",
          phone: "555-0203",
          isActive: true,
        },
      ],
      ["email"]
    );

    await locationRepo.upsert(
      [
        {
          id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c01",
          name: "Fresh Fields - Downtown",
          address: "101 Market St",
          city: "San Francisco",
          state: "CA",
          zip: "94105",
          latitude: 37.78921,
          longitude: -122.3969,
          phone: "555-0301",
          is_active: true,
          vendorId: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01",
        },
        {
          id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c02",
          name: "Fresh Fields - Mission",
          address: "220 Valencia St",
          city: "San Francisco",
          state: "CA",
          zip: "94103",
          latitude: 37.76882,
          longitude: -122.422,
          phone: "555-0302",
          is_active: true,
          vendorId: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01",
        },
        {
          id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c03",
          name: "Harbor Seafood - Pier 39",
          address: "Pier 39",
          city: "San Francisco",
          state: "CA",
          zip: "94133",
          latitude: 37.80867,
          longitude: -122.40982,
          phone: "555-0303",
          is_active: true,
          vendorId: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02",
        },
        {
          id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c04",
          name: "Harbor Seafood - Oakland",
          address: "55 Embarcadero W",
          city: "Oakland",
          state: "CA",
          zip: "94607",
          latitude: 37.7955,
          longitude: -122.2764,
          phone: "555-0304",
          is_active: true,
          vendorId: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02",
        },
        {
          id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c05",
          name: "Sunrise Bakery - SoMa",
          address: "700 Folsom St",
          city: "San Francisco",
          state: "CA",
          zip: "94107",
          latitude: 37.78233,
          longitude: -122.39718,
          phone: "555-0305",
          is_active: true,
          vendorId: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03",
        },
        {
          id: "2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c06",
          name: "Sunrise Bakery - Daly City",
          address: "90 Mission St",
          city: "Daly City",
          state: "CA",
          zip: "94014",
          latitude: 37.70577,
          longitude: -122.47,
          phone: "555-0306",
          is_active: true,
          vendorId: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03",
        },
      ],
      ["id"]
    );

    await driverRepo.upsert(
      [
        {
          id: "3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d01",
          license_number: "D-CA-394020",
          license_expiry_date: new Date("2027-12-31"),
          vehicle_number: "CA-DRV-101",
          vehicle_type: "van",
          is_available: true,
          is_active: true,
          user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a05",
        },
        {
          id: "3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d02",
          license_number: "D-CA-482910",
          license_expiry_date: new Date("2026-08-15"),
          vehicle_number: "CA-DRV-102",
          vehicle_type: "truck",
          is_available: false,
          is_active: true,
          user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a06",
        },
        {
          id: "3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d03",
          license_number: "D-CA-553210",
          license_expiry_date: new Date("2028-05-20"),
          vehicle_number: "CA-DRV-103",
          vehicle_type: "car",
          is_available: true,
          is_active: true,
        },
      ],
      ["id"]
    );

    await customerRepo.upsert(
      [
        {
          id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e01",
          name: "Blue Bottle Cafe",
          phone: "555-0401",
          is_active: true,
          user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a07",
        },
        {
          id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e02",
          name: "Mission Bistro",
          phone: "555-0402",
          is_active: true,
          user_id: "0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a08",
        },
        {
          id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e03",
          name: "North Beach Deli",
          phone: "555-0403",
          is_active: true,
        },
        {
          id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e04",
          name: "Golden Gate Hotel",
          phone: "555-0404",
          is_active: true,
        },
      ],
      ["id"]
    );

    await orderRepo.upsert(
      [
        {
          id: "5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f01",
          order_number: "SN-100001",
          customer_id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e01",
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01",
          status: "pending",
          total_amount: 124.5,
        },
        {
          id: "5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f02",
          order_number: "SN-100002",
          customer_id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e02",
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02",
          status: "confirmed",
          total_amount: 342.1,
        },
        {
          id: "5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f03",
          order_number: "SN-100003",
          customer_id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e03",
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03",
          status: "shipped",
          total_amount: 89.99,
        },
        {
          id: "5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f04",
          order_number: "SN-100004",
          customer_id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e04",
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01",
          status: "delivered",
          total_amount: 560.0,
        },
        {
          id: "5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f05",
          order_number: "SN-100005",
          customer_id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e01",
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02",
          status: "cancelled",
          total_amount: 210.75,
        },
        {
          id: "5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f06",
          order_number: "SN-100006",
          customer_id: "4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e02",
          vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03",
          status: "pending",
          total_amount: 47.25,
        },
      ],
      ["order_number"]
    );

    await semanticsRepo.upsert(
      [
        {
          id: "6b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a1001",
          name: "users",
          type: "table",
          description: "Application users with roles",
          columns: [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "created_at",
            "updated_at",
          ],
          embed: [0.12, 0.34, 0.56],
        },
        {
          id: "6b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a1002",
          name: "vendors",
          type: "table",
          description: "Suppliers and vendors",
          columns: [
            "id",
            "name",
            "email",
            "phone",
            "isActive",
            "createdAt",
            "updatedAt",
            "user_id",
          ],
          embed: [0.22, 0.44, 0.66],
        },
        {
          id: "6b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a1003",
          name: "orders",
          type: "table",
          description: "Customer orders",
          columns: [
            "id",
            "order_number",
            "customer_id",
            "vendor_id",
            "status",
            "total_amount",
            "createdAt",
            "updatedAt",
          ],
          embed: [0.18, 0.27, 0.39],
        },
      ],
      ["id"]
    );
  });

  await dataSource.destroy();
}

seed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Seed completed.");
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error);
    process.exit(1);
  });
