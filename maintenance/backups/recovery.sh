#!/bin/bash

# Configuración
USER="appuser"
PASS="password"
DB="calendar"
BACKUP_DIR="/home/ubuntu/maintenance/backups/"

# 1. Validar que se pasó un nombre como argumento
if [ -z "$1" ]; then
  echo "Use: $0 backup_name (without .sql)"
  exit 1
fi

NAME=$1
FILE_PATH="${BACKUP_DIR}${NAME}.sql"

# 2. Verificar si el archivo existe
if [ ! -f "$FILE_PATH" ]; then
  echo "Error: File $FILE_PATH doesn't exists."
  exit 1
fi

echo "Starting restauration: $NAME..."

# 3. Ejecutar la restauración
# Usamos -e para crear la base de datos si por alguna razón no existiera
mysql -u "$USER" -p"$PASS" -e "CREATE DATABASE IF NOT EXISTS $DB;"

# Importar el archivo SQL
mysql -u "$USER" -p"$PASS" "$DB" < "$FILE_PATH"

# 4. Verificar el resultado
if [ $? -eq 0 ]; then
  echo "Restauration completed succesfully."
  echo "Data base '$DB' updated."
else
  echo "Error during restauration."
  exit 1
fi