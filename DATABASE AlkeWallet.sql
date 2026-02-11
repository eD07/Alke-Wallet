-- Crear base de datos
CREATE DATABASE AlkeWallet;

-- Seleccionar base de datos
USE AlkeWallet;

-- Verificar creación
SHOW DATABASES;


-- Creación de Tablas (DDL)
-- Tabla: usuario
CREATE TABLE usuario (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    saldo DECIMAL(10,2) NOT NULL DEFAULT 0
);


-- Tabla: moneda
CREATE TABLE moneda (
    currency_id INT AUTO_INCREMENT PRIMARY KEY,
    currency_name VARCHAR(50) NOT NULL,
    currency_symbol VARCHAR(10) NOT NULL
);


-- Tabla: transaccion
CREATE TABLE transaccion (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_user_id INT NOT NULL,
    receiver_user_id INT NOT NULL,
    currency_id INT NOT NULL,
    importe DECIMAL(10,2) NOT NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sender_user_id) REFERENCES usuario(user_id),
    FOREIGN KEY (receiver_user_id) REFERENCES usuario(user_id),
    FOREIGN KEY (currency_id) REFERENCES moneda(currency_id)
);

-- Inserción de Datos de Prueba (DML)
-- Insertar usuarios
INSERT INTO usuario (nombre, correo_electronico, contrasena, saldo)
VALUES 
('Juan Perez', 'juan@gmail.com', '1234', 5000),
('Maria Lopez', 'maria@gmail.com', 'abcd', 3000),
('Alberto Salas', 'asalas@gmail.com', '4567', 8000),
('Luz Cepeda', 'maria@email.com', 'qwerty', 9000);


-- Insertar moneda
INSERT INTO moneda (currency_name, currency_symbol)
VALUES 
('Peso Chileno', 'CLP'),
('Dolar', 'USD');


-- Insertar transaccion
INSERT INTO transaccion (sender_user_id, receiver_user_id, currency_id, importe)
VALUES (1, 2, 1, 1000);


-- Consultas SQL (SELECT)
-- Obtener nombre de moneda elegida por un usuario específico
SELECT u.nombre, m.currency_name
FROM usuario u
JOIN transaccion t ON u.user_id = t.sender_user_id
JOIN moneda m ON t.currency_id = m.currency_id
WHERE u.user_id = 1;



-- Obtener todas las transacciones
SELECT * FROM transaccion;


-- Obtener todas las transacciones de un usuario específico
SELECT *
FROM transaccion
WHERE sender_user_id = 1;


-- Sentencias de Modificación
-- Modificar correo electrónico
UPDATE usuario
SET correo_electronico = 'nuevocorreo@gmail.com'
WHERE user_id = 1;

select *
from usuario
WHERE user_id = 1;



-- Eliminar una transacción
DELETE FROM transaccion
WHERE transaction_id = 1;



-- Ejemplo de Transacción (ACID)
START TRANSACTION;

UPDATE usuario
SET saldo = saldo - 1000
WHERE user_id = 1;

UPDATE usuario
SET saldo = saldo + 1000
WHERE user_id = 2;

COMMIT;
