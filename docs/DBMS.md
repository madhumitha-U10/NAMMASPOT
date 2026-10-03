# NammaSpot DBMS Notes

## Core entities

Users, Sellers, Categories, Products, Enquiries, Admins.

Supporting entity: Favourites.

## Cardinality

Users 1 — 1 Sellers  
Categories 1 — M Sellers  
Sellers 1 — M Products  
Users 1 — M Enquiries  
Sellers 1 — M Enquiries  
Products 1 — M Enquiries  
Users M — M Sellers through Favourites

## Example SQL

SELECT p.product_name, p.price, s.business_name
FROM products p
JOIN sellers s ON p.seller_id = s.id
WHERE s.verification_status = 'approved';

SELECT product_name, price
FROM products
WHERE product_name ILIKE '%crochet%'
ORDER BY price;

UPDATE products
SET availability = FALSE
WHERE id = 'PRODUCT_ID';

DELETE FROM products
WHERE id = 'PRODUCT_ID';

INSERT INTO categories(name) VALUES ('Handmade');

-- Database DDL is maintained in:
-- supabase/migrations/0001_nammaspot_mvp.sql
