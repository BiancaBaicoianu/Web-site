DROP TYPE IF EXISTS categ_mobila;
DROP TYPE IF EXISTS tipuri_produse;

CREATE TYPE categ_mobila AS ENUM( 'bucatarie', 'living', 'gradina', 'dormitor','hol');
CREATE TYPE tipuri_produse AS ENUM('dulap', 'comoda cu oglinda', 'pantofar', 'coltar', 'foisor', 'birou', 'mobila living', 'masuta de cafea', 'corp bucatarie');


CREATE TABLE IF NOT EXISTS mobila (
   id serial PRIMARY KEY,
   nume VARCHAR(50) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   dimensiuni INT NOT NULL CHECK (dimensiuni>=0), 
   culoare VARCHAR [], 
   tip_produs tipuri_produse DEFAULT ' dulap',
   categorie categ_mobila DEFAULT 'bucatarie',
   nr_bucati INT NOT NULL CHECK (nr_bucati>=0),
   -- ingrediente VARCHAR [], --pot sa nu fie specificare deci nu punem NOT NULL
   modulara BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

