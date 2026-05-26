# GasNet POS Database Schema (Idempotent)

This schema keeps per-branch pricing and prevents duplicate sales with
idempotency keys. There is no separate customer table; the receipt name
is stored directly on the sales transaction.

## Table 4: Branch

| Field Name | Data Type | Description |
| --- | --- | --- |
| branch_id | INT (PK) | Unique identifier for each branch. |
| branch_name | VARCHAR | Name of the specific branch. |
| location | VARCHAR | Address of the branch. |
| contact_no | VARCHAR | Official contact number of the branch. |

The Branch table defines the essential details of each business location,
including its identifier, name, address, and contact information.

```sql
CREATE TABLE branches (
  branch_id SERIAL PRIMARY KEY,
  branch_name VARCHAR(120) NOT NULL UNIQUE,
  location VARCHAR(255) NOT NULL,
  contact_no VARCHAR(40) NOT NULL
);
```

## Table 5: Staff

| Field Name | Data Type | Description |
| --- | --- | --- |
| staff_id | UUID (PK) | Unique identifier for the employee (matches auth.users.id). |
| branch_id | INT (FK) | Links the staff to their assigned branch. |
| username | VARCHAR | Account username for system login. |
| password | VARCHAR | Encrypted account password. |
| role | VARCHAR | User level (Admin, Staff, Manager). |

The Staff table outlines employee records, linking personnel to their assigned
branch while storing login credentials and role classifications.

```sql
CREATE TABLE staff (
  staff_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  branch_id INT NOT NULL REFERENCES branches(branch_id) ON DELETE RESTRICT,
  username VARCHAR(80) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Staff', 'Manager'))
);
```

## Table 6: Product

| Field Name | Data Type | Description |
| --- | --- | --- |
| product_id | INT (PK) | Unique identifier for the product. |
| product_name | VARCHAR | Name of the specific product. |
| weight_kg | INT | Weight of the tank in kilograms. |
| active | BOOLEAN | Indicates if the product is available for sale. |

The Product table specifies the fundamental attributes of each item offered
by the business. Prices are stored per branch in `branch_product_prices`.

```sql
CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(120) NOT NULL UNIQUE,
  weight_kg INT NOT NULL CHECK (weight_kg > 0),
  active BOOLEAN NOT NULL DEFAULT true
);
```

## Table 6A: Branch_Product_Prices (per-branch pricing)

| Field Name | Data Type | Description |
| --- | --- | --- |
| branch_id | INT (PK, FK) | Branch that owns the price. |
| product_id | INT (PK, FK) | Product being priced. |
| price | INT | Current selling price for that branch. |
| updated_at | TIMESTAMP | Last price update time. |

This table makes product pricing editable per branch and prevents duplicates
by using a composite primary key.

```sql
CREATE TABLE branch_product_prices (
  branch_id INT NOT NULL REFERENCES branches(branch_id) ON DELETE RESTRICT,
  product_id INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
  price INT NOT NULL CHECK (price >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (branch_id, product_id)
);
```

## Table 7: Branch_Stock

| Field Name | Data Type | Description |
| --- | --- | --- |
| stock_id | INT (PK) | Unique identifier for the stock record. |
| branch_id | INT (FK) | Links to the specific branch. |
| product_id | INT (FK) | Links to the specific product. |
| quantity | INT | Current number of units on hand. |
| reorder_level | INT | Minimum quantity before a replenishment alert is sent. |

The Branch_Stock table records inventory details for each branch, linking
products to their respective locations while tracking quantities and reorder levels.

```sql
CREATE TABLE branch_stock (
  stock_id SERIAL PRIMARY KEY,
  branch_id INT NOT NULL REFERENCES branches(branch_id) ON DELETE RESTRICT,
  product_id INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity >= 0),
  reorder_level INT NOT NULL CHECK (reorder_level >= 0),
  UNIQUE (branch_id, product_id)
);
```

## Table 8: Sales_Transaction (idempotent)

| Field Name | Data Type | Description |
| --- | --- | --- |
| sales_id | INT (PK) | Unique identifier for the sale. |
| idempotency_key | VARCHAR | Client-generated key to prevent duplicate sales. |
| tracking_no | VARCHAR | Unique tracking number for the customer. |
| guest_name | VARCHAR | Name of the customer (receipt only). |
| guest_phone | VARCHAR | Customer contact number (optional). |
| delivery_address | VARCHAR | Destination address (optional). |
| transaction_date | DATE | The date the sale was made. |
| branch_id | INT (FK) | The branch where the sale occurred. |
| staff_id | UUID (FK) | The staff member who processed the sale. |
| transaction_type | VARCHAR | Type of transaction (Instore, Commercial). |
| subtotal | INT | Subtotal before adjustments. |
| total | INT | Final total for the sale. |

The Sales_Transaction table documents customer purchases, capturing transaction
details, delivery information, and the staff and branch involved in the sale.
Idempotency is enforced per branch to avoid duplicate inserts on retries.

```sql
CREATE TABLE sales_transactions (
  sales_id SERIAL PRIMARY KEY,
  idempotency_key VARCHAR(80) NOT NULL,
  tracking_no VARCHAR(80),
  guest_name VARCHAR(120) NOT NULL,
  guest_phone VARCHAR(40),
  delivery_address VARCHAR(255),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  branch_id INT NOT NULL REFERENCES branches(branch_id) ON DELETE RESTRICT,
  staff_id UUID NOT NULL REFERENCES staff(staff_id) ON DELETE RESTRICT,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Instore', 'Commercial')),
  subtotal INT NOT NULL CHECK (subtotal >= 0),
  total INT NOT NULL CHECK (total >= 0),
  UNIQUE (branch_id, idempotency_key),
  UNIQUE (tracking_no)
);
```

### Idempotent insert example
```sql
INSERT INTO sales_transactions (
  idempotency_key, tracking_no, guest_name, guest_phone, delivery_address,
  branch_id, staff_id, transaction_type, subtotal, total
) VALUES (
  $1, $2, $3, $4, $5,
  $6, $7, $8, $9, $10
)
ON CONFLICT (branch_id, idempotency_key)
DO NOTHING;

SELECT sales_id
FROM sales_transactions
WHERE branch_id = $6
  AND idempotency_key = $1;
```

## Table 9: Delivery

| Field Name | Data Type | Description |
| --- | --- | --- |
| delivery_id | INT (PK) | Unique identifier for the delivery task. |
| sales_id | INT (FK) | Links back to the original sales transaction. |
| status | VARCHAR | Status of the delivery. |
| updated_at | TIMESTAMP | Last status update time. |

```sql
CREATE TABLE deliveries (
  delivery_id SERIAL PRIMARY KEY,
  sales_id INT NOT NULL REFERENCES sales_transactions(sales_id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL CHECK (status IN ('Pending', 'Out for Delivery', 'Delivered', 'Cancelled')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Optional seed data (branches)
```sql
INSERT INTO branches (branch_name, location, contact_no) VALUES
  ('Bayan', 'Bayan Address', '000-000-0000'),
  ('Gulod', 'Gulod Address', '000-000-0000'),
  ('Cuenca', 'Cuenca Address', '000-000-0000'),
  ('Caloocan', 'Caloocan Address', '000-000-0000'),
  ('Agoncillo', 'Agoncillo Address', '000-000-0000'),
  ('Sta. Teresita', 'Sta. Teresita Address', '000-000-0000');
```
