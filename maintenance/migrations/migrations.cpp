#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
#include <filesystem>
#include <algorithm>
#include <iterator>

using namespace std;
using namespace sql;

// Obtiene las migraciones que ya han sido guardadas en la tabla migrations
vector<string> getCurrentMigrations(Connection *con) {
  Statement *stmt = nullptr;
  vector<string> results;
  try {
    stmt = con->createStatement();
    ResultSet *res;
    res = stmt->executeQuery("SELECT name FROM migrations");
    while (res->next()) {
      results.push_back(res->getString("name"));
    }
    delete res;
  } catch (SQLException &e) {
    cerr << "Error de SQL: " << e.what() << endl;
  }
  delete stmt;
  sort(results.begin(), results.end());
  return results;
}

bool ends_with(const std::string& str, const std::string& suffix) {
  if (str.length() >= suffix.length()) {
    return (0 == str.compare(str.length() - suffix.length(), suffix.length(), suffix));
  } else {
    return false;
  }
}

vector<string> getFiles(const string &path) {
  namespace fs = filesystem;
  vector<string> files;
  // Busca todos los archivos del directorio y los retorna en un vector
  for (const auto & entry : fs::directory_iterator(path)) {
    string fileName = entry.path().filename().string();
    if (ends_with(fileName, ".sql"))
      files.push_back(fileName);
  }
  // Ordena el vector antes de retornarlo
  sort(files.begin(), files.end());
  return files;
}

// Resta del vector files las migraciones que ya han sido ejecutadas en el pasado
vector<string> getDiference(const string &path, Connection *con) {
  vector<string> result;
  vector<string> files = getFiles(path);
  vector<string> applied = getCurrentMigrations(con);
  set_difference(
    files.begin(), files.end(),
    applied.begin(), applied.end(),
    back_inserter(result)
  );
  return result;
}

string getFileContent(const string &path) {
  ifstream file(path);
  string str;
  string fileContent;

  // Une todas las lineas del archivo en un unico string
  while (getline(file, str)) {
    fileContent += str;
    fileContent.push_back('\n');
  }

  return fileContent;
}

bool runMigration(Connection *con, const string &migration) {
  Statement *stmt = nullptr;
  try
  {
    string fullQuery = getFileContent(migration);
    stringstream ss(fullQuery);
    string segment;

    con->setAutoCommit(false); 
    stmt = con->createStatement();

    // Separamos el archivo por cada ';'
    while (getline(ss, segment, ';')) {
      // Limpiar espacios en blanco o saltos de línea vacíos
      segment.erase(0, segment.find_first_not_of(" \n\r\t"));
      segment.erase(segment.find_last_not_of(" \n\r\t") + 1);

      if (!segment.empty()) {
        stmt->execute(segment);
      }
    }

    stmt->execute("INSERT INTO migrations (name) VALUES ('" + migration.substr(migration.find_last_of('/') + 1) + "')");

    con->commit();
    cout << "Migration " << migration.substr(migration.find_last_of('/') + 1) << " completed and stored." << endl;
    con->setAutoCommit(true); // Restaurar comportamiento normal
    delete stmt;

    return true;
  } catch(SQLException &e) {
    cerr << "Error en la migración: " << e.what() << endl;
    cerr << "Ejecutando ROLLBACK..." << endl;
    
    con->rollback(); // La DB vuelve al estado exacto de antes de empezar
    
    if (stmt) delete stmt;
    con->setAutoCommit(true);
    return false;
  }
}

int main() {
  const string basePath = "./";
  try {
    mysql::MySQL_Driver *driver;

    // Inicializar el Driver
    driver = mysql::get_mysql_driver_instance();

    // Crear la conexión (Host, Usuario, Password)
    unique_ptr<Connection> con(driver->connect("tcp://127.0.0.1:3306", "santiago", "953741"));

    // Ejecuta la primer migacion (000_init.sql) que crea la base de datos
    runMigration(con.get(), basePath + "000_init.sql");

    // Utiliza la base de datos "calendar" quee se acaba de crear
    con->setSchema("calendar");

    vector<string> files = getDiference(basePath, con.get());

    // Ejecuta ls demas migraciones
    for (size_t i = 0; i < files.size(); i++) {
      bool res = runMigration(con.get(), basePath + files[i]);
      if (!res) 
        return 1;
    }

  } catch (SQLException &e) {
    cerr << "Error de SQL: " << e.what() << endl;
  }

  return 0;
}
