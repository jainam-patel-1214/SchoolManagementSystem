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
	fmt.Println(fileName)
	for _, file := range fileName {
		path := filepath.Join(dirName, file)
		content, err := os.ReadFile(path)
		if err != nil {
			log.Fatal(err)
		}
		if _, err := db.Exec(string(content)); err != nil {
			log.Fatal(err)
		}
	}
}
