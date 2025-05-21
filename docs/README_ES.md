# Fuse API

[![Build and deploy an app to AKS](https://github.com/andreslon/fuse-api/actions/workflows/ci-cd.yaml/badge.svg?branch=dev)](https://github.com/andreslon/fuse-api/actions/workflows/ci-cd.yaml)

## Descripción General
Fuse API es una API REST moderna y escalable construida con NestJS para interactuar con datos financieros. Proporciona endpoints para gestionar acciones, carteras, transacciones, informes y más.

## Despliegue en Producción
- **URL de Producción**: [https://fuse-api.neobit.com.co](https://fuse-api.neobit.com.co)
- **API Key**: `fuse-api-key-a1b2c3d4e5f6` (requerida para todos los endpoints excepto `/`, `/health` y `/health/redis`)
- **Panel de Monitoreo**: [Dashboard de Fuse API](https://monitoring.neobit.com.co/d/d3d1922e-3022-4e99-9440-f7af0a584834/fuse-api-dashboard?orgId=1)

## Ejemplos de Uso de la API

#### Obtener Información de la API (No requiere API Key)
```bash
curl -X GET http://localhost:3000/
```

#### Verificar Estado de Salud (No requiere API Key)
```bash
curl -X GET http://localhost:3000/api/v1/health
```

#### Flujo de Trabajo Principal

1. Listar Acciones Disponibles
```bash
curl -X 'GET' \
  'http://localhost:3000/api/v1/stocks' \
  -H 'accept: */*' \
  -H 'x-api-key: fuse-api-key-a1b2c3d4e5f6'
```

2. Ejecutar Transacciones de Compra de Acciones
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/transactions/buy' \
  -H 'accept: application/json' \
  -H 'x-api-key: fuse-api-key-a1b2c3d4e5f6' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "H24G1",
  "symbol": "NVDA",
  "quantity": 3,
  "price": 0.25
}'
```

3. Obtener Cartera del Usuario (Lista de Sus Acciones y Cantidades)
```bash
curl -X 'GET' \
  'http://localhost:3000/api/v1/portfolio/H24G1' \
  -H 'accept: application/json' \
  -H 'x-api-key: fuse-api-key-a1b2c3d4e5f6'
```

4. Generar y Enviar Informe por Correo Electrónico
```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/reports/send' \
  -H 'accept: application/json' \
  -H 'x-api-key: fuse-api-key-a1b2c3d4e5f6' \
  -H 'Content-Type: application/json' \
  -d '{
  "userId": "H24G1",
  "email": "usuario@ejemplo.com",
  "includeTransactions": true,
  "includePortfolio": true
}'
```

## Diagrama de Arquitectura

![Arquitectura de Fuse API](https://raw.githubusercontent.com/andreslon/fuse-api/main/docs/architecture.png)

### Descripción de la Arquitectura del Sistema

La arquitectura de Fuse API sigue un diseño moderno nativo de la nube con múltiples capas:

#### Capa de Desarrollo
- **VS Code (IDE)**: Entorno de desarrollo donde se escribe y prueba el código
- **Código Fuente**: Repositorio de código que contiene la aplicación NestJS
- **GitHub Actions**: Pipeline de CI/CD para pruebas, compilación y despliegue automatizados

#### Capa de Infraestructura
- **Container Registry**: Azure Container Registry almacena las imágenes Docker de la aplicación
- **Kubernetes**: Orquesta el despliegue de contenedores en Azure Kubernetes Service (AKS)
- **Red Virtual**: Asegura la comunicación entre servicios
- **Grupo de Recursos**: Contenedor lógico para los recursos de Azure
- **Cloudflare**: Proporciona DNS, terminación SSL y WAF (Firewall de Aplicaciones Web)
- **Autoridad Certificadora**: Gestiona los certificados TLS
- **Microsoft Azure**: Plataforma en la nube que aloja todos los servicios

#### Capa de Aplicación
- **Fuse-API**: La aplicación principal NestJS con autenticación mediante x-api-key
- **Service-A y Service-B**: Microservicios dentro del clúster de Kubernetes
- **Pods**: Contenedores individuales que ejecutan los componentes de la aplicación
- **Controlador de Ingress**: Dirige el tráfico externo a los servicios apropiados
- **Secrets**: Almacena de forma segura información sensible como claves API y contraseñas

#### Capa de Datos
- **PostgreSQL**: Base de datos gestionada para el almacenamiento persistente de transacciones y datos de usuarios
- **Cache**: Instancia de Redis para recuperación rápida de datos y caché de información de acciones
- **Apache Pulsar**: Broker de mensajes para arquitectura orientada a eventos

#### Capa de Integración
- **Sendgrid (Emails)**: Servicio para enviar correos electrónicos de informes diarios
- **Fuse Finance API**: API externa que proporciona datos de acciones
- **Stack de Monitoreo**: Grafana, Loki y Prometheus para observabilidad

### Flujo de Datos
1. Los dispositivos cliente se conectan a Fuse API a través de Cloudflare con autenticación mediante x-api-key
2. Las solicitudes se dirigen al servicio apropiado mediante el Controlador de Ingress en Kubernetes
3. Los servicios de Fuse API procesan solicitudes, accediendo a:
   - PostgreSQL para datos persistentes
   - Redis para respuestas en caché
   - Apache Pulsar para publicación de eventos
4. Las integraciones externas incluyen:
   - Recuperación de datos de acciones desde Fuse Finance API
   - Envío de correos electrónicos a través de Sendgrid
5. El monitoreo se proporciona mediante dashboards de Grafana

### Pipeline de CI/CD
El proceso de despliegue sigue estos pasos:
1. El código se escribe en VS Code y se envía al control de fuentes
2. GitHub Actions activa compilaciones automatizadas
3. Las imágenes Docker se compilan y se envían a Azure Container Registry
4. Kubernetes extrae las imágenes y despliega los servicios actualizados
5. Los secretos se gestionan de forma segura durante todo el proceso

## Características Principales

1. **Autenticación de API**: Autenticación segura basada en clave API
2. **Caché de Datos**: Caché basado en Redis para mejorar el rendimiento
3. **Procesamiento en Segundo Plano**: Sistema de colas para manejar tareas de larga duración
4. **Informes Automatizados**: Generación de informes programados y envío por correo electrónico
5. **Integración con Base de Datos**: PostgreSQL para almacenamiento persistente de datos
6. **Resiliencia**: Circuit breakers y mecanismos de reintento para llamadas a API externas
7. **Registro**: Sistema de logging completo
8. **Monitoreo**: Integración con herramientas de monitoreo
9. **Documentación Swagger**: Documentación de API autogenerada
10. **Validación**: Validación de solicitudes usando class-validator

## Contacto

Para cualquier pregunta o soporte, por favor contactar a: andres.londono@neobit.com.co 