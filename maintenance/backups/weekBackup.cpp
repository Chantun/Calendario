#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <algorithm>
#include <filesystem>
#include <iostream>
#include <string>
#include <vector>
#include <iomanip>
#include <ctime>

using namespace std;
using namespace sql;

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

bool verifyBackups(string &path, string &today, Statement *stmt) {
  vector<string> backups;
  try  {
    ResultSet *res;
    res = stmt->executeQuery("SELECT * FROM backup WHERE temporary = 1 AND deleted_at IS NULL ORDER BY executed_at ASC");
    while (res->next()) {
      backups.push_back(res->getString("name"));
    }
    delete res;
  } catch (SQLException &e) {
    cerr << "SQL Error: " << e.what() << endl;
    return 1;
  }

  if (backups.empty())
    return 0;

  if (backups.size() > 1) {
    for (size_t i = 0; i < backups.size() - 1; i++) {
      deleteBackup(path, backups[i], today, stmt);
    }
  }
  
  return 0;
}

bool createBackup(string &path, string &today) {
  string command = path + "backup.out " + today + " true";

  int result = system(command.c_str());

  if (result == 0) {
      cout << "Backup created successfully." << std::endl;
      return 0;
  } else {
      cerr << "Mysqldump error. Code: " << result << std::endl;
      return 1;
  }
}

int main() {
  string path = "/home/santiago/Escritorio/backups/";
  auto t = time(nullptr);
  auto tm = *localtime(&t);
  stringstream timeName;
  stringstream timeStamp;
  timeName << put_time(&tm, "%Y-%m-%d_%H-%M-%S");
  timeStamp << put_time(&tm, "%Y-%m-%d %H-%M-%S");
  string todayName = timeName.str();
  string todayStamp = timeStamp.str();
  try {
    mysql::MySQL_Driver *driver;

    driver = mysql::get_mysql_driver_instance();

    unique_ptr<Connection> con(driver->connect("tcp://127.0.0.1:3306", "santiago", "953741"));
    con->setSchema("calendar");

    unique_ptr<Statement> stmt(con->createStatement());
    verifyBackups(path, todayStamp, stmt.get());

    bool res = createBackup(path, todayName);

  } catch (SQLException &e) {
    cerr << "SQL Error: " << e.what() << endl;
    return 1;
  }
}
