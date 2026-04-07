#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <filesystem>
#include <algorithm>
#include <string>
#include <vector>

using namespace std;
using namespace sql;

bool ends_with(const std::string& str, const std::string& suffix) {
  if (str.length() >= suffix.length()) {
    return (0 == str.compare(str.length() - suffix.length(), suffix.length(), suffix));
  } else {
    return false;
  }
}

bool arguments(int &argc, char *argv[]) {
  string msj = "First arg 'name.sql'\n";

  if (argc != 2){
    cerr << "Argument number error: " << msj;
    return 1;
  }
  if (!ends_with(argv[1], ".sql")) {
    cerr << "Argument is not an .sql\n";
    return 1;
  }
  return 0;
}

void deleteBackup(string &path, string &name, string &today, Statement *stmt) {
  namespace fs = filesystem;
  vector<string> files;
  // Busca todos los archivos del directorio y los retorna en un vector
  for (const auto & entry : fs::directory_iterator(path)) {
    string fileName = entry.path().filename().string();
    files.push_back(fileName);
  }
  
  if (find(files.begin(), files.end(), name) != files.end()) {
    fs::remove(path + name);
    try {
      stmt->execute("UPDATE backup SET deleted_at = '" + today + "' WHERE name = '" + name + "'");
    } catch (SQLException &e) {
      cerr << "SQL Error: " << e.what() << endl;
    }
    cout << name << " deleted succesfully\n";
  }
}

bool verifyBackup(string &path, string &name, string &today, Statement *stmt) {
  vector<string> backups;
  try  {
    string command = "SELECT * FROM backup WHERE deleted_at IS NULL AND name = '" + name + "'";
    ResultSet *res;
    res = stmt->executeQuery(command);
    while (res->next()) {
      backups.push_back(res->getString("name"));
    }
    delete res;
  } catch (SQLException &e) {
    cerr << "SQL Error: " << e.what() << endl;
    return 1;
  }

  if (backups.empty()) {
    cerr << "Backup " + name + " doesn't exists.\n";
    return 1;
  }
  return 0;
}

int main(int argc, char *argv[]) {
  string path = "/home/ubuntu/maintenance/backups/";
  auto t = time(nullptr);
  auto tm = *localtime(&t);
  stringstream time;
  time << put_time(&tm, "%Y-%m-%d %H-%M-%S");
  string today = time.str();
  if (arguments(argc, argv) == 1)
    return 1;
  string name = argv[1];
  try {
    mysql::MySQL_Driver *driver;

    driver = mysql::get_mysql_driver_instance();

    unique_ptr<Connection> con(driver->connect("tcp://127.0.0.1:3306", "appuser", "password"));
    con->setSchema("calendar");

    unique_ptr<Statement> stmt(con->createStatement());
    if (verifyBackup(path, name, today, stmt.get()) != 0)
      return 1;
    
    deleteBackup(path, name, today, stmt.get());
  } catch (SQLException &e) {
    cerr << "SQL Error: " << e.what() << endl;
    return 1;
  }
  return 0;
}
