DROP DATABASE IF EXISTS giveme;
DROP USER IF EXISTS giveme_user;

CREATE USER giveme_user WITH ENCRYPTED PASSWORD 'giveme_user_password';
CREATE DATABASE giveme WITH OWNER giveme_user; 