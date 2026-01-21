
# Alke Wallet - Aplicación Demo

## Descripción

**Alke Wallet** es una aplicación de demostración para la gestión de fondos digitales. Permite a los usuarios realizar depósitos, transferencias, y visualizar el historial de transacciones. El sistema incluye un inicio de sesión, gestión de contactos y una interfaz intuitiva para interactuar con las funcionalidades.

## Requerimientos

### Frontend
- **HTML**: Estructura de las páginas web.
- **CSS**: Diseño y estilos de la aplicación.
- **JavaScript**: Lógica para la manipulación de datos y la interacción con el DOM.
- **Bootstrap 5**: Framework para el diseño responsivo.
- **jQuery**: Simplificación de la manipulación del DOM y gestión de eventos.

### Backend
Este proyecto no tiene backend real. Todo está simulado en el cliente utilizando `localStorage` para almacenar los datos de usuario y las transacciones.

## Funcionalidades

1. **Inicio de sesión**: Los usuarios pueden iniciar sesión utilizando las credenciales demo. Si las credenciales son correctas, el usuario es redirigido al menú principal.

2. **Registro de usuario**: Los usuarios pueden crear una cuenta proporcionando un correo electrónico y una contraseña. La contraseña debe coincidir en ambos campos para crear la cuenta.

3. **Gestión de fondos**: Los usuarios pueden realizar depósitos simulados y consultar su saldo disponible.

4. **Envío de dinero**: Los usuarios pueden enviar dinero a otros contactos de su lista.

5. **Historial de transacciones**: Los usuarios pueden ver todas las transacciones realizadas dentro de la aplicación.

## Instalación

Para usar Alke Wallet localmente, sigue estos pasos:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/alke-wallet.git
   ```

2. **Abrir los archivos**: 
   - Abre el archivo `index.html` en tu navegador para iniciar la aplicación.
   - Usa herramientas como **Live Server** de Visual Studio Code para ver la aplicación en tiempo real.

## Uso

1. **Iniciar sesión**: 
   Usa las siguientes credenciales para iniciar sesión en la aplicación:
   - **Email**: `user@test.com`
   - **Contraseña**: `1234`

2. **Registrar un nuevo usuario**: 
   Haz clic en "¿No tienes una cuenta? Regístrate aquí" para mostrar el formulario de registro.
   Ingresa un correo electrónico y una contraseña para crear una cuenta.

3. **Simular un depósito**: 
   Una vez que inicies sesión, podrás simular un depósito y ver tu saldo disponible.

4. **Enviar dinero**: 
   Accede a la opción "Enviar dinero", selecciona un contacto y realiza una transferencia simulada.

5. **Ver historial de transacciones**: 
   Revisa todas las transacciones realizadas desde la página de "Últimos movimientos".

## Credenciales de acceso

### Usuario Demo

- **Email**: `user@test.com`
- **Contraseña**: `1234`

Estas credenciales permiten acceder a una cuenta de demostración con saldo ficticio.

## Tecnologías utilizadas

- **HTML**: Estructura base de las páginas.
- **CSS**: Estilos personalizados para la interfaz de usuario.
- **JavaScript**: Funcionalidades de la aplicación, como la validación de login, la gestión de contactos y la simulación de transacciones.
- **Bootstrap**: Framework de diseño para crear una interfaz responsiva y moderna.
- **jQuery**: Simplificación de la manipulación del DOM y eventos.

## Contribuciones

Si deseas contribuir al proyecto, sigue estos pasos:

1. **Fork** el repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios.
4. **Commit** tus cambios (`git commit -am 'Añadir nueva funcionalidad'`).
5. **Push** a la rama (`git push origin feature/nueva-funcionalidad`).
6. Abre un **Pull Request**.

