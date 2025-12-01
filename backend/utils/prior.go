package utils

import (
	"database/sql"
	"fmt"

	"example.com/main/database"
)

func PriorRuns(cmds []string) {
	fmt.Println("Inside prior runs with", cmds)
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
				fmt.Println(err)
				return
			}
		}
	}
}
