CREATE TABLE IF NOT EXISTS budget_categories (
	id INT PRIMARY KEY,
	user_id INT,
	name VARCHAR(25),
	amount int,
	active boolean
);

CREATE TABLE IF NOT EXISTS transactions (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL,
	cents INT NOT NULL,
	category INT,
	date_purchased DATE,
	date_entered TIMESTAMP WITH TIME ZONE,
	notes varchar(200)
);

/*
ALTER TABLE transactions 
ADD CONSTRAINT fk_tui_ui
FOREIGN KEY (user_id)
REFERENCES users(id);
*/

/*
ALTER TABLE budget_categories
ADD CONSTRAINT fk_bcui_ui
FOREIGN KEY (user_id)
REFERENCES users(id);
*/
