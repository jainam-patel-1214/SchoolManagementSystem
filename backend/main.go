package main

import (
	"database/sql"
	"fmt"
	"log"

	"example.com/main/database"
	"example.com/main/migration"
	"example.com/main/routes"

	_ "github.com/go-sql-driver/mysql"
)

var dsn = database.InitDb()

func main() {

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Error opening DB: ", err)
	}
	defer db.Close()
	migration.RunMigrations(db, "./migration")
	router := routes.InitializeRouter()
	router.Run("localhost:8090")
	fmt.Println("Server running at port 6969")
}
