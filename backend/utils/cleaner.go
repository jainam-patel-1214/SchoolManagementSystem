package utils

import (
	"database/sql"
	"fmt"
	"log"

	"example.com/main/database"
)

func Cleaner(cmds []string) {
	dsn := database.InitDb()
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	for _, v := range cmds {
		if v != "" {
			_, err := db.Exec(v)
			if err != nil {
				log.Fatal(err)
			}
		}
	}
}
