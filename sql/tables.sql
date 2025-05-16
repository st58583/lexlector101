CREATE TABLE word_links (
wol_word_a INT NOT NULL,
wol_word_b INT NOT NULL,
PRIMARY KEY (wol_word_a, wol_word_b)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE ui_text (
uit_id INT NOT NULL AUTO_INCREMENT,
uit_lang VARCHAR(10) NOT NULL,
uit_key VARCHAR(255) NOT NULL,
uit_text TEXT NOT NULL,
PRIMARY KEY (uit_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE words (
wor_id BIGINT NOT NULL AUTO_INCREMENT,
wor_type INT NOT NULL,
wor_value VARCHAR(255) NOT NULL,
wor_lang VARCHAR(10) NOT NULL,
PRIMARY KEY (wor_id),
KEY wor_lang (wor_lang)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE users_books (
ubo_id INT NOT NULL AUTO_INCREMENT,
ubo_insert_dt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
ubo_read_dt DATETIME NOT NULL, 
ubo_user INT NOT NULL,
ubo_book INT NOT NULL,
ubo_file_name VARCHAR(255) NOT NULL,
ubo_file_type VARCHAR(50) NOT NULL,
ubo_file_size INT NOT NULL,
ubo_custom_name VARCHAR (255) NOT NULL,
ubo_author VARCHAR(255) NOT NULL,
ubo_year DATE NOT NULL,
ubo_lang VARCHAR(10) NOT NULL,
ubo_order INT NOT NULL,
ubo_text LONGTEXT NOT NULL,
PRIMARY KEY (ubo_id),
KEY ubo_user (ubo_user),
KEY ubo_book (ubo_book)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE users (
usr_id INT NOT NULL AUTO_INCREMENT,
usr_insert_dt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ,
usr_lastlogin_dt DATETIME NOT NULL,
usr_username VARCHAR(255) NOT NULL,
usr_password VARCHAR(255) NOT NULL,
usr_email VARCHAR(255) NOT NULL,
usr_first_name VARCHAR(255) NOT NULL,
usr_surname VARCHAR(255) NOT NULL,
usr_lang VARCHAR(10) NOT NULL,
PRIMARY KEY (usr_id),
KEY usr_username (usr_username)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci