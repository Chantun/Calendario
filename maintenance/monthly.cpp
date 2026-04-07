#include <iostream>
#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

using namespace std;
using namespace sql;

int main() {
  mysql::MySQL_Driver *driver;
  driver = mysql::get_mysql_driver_instance();
  unique_ptr<Connection> con(driver->connect("tcp://127.0.0.1:3306", "appuser", "password"));

  try {
    unique_ptr<Statement> stmt(con->createStatement());

    con->setSchema("calendar");
    con->setAutoCommit(false);

    stmt->execute("UPDATE events SET active = FALSE WHERE date < LAST_DAY(NOW() - INTERVAL 1 MONTH) + INTERVAL 1 DAY");
    stmt->execute("UPDATE periods SET active = FALSE WHERE end < LAST_DAY(NOW() - INTERVAL 1 MONTH) + INTERVAL 1 DAY");
    stmt->execute("UPDATE feriados SET active = FALSE WHERE date < LAST_DAY(NOW() - INTERVAL 1 MONTH) + INTERVAL 1 DAY");

    con->commit();
    cout << "Events deactivated succesfully.\n";
    con->setAutoCommit(true);
  } catch(SQLException &e) {
    cerr << "Error: " << e.what() << endl;
    cerr << "ROLLBACK..." << endl;
    
    con->rollback(); // La DB vuelve al estado exacto de antes de empezar
    
    con->setAutoCommit(true);
    return 1;
  }
  return 0;
}
