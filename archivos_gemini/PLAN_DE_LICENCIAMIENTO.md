# Plan de Implementación de Licenciamiento por Hardware

Este documento describe el plan para implementar un sistema de licencias que vincule la aplicación a una máquina específica, evitando que sea clonada y ejecutada en otras computadoras sin autorización.

## Objetivo
Asegurar que cada copia del sistema POS solo pueda ejecutarse en la PC del cliente para la cual fue licenciada.

## Estrategia General
La estrategia se basa en un sistema de "fingerprinting" de hardware combinado con criptografía de clave pública/privada.

1.  **Obtener un ID Único de la Máquina (Fingerprint):** Se generará un identificador único para la PC del cliente.
2.  **Generar una Licencia Firmada:** Se creará un archivo de licencia que contenga datos (como el ID de la máquina y una fecha de expiración) y una firma digital.
3.  **Verificar la Licencia al Arrancar:** El backend (`app.js`) verificará la validez de la licencia en cada ejecución. Si la verificación falla, la aplicación se cerrará.

---

## Pasos de Implementación

### 1. Dependencias Necesarias
Se añadirá la siguiente dependencia al backend:
```bash
# Dentro de la carpeta 'back'
pnpm add node-machine-id
```

### 2. Proceso de Creación de Licencia

Este proceso lo realiza el desarrollador.

#### Paso 2.1: Obtener el ID de la Máquina del Cliente
Se debe ejecutar este pequeño script en la PC del cliente para obtener su ID único.

**Script: `get-machine-id.js`**
```javascript
import { machineIdSync } from 'node-machine-id';
console.log('Machine ID:', machineIdSync());
```
El ID resultante se usará en el siguiente paso.

#### Paso 2.2: Generar Claves Criptográficas (Hacer una sola vez)
Se generará un par de claves pública/privada. La **clave privada (`private.key`) debe mantenerse secreta** y nunca debe ser entregada al cliente. La clave pública (`public.key`) se distribuirá con la aplicación.

**Script para generar claves:**
```javascript
import crypto from 'crypto';
import fs from 'fs';

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

fs.writeFileSync('private.key', privateKey.export({ type: 'pkcs1', format: 'pem' }));
fs.writeFileSync('public.key', publicKey.export({ type: 'spki', format: 'pem' }));

console.log('Claves generadas: private.key y public.key');
```

#### Paso 2.3: Generar el Archivo de Licencia
Este script usa la clave privada para firmar los datos de la licencia, incluyendo el ID de la máquina del cliente.

**Script: `generate-license.js`**
```javascript
import crypto from 'crypto';
import fs from 'fs';

const privateKey = fs.readFileSync('private.key', 'utf8');

const licenseData = {
    customer: 'Nombre del Cliente',
    machineId: 'ID_DE_MAQUINA_OBTENIDO_DEL_CLIENTE', // <-- Pegar el ID del Paso 2.1 aquí
    expiresAt: '2026-12-31'
};

const sign = crypto.createSign('SHA256');
sign.update(JSON.stringify(licenseData));
sign.end();
const signature = sign.sign(privateKey, 'base64');

const licenseFile = {
    data: licenseData,
    signature: signature
};

fs.writeFileSync('license.json', JSON.stringify(licenseFile, null, 2));
console.log('license.json generado!');
```

### 3. Integración de la Verificación en el Backend

El siguiente código debe ser añadido al **principio del archivo `back/app.js`**.

**Archivos a incluir en la carpeta `back` del proyecto distribuido:**
*   `public.key` (generada en el paso 2.2)
*   `license.json` (generada en el paso 2.3 para el cliente específico)

**Código para `back/app.js`:**
```javascript
// back/app.js (añadir al principio del todo)
import fs from 'fs';
import crypto from 'crypto';
import { machineIdSync } from 'node-machine-id';

function verifyLicense() {
    try {
        // 1. Cargar la clave pública y el archivo de licencia
        const publicKey = fs.readFileSync('./public.key', 'utf8');
        const licenseFile = JSON.parse(fs.readFileSync('./license.json', 'utf8'));

        const { data, signature } = licenseFile;

        // 2. Verificar la firma para asegurar que la licencia no fue manipulada
        const verify = crypto.createVerify('SHA256');
        verify.update(JSON.stringify(data));
        verify.end();

        if (!verify.verify(publicKey, signature, 'base64')) {
            console.error('Error: Firma de licencia inválida. El programa se cerrará.');
            process.exit(1);
        }

        // 3. Verificar que el ID de la máquina actual coincida con el de la licencia
        const currentMachineId = machineIdSync();
        if (currentMachineId !== data.machineId) {
            console.error(`Error: La licencia no es válida para esta máquina.`);
            process.exit(1);
        }

        // 4. (Opcional) Verificar la fecha de expiración
        if (new Date() > new Date(data.expiresAt)) {
            console.error('Error: La licencia ha expirado.');
            process.exit(1);
        }

        console.log(`Licencia verificada para: ${data.customer}. Válida hasta: ${data.expiresAt}`);
        return true;

    } catch (error) {
        console.error('Error fatal al verificar la licencia: No se encontró o es inválida.', error.message);
        process.exit(1);
    }
}

// --- Ejecutar la verificación al iniciar la aplicación ---
verifyLicense();


// --- El resto de tu código de app.js continúa aquí ---
// import express from "express";
// ...
```
