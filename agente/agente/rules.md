# Reglas de Comportamiento - Perfumería Fabio

1. **Arquitectura Modular**: Separar claramente las rutas, controladores y servicios para el catálogo de perfumes, muestras y pedidos.
2. **Persistencia con Prisma**: Toda consulta e interacción con la base de datos de productos y usuarios debe manejarse mediante Prisma ORM.
3. **Contenedorización**: Los servicios de base de datos, backend y frontend deben aislarse y orquestarse de manera limpia mediante Docker Compose.
4. **Conventional Commits**: Los mensajes de commit deben seguir estrictamente el estándar (`feat:`, `fix:`, `docs:`, `chore:`).