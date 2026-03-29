#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/prepared_statement.h>
#include <iostream>
#include <string>
#include <vector>

using namespace std;
using namespace sql;

vector<string> arguments(int &argc, char *argv[]) {
  string msj = "\n   First arg 'name'\n   Second arg 'temporaly', default: false\n";

  if (argc < 2) {
    cerr << "Missing arguments:" << msj;
    return {};
  } else if (argc > 3) {
    cerr << "To much arguments:" << msj;
    return {};
  }

  vector<string> results;
  for (size_t i = 1; i < argc; i++)
    results.push_back(argv[i]);

  if (argc == 2)
    results.push_back("false");

  return results;
}

bool createBackup(string &name, string &path) {
  string user = "santiago";
  string password = "953741";
  string db = "calendar";

  string command = "mysqldump -u " + user + " -p" + password + " " + db + " --ignore-table=calendar.backup " + " > " + path + name + ".sql";

  int resultado = system(command.c_str());

  if (resultado == 0) {
      cout << "Backup created successfully." << std::endl;
      return 0;
  } else {
      cerr << "Mysqldump error. Code: " << resultado << std::endl;
      return 1;
  }
}

int main(int argc, char *argv[]) {
  string path = "/home/santiago/Escritorio/backups/";
  vector<string> args = arguments(argc, argv);
  if (args.size() == 0)
    return 1;
  
  bool res = createBackup(args[0], path);
  if (res)
    return 1;

  try {
    mysql::MySQL_Driver *driver;

    driver = mysql::get_mysql_driver_instance();

    unique_ptr<Connection> con(driver->connect("tcp://127.0.0.1:3306", "santiago", "953741"));
    con->setSchema("calendar");

    unique_ptr<PreparedStatement> pstmt(con->prepareStatement("INSERT INTO backup (name, temporary) VALUES (?, ?)"));

    pstmt->setString(1, args[0] + ".sql");
    pstmt->setBoolean(2, (args[1] == "false") ? false : true);

    pstmt->executeUpdate();
  } catch (SQLException &e) {
    cerr << "SQL Error: " << e.what() << endl;
    return 1;
  }

  return 0;
}
