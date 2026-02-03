package utils

import (
	"database/sql"

	"example.com/main/database"
)

func PriorRuns(cmds []string) {
	dsn := database.InitDb()
	db, err := sql.Open("mysql", dsn)
	if err != nil {

		return
	}
	defer db.Close()
	for _, v := range cmds {
		if v != "" {
			_, err := db.Exec(v)
			if err != nil {

				return
			}
		}
	}
}
