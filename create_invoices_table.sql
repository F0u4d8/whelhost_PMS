-- Drop the existing invoices table if it exists
DROP TABLE IF EXISTS invoices;

-- Create the invoices table with the correct schema
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
    guest_id UUID REFERENCES guests(id),
    unit_id UUID REFERENCES units(id),
    reservation_id UUID REFERENCES bookings(id),
    contract_number VARCHAR(255),
    date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    vat DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_invoices_hotel_id ON invoices(hotel_id);
CREATE INDEX idx_invoices_guest_id ON invoices(guest_id);
CREATE INDEX idx_invoices_unit_id ON invoices(unit_id);
CREATE INDEX idx_invoices_reservation_id ON invoices(reservation_id);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_contract_number ON invoices(contract_number);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a sample invoice to test
-- INSERT INTO invoices (hotel_id, guest_id, date, subtotal, vat, total, status, contract_number) 
-- VALUES 
--     ((SELECT id FROM hotels LIMIT 1), (SELECT id FROM guests LIMIT 1), CURRENT_DATE, 1000.00, 150.00, 1150.00, 'pending', 'INV-001');