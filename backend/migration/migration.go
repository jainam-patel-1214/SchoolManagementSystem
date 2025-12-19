package migration

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
)

func RunMigrations(db *sql.DB, dirName string) {
	res, err := os.ReadDir(dirName)
	if err != nil {
		log.Fatal(err)
	}
	var fileName []string
	for _, f := range res {
		if filepath.Ext(f.Name()) == ".sql" {
			fileName = append(fileName, f.Name())
		}
	}
	if _, err := db.Exec("set foreign_key_checks=0"); err != nil {
		log.Fatal(err)
	}
	for _, file := range fileName {
		path := filepath.Join(dirName, file)
		content, err := os.ReadFile(path)
		if err != nil {
			log.Fatal(err)
		}
		_, err = db.Exec(string(content))
		if err != nil {
			if file == "001.sql" {
				log.Fatal("Error in 001.sql:", err)
			} else {
				fmt.Println("Ignoring error in", file, ":", err)
			}
		}
	}
	db.Exec("set foreign_key_checks=1")
}
