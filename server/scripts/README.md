# Scripts de Seed para Séptimo Blog

## 🚀 Cómo ejecutar el seeder

Desde la carpeta `server/`, ejecuta:

```bash
npm run seed:users
```

Este comando poblará la base de datos con datos de ejemplo.

## 📋 Credenciales de los usuarios creados

### 👑 Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Rol:** Administrador (acceso total al panel de admin)

### 👤 Usuario Normal 1
- **Usuario:** `usuario`
- **Contraseña:** `usuario123`
- **Rol:** Usuario regular

### 👤 Usuario Normal 2
- **Usuario:** `ChinoJuegaGod`
- **Contraseña:** `chino123`
- **Rol:** Usuario regular

## 📊 Datos creados

El seeder crea:
- ✅ **3 usuarios** (1 admin + 2 usuarios normales)
- ✅ **3 películas** con información completa:
  - Alien (1979) - Ridley Scott
  - Blade Runner (1982) - Ridley Scott
  - Inception (2010) - Christopher Nolan
- ✅ **4 reseñas** de películas con calificaciones
- ✅ **2 artículos** sobre cine:
  - "¿Cuál es el arte de no contar nada?" (Fallen Leaves)
  - "El legado de Ridley Scott en la ciencia ficción" (Blade Runner)

## 🔑 Características de seguridad

- ✅ Las contraseñas están hasheadas con bcrypt (salt rounds: 10)
- ✅ El seeder es idempotente (puedes ejecutarlo múltiples veces sin duplicar datos)
- ✅ Si un usuario ya existe, se omite su creación

## 💡 Notas

- El seeder verifica si los datos ya existen antes de crearlos
- Las calificaciones de las películas se calculan automáticamente según las reseñas
- Todos los usuarios tienen perfiles completos con géneros favoritos y biografías
