import { pgTable, serial, uuid, varchar, timestamp, boolean, numeric, integer, date, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'BLOCKED']);
export const companyStatusEnum = pgEnum('company_status', ['ACTIVE', 'INACTIVE', 'BLOCKED']);
export const companyTypeEnum = pgEnum('company_type', ['SUPPLIER', 'CUSTOMER', 'SUPPLIER_CUSTOMER']);
export const invoiceMaterialStatusEnum = pgEnum('invoice_material_status', ['DIVERGENT', 'CONFORMING', 'COUNTING', 'DAMAGED', 'MISSING', 'MISMATCHED', 'WAITING']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['PENDING', 'RECEIVED', 'REJECTED', 'CANCELLED', 'WAITING_INSPECTION']);
export const loadStatusEnum = pgEnum('load_status', ['Cancelled', 'Dispatched', 'Processing', 'Received', 'Rejected', 'Stored']);
export const materialConditionEnum = pgEnum('material_condition', ['NEW', 'USED']);
export const materialStatusEnum = pgEnum('material_status', ['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'DEVELOPMENT']);
export const materialUnitEnum = pgEnum('material_unit', ['BX', 'CM', 'GR', 'KG', 'LT', 'M2', 'M3', 'ML', 'MT', 'PK', 'UN']);
export const packageUnitEnum = pgEnum('package_unit', ['BX', 'BD', 'LT', 'PL', 'UN']);
export const taskStatusEnum = pgEnum('task_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const taskTypeEnum = pgEnum('task_type', ['PICKING', 'STORAGE', 'CONFERENCE', 'PACKAGING', 'SHIPPING', 'INVENTORY', 'DEMOBILIZATION']);
export const zoneTypeEnum = pgEnum('zone_type', ['PICKING', 'BULK', 'STAGING', 'RECEIVING', 'DAMAGED']);
export const serviceStatusEnum = pgEnum('service_status', ['ACTIVE', 'DEPRECATED', 'TESTING']);
export const shipmentOrderStatusEnum = pgEnum('shipment_order_status', ['OPEN', 'DELIVERED', 'CANCELLED', 'ON HOLD']);
export const shipmentOrderMaterialStatusEnum = pgEnum('shipment_order_material_status', ['MATERIAL_PICKED', 'MATERIAL_NOT_PICKED', 'MATERIAL_NOT_FOUND', 'SEPARATED', 'WAITING_SEPARATION']);

// Tables
export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  userGroupId: integer('user_group_id'),
  status: userStatusEnum('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userGroups = pgTable('user_group', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const services = pgTable('service', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 100 }),
  status: serviceStatusEnum('status').default('TESTING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const roles = pgTable('role', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  serviceId: integer('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 100 }),
});

export const userGroupRoles = pgTable('user_group_roles', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  userGroupId: integer('user_group_id').notNull().references(() => userGroups.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  write: boolean('write').default(false).notNull(),
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  write: boolean('write').default(false).notNull(),
});

export const companies = pgTable('company', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  cnpj: varchar('cnpj', { length: 14 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  status: companyStatusEnum('status').default('ACTIVE').notNull(),
  street: varchar('street', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const customerInfo = pgTable('customer_info', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const supplierInfo = pgTable('supplier_info', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const materialCategories = pgTable('material_category', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 255 }).notNull(),
  materialUnit: materialUnitEnum('material_unit').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const materials = pgTable('material', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  externalCode: varchar('external_code', { length: 255 }).notNull().unique(),
  categoryId: integer('category_id').notNull().references(() => materialCategories.id, { onDelete: 'cascade' }),
  description: varchar('description', { length: 255 }).notNull(),
  materialUnit: materialUnitEnum('material_unit').notNull(),
  status: materialStatusEnum('status').default('DEVELOPMENT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoice', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  supplierId: integer('supplier_id').notNull().references(() => supplierInfo.id),
  receivedAt: timestamp('received_at').notNull(),
  status: invoiceStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoiceItems = pgTable('invoice_item', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  materialId: integer('material_id').notNull().references(() => materials.id),
  quantity: numeric('quantity', { precision: 18, scale: 3 }).notNull(),
  totalValue: numeric('total_value', { precision: 18, scale: 2 }).notNull(),
  unitValue: numeric('unit_value', { precision: 18, scale: 6 }).generatedAlwaysAs(sql`CAST(total_value AS numeric) / CAST(quantity AS numeric)`).notNull(),
  status: invoiceMaterialStatusEnum('status').default('WAITING').notNull(),
  remark: varchar('remark', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const costCenters = pgTable('cost_center', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  idExternal: varchar('id_external', { length: 255 }),
  customerId: integer('customer_id').notNull().references(() => customerInfo.id, { onDelete: 'cascade' }),
  street: varchar('street', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shipmentOrders = pgTable('shipment_order', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  costCenterId: integer('cost_center_id').notNull().references(() => costCenters.id, { onDelete: 'cascade' }),
  requiredDate: timestamp('required_date').notNull(),
  status: shipmentOrderStatusEnum('status').default('OPEN').notNull(),
  remark: varchar('remark', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shipmentOrderMaterials = pgTable('shipment_order_material', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  shipmentOrderId: integer('shipment_order_id').notNull().references(() => shipmentOrders.id, { onDelete: 'cascade' }),
  materialId: integer('material_id').notNull().references(() => materials.id),
  quantity: numeric('quantity', { precision: 18, scale: 3 }).notNull(),
  status: shipmentOrderMaterialStatusEnum('status').default('WAITING_SEPARATION').notNull(),
  remark: varchar('remark', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shipmentDocuments = pgTable('shipment_documents', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  number: integer('number').notNull(),
  value: numeric('value', { precision: 18, scale: 3 }).notNull(),
  externalPackageId: varchar('external_package_id', { length: 255 }),
  shipmentDate: date('shipment_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shipmentLoads = pgTable('shipment_load', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  shipmentDocumentId: integer('shipment_document_id').references(() => shipmentDocuments.id, { onDelete: 'cascade' }),
  quantity: numeric('quantity', { precision: 18, scale: 3 }).notNull(),
  weight: numeric('weight', { precision: 18, scale: 3 }).notNull(),
  dimensions: varchar('dimensions', { length: 255 }).notNull(),
  externalPackageId: varchar('external_package_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shipmentPackages = pgTable('shipment_packages', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  shipmentOrderId: integer('shipment_order_id').notNull().references(() => shipmentOrderMaterials.id, { onDelete: 'cascade' }),
  packageType: packageUnitEnum('package_type').default('BX').notNull(),
  quantity: numeric('quantity', { precision: 18, scale: 3 }).notNull(),
  weight: numeric('weight', { precision: 18, scale: 3 }).notNull(),
  dimensions: varchar('dimensions', { length: 255 }).notNull(),
  shipmentLoadId: integer('shipment_load_id').references(() => shipmentLoads.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const storages = pgTable('storage', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const inventories = pgTable('inventory', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  materialId: integer('material_id').notNull().references(() => invoiceItems.id, { onDelete: 'cascade' }),
  storageId: integer('storage_id').notNull().references(() => storages.id, { onDelete: 'cascade' }),
  quantity: numeric('quantity', { precision: 18, scale: 3 }).notNull(),
  reserved: numeric('reserved', { precision: 18, scale: 3 }).default('0').notNull(),
  available: numeric('available', { precision: 18, scale: 3 }).generatedAlwaysAs(sql`quantity - reserved`),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tasks = pgTable('task', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').default(sql`gen_random_uuid()`).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 1024 }),
  taskType: taskTypeEnum('task_type').notNull(),
  status: taskStatusEnum('status').default('PENDING').notNull(),
  invoiceId: integer('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }),
  materialId: integer('material_id').references(() => materials.id, { onDelete: 'set null' }),
  itemSpecification: varchar('item_specification', { length: 255 }),
  assignedUserId: integer('assigned_user_id').references(() => users.id, { onDelete: 'set null' }),
  issuedBy: varchar('issued_by', { length: 255 }),
  entryDate: timestamp('entry_date'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserGroup = typeof userGroups.$inferSelect;
export type NewUserGroup = typeof userGroups.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Material = typeof materials.$inferSelect;
export type NewMaterial = typeof materials.$inferInsert;
export type MaterialCategory = typeof materialCategories.$inferSelect;
export type NewMaterialCategory = typeof materialCategories.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
export type ShipmentOrder = typeof shipmentOrders.$inferSelect;
export type NewShipmentOrder = typeof shipmentOrders.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
