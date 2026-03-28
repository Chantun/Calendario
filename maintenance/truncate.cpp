#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <filesystem>
#include <iostream>

using namespace std;
using namespace sql;

int main() {
  string path = "/home/santiago/Escritorio/backups/";

  auto t = time(nullptr);
  auto tm = *localtime(&t);
  stringstream year;
  year << put_time(&tm, "%Y");

  string command = path + "backup.out Y" + year.str() + " false";
  int status = system(command.c_str());
  if (status != 0)
    return 1;
  
  mysql::MySQL_Driver *driver;
  driver = mysql::get_mysql_driver_instance();
  unique_ptr<Connection> con(driver->connect("tcp://127.0.0.1:3306", "santiago", "953741"));

  try {
    unique_ptr<Statement> stmt(con->createStatement());

    con->setSchema("calendar");
    con->setAutoCommit(false);

    stmt->execute("SET FOREIGN_KEY_CHECKS = 0");
    stmt->execute("DELETE FROM materias");
    stmt->execute("DELETE FROM horarios");
    stmt->execute("DELETE FROM events");
    stmt->execute("DELETE FROM periods");
    stmt->execute("DELETE FROM feriados");
    stmt->execute("SET FOREIGN_KEY_CHECKS = 1");

    con->commit();
    cout << "Database cleaned succesfully.\n";
    con->setAutoCommit(true);
  } catch(SQLException &e) {
    cerr << "Error: " << e.what() << endl;
    cerr << "ROLLBACK..." << endl;
    
    con->rollback();
    
    con->setAutoCommit(true);
    return 1;
  }
  
  return 0;
}
